/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, getDocs, collection, deleteDoc } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { Product, Transaction, Movement, Supplier, PurchaseOrder, Customer, UserProfile, SystemSettings, CompanyInfo, StaffMember } from "./types";
import {
  initialProducts,
  initialTransactions,
  initialMovements,
  initialSuppliers,
  initialPurchaseOrders,
  initialCustomers
} from "./data";

export const initialProfiles: UserProfile[] = [
  {
    id: "prof-1",
    name: "Alex Rivera",
    role: "Enterprise Admin",
    branch: "Main Hub Branch",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    email: "alex@sheeterp.com"
  },
  {
    id: "prof-2",
    name: "Sarah Jenkins",
    role: "Procurement Specialist",
    branch: "HQ North Wing",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    email: "sarah.j@sheeterp.com"
  },
  {
    id: "prof-3",
    name: "Marcus Vance",
    role: "Retail Cashier",
    branch: "Downtown Terminal",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    email: "marcus.v@sheeterp.com"
  }
];

const defaultSettings: SystemSettings = {
  billingVat: 15,
  mainHubBranch: "Main Hub Branch",
  currencySymbol: "$",
  lowStockThreshold: 20,
  defaultPaymentMode: "Cash"
};

const DEMO_COMPANY: CompanyInfo = {
  id: "demo-comp",
  name: "MAM ERP Group (Demo)",
  ownerName: "Alex Rivera",
  address: "712 Tech Sector, HQ Boulevard",
  phone: "+880 1711-223344",
  username: "admin",
  password: "123",
  registrationDate: "2026-05-23"
};

const INITIAL_DEMO_STAFF: StaffMember[] = [
  {
    id: "staff-demo-1",
    companyId: "demo-comp",
    name: "Sarah Jenkins",
    username: "sarah",
    password: "123",
    role: "Manager",
    branch: "HQ North Wing"
  },
  {
    id: "staff-demo-2",
    companyId: "demo-comp",
    name: "Marcus Vance",
    username: "marcus",
    password: "123",
    role: "Cashier",
    branch: "Downtown Terminal"
  }
];

interface AppContextType {
  // Navigation / Views State
  appSuite: "POS" | "ERP";
  setAppSuite: (suite: "POS" | "ERP") => void;
  posView: "Dashboard" | "QuickBilling" | "Customers" | "Reports" | "Settings";
  setPosView: (view: "Dashboard" | "QuickBilling" | "Customers" | "Reports" | "Settings") => void;
  erpView: "StockOverview" | "ProductMaster" | "MovementHistory" | "PurchaseOrders" | "Suppliers" | "Warehouse" | "Analytics" | "ProductEditor" | "GoogleSheets" | "StaffDesk" | "SKULabelGenerator";
  setErpView: (view: "StockOverview" | "ProductMaster" | "MovementHistory" | "PurchaseOrders" | "Suppliers" | "Warehouse" | "Analytics" | "ProductEditor" | "GoogleSheets" | "StaffDesk" | "SKULabelGenerator") => void;
  editingProductSku: string | null;
  setEditingProductSku: (sku: string | null) => void;

  // Data State
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  movements: Movement[];
  setMovements: React.Dispatch<React.SetStateAction<Movement[]>>;
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;

  // Multi-Tenant Profiles & Companies
  companies: CompanyInfo[];
  currentCompany: CompanyInfo | null;
  currentStaff: StaffMember | null;
  staffMembers: StaffMember[];
  registerCompany: (comp: CompanyInfo) => void;
  addStaff: (staff: StaffMember) => void;
  removeStaff: (id: string) => void;
  loginAsCompany: (username: string, password: string) => boolean;
  loginAsStaff: (companyId: string, username: string, password: string) => boolean;
  logout: () => void;

  // User profiles & settings state
  profiles: UserProfile[];
  setProfiles: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  activeProfile: UserProfile;
  setActiveProfile: (profile: UserProfile) => void;
  settings: SystemSettings;
  setSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;

  // Actions
  addTransaction: (tx: Transaction) => void;
  addMovement: (mov: Movement) => void;
  updateProduct: (sku: string, updated: Partial<Product>) => void;
  addPurchaseOrder: (po: PurchaseOrder) => void;
  addCustomer: (cust: Customer) => void;
  addProfile: (profile: UserProfile) => void;
  updateProfile: (id: string, updated: Partial<UserProfile>) => void;
  updateSettings: (updated: Partial<SystemSettings>) => void;

