/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import { Product, PurchaseOrder, Transaction } from "../types";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/spreadsheets");

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuthListener = (
  onAuthSuccess: (user: User, token: string) => void,
  onAuthFailure: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to retrieve oauth access token from Google provider.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error("Popup Authentication failed:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const googleSignOut = async (): Promise<void> => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * Creates a brand new Google Spreadsheet.
 */
export const createSpreadsheet = async (title: string): Promise<{ id: string; url: string }> => {
  const token = getAccessToken();
  if (!token) throw new Error("Unauthenticated. Please sign in with Google first.");

  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      properties: {
        title: title
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create spreadsheet: ${errText}`);
  }

  const data = await response.json();
  return {
    id: data.spreadsheetId,
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`
  };
};

/**
 * Checks if a tab exists, and if not, creates it.
 */
export const checkAndCreateSheetTab = async (spreadsheetId: string, tabName: string): Promise<void> => {
  const token = getAccessToken();
  if (!token) return;

  // Fetch metadata
  const metaResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!metaResponse.ok) return;
  const meta = await metaResponse.json();
  const existingSheets = (meta.sheets || []).map((s: any) => s.properties?.title);

  if (existingSheets.includes(tabName)) {
    return; // Already exists
  }

  // Create sheet tab
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      requests: [
        {
          addSheet: {
            properties: {
              title: tabName
            }
          }
        }
      ]
    })
  });
};

/**
 * Clears and syncs products into the 'Product Catalog' tab.
 */
export const syncProductsToSheet = async (spreadsheetId: string, products: Product[]): Promise<void> => {
  const token = getAccessToken();
  if (!token) throw new Error("No OAuth token cached.");

  const tabName = "Products";
  await checkAndCreateSheetTab(spreadsheetId, tabName);

  // Clear existing cells
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tabName}!A1:Z2000:clear`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });

  // Prepare table rows
  const headers = ["SKU", "Name", "Category", "Stock Level", "Min Stock Level", "Reorder Point", "Cost Price", "Sell Price", "Status", "Description"];
  const rows = products.map(p => [
    p.sku,
    p.name,
    p.category,
    p.stockLevel,
    p.minStockLevel,
    p.reorderPoint,
    p.costPrice,
    p.sellPrice,
    p.status,
    p.description || ""
  ]);

  const bodyData = {
    range: `${tabName}!A1`,
    majorDimension: "ROWS",
    values: [headers, ...rows]
  };

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tabName}!A1?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(bodyData)
  });

  if (!response.ok) {
    throw new Error(`Products sync failed: ${await response.text()}`);
  }
};

/**
 * Imports products from the 'Products' sheet tab.
 */
export const importProductsFromSheet = async (spreadsheetId: string): Promise<Product[]> => {
  const token = getAccessToken();
  if (!token) throw new Error("No OAuth token cached.");

  const tabName = "Products";
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tabName}!A1:J2000`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Failed to read 'Products' tab. Please sync products first to establish structure.`);
  }

  const data = await response.json();
  const rows: string[][] = data.values || [];
  if (rows.length <= 1) {
    throw new Error("The inventory sheet is empty (only headers found or completely blank).");
  }

  // Header row index mappings
  const headers = rows[0].map(h => h.trim().toLowerCase());
  const skuIdx = headers.indexOf("sku");
  const nameIdx = headers.indexOf("name");
  const catIdx = headers.indexOf("category");
  const stockIdx = headers.indexOf("stock level");
  const minStockIdx = headers.indexOf("min stock level");
  const costIdx = headers.indexOf("cost price");
  const sellIdx = headers.indexOf("sell price");
  const descIdx = headers.indexOf("description");

  if (skuIdx === -1 || nameIdx === -1) {
    throw new Error("Invalid spreadsheet structure! Missing required 'SKU' or 'Name' columns.");
  }

  const importedProducts: Product[] = [];

  for (let s = 1; s < rows.length; s++) {
    const row = rows[s];
    if (!row[skuIdx] || !row[nameIdx]) continue; // skip blank

    const sku = row[skuIdx].trim();
    const name = row[nameIdx].trim();
    const category = (catIdx !== -1 && row[catIdx]) ? row[catIdx].trim() : "Electronics";
    const stockLevel = (stockIdx !== -1 && row[stockIdx]) ? Number(row[stockIdx]) : 0;
    const minStockLevel = (minStockIdx !== -1 && row[minStockIdx]) ? Number(row[minStockIdx]) : 10;
    const costPrice = (costIdx !== -1 && row[costIdx]) ? Number(row[costIdx]) : 0;
    const sellPrice = (sellIdx !== -1 && row[sellIdx]) ? Number(row[sellIdx]) : 0;
    const description = (descIdx !== -1 && row[descIdx]) ? row[descIdx].trim() : "";

    let status: Product["status"] = "Healthy";
    if (stockLevel <= 0) status = "Out of Stock";
    else if (stockLevel <= minStockLevel) status = "Low Stock";

    importedProducts.push({
      sku,
      name,
      category: category as any,
      stockLevel,
      minStockLevel,
      reorderPoint: minStockLevel * 2,
      costPrice,
      sellPrice,
      suggestedMsrp: sellPrice * 1.1,
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80",
      location: "Warehouse Bay-Default",
      status,
      description
    });
  }

  return importedProducts;
};

/**
 * Clears and syncs Purchase Orders to Sheets ledger.
 */
export const syncPurchaseOrdersToSheet = async (spreadsheetId: string, orders: PurchaseOrder[]): Promise<void> => {
  const token = getAccessToken();
  if (!token) throw new Error("No OAuth token cached.");

  const tabName = "Purchase_Orders";
  await checkAndCreateSheetTab(spreadsheetId, tabName);

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tabName}!A1:Z2000:clear`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });

  const headers = ["PO Reference", "Supplier", "Date Raised", "Order Status", "Total Amount", "Initials"];
  const rows = orders.map(o => [
    o.poId,
    o.supplierName,
    o.date,
    o.status,
    o.total,
    o.initials
  ]);

  const bodyData = {
    range: `${tabName}!A1`,
    majorDimension: "ROWS",
    values: [headers, ...rows]
  };

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tabName}!A1?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(bodyData)
  });

  if (!response.ok) {
    throw new Error(`PO sync failed: ${await response.text()}`);
  }
};

/**
 * Clears and syncs transactions into Sheets ledger.
 */
export const syncTransactionsToSheet = async (spreadsheetId: string, transactions: Transaction[]): Promise<void> => {
  const token = getAccessToken();
  if (!token) throw new Error("No OAuth token cached.");

  const tabName = "POS_Sales_History";
  await checkAndCreateSheetTab(spreadsheetId, tabName);

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tabName}!A1:Z2000:clear`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });

  const headers = ["Invoice ID", "Customer Name", "Date Transacted", "Total Charged", "Invoice Status", "Payment Mode"];
  const rows = transactions.map(t => [
    t.invoiceId,
    t.customerName,
    t.date,
    t.amount,
    t.status,
    t.paymentMode || "Cash"
  ]);

  const bodyData = {
    range: `${tabName}!A1`,
    majorDimension: "ROWS",
    values: [headers, ...rows]
  };

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tabName}!A1?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(bodyData)
  });

  if (!response.ok) {
    throw new Error(`POS Transactions sync failed: ${await response.text()}`);
  }
};
