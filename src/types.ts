/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  sku: string;
  name: string;
  category: "Electronics" | "Beverages" | "Snacks" | "Office Supplies" | "Accessories" | "Networking" | "Workstation" | "Server" | "Peripherals";
  stockLevel: number;
  minStockLevel: number;
  reorderPoint: number;
  costPrice: number;
  sellPrice: number;
  suggestedMsrp: number;
  imageUrl: string;
  location: string;
  status: "Healthy" | "Low Stock" | "Out of Stock" | "Optimal";
  description: string;
}

export interface Transaction {
  invoiceId: string;
  customerName: string;
  date: string;
  amount: number;
  status: "PAID" | "PENDING" | "OVERDUE";
  paymentMode?: "Cash" | "Card" | "Credit";
}

export interface Movement {
  id: string;
  date: string;
  time: string;
  sku: string;
  description: string;
  type: "IN" | "OUT" | "ADJ";
  quantity: number;
  referenceId: string;
  executedBy: string;
  avatarUrl: string;
}

export interface Supplier {
  name: string;
  reliability: number;
  leadTime: string;
  MOQ: string;
  unitPrice: number;
  status: "PRIMARY" | "BACKUP";
}

export interface PurchaseOrder {
  poId: string;
  supplierName: string;
  date: string;
  status: "Pending" | "Partial" | "Fully Received" | "Cancelled";
  total: number;
  initials: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  accountNo?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  branch: string;
  avatarUrl: string;
  email: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  ownerName: string;
  address: string;
  phone: string;
  username: string; // Admin User ID/Username
  password: string;
  registrationDate: string;
}

export interface StaffMember {
  id: string;
  companyId: string;
  name: string;
  username: string; // Staff login details
  password: string;
  role: "Admin" | "Manager" | "Cashier";
  branch: string;
}


export interface SystemSettings {
  billingVat: number;
  mainHubBranch: string;
  currencySymbol: string;
  lowStockThreshold: number;
  defaultPaymentMode: "Cash" | "Card" | "Credit";
}