  // Firebase Auth and Multi-Tenant Sync
  firebaseUser: User | null;
  firebaseLoading: boolean;
  syncWithCloud: () => Promise<void>;
  pullFromCloud: () => Promise<void>;
  cloudSyncLogs: string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [appSuite, setAppSuite] = useState<"POS" | "ERP">("POS");
  const [posView, setPosView] = useState<"Dashboard" | "QuickBilling" | "Customers" | "Reports" | "Settings">("Dashboard");
  const [erpView, setErpView] = useState<"StockOverview" | "ProductMaster" | "MovementHistory" | "PurchaseOrders" | "Suppliers" | "Warehouse" | "Analytics" | "ProductEditor" | "GoogleSheets" | "StaffDesk" | "SKULabelGenerator">("StockOverview");
  const [editingProductSku, setEditingProductSku] = useState<string | null>(null);

  // Firebase integration states
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [cloudSyncLogs, setCloudSyncLogs] = useState<string[]>([]);

  const addSyncLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setCloudSyncLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setFirebaseLoading(false);
      if (user) {
        addSyncLog(`Secured session using credentials: ${user.email}`);
      } else {
        addSyncLog("Cloud Vault access disabled. Operating offline.");
      }
    });
    return () => unsubscribe();
  }, []);

  // Multi-tenancy metadata loaded from localStorage
  const [companies, setCompanies] = useState<CompanyInfo[]>(() => {
    const saved = localStorage.getItem("mam_erp_companies");
    if (!saved) {
      return [DEMO_COMPANY];
    }
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.find((c: any) => c.id === "demo-comp")) {
        parsed.unshift(DEMO_COMPANY);
      }
      return parsed;
    } catch {
      return [DEMO_COMPANY];
    }
  });

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem("mam_erp_staff_all");
    if (!saved) {
      return INITIAL_DEMO_STAFF;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_DEMO_STAFF;
    }
  });

  const [currentCompany, setCurrentCompany] = useState<CompanyInfo | null>(() => {
    const saved = localStorage.getItem("mam_erp_curr_company");
    if (!saved) return null; // prompt company registration/login first
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(() => {
    const saved = localStorage.getItem("mam_erp_curr_staff");
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  // State populated according to the logged in Company (Tenancy isolation)
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [suppliers] = useState<Supplier[]>(initialSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>(initialProfiles);
  const [activeProfile, setActiveProfile] = useState<UserProfile>(initialProfiles[0]);
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

  // Triggered when currentCompany changes -> load the specific company data containers (or fresh ones)
  useEffect(() => {
    if (!currentCompany) {
      setProducts([]);
      setTransactions([]);
      setMovements([]);
      setPurchaseOrders([]);
      setCustomers([]);
      return;
    }

    const { id } = currentCompany;

    // Direct data container load mapping
    const getOrInit = (key: string, defaultVal: string) => {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return JSON.parse(defaultVal);
        }
      }
      return JSON.parse(defaultVal);
    };

    // If Demo company, load pre-seeded templates. Otherwise, seed COMPLETELY FRESH, empty datasets!
    const defaultProds = id === "demo-comp" ? JSON.stringify(initialProducts) : "[]";
    const defaultTxs = id === "demo-comp" ? JSON.stringify(initialTransactions) : "[]";
    const defaultMovs = id === "demo-comp" ? JSON.stringify(initialMovements) : "[]";
    const defaultPOs = id === "demo-comp" ? JSON.stringify(initialPurchaseOrders) : "[]";
    const defaultCusts = id === "demo-comp" ? JSON.stringify(initialCustomers) : "[]";

    setProducts(getOrInit(`mam_erp_products_${id}`, defaultProds));
    setTransactions(getOrInit(`mam_erp_transactions_${id}`, defaultTxs));
    setMovements(getOrInit(`mam_erp_movements_${id}`, defaultMovs));
    setPurchaseOrders(getOrInit(`mam_erp_purchase_orders_${id}`, defaultPOs));
    setCustomers(getOrInit(`mam_erp_customers_${id}`, defaultCusts));
    setSettings(getOrInit(`mam_erp_settings_${id}`, JSON.stringify(defaultSettings)));

    // Sync profiles
    if (currentStaff) {
      setActiveProfile({
        id: currentStaff.id,
        name: currentStaff.name,
        role: currentStaff.role,
        branch: currentStaff.branch || "HQ Terminal",
        avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
        email: `${currentStaff.username}@${currentCompany.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`
      });
    } else {
      setActiveProfile({
        id: "owner-adm",
        name: currentCompany.ownerName,
        role: "Enterprise Admin",
        branch: "Main Hub Head Office",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        email: `${currentCompany.username}@${currentCompany.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`
      });
    }
  }, [currentCompany, currentStaff]);

  // Synchronize state outputs to localStorage continuously when state evolves
  useEffect(() => {
    if (currentCompany) {
      localStorage.setItem(`mam_erp_products_${currentCompany.id}`, JSON.stringify(products));
    }
  }, [products, currentCompany]);

  useEffect(() => {
    if (currentCompany) {
      localStorage.setItem(`mam_erp_transactions_${currentCompany.id}`, JSON.stringify(transactions));
    }
  }, [transactions, currentCompany]);

  useEffect(() => {
    if (currentCompany) {
      localStorage.setItem(`mam_erp_movements_${currentCompany.id}`, JSON.stringify(movements));
    }
  }, [movements, currentCompany]);

  useEffect(() => {
    if (currentCompany) {
      localStorage.setItem(`mam_erp_purchase_orders_${currentCompany.id}`, JSON.stringify(purchaseOrders));
    }
  }, [purchaseOrders, currentCompany]);

  useEffect(() => {
    if (currentCompany) {
      localStorage.setItem(`mam_erp_customers_${currentCompany.id}`, JSON.stringify(customers));
    }
  }, [customers, currentCompany]);

  useEffect(() => {
    if (currentCompany) {
      localStorage.setItem(`mam_erp_settings_${currentCompany.id}`, JSON.stringify(settings));
    }
  }, [settings, currentCompany]);

  // Save the master registry arrays
  useEffect(() => {
    localStorage.setItem("mam_erp_companies", JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem("mam_erp_staff_all", JSON.stringify(staffMembers));
  }, [staffMembers]);

  // Operations
  const registerCompany = (comp: CompanyInfo) => {
    setCompanies((prev) => {
      const updated = [...prev, comp];
      localStorage.setItem("mam_erp_companies", JSON.stringify(updated));
      return updated;
    });
  };

  const addStaff = (staff: StaffMember) => {
    setStaffMembers((prev) => {
      const updated = [...prev, staff];
      localStorage.setItem("mam_erp_staff_all", JSON.stringify(updated));
      return updated;
    });
  };

  const removeStaff = (id: string) => {
    setStaffMembers((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem("mam_erp_staff_all", JSON.stringify(updated));
      return updated;
    });
  };

  const loginAsCompany = (username: string, password: string): boolean => {
    const matched = companies.find(
      (c) => c.username.toLowerCase() === username.toLowerCase() && c.password === password
    );
    if (matched) {
      setCurrentCompany(matched);
      setCurrentStaff(null);
      localStorage.setItem("mam_erp_curr_company", JSON.stringify(matched));
      localStorage.removeItem("mam_erp_curr_staff");
      return true;
    }
    return false;
  };

  const loginAsStaff = (companyId: string, username: string, password: string): boolean => {
    const compMatch = companies.find((c) => c.id === companyId);
    if (!compMatch) return false;

    const matched = staffMembers.find(
      (s) =>
        s.companyId === companyId &&
        s.username.toLowerCase() === username.toLowerCase() &&
        s.password === password
    );

    if (matched) {
      setCurrentCompany(compMatch);
      setCurrentStaff(matched);
      localStorage.setItem("mam_erp_curr_company", JSON.stringify(compMatch));
      localStorage.setItem("mam_erp_curr_staff", JSON.stringify(matched));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentCompany(null);
    setCurrentStaff(null);
    localStorage.removeItem("mam_erp_curr_company");
    localStorage.removeItem("mam_erp_curr_staff");
  };

  const addTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
    if (firebaseUser && currentCompany) {
      setDoc(doc(db, `companies/${currentCompany.id}/transactions`, tx.invoiceId), tx)
        .then(() => addSyncLog(`Synced receipt to Firestore: ${tx.invoiceId}`))
        .catch((e) => handleFirestoreError(e, OperationType.WRITE, `companies/${currentCompany.id}/transactions/${tx.invoiceId}`));
    }
  };

  const addMovement = (mov: Movement) => {
    setMovements((prev) => [mov, ...prev]);
    if (firebaseUser && currentCompany) {
      setDoc(doc(db, `companies/${currentCompany.id}/movements`, mov.id), mov)
        .then(() => addSyncLog(`Synced stock movement log: ${mov.id}`))
        .catch((e) => handleFirestoreError(e, OperationType.WRITE, `companies/${currentCompany.id}/movements/${mov.id}`));
    }
  };

  const updateProduct = (sku: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.sku === sku) {
          const merged = { ...item, ...updated };
          let status: Product["status"] = "Healthy";
          if (merged.stockLevel <= 0) status = "Out of Stock";
          else if (merged.stockLevel <= merged.minStockLevel) status = "Low Stock";
          else if (merged.stockLevel > merged.reorderPoint) status = "Optimal";
          const finalProd = { ...merged, status };

          if (firebaseUser && currentCompany) {
            setDoc(doc(db, `companies/${currentCompany.id}/products`, sku), finalProd)
              .then(() => addSyncLog(`Synced catalog item update for: ${sku}`))
              .catch((e) => handleFirestoreError(e, OperationType.WRITE, `companies/${currentCompany.id}/products/${sku}`));
          }
          return finalProd;
        }
        return item;
      })
    );
  };

  const addPurchaseOrder = (po: PurchaseOrder) => {
    setPurchaseOrders((prev) => [po, ...prev]);
    if (firebaseUser && currentCompany) {
      setDoc(doc(db, `companies/${currentCompany.id}/purchaseOrders`, po.poId), po)
        .then(() => addSyncLog(`Synced purchase order: ${po.poId}`))
        .catch((e) => handleFirestoreError(e, OperationType.WRITE, `companies/${currentCompany.id}/purchaseOrders/${po.poId}`));
    }
  };

  const addCustomer = (cust: Customer) => {
    setCustomers((prev) => [...prev, cust]);
    if (firebaseUser && currentCompany) {
      setDoc(doc(db, `companies/${currentCompany.id}/customers`, cust.id), cust)
        .then(() => addSyncLog(`Synced customer file: ${cust.id}`))
        .catch((e) => handleFirestoreError(e, OperationType.WRITE, `companies/${currentCompany.id}/customers/${cust.id}`));
    }
  };

  const addProfile = (profile: UserProfile) => {
    setProfiles((prev) => [...prev, profile]);
  };

  const updateProfile = (id: string, updated: Partial<UserProfile>) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const merged = { ...p, ...updated };
          if (p.id === activeProfile.id) {
            setActiveProfile(merged);
          }
          return merged;
        }
        return p;
      })
    );
  };

  const updateSettings = (updated: Partial<SystemSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updated };
      if (firebaseUser && currentCompany) {
        setDoc(doc(db, `companies/${currentCompany.id}/settings`, "system"), next)
          .then(() => addSyncLog("Synced layout & VAT configs to system document."))
          .catch((e) => handleFirestoreError(e, OperationType.WRITE, `companies/${currentCompany.id}/settings/system`));
      }
      return next;
    });
  };

  // Firebase outward synchronization (Push state)
  const syncWithCloud = async () => {
    if (!firebaseUser) {
      addSyncLog("ERROR: Cloud push failed. Must authenticate with Google first.");
      return;
    }
    if (!currentCompany) {
      addSyncLog("ERROR: Sync failed. Select an active business tenant.");
      return;
    }

    addSyncLog("Info: Initiating outwards Cloud push to Firestore...");
    try {
      const tenantId = currentCompany.id;

      // Register company
      const compRef = doc(db, "companies", tenantId);
      await setDoc(compRef, {
        ...currentCompany,
        ownerUid: firebaseUser.uid
      });
      addSyncLog(`Registered company tenant: ${currentCompany.name}`);

      // Push Products
      for (const prod of products) {
        await setDoc(doc(db, `companies/${tenantId}/products`, prod.sku), prod);
      }
      addSyncLog(`Uploaded ${products.length} master products.`);

      // Push Transactions
      for (const tx of transactions) {
        await setDoc(doc(db, `companies/${tenantId}/transactions`, tx.invoiceId), tx);
      }
      addSyncLog(`Uploaded ${transactions.length} receipts.`);

      // Push Movements
      for (const mov of movements) {
        await setDoc(doc(db, `companies/${tenantId}/movements`, mov.id), mov);
      }
      addSyncLog(`Uploaded ${movements.length} audit trails.`);

      // Push Purchase Orders
      for (const po of purchaseOrders) {
        await setDoc(doc(db, `companies/${tenantId}/purchaseOrders`, po.poId), po);
      }
      addSyncLog(`Uploaded ${purchaseOrders.length} procurement orders.`);

      // Push Customers
      for (const cust of customers) {
        await setDoc(doc(db, `companies/${tenantId}/customers`, cust.id), cust);
      }
      addSyncLog(`Uploaded ${customers.length} business clients.`);

      // Push Settings
      await setDoc(doc(db, `companies/${tenantId}/settings`, "system"), settings);
      addSyncLog("Uploaded configuration set documents.");

      // Push Staff Members
      const companyStaff = staffMembers.filter(s => s.companyId === tenantId);
      for (const st of companyStaff) {
        await setDoc(doc(db, `companies/${tenantId}/staffMembers`, st.id), st);
      }
      addSyncLog(`Uploaded ${companyStaff.length} staff credentials.`);

      addSyncLog("CLOUD SYNC COMPLETE: Cloud database is perfectly aligned!");
    } catch (err: any) {
      addSyncLog(`CRITICAL ERROR during push: ${err.message}`);
      handleFirestoreError(err, OperationType.WRITE, `companies/${currentCompany.id}`);
    }
  };

  // Firebase inward synchronization (Pull state)
  const pullFromCloud = async () => {
    if (!firebaseUser) {
      addSyncLog("ERROR: Pull failed. Must authenticate with Google first.");
      return;
    }
    if (!currentCompany) {
      addSyncLog("ERROR: Pull failed. No active company tenant selected.");
      return;
    }

    addSyncLog("Info: Initiating inwards Cloud pull from Firestore...");
    try {
      const tenantId = currentCompany.id;

      // 1. Fetch products
      const prodsSnap = await getDocs(collection(db, `companies/${tenantId}/products`));
      const loadedProds: Product[] = [];
      prodsSnap.forEach(docSnap => {
        loadedProds.push(docSnap.data() as Product);
      });
      if (loadedProds.length > 0) {
        setProducts(loadedProds);
        addSyncLog(`Downloaded ${loadedProds.length} products to offline state.`);
      }

      // 2. Fetch transactions
      const txsSnap = await getDocs(collection(db, `companies/${tenantId}/transactions`));
      const loadedTxs: Transaction[] = [];
      txsSnap.forEach(docSnap => {
        loadedTxs.push(docSnap.data() as Transaction);
      });
      if (loadedTxs.length > 0) {
        setTransactions(loadedTxs);
        addSyncLog(`Downloaded ${loadedTxs.length} sales receipts.`);
      }

      // 3. Fetch movements
      const movsSnap = await getDocs(collection(db, `companies/${tenantId}/movements`));
      const loadedMovs: Movement[] = [];
      movsSnap.forEach(docSnap => {
        loadedMovs.push(docSnap.data() as Movement);
      });
      if (loadedMovs.length > 0) {
        setMovements(loadedMovs);
        addSyncLog(`Downloaded ${loadedMovs.length} audit logs.`);
      }

      // 4. Fetch purchase orders
      const poSnap = await getDocs(collection(db, `companies/${tenantId}/purchaseOrders`));
      const loadedPOs: PurchaseOrder[] = [];
      poSnap.forEach(docSnap => {
        loadedPOs.push(docSnap.data() as PurchaseOrder);
      });
      if (loadedPOs.length > 0) {
        setPurchaseOrders(loadedPOs);
        addSyncLog(`Downloaded ${loadedPOs.length} purchase orders.`);
      }

      // 5. Fetch customers
      const custsSnap = await getDocs(collection(db, `companies/${tenantId}/customers`));
      const loadedCusts: Customer[] = [];
      custsSnap.forEach(docSnap => {
        loadedCusts.push(docSnap.data() as Customer);
      });
      if (loadedCusts.length > 0) {
        setCustomers(loadedCusts);
        addSyncLog(`Downloaded ${loadedCusts.length} client profiles.`);
      }

      // 6. Fetch Settings
      const settingsSnap = await getDoc(doc(db, `companies/${tenantId}/settings`, "system"));
      if (settingsSnap.exists()) {
        setSettings(settingsSnap.data() as SystemSettings);
        addSyncLog("Downloaded system configurations.");
      }

      addSyncLog("CLOUD PULL COMPLETE: Successfully parsed and compiled local store.");
    } catch (err: any) {
      addSyncLog(`CRITICAL ERROR during pull: ${err.message}`);
      handleFirestoreError(err, OperationType.GET, `companies/${currentCompany.id}`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        appSuite,
        setAppSuite,
        posView,
        setPosView,
        erpView,
        setErpView,
        editingProductSku,
        setEditingProductSku,
        products,
        setProducts,
        transactions,
        setTransactions,
        movements,
        setMovements,
        suppliers,
        purchaseOrders,
        setPurchaseOrders,
        customers,
        setCustomers,
        companies,
        currentCompany,
        currentStaff,
        staffMembers,
        registerCompany,
        addStaff,
        removeStaff,
        loginAsCompany,
        loginAsStaff,
        logout,
        profiles,
        setProfiles,
        activeProfile,
        setActiveProfile,
        settings,
        setSettings,
        addTransaction,
        addMovement,
        updateProduct,
        addPurchaseOrder,
        addCustomer,
        addProfile,
        updateProfile,
        updateSettings,
        firebaseUser,
        firebaseLoading,
        syncWithCloud,
        pullFromCloud,
        cloudSyncLogs
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

