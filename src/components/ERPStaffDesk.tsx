/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context";
import { Product, Transaction, PurchaseOrder, Customer, StaffMember, Movement } from "../types";
import {
  Users,
  PlusCircle,
  Trash2,
  Lock,
  CheckCircle,
  Database,
  Save,
  AlertTriangle,
  Layers,
  Edit,
  UserCheck,
  Building,
  DollarSign,
  Package,
  FileText,
  HelpCircle,
  Settings,
  QrCode,
  Camera,
  X,
  Search
} from "lucide-react";

export default function ERPStaffDesk() {
  const {
    currentCompany,
    staffMembers,
    addStaff,
    removeStaff,
    products,
    setProducts,
    transactions,
    setTransactions,
    purchaseOrders,
    setPurchaseOrders,
    customers,
    setCustomers,
    settings,
    addMovement
  } = useApp();

  // Active Screen Selector within the Control Center
  const [controlTab, setControlTab] = useState<"staff" | "data">("staff");

  // Local state for New Staff input
  const [staffName, setStaffName] = useState("");
  const [staffUsername, setStaffUsername] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffRole, setStaffRole] = useState<"Admin" | "Manager" | "Cashier">("Cashier");
  const [staffBranch, setStaffBranch] = useState("Downtown Main Hub");
  const [opFeedback, setOpFeedback] = useState<string | null>(null);

  // Active dataset edit state
  const [activeDataset, setActiveDataset] = useState<"products" | "transactions" | "orders" | "customers">("products");
  const [editFeedMsg, setEditFeedMsg] = useState<string | null>(null);

  // Real-time camera scanner & overlay states
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [scannerFeedback, setScannerFeedback] = useState("");
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const overlayVideoRef = React.useRef<HTMLVideoElement | null>(null);

  // Stop active camera session
  const stopScannerCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Start active camera media stream
  const startScannerCamera = async (isOverlay: boolean) => {
    stopScannerCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setCameraStream(stream);
      const targetRef = isOverlay ? overlayVideoRef : videoRef;
      if (targetRef.current) {
        targetRef.current.srcObject = stream;
      }
      setScannerFeedback("Camera loaded successfully! Ready to scan.");
    } catch (err: any) {
      try {
        const streamFallback = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraStream(streamFallback);
        const targetRef = isOverlay ? overlayVideoRef : videoRef;
        if (targetRef.current) {
          targetRef.current.srcObject = streamFallback;
        }
        setScannerFeedback("Fallback webcam loaded. Ready.");
      } catch (fallbackErr: any) {
        setScannerFeedback("Camera Blocked: Initializing scannable diagnostic bypass list.");
      }
    }
  };

  // Filter current company's staff members
  const activeCompanyStaff = staffMembers.filter(
    (s) => s.companyId === currentCompany?.id
  );

  const handleAddStaffClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompany) return;
    if (!staffName || !staffUsername || !staffPassword) {
      setOpFeedback("Error: Please provide staff name, login ID, and password!");
      return;
    }

    const isDuplicate = staffMembers.some(
      (s) => s.companyId === currentCompany.id && s.username.toLowerCase() === staffUsername.toLowerCase()
    );
    if (isDuplicate) {
      setOpFeedback("Error: Staff Login ID already registered for this company!");
      return;
    }

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      companyId: currentCompany.id,
      name: staffName,
      username: staffUsername,
      password: staffPassword,
      role: staffRole,
      branch: staffBranch
    };

    addStaff(newStaff);
    setStaffName("");
    setStaffUsername("");
    setStaffPassword("");
    setOpFeedback(`SUCCESS: Staff member "${newStaff.name}" added successfully.`);
    setTimeout(() => {
      setOpFeedback(null);
    }, 4000);
  };

  const handleRemoveStaff = (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to remove staff member: "${name}"?`)) {
      removeStaff(id);
      setOpFeedback(`SUCCESS: Staff member "${name}" removed from company register.`);
      setTimeout(() => {
        setOpFeedback(null);
      }, 3000);
    }
  };

  // Helper trigger to log manual database direct updates
  const registerDatabaseChange = (desc: string) => {
    addMovement({
      id: `mov-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString(undefined, { hour12: false }),
      sku: "SYS_EDIT",
      description: `Manual database override: ${desc}`,
      type: "ADJ",
      quantity: 0,
      referenceId: "DB_ADMIN",
      executedBy: currentCompany?.ownerName || "Company Owner",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    });
  };

  // UPDATE PROCEDURES FOR BULK MANUALLY EDITED FIELDS
  const handleProductCellChange = (sku: string, field: keyof Product, val: any) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.sku === sku) {
          let updated = { ...p, [field]: val };
          // enforce dynamic stock level state badges
          let statusProduct: Product["status"] = "Healthy";
          if (updated.stockLevel <= 0) statusProduct = "Out of Stock";
          else if (updated.stockLevel <= updated.minStockLevel) statusProduct = "Low Stock";
          else if (updated.stockLevel > updated.reorderPoint) statusProduct = "Optimal";
          return { ...updated, status: statusProduct };
        }
        return p;
      })
    );
  };

  const handleTransactionCellChange = (invoiceId: string, field: keyof Transaction, val: any) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.invoiceId === invoiceId) {
          return { ...t, [field]: val };
        }
        return t;
      })
    );
  };

  const handleOrderCellChange = (poId: string, field: keyof PurchaseOrder, val: any) => {
    setPurchaseOrders((prev) =>
      prev.map((o) => {
        if (o.poId === poId) {
          return { ...o, [field]: val };
        }
        return o;
      })
    );
  };

  const handleCustomerCellChange = (id: string, field: keyof Customer, val: any) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return { ...c, [field]: val };
        }
        return c;
      })
    );
  };

  // Delete Handlers for Rows
  const handleDeleteProduct = (sku: string) => {
    if (confirm(`Remove product SKU [${sku}] from catalog?`)) {
      setProducts((prev) => prev.filter((p) => p.sku !== sku));
      registerDatabaseChange(`Dropped SKU ${sku} from products`);
      setEditFeedMsg("Product removed.");
    }
  };

  const handleDeleteTransaction = (invoiceId: string) => {
    if (confirm(`Delete sale receipt record [${invoiceId}]?`)) {
      setTransactions((prev) => prev.filter((t) => t.invoiceId !== invoiceId));
      registerDatabaseChange(`Dropped checkout receipt ID ${invoiceId}`);
      setEditFeedMsg("Receipt record removed.");
    }
  };

  const handleDeleteOrder = (poId: string) => {
    if (confirm(`Cancel and delete purchase bill [${poId}]?`)) {
      setPurchaseOrders((prev) => prev.filter((o) => o.poId !== poId));
      registerDatabaseChange(`Dropped Purchase Order ID ${poId}`);
      setEditFeedMsg("PO record removed.");
    }
  };

  const handleDeleteCustomer = (id: string, name: string) => {
    if (confirm(`Delete customer register node: "${name}"?`)) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      registerDatabaseChange(`Dropped customer ${name}`);
      setEditFeedMsg("Customer record removed.");
    }
  };

  return (
    <div className="animate-fade-in min-h-[500px]">
      
      {/* Title Header area */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <Building className="w-8 h-8 text-primary shrink-0" />
            <span>Enterprise Control Center</span>
          </h1>
          <p className="font-sans text-xs text-on-surface-variant mt-1 text-body-sm">
            Company tenant space of <strong className="text-primary">{currentCompany?.name}</strong>. Add staff profiles, design rosters, and directly edit live SQL mock system databases.
          </p>
        </div>

        {/* Global tab Switcher with beautiful design styling */}
        <div className="flex bg-surface-container-low border border-outline-variant p-1 rounded-xl shadow-xs self-start md:self-center shrink-0">
          <button
            onClick={() => setControlTab("staff")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              controlTab === "staff"
                ? "bg-primary text-white shadow-xs font-black"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff / Team Desk</span>
          </button>
          <button
            onClick={() => setControlTab("data")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              controlTab === "data"
                ? "bg-primary text-white shadow-xs font-black"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Manual DB Editor</span>
          </button>
        </div>
      </div>

      {/* RENDER VIEW 1: STAFF ROSTER PANEL */}
      {controlTab === "staff" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative">
          
          {/* STAFF DESK CAM SCAN COMPANION CONTROLS */}
          <div className="col-span-12 flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#0a0a0c] border border-outline-variant/50 rounded-2xl gap-4 mb-2 shadow-sm animate-fade-in text-left">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/20">
                <QrCode className="w-3 h-3 text-[#005BFF]" /> Live Operations Companion
              </span>
              <h3 className="text-sm font-bold text-on-surface">Staff Inventory Quick-Scan & Camera Desk</h3>
              <p className="text-[10px] text-on-surface-variant leading-relaxed">Perform rapid inventory lookups, adjust stock levels via live barcode simulation, or toggle persistent live-cam overlays.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowScannerModal(true);
                  startScannerCamera(false);
                }}
                className="px-4 py-2 bg-primary text-white hover:bg-opacity-95 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
              >
                <QrCode className="w-4 h-4 text-white" />
                <span>Quick Scan Modal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (cameraActive) {
                    stopScannerCamera();
                    setCameraActive(false);
                  } else {
                    setCameraActive(true);
                    startScannerCamera(true);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm border ${
                  cameraActive 
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500" 
                    : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant border-outline-variant"
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{cameraActive ? "Hide Cam Overlay" : "Show Cam Overlay"}</span>
              </button>
            </div>
          </div>

          {/* Card left: Register new Staff Profile */}
          <div className="lg:col-span-5 glass-card p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-sm space-y-4">
            <div className="border-b border-outline-variant/40 pb-3">
              <h2 className="font-display text-sm font-bold text-on-surface flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-primary" />
                <span>Add Company Staff Member</span>
              </h2>
              <p className="text-[10px] text-on-surface-variant leading-relaxed mt-1">
                Establish credentials for company employees. Staff members login with their Tenant Company scope and personalized User ID.
              </p>
            </div>

            {opFeedback && (
              <div className={`p-3 rounded-lg text-xs border font-medium ${
                opFeedback.startsWith("SUCCESS") 
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                  : "bg-red-50 border-red-100 text-red-800"
              }`}>
                {opFeedback}
              </div>
            )}

            <form onSubmit={handleAddStaffClick} className="space-y-3">
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase font-mono">
                  Full Employee Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mahfuj Alom"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="px-3 py-2 text-xs border border-outline-variant bg-surface-container-low rounded-lg outline-none focus:ring-1 focus:ring-primary w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase font-mono">
                    Login User ID / Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. mahfuj"
                    required
                    value={staffUsername}
                    onChange={(e) => setStaffUsername(e.target.value)}
                    className="px-3 py-2 text-xs border border-outline-variant bg-surface-container-low rounded-lg outline-none focus:ring-1 focus:ring-primary w-full font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase font-mono">
                    Login Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    className="px-3 py-2 text-xs border border-outline-variant bg-surface-container-low rounded-lg outline-none focus:ring-1 focus:ring-primary w-full font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase font-mono">
                    Roster Access Role
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="px-2.5 py-2 text-xs border border-outline-variant bg-surface-container-low rounded-lg outline-none focus:ring-1 focus:ring-primary w-full font-semibold text-on-surface cursor-pointer"
                  >
                    <option value="Admin">Admin (Full Control)</option>
                    <option value="Manager">Manager (ERP/Stocks)</option>
                    <option value="Cashier">Cashier (POS Checkout only)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase font-mono">
                    Branch Terminal
                  </label>
                  <input
                    type="text"
                    required
                    value={staffBranch}
                    onChange={(e) => setStaffBranch(e.target.value)}
                    className="px-3 py-2 text-xs border border-outline-variant bg-surface-container-low rounded-lg outline-none focus:ring-1 focus:ring-primary w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-primary text-white hover:bg-opacity-95 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Register Staff Credentials</span>
              </button>
            </form>
          </div>

          {/* Card right: Active Staff List */}
          <div className="lg:col-span-7 glass-card p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col min-h-[380px]">
            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-3 mb-4">
              <div>
                <h2 className="font-display text-sm font-bold text-on-surface flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-secondary" />
                  <span>Configured Roster Registry</span>
                </h2>
                <p className="text-[10px] text-on-surface-variant leading-none mt-0.5">
                  Secure staff list mapped to {currentCompany?.name}.
                </p>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold font-mono uppercase">
                {activeCompanyStaff.length} configured profiles
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[340px] custom-scrollbar space-y-3 pr-1 text-left">
              {activeCompanyStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="p-3 bg-surface-container-low border border-outline-variant/40 hover:border-outline rounded-xl flex justify-between items-center transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold font-display shadow-inner">
                      {staff.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-on-surface truncate">{staff.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[8.5px] font-mono leading-none px-1.5 py-0.5 bg-zinc-950 text-emerald-400 rounded border border-zinc-900">
                          {staff.username}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-semibold font-mono">
                          {staff.branch}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider rounded-full ${
                        staff.role === "Admin"
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-150"
                          : staff.role === "Manager"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {staff.role}
                      </span>
                      <p className="text-[9.5px] text-stone-500 font-mono font-bold mt-1">pass: {staff.password}</p>
                    </div>

                    <button
                      onClick={() => handleRemoveStaff(staff.id, staff.name)}
                      className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/5 border border-transparent hover:border-error/10 rounded-lg transition-all cursor-pointer"
                      title="Decommission user account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {activeCompanyStaff.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-stone-400 bg-surface-container-lowest border-2 border-dashed border-outline-variant/50 rounded-2xl">
                  <Lock className="w-8 h-8 text-stone-300 mb-2" />
                  <p className="text-xs font-bold">Only Owner Admin Configured</p>
                  <p className="text-[10px] text-stone-500 max-w-xs mt-1">
                    No custom staff logins configured for this company. Add cashier credentials on the left to activate independent user nodes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW 2: MANUAL DATABASE GRID EDITOR */}
      {controlTab === "data" && (
        <div className="glass-card p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col space-y-4">
          
          <div className="border-b border-outline-variant/40 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-sm font-bold text-on-surface flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Live Database Direct Field Editor (Local Cache Partition)</span>
              </h2>
              <p className="text-[10px] text-on-surface-variant mt-1">
                Edit database cells directly. Any modifications write back into the localized local-storage structures, update POS dashboards instantly, and mirror standard Google Sheets exports.
              </p>
            </div>

            {/* Selector of which database table to manual-edit */}
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => { setActiveDataset("products"); setEditFeedMsg(null); }}
                className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeDataset === "products"
                    ? "bg-secondary-fixed text-on-secondary-fixed border border-secondary"
                    : "bg-surface-container-low text-on-surface-variant border border-transparent hover:bg-surface-container-medium"
                }`}
              >
                Products ({products.length})
              </button>
              <button
                onClick={() => { setActiveDataset("transactions"); setEditFeedMsg(null); }}
                className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeDataset === "transactions"
                    ? "bg-secondary-fixed text-on-secondary-fixed border border-secondary"
                    : "bg-surface-container-low text-on-surface-variant border border-transparent hover:bg-surface-container-medium"
                }`}
              >
                Transactions ({transactions.length})
              </button>
              <button
                onClick={() => { setActiveDataset("orders"); setEditFeedMsg(null); }}
                className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeDataset === "orders"
                    ? "bg-secondary-fixed text-on-secondary-fixed border border-secondary"
                    : "bg-surface-container-low text-on-surface-variant border border-transparent hover:bg-surface-container-medium"
                }`}
              >
                Purchase Orders ({purchaseOrders.length})
              </button>
              <button
                onClick={() => { setActiveDataset("customers"); setEditFeedMsg(null); }}
                className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeDataset === "customers"
                    ? "bg-secondary-fixed text-on-secondary-fixed border border-secondary"
                    : "bg-surface-container-low text-on-surface-variant border border-transparent hover:bg-surface-container-medium"
                }`}
              >
                Customers ({customers.length})
              </button>
            </div>
          </div>

          {/* Feedback logs */}
          {editFeedMsg && (
            <div className="p-2 px-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{editFeedMsg} Direct master database saved successfully.</span>
            </div>
          )}

          {/* LIVE GRID RENDER ENGINE FOR SELECTED RESOURCE */}
          <div className="overflow-x-auto border border-outline-variant rounded-xl max-h-[400px] overflow-y-auto custom-scrollbar">
            
            {/* 1. PRODUCT MANAGER GRID */}
            {activeDataset === "products" && (
              <table className="w-full text-xs font-sans text-left border-collapse table-auto min-w-[750px]">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant font-mono text-[10px] font-bold uppercase">
                    <th className="p-3">SKU Code</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Cost Price</th>
                    <th className="p-3 text-center">Sell Price</th>
                    <th className="p-3 text-center">Stock Level</th>
                    <th className="p-3 text-center">Min Stock</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 font-medium">
                  {products.map((p) => (
                    <tr key={p.sku} className="hover:bg-surface-container-low/20 transition-colors">
                      <td className="p-2 font-mono font-bold text-primary select-all">{p.sku}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => {
                            handleProductCellChange(p.sku, "name", e.target.value);
                            setEditFeedMsg(`Modified "${p.sku}" name.`);
                          }}
                          className="px-2 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded outline-none focus:ring-1 focus:ring-primary w-full text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={p.category}
                          onChange={(e) => {
                            handleProductCellChange(p.sku, "category", e.target.value as any);
                            setEditFeedMsg(`Changed SKU ${p.sku} category.`);
                          }}
                          className="px-2 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded text-xs select-none"
                        >
                          <option value="Electronics">Electronics</option>
                          <option value="Beverages">Beverages</option>
                          <option value="Snacks">Snacks</option>
                          <option value="Office Supplies">Office Supplies</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Networking">Networking</option>
                          <option value="Workstation">Workstation</option>
                          <option value="Server">Server</option>
                          <option value="Peripherals">Peripherals</option>
                        </select>
                      </td>
                      <td className="p-2 w-24">
                        <input
                          type="number"
                          step="0.01"
                          value={p.costPrice}
                          onChange={(e) => {
                            handleProductCellChange(p.sku, "costPrice", parseFloat(e.target.value) || 0);
                            setEditFeedMsg(`Modified Cost for ${p.sku}`);
                          }}
                          className="px-2 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded outline-none focus:ring-1 focus:ring-primary w-full text-xs text-center font-mono font-bold"
                        />
                      </td>
                      <td className="p-2 w-24">
                        <input
                          type="number"
                          step="0.01"
                          value={p.sellPrice}
                          onChange={(e) => {
                            handleProductCellChange(p.sku, "sellPrice", parseFloat(e.target.value) || 0);
                            setEditFeedMsg(`Modified Sell for ${p.sku}`);
                          }}
                          className="px-2 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded outline-none focus:ring-1 focus:ring-primary w-full text-xs text-center font-mono font-bold"
                        />
                      </td>
                      <td className="p-2 w-20 text-center">
                        <input
                          type="number"
                          value={p.stockLevel}
                          onChange={(e) => {
                            handleProductCellChange(p.sku, "stockLevel", parseInt(e.target.value) || 0);
                            setEditFeedMsg(`Set Stock Level for ${p.sku}`);
                          }}
                          className="px-2 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded outline-none focus:ring-1 focus:ring-primary w-full text-xs text-center font-mono font-bold"
                        />
                      </td>
                      <td className="p-2 w-20 text-center">
                        <input
                          type="number"
                          value={p.minStockLevel}
                          onChange={(e) => {
                            handleProductCellChange(p.sku, "minStockLevel", parseInt(e.target.value) || 0);
                            setEditFeedMsg(`Set Min Stock on ${p.sku}`);
                          }}
                          className="px-2 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded outline-none focus:ring-1 focus:ring-primary w-full text-xs text-center font-mono font-bold"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleDeleteProduct(p.sku)}
                          className="p-1 hover:bg-error/10 text-on-surface-variant hover:text-error rounded transition-colors"
                          title="Purge row product node"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {products.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-stone-400 italic font-medium">
                        Product catalog database contains zero records. Click "Warehouse Inventory" to seed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* 2. TRANSACTION / INVOICE MANAGER GRID */}
            {activeDataset === "transactions" && (
              <table className="w-full text-xs font-sans text-left border-collapse table-auto min-w-[700px]">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant font-mono text-[10px] font-bold uppercase">
                    <th className="p-3">Receipt Invoice</th>
                    <th className="p-3">Customer Ident</th>
                    <th className="p-3 text-center">Billing Date</th>
                    <th className="p-3 text-center text-primary">Paid Amount</th>
                    <th className="p-3 text-center">Method</th>
                    <th className="p-3 text-center">Payment Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 font-medium">
                  {transactions.map((t) => (
                    <tr key={t.invoiceId} className="hover:bg-surface-container-low/20 transition-colors">
                      <td className="p-2 font-mono font-bold select-all">{t.invoiceId}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={t.customerName}
                          onChange={(e) => {
                            handleTransactionCellChange(t.invoiceId, "customerName", e.target.value);
                            setEditFeedMsg(`Modified transaction target client: ${t.invoiceId}`);
                          }}
                          className="px-2 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded outline-none focus:ring-1 focus:ring-primary w-full text-xs"
                        />
                      </td>
                      <td className="p-2 w-36 text-center">
                        <input
                          type="date"
                          value={t.date}
                          onChange={(e) => {
                            handleTransactionCellChange(t.invoiceId, "date", e.target.value);
                            setEditFeedMsg(`Modified Invoice Date for ${t.invoiceId}`);
                          }}
                          className="px-1.5 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded outline-none w-full text-xs text-center font-mono"
                        />
                      </td>
                      <td className="p-2 w-28">
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-zinc-500 font-bold font-mono">
                            {settings.currencySymbol}
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            value={t.amount}
                            onChange={(e) => {
                              handleTransactionCellChange(t.invoiceId, "amount", parseFloat(e.target.value) || 0);
                              setEditFeedMsg(`Fixed Transaction Value: ${t.invoiceId}`);
                            }}
                            className="pl-5 pr-2 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded outline-none focus:ring-1 focus:ring-primary w-full text-xs text-right font-mono font-bold"
                          />
                        </div>
                      </td>
                      <td className="p-2 w-28 text-center text-zinc-700">
                        <select
                          value={t.paymentMode || "Cash"}
                          onChange={(e) => {
                            handleTransactionCellChange(t.invoiceId, "paymentMode", e.target.value as any);
                            setEditFeedMsg(`Changed Payment routing route for: ${t.invoiceId}`);
                          }}
                          className="px-1.5 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded text-xs select-none"
                        >
                          <option value="Cash">Cash Account</option>
                          <option value="Card">Visa/MCard</option>
                          <option value="Credit">Leasing / Credit</option>
                        </select>
                      </td>
                      <td className="p-2 w-28 text-center">
                        <select
                          value={t.status}
                          onChange={(e) => {
                            handleTransactionCellChange(t.invoiceId, "status", e.target.value as any);
                            setEditFeedMsg(`Adjusted Payment Ledger Status: ${t.invoiceId}`);
                          }}
                          className="px-1.5 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded text-xs select-none font-bold"
                        >
                          <option value="PAID">PAID</option>
                          <option value="PENDING">PENDING</option>
                          <option value="OVERDUE">OVERDUE</option>
                        </select>
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleDeleteTransaction(t.invoiceId)}
                          className="p-1 hover:bg-error/10 text-on-surface-variant hover:text-error rounded transition-colors"
                          title="Purge billing transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400 italic font-medium">
                        Receipt transactions ledger currently empty. Submit quick billing checkouts to populate.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* 3. PROCUREMENT / PURCHASE ORDER GRID */}
            {activeDataset === "orders" && (
              <table className="w-full text-xs font-sans text-left border-collapse table-auto min-w-[700px]">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant font-mono text-[10px] font-bold uppercase">
                    <th className="p-3">PO Bill ID</th>
                    <th className="p-3">Vendor / Supplier</th>
                    <th className="p-3 text-center">Order Date</th>
                    <th className="p-3 text-center">Total Value</th>
                    <th className="p-3 text-center">Order Status</th>
                    <th className="p-3 text-center">Verifier</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 font-medium">
                  {purchaseOrders.map((o) => (
                    <tr key={o.poId} className="hover:bg-surface-container-low/20 transition-colors">
                      <td className="p-2 font-mono font-bold select-all">{o.poId}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={o.supplierName}
                          onChange={(e) => {
                            handleOrderCellChange(o.poId, "supplierName", e.target.value);
                            setEditFeedMsg(`Fixed supplier target for order: ${o.poId}`);
                          }}
                          className="px-2 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded outline-none focus:ring-1 focus:ring-primary w-full text-xs"
                        />
                      </td>
                      <td className="p-2 w-36 text-center">
                        <input
                          type="date"
                          value={o.date}
                          onChange={(e) => {
                            handleOrderCellChange(o.poId, "date", e.target.value);
                            setEditFeedMsg(`Fixed procurement date for order: ${o.poId}`);
                          }}
                          className="px-1.5 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded outline-none w-full text-xs text-center font-mono"
                        />
                      </td>
                      <td className="p-2 w-28">
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-zinc-500 font-bold font-mono">
                            {settings.currencySymbol}
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            value={o.total}
                            onChange={(e) => {
                              handleOrderCellChange(o.poId, "total", parseFloat(e.target.value) || 0);
                              setEditFeedMsg(`Adjusted Purchase Total for order: ${o.poId}`);
                            }}
                            className="pl-5 pr-2 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded outline-none focus:ring-1 focus:ring-primary w-full text-xs text-right font-mono font-bold"
                          />
                        </div>
                      </td>
                      <td className="p-2 w-32 text-center">
                        <select
                          value={o.status}
                          onChange={(e) => {
                            handleOrderCellChange(o.poId, "status", e.target.value as any);
                            setEditFeedMsg(`Security override PO Status: ${o.poId}`);
                          }}
                          className="px-1.5 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded text-xs select-none"
                        >
                          <option value="Pending">Pending Authorized</option>
                          <option value="Partial">Partial Check-In</option>
                          <option value="Fully Received">Fully Received</option>
                          <option value="Cancelled">Cancelled/Bypassed</option>
                        </select>
                      </td>
                      <td className="p-2 w-20 text-center">
                        <input
                          type="text"
                          value={o.initials}
                          onChange={(e) => {
                            handleOrderCellChange(o.poId, "initials", e.target.value);
                            setEditFeedMsg(`Assigned new investigator to Order: ${o.poId}`);
                          }}
                          className="px-2 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded outline-none text-center font-mono uppercase text-xs"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleDeleteOrder(o.poId)}
                          className="p-1 hover:bg-error/10 text-on-surface-variant hover:text-error rounded transition-colors"
                          title="Purge procurement order bill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {purchaseOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400 italic font-medium">
                        Company has raised zero historic purchase orders. Build procurement bills under back-office menu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* 4. CUSTOMER MANAGER GRID */}
            {activeDataset === "customers" && (
              <table className="w-full text-xs font-sans text-left border-collapse table-auto min-w-[650px]">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant font-mono text-[10px] font-bold uppercase">
                    <th className="p-3">Customer ID</th>
                    <th className="p-3">Contact Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3 font-mono">Billed Account No.</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 font-medium font-sans">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-container-low/20 transition-colors">
                      <td className="p-2 font-mono font-bold text-slate-500 select-all">{c.id}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) => {
                            handleCustomerCellChange(c.id, "name", e.target.value);
                            setEditFeedMsg(`Renamed Customer record: ${c.id}`);
                          }}
                          className="px-2 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded outline-none focus:ring-1 focus:ring-primary w-full text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="email"
                          value={c.email}
                          onChange={(e) => {
                            handleCustomerCellChange(c.id, "email", e.target.value);
                            setEditFeedMsg(`Modified customer email for: ${c.id}`);
                          }}
                          className="px-2 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded outline-none focus:ring-1 focus:ring-primary w-full text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={c.accountNo || ""}
                          onChange={(e) => {
                            handleCustomerCellChange(c.id, "accountNo", e.target.value);
                            setEditFeedMsg(`Assigned customer account code: ${c.id}`);
                          }}
                          className="px-2 py-1 border border-outline-variant bg-surface-container-low text-on-surface rounded outline-none focus:ring-1 focus:ring-primary w-full text-xs font-mono"
                        />
                      </td>
                      <td className="p-2 text-center col-span-1">
                        <button
                          onClick={() => handleDeleteCustomer(c.id, c.name)}
                          className="p-1 hover:bg-error/10 text-on-surface-variant hover:text-error rounded transition-colors"
                          title="Purge historical client register"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-stone-400 italic font-medium">
                        Customer relationship ledger contains zero client nodes. Connect quick sales to register.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

          </div>

          <div className="pt-3 text-[11px] text-zinc-500 font-medium flex items-center gap-1.5 border-t border-outline-variant/30 select-none">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Database Direct Override is highly sensitive. Standard business rules bypass limits and authorize silent overrides immediately.</span>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* FEATURE: Barcode/QR Scanner Modal */}
      {/* ========================================== */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-[#0b0b0d] border border-outline-variant rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-surface-container-low border-b border-outline-variant flex justify-between items-center text-on-surface">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-sm">Staff Interactive Barcode Scanner</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopScannerCamera();
                  setShowScannerModal(false);
                }}
                className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
              {/* Camera view */}
              <div className="relative aspect-video bg-zinc-950 border border-outline-variant rounded-xl overflow-hidden flex items-center justify-center group shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                
                {/* Visual red laser scanner beam */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_8px_red] animate-[bounce_2s_infinite]" />
                
                {/* Scanning reticle box */}
                <div className="absolute inset-0 border-[3px] border-primary/40 rounded-xl m-10 border-dashed pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] text-white/50 font-mono tracking-widest uppercase bg-black/55 px-2.5 py-1 rounded">ALIGN CODE AREA</span>
                </div>

                <div className="absolute bottom-2 left-2 bg-black/60 px-3 py-1.5 rounded-lg text-[10px] text-zinc-300 font-mono">
                  {scannerFeedback}
                </div>
              </div>

              {/* Simulation options */}
              <div className="p-4 bg-surface-container-low border border-outline-variant/50 rounded-xl space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
                  <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-primary" /> Simulate Hardware Scan Key
                  </h4>
                  <span className="text-[9px] text-on-surface-variant font-semibold">Select SKU to trigger micro-checkout checks</span>
                </div>
                
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-3 py-2 bg-[#121214] border border-outline-variant rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary w-full text-on-surface cursor-pointer"
                    onChange={(e) => {
                      const prod = products.find(p => p.sku === e.target.value);
                      if (prod) {
                        // Play laser beep
                        try {
                          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                          const osc = audioCtx.createOscillator();
                          const gain = audioCtx.createGain();
                          osc.connect(gain);
                          gain.connect(audioCtx.destination);
                          osc.type = "sine";
                          osc.frequency.value = 1450;
                          gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
                          osc.start();
                          osc.stop(audioCtx.currentTime + 0.08);
                        } catch (err) {}
                        setScannedProduct(prod);
                        setScannerFeedback(`SUCCESS: Scanned SKU - ${prod.sku}`);
                      }
                    }}
                  >
                    <option value="">-- Choose any product to scan --</option>
                    {products.map(p => (
                      <option key={p.sku} value={p.sku}>
                        {p.name} ({p.sku}) [Stock: {p.stockLevel}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scanned result detail card */}
              {scannedProduct ? (
                <div className="p-4 bg-[#121214] border border-primary/25 rounded-xl flex gap-4 animate-fade-in relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full flex items-center justify-center font-bold text-xs">
                    MATCH
                  </div>
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-outline-variant bg-surface-container-lowest shrink-0">
                    <img src={scannedProduct.imageUrl} alt={scannedProduct.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1 text-left">
                    <h3 className="text-xs font-black text-on-surface truncate pr-14">{scannedProduct.name}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">SKU ID: <strong className="text-primary">{scannedProduct.sku}</strong></p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="text-[10px]">
                        <span className="text-zinc-500 block">Selling Price</span>
                        <strong className="text-on-surface">${scannedProduct.sellPrice.toFixed(2)}</strong>
                      </div>
                      <div className="text-[10px]">
                        <span className="text-zinc-500 block">Inventory Level</span>
                        <strong className={` ${scannedProduct.stockLevel <= scannedProduct.minStockLevel ? "text-error" : "text-emerald-500"}`}>
                          {scannedProduct.stockLevel} units remaining
                        </strong>
                      </div>
                    </div>
                    
                    {/* Inline stock adjustment helper */}
                    <div className="mt-3 pt-2.5 border-t border-outline-variant/30 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const nextStock = scannedProduct.stockLevel + 10;
                          const nextProds = products.map(p => p.sku === scannedProduct.sku ? { ...p, stockLevel: nextStock } : p);
                          setProducts(nextProds);
                          setScannedProduct({ ...scannedProduct, stockLevel: nextStock });
                          
                          addMovement({
                            id: `mov-add-${Date.now()}`,
                            date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
                            time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
                            sku: scannedProduct.sku,
                            description: `Restocked 10 units via staff barcode scanner companion`,
                            type: "IN",
                            quantity: 10,
                            referenceId: "MAN-ADJ",
                            executedBy: "Enterprise Staff",
                            avatarUrl: ""
                          });
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        + Add 10 Stock
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const nextStock = Math.max(0, scannedProduct.stockLevel - 1);
                          const nextProds = products.map(p => p.sku === scannedProduct.sku ? { ...p, stockLevel: nextStock } : p);
                          setProducts(nextProds);
                          setScannedProduct({ ...scannedProduct, stockLevel: nextStock });
                          
                          addMovement({
                            id: `mov-ded-${Date.now()}`,
                            date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
                            time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
                            sku: scannedProduct.sku,
                            description: `Issued 1 unit via staff barcode scanner companion`,
                            type: "OUT",
                            quantity: 1,
                            referenceId: "MAN-ADJ",
                            executedBy: "Enterprise Staff",
                            avatarUrl: ""
                          });
                        }}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        - Issue 1 Unit
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-[11px] text-zinc-500 italic bg-surface-container-low border border-dashed border-outline-variant/40 rounded-xl">
                  Ready. Simulate a barcode trigger or present product tag above.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* FEATURE: Persistent Mini Camera Overlay UI */}
      {/* ========================================== */}
      {cameraActive && (
        <div className="fixed bottom-6 right-6 w-72 bg-[#09090b] border border-outline-variant rounded-2xl shadow-2xl z-40 animate-slide-in overflow-hidden flex flex-col font-sans">
          <div className="p-3 bg-surface-container-low border-b border-outline-variant flex justify-between items-center text-on-surface text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-500">
              <span className="animate-pulse block w-2 h-2 rounded-full bg-emerald-500" />
              <span>Staff Live-Cam Overlay</span>
            </div>
            <button
              type="button"
              onClick={() => {
                stopScannerCamera();
                setCameraActive(false);
              }}
              className="p-1 hover:bg-error/10 hover:text-error rounded text-zinc-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 space-y-2">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-outline-variant">
              <video
                ref={overlayVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider">Simulate Decode</label>
              <select
                className="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-semibold text-on-surface cursor-pointer focus:outline-none"
                onChange={(e) => {
                  const prod = products.find(p => p.sku === e.target.value);
                  if (prod) {
                    setScannedProduct(prod);
                  }
                }}
              >
                <option value="">-- Rapid Selector --</option>
                {products.map(p => (
                  <option key={p.sku} value={p.sku}>{p.sku} - {p.name}</option>
                ))}
              </select>
            </div>

            {/* Micro display in persistent camera frame */}
            {scannedProduct ? (
              <div className="p-2.5 bg-[#121214] border border-outline-variant rounded-xl text-left text-xs space-y-1 animate-fade-in text-on-surface">
                <p className="font-bold text-on-surface truncate">{scannedProduct.name}</p>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-zinc-500">Stock Status:</span>
                  <span className={`font-mono font-bold ${scannedProduct.stockLevel <= scannedProduct.minStockLevel ? "text-error" : "text-emerald-500"}`}>
                    {scannedProduct.stockLevel} Left
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] pt-1 border-t border-outline-variant/30 text-zinc-400">
                  <span>Price: ${scannedProduct.sellPrice.toFixed(2)}</span>
                  <span>Loc: Zone A</span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-zinc-500 italic text-center py-2 bg-surface-container-low border border-dashed border-outline-variant/30 rounded-lg">
                Decoded results display here in real-time.
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
