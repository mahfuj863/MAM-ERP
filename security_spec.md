# Firestore Security Specification

This document details the Zero-Trust, Attribute-Based Access Control (ABAC) architecture for securing the enterprise multi-tenant ERP and POS database.

## 1. Data Invariants

1. **Strict Multi-Tenancy**: Data inside `/companies/{companyId}/` belongs exclusively to that tenant. Only users who own the company or are registered staff members may access any sub-collection resource within.
2. **Strict Identity Binding**: Company documents can only be registered if the `ownerUid` matches the `request.auth.uid`. No user can claim ownership of another user's corporate tenant.
3. **Temporal Integrity**: Fields like `createdAt` and `updatedAt` are immutable after their creation or must always trust `request.time`.
4. **Finite Boundaries**: All numeric and string bounds must be locked down (e.g. `billingVat` must be between `0` and `100`, stock levels must be positive numbers).
5. **No Blind Access**: No blanket list queries allowed. Collection operations must be verified against `resource.data` to prevent scraping.

---

## 2. The "Dirty Dozen" Payloads

Here are twelve specific JSON payloads representing adversarial attacks designed to compromise the system, all of which must return `PERMISSION_DENIED`:

### Hijacking Corporate Tenants (Identity Spoofing)
- **Payload 1 (Claiming Someone Else's tenant)**: Attempt to write a company profile under `/companies/attacker_comp` but setting `ownerUid: "victim_auth_uid"`.
- **Payload 2 (Privilege Escalation on Create)**: Attempt to create an unauthorized staff account under `/companies/victim_comp/staffMembers/attacker` bypassing tenancy boundaries.

### Tampering with Catalog Records (Value Poisoning)
- **Payload 3 (Negative Pricing Injection)**: Trying to write a product under `/companies/comp1/products/SKU123` with `sellPrice: -500.0`.
- **Payload 4 (Resource Denial via massive inputs)**: Creating a product with `description` mapping a 5MB junk text payload.

### State Bypass & Fraudulent Checkout (State Shortcutting)
- **Payload 5 (Unverified Operator Writing Transactions)**: Authenticated user writing directly to another tenant's `/companies/comp1/transactions/TX_99` specifying a paid Invoice without working as cashiers for that firm.
- **Payload 6 (State Skip)**: Bypass status sequence by setting an empty system order as `status: "Fully Received"` without matching procurement validation structures.

### Inventory Modification Gaps (Ghost Writes)
- **Payload 7 (Shadow Stock Adjustments)**: Sending a ledger movement payload with unlisted tags like `isVerifiedByGlobalAdmin: true` to inject fake ledger updates.
- **Payload 8 (Negative Quantity Adjustment)**: Logging stock transaction movement with `quantity: -999999` to corrupt ledger charts.

### PII Data Scraping (PII Blanket Expose)
- **Payload 9 (Bulk Customer Harvesting)**: Attacker attempts a blanket query list read on `/companies/comp1/customers` without establishing active tenancy membership or store clerk logs.
- **Payload 10 (Access private tenant settings)**: Unauthenticated request attempting to read system parameters at `/companies/comp1/settings/system`.

### Temporal Spoofing (Timestamp Poisoning)
- **Payload 11 (Fabricating Transaction History)**: Log purchase invoice with a hardcoded historic date or user-provided future timestamp: `{ date: "2050-12-31", createdAt: "2050-12-31" }` instead of binding to server time.
- **Payload 12 (Self-Assigned Admin privileges)**: User document updates attempting to override roles to `Enterprise Admin` outside permission gates.

---

## 3. Test Specifications

Testing will assert that if security rules are structured as defined in `firestore.rules`, all write and read actions represented above are safely rejected. Let's proceed to construct rules matching this Zero-Trust posture.
