/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AppProvider, useApp } from "./context";
import POSDashboard from "./components/POSDashboard";
import POSQuickBilling from "./components/POSQuickBilling";
import ERPStockOverview from "./components/ERPStockOverview";
import ERPMovementHistory from "./components/ERPMovementHistory";
import ERPProductEditor from "./components/ERPProductEditor";
import ERPPurchaseOrders from "./components/ERPPurchaseOrders";
import ERPGoogleSheets from "./components/ERPGoogleSheets";
import ERPStaffDesk from "./components/ERPStaffDesk";
import EnterprisePortal from "./components/EnterprisePortal";

import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Warehouse,
  Package,
  History,
  Truck,
  Building,
  MapPin,
  LineChart,
  ShieldAlert,
  Sliders,
  UserPlus,
  Edit3,
  Save,
  Check,
  Coins,
  Percent,
  Key,
  RefreshCw,
  Award,
  FileSpreadsheet
} from "lucide-react";

// Beautiful inline mountain-peak architectural logo mapping the user's attachment
const MAMLogo = ({ className = "h-8 w-auto" }: { className?: string }) => (
  <svg 
    viewBox="0 0 200 100" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="mamGrad" x1="0" y1="100" x2="200" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#005BFF" />
        <stop offset="30%" stopColor="#00C4FF" />
        <stop offset="65%" stopColor="#0072FF" />
        <stop offset="100%" stopColor="#0035FF" />
      </linearGradient>
    </defs>
    {/* Left dynamic peaks representing "M" */}
    <path 
      d="M 12 90 L 52 32 L 68 56 L 56 56 L 48 44 L 24 90 Z" 
      fill="url(#mamGrad)" 
    />
    {/* Tall main central arch representing "A" */}
    <path 
      d="M 52 90 L 100 12 L 148 90 L 134 90 L 100 36 L 64 90 Z" 
      fill="url(#mamGrad)" 
    />
    {/* Right mirroring peak representing "M" */}
    <path 
      d="M 188 90 L 148 32 L 132 56 L 144 56 L 152 44 L 176 90 Z" 
      fill="url(#mamGrad)" 
    />
  </svg>
);

function RootDashboardContainer() {
  const {
    appSuite,
    setAppSuite,
    posView,
    setPosView,
    erpView,
    setErpView,
    editingProductSku,
    profiles,
    activeProfile,
    setActiveProfile,
    addProfile,
    updateProfile,
    settings,
    updateSettings,
    currentCompany,
    currentStaff,
    logout
  } = useApp();

  if (!currentCompany) {
    return <EnterprisePortal />;
  }

  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  // Profile modal and state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab] = useState<"switch" | "edit" | "create">("switch");

  // Create Profile state
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileEmail, setNewProfileEmail] = useState("");
  const [newProfileRole, setNewProfileRole] = useState("Sales Representative");
  const [newProfileBranch, setNewProfileBranch] = useState("Main Hub Branch");
  const [newProfileAvatar, setNewProfileAvatar] = useState("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80");

  // Edit Profile state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editBranch, setEditBranch] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  const presetAvatars = [
    { name: "Default Amber", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" },
    { name: "Tech Lead Blue", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
    { name: "Executive Lady", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
    { name: "Gentleman Red", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
    { name: "Team Lead Yellow", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80" }
  ];

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col text-on-surface antialiased font-sans">
      
      {/* GLOBAL ENTERPRISE TOP HEADER */}
      <header className="h-16 bg-surface-container-lowest border-b border-outline-variant px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs select-none">
        
        {/* Brand identity & Suite-Switch Trigger */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-12 flex items-center justify-center bg-transparent">
              <MAMLogo className="h-9 w-auto" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-black text-on-surface text-sm tracking-tight leading-none block truncate max-w-[160px] md:max-w-[260px] uppercase text-primary">
                {currentCompany?.name}
              </span>
              <span className="text-[9px] font-bold text-outline-variant uppercase tracking-wider leading-none block mt-1 font-mono">
                {currentStaff ? `${currentStaff.name} • ${currentStaff.role}` : "Proprietor Owner Admin"}
              </span>
            </div>
          </div>
          
          {/* Glowing Switch Toggle */}
          <div className="flex border border-outline-variant rounded-full p-0.5 bg-surface-container-low shrink-0 shadow-inner">
            <button
              onClick={() => setAppSuite("POS")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                appSuite === "POS"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              MAM ERP POS Terminal
            </button>
            <button
              onClick={() => {
                if (currentStaff && currentStaff.role === "Cashier") {
                  alert("Access Restricted: Back-Office and Inventory ERP ledger modules are disabled for cashiers. Please contact the company owner.");
                  return;
                }
                setAppSuite("ERP");
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                appSuite === "ERP"
                  ? "bg-primary text-white shadow-xs border border-primary/30 font-extrabold"
                  : currentStaff && currentStaff.role === "Cashier"
                  ? "text-on-surface-variant/40 cursor-not-allowed"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Pro-Ledger ERP Back-Office
            </button>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-4">
          
          {/* Universal Search box */}
          <div className={`relative w-64 hidden md:block transition-all ${searchFocused ? "w-80" : "w-64"}`}>
            <Search className="w-4 h-4 text-on-secondary-container absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search catalog models..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="pl-9 pr-4 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {/* Integrated notification trigger */}
          <div className="relative">
            <button 
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer text-on-surface-variant relative select-none"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-error rounded-full animate-pulse"></span>
            </button>

            {showNotificationMenu && (
              <div className="absolute top-10 right-0 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl p-4 z-50 animate-fade-in text-xs space-y-3">
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                  <h4 className="font-bold text-on-surface font-display">SLA Alerts & Logs</h4>
                  <button onClick={() => setShowNotificationMenu(false)} className="text-secondary hover:text-error">Close</button>
                </div>
                <div className="space-y-2">
                  <div className="p-2 hover:bg-surface-container-low rounded border border-outline-variant/30">
                    <p className="font-bold text-error">Low stock threshold breached</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">Premium Headset X2: 24 units left</p>
                  </div>
                  <div className="p-2 hover:bg-surface-container-low rounded border border-outline-variant/30">
                    <p className="font-bold text-[#006e2a]">Carrier arriving safe</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">Cisco catalyst check-in successful</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic User Profile Quick Settings Trigger */}
          <div 
            onClick={() => {
              setEditName(activeProfile.name);
              setEditEmail(activeProfile.email);
              setEditRole(activeProfile.role);
              setEditBranch(activeProfile.branch);
              setEditAvatar(activeProfile.avatarUrl);
              setProfileTab("switch");
              setShowProfileModal(true);
            }} 
            className="flex items-center gap-2 pl-2 border-l border-outline-variant hover:bg-surface-container-low p-1.5 rounded-lg cursor-pointer transition-all active:scale-95 group select-none"
          >
            <div className="h-8 w-8 rounded-full overflow-hidden border border-primary shrink-0 relative">
              <img 
                src={activeProfile.avatarUrl} 
                alt={`${activeProfile.name} Corporate Profile`}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover group-hover:scale-110 transition-transform" 
              />
            </div>
            <div className="hidden lg:block text-left text-body-sm select-none">
              <span className="font-sans text-xs font-black text-on-surface block group-hover:text-primary transition-colors">{activeProfile.name}</span>
              <span className="text-[10px] text-on-secondary-container leading-none block uppercase">
                {activeProfile.role} • <span className="text-primary font-bold">{activeProfile.branch}</span>
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-on-surface-variant group-hover:text-primary transition-colors hidden lg:block" />
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE FRAME */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* DYNAMIC LEFT SIDEBAR */}
        <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col justify-between select-none shrink-0 sticky top-16 h-[calc(100vh-64px)] hidden md:flex">
          
          <div className="p-card-padding space-y-6">
            <div>
              <span className="text-[10px] font-bold text-on-secondary-container bg-secondary-container/50 px-2 py-0.5 rounded uppercase tracking-wider">
                {appSuite === "POS" ? "Branch Sales Desk" : "HQ Back-Office"}
              </span>
              <p className="text-xs text-on-surface-variant mt-1.5 font-medium">Enterprise Edition V4.1</p>
            </div>

            {/* Match specific sidebars */}
            {appSuite === "POS" ? (
              // SHEETERP POS NAVIGATION
              <nav className="space-y-1">
                <button
                  onClick={() => setPosView("Dashboard")}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 text-left cursor-pointer ${
                    posView === "Dashboard"
                      ? "bg-primary-fixed text-on-primary-fixed font-black"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard Control
                </button>
                <button
                  onClick={() => setPosView("QuickBilling")}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 text-left cursor-pointer ${
                    posView === "QuickBilling"
                      ? "bg-primary-fixed text-on-primary-fixed font-black"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Quick Billing Terminal
                </button>
                <button
                  onClick={() => setPosView("Customers")}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 text-left cursor-pointer ${
                    posView === "Customers"
                      ? "bg-primary-fixed text-on-primary-fixed font-black"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Customers Catalog
                </button>
                <button
                  onClick={() => setPosView("Reports")}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 text-left cursor-pointer ${
                    posView === "Reports"
                      ? "bg-primary-fixed text-on-primary-fixed font-black"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Sales Reports
                </button>
                <button
                  onClick={() => setPosView("Settings")}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 text-left cursor-pointer ${
                    posView === "Settings"
                      ? "bg-primary-fixed text-on-primary-fixed font-black"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Terminal Settings
                </button>
              </nav>
            ) : (
              // PRO-LEDGER ENTERPRISE NAVIGATION
              <nav className="space-y-1">
                <button
                  onClick={() => setErpView("StockOverview")}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 text-left cursor-pointer ${
                    erpView === "StockOverview"
                      ? "bg-secondary-fixed text-on-secondary-fixed font-black border border-outline-variant/40"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <Warehouse className="w-4 h-4 text-on-surface-variant" />
                  Inventory HQ / Stock
                </button>
                <button
                  onClick={() => setErpView("ProductMaster")}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 text-left cursor-pointer ${
                    erpView === "ProductMaster"
                      ? "bg-secondary-fixed text-on-secondary-fixed font-black border border-outline-variant/40"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <Package className="w-4 h-4 text-on-surface-variant" />
                  Product Master
                </button>
                <button
                  onClick={() => setErpView("MovementHistory")}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 text-left cursor-pointer ${
                    erpView === "MovementHistory"
                      ? "bg-secondary-fixed text-on-secondary-fixed font-black border border-outline-variant/40"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <History className="w-4 h-4 text-on-surface-variant" />
                  Movement History
                </button>
                <button
                  onClick={() => setErpView("PurchaseOrders")}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 text-left cursor-pointer ${
                    erpView === "PurchaseOrders"
                      ? "bg-secondary-fixed text-on-secondary-fixed font-black border border-outline-variant/40"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <Truck className="w-4 h-4 text-on-surface-variant" />
                  Procurement/POs
                </button>
                <button
                  onClick={() => setErpView("Suppliers")}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 text-left cursor-pointer ${
                    erpView === "Suppliers"
                      ? "bg-secondary-fixed text-on-secondary-fixed font-black border border-[#adc7ff]"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <Building className="w-4 h-4 text-on-surface-variant" />
                  Active Suppliers
                </button>
                <button
                  onClick={() => setErpView("Warehouse")}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 text-left cursor-pointer ${
                    erpView === "Warehouse"
                      ? "bg-secondary-fixed text-on-secondary-fixed font-black"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <MapPin className="w-4 h-4 text-on-surface-variant" />
                  Warehouse cells
                </button>
                <button
                  onClick={() => setErpView("Analytics")}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 text-left cursor-pointer ${
                    erpView === "Analytics"
                      ? "bg-secondary-fixed text-on-secondary-fixed font-black"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <LineChart className="w-4 h-4 text-on-surface-variant" />
                  ERP Analytics
                </button>
                <button
                  onClick={() => setErpView("GoogleSheets")}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 text-left cursor-pointer ${
                    erpView === "GoogleSheets"
                      ? "bg-secondary-fixed text-on-secondary-fixed font-black border border-outline-variant/40"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-on-surface-variant" />
                  Google Sheets Hub
                </button>

                <button
                  onClick={() => setErpView("StaffDesk")}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 text-left cursor-pointer ${
                    erpView === "StaffDesk"
                      ? "bg-secondary-fixed text-on-secondary-fixed font-black border border-outline-variant/50"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <Sliders className="w-4 h-4 text-primary" />
                  Control & Staff
                </button>

                {editingProductSku && (
                  <button
                    onClick={() => setErpView("ProductEditor")}
                    className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 text-left cursor-pointer ${
                      erpView === "ProductEditor"
                        ? "bg-secondary-fixed text-on-secondary-fixed font-black"
                        : "text-error hover:bg-error/5"
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    Product Core Editor
                  </button>
                )}
              </nav>
            )}
          </div>

          {/* Logout / Support link footer */}
          <div className="p-card-padding border-t border-outline-variant space-y-1">
            <button className="w-full px-3 py-2 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface flex items-center gap-3 text-left cursor-pointer">
              <HelpCircle className="w-4 h-4" />
              Direct Support
            </button>
            <button 
              onClick={() => {
                if (confirm("Are you sure you want to sign out from this enterprise tenant workspace?")) {
                  logout();
                }
              }}
              className="w-full px-3 py-2 rounded-lg text-xs font-bold text-error hover:bg-error/5 flex items-center gap-3 text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign-out Desk
            </button>
          </div>
        </aside>

        {/* WORKSPACE ACTIVE SUBVIEW PORTS RENDERER */}
        <main className="flex-1 overflow-y-auto p-margin-page custom-scrollbar min-h-0 bg-surface-bright border-l border-outline-variant/30 relative">
          {/* Subtle Bento Glows */}
          <div className="absolute top-1/4 right-[10%] w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none select-none"></div>
          <div className="absolute bottom-1/4 left-[5%] w-80 h-80 bg-tertiary/5 rounded-full blur-3xl pointer-events-none select-none"></div>
          <div className="relative z-10">
          {appSuite === "POS" ? (
            // POS App Views Routing Switch
            (() => {
              switch (posView) {
                case "Dashboard":
                  return <POSDashboard />;
                case "QuickBilling":
                  return <POSQuickBilling />;
                case "Customers":
                  return (
                    <div className="glass-card bg-surface-container-lowest border-outline-variant p-6 rounded-xl animate-fade-in space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30">
                        <div>
                          <h2 className="font-display font-bold text-xl text-on-surface">Registered Customers catalog</h2>
                          <p className="text-xs text-on-surface-variant mt-1">Shared commercial ledger clients records.</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-outline-variant rounded-xl bg-surface-container-low flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-primary tracking-widest block uppercase">WALK-IN STANDARD</span>
                            <h4 className="font-display font-bold text-base text-on-surface mt-1">Walk-in Customer</h4>
                            <p className="text-xs text-on-surface-variant mt-1">Standard counter check-out profile.</p>
                          </div>
                        </div>
                        <div className="p-4 border border-outline-variant rounded-xl bg-surface-container-low flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-[#006e2a] tracking-widest block uppercase">ACC-1002 REGULAR</span>
                            <h4 className="font-display font-bold text-base text-on-surface mt-1">Sarah Johnson</h4>
                            <p className="text-xs text-on-surface-variant mt-1">Email: sarah.j@email.com</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                case "Reports":
                  return (
                    <div className="glass-card bg-surface-container-lowest border-outline-variant p-6 rounded-xl animate-fade-in text-center space-y-4">
                      <BarChart3 className="w-16 h-16 text-primary mx-auto" />
                      <h2 className="font-display font-bold text-xl text-on-surface">Financial Ledger Reports</h2>
                      <p className="text-xs text-on-surface-variant max-w-md mx-auto">This widget generates consolidated POS and Procurement cash-flow balances. Export full PDFs through the export tools in main view ports.</p>
                    </div>
                  );
                case "Settings":
                  return (
                    <div className="space-y-6 animate-fade-in text-on-surface">
                      
                      {/* PAGE TITLE HEADER */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-outline-variant/35 gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-primary tracking-widest block uppercase font-mono mb-1">SYSTEM CONTROLS</span>
                          <h2 className="font-display font-black text-2xl text-on-surface">Configuration Desk & User Directory</h2>
                          <p className="text-xs text-on-surface-variant mt-1">Configure live VAT tax rates, system currencies, locate active nodes, and manage employee identities.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-[#006e2a]/10 border border-[#006e2a]/20 text-[#006e2a] px-3 py-1.5 rounded-lg text-xs font-bold font-mono">
                          <span className="h-2 w-2 rounded-full bg-[#006e2a] animate-pulse"></span>
                          REAL-TIME SYNC DESK ACTIVE
                        </div>
                      </div>

                      {/* BENTO LAYOUT GRIDS */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* LEFT COLUMN - SYSTEM OPTIONS (7 COLS) */}
                        <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-card-padding shadow-xs space-y-6">
                          <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/35">
                            <Sliders className="w-4 h-4 text-primary" />
                            <h3 className="font-display font-bold text-sm text-on-surface uppercase tracking-wider">Editable System Options</h3>
                          </div>

                          <div className="space-y-5">
                            
                            {/* Option Item 1: Billing VAT Rate */}
                            <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-lg space-y-2">
                              <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-on-surface flex items-center gap-1.5">
                                  <Percent className="w-3.5 h-3.5 text-primary" />
                                  Global Billing VAT Rate
                                </label>
                                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                  {settings.billingVat}.00%
                                </span>
                              </div>
                              <p className="text-[11px] text-on-surface-variant">Applied automatically on all checkout carts inside POS Terminal.</p>
                              <div className="flex items-center gap-3 pt-1">
                                <button
                                  onClick={() => updateSettings({ billingVat: Math.max(0, settings.billingVat - 1) })}
                                  className="h-8 w-8 rounded bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95 transition-all"
                                >
                                  -
                                </button>
                                <input
                                  type="range"
                                  min="0"
                                  max="40"
                                  value={settings.billingVat}
                                  onChange={(e) => updateSettings({ billingVat: Number(e.target.value) })}
                                  className="flex-1 h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <button
                                  onClick={() => updateSettings({ billingVat: Math.min(40, settings.billingVat + 1) })}
                                  className="h-8 w-8 rounded bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95 transition-all"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Option Item 2: Base Currency Selector */}
                            <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-lg space-y-2">
                              <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-on-surface flex items-center gap-1.5">
                                  <Coins className="w-3.5 h-3.5 text-primary" />
                                  Base Currency Symbol
                                </label>
                                <span className="font-mono text-xs font-black text-white bg-on-surface-variant px-2 py-0.5 rounded">
                                  Symbol: {settings.currencySymbol}
                                </span>
                              </div>
                              <p className="text-[11px] text-on-surface-variant">Locally replaces standard currency indicators in receipts and catalog grids.</p>
                              <div className="grid grid-cols-6 gap-2 pt-1 font-mono text-xs font-bold">
                                {["$", "€", "£", "¥", "৳", "₹"].map((sym) => (
                                  <button
                                    key={sym}
                                    onClick={() => updateSettings({ currencySymbol: sym })}
                                    className={`py-1.5 rounded border transition-all cursor-pointer ${
                                      settings.currencySymbol === sym
                                        ? "bg-primary text-white border-primary shadow-xs"
                                        : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border-outline-variant"
                                    }`}
                                  >
                                    {sym}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Option Grid Pair: Low Stock Warning & Hub Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              
                              <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-lg space-y-2">
                                <label className="text-xs font-black text-on-surface flex items-center gap-1.5">
                                  <Package className="w-3.5 h-3.5 text-primary" />
                                  Min Buffer Alert List
                                </label>
                                <p className="text-[10px] text-on-surface-variant">Highlight items below units:</p>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="2"
                                    max="500"
                                    value={settings.lowStockThreshold}
                                    onChange={(e) => updateSettings({ lowStockThreshold: Math.max(2, Number(e.target.value)) })}
                                    className="w-full px-3 py-1.5 border border-outline-variant bg-surface-container-lowest rounded text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                                  />
                                  <span className="text-[10px] font-bold text-on-surface-variant font-mono uppercase bg-surface-container-highest px-2 py-1.5 rounded border border-outline-variant">PCS</span>
                                </div>
                              </div>

                              <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-lg space-y-2">
                                <label className="text-xs font-black text-on-surface flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-primary" />
                                  Corporate Desk Hub Location
                                </label>
                                <p className="text-[10px] text-on-surface-variant">Update active node address:</p>
                                <input
                                  type="text"
                                  placeholder="e.g. Kyoto HQ Desk"
                                  value={settings.mainHubBranch}
                                  onChange={(e) => {
                                    updateSettings({ mainHubBranch: e.target.value });
                                    updateProfile(activeProfile.id, { branch: e.target.value });
                                  }}
                                  className="w-full px-3 py-1.5 border border-outline-variant bg-surface-container-lowest rounded text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                              </div>

                            </div>

                          </div>
                        </div>

                        {/* RIGHT COLUMN - ACTIVE PROFILE PORTRAIT & EDIT PANEL (5 COLS) */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                          
                          {/* Active Profile Card Display */}
                          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary shadow-md shrink-0">
                                <img
                                  src={activeProfile.avatarUrl}
                                  alt="Active Profile Picture"
                                  referrerPolicy="no-referrer"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-primary font-mono uppercase tracking-widest bg-primary/15 px-2 py-0.5 rounded border border-primary/20">CURRENT LOGGED SESSION</span>
                                <h4 className="font-display font-black text-base text-on-surface mt-1">{activeProfile.name}</h4>
                                <p className="text-xs text-on-surface-variant">{activeProfile.role} • <span className="text-primary font-bold">{activeProfile.branch}</span></p>
                              </div>
                            </div>

                            <div className="p-3 bg-surface-container-lowest border border-outline-variant/40 rounded-lg grid grid-cols-2 gap-2 text-[10px] font-mono">
                              <div>
                                <span className="text-on-surface-variant block uppercase text-[8px] font-semibold">Corporate Node</span>
                                <span className="font-bold text-on-surface truncate block">{activeProfile.branch}</span>
                              </div>
                              <div>
                                <span className="text-on-surface-variant block uppercase text-[8px] font-semibold">Acting Clearance</span>
                                <span className="font-bold text-primary uppercase select-none">{activeProfile.id === "prof-1" ? "SysAdmin Lvl 4" : "Commercial Op"}</span>
                              </div>
                              <div className="mt-1.5 col-span-2">
                                <span className="text-on-surface-variant block uppercase text-[8px] font-semibold">Operator Email</span>
                                <span className="font-bold text-on-surface truncate block">{activeProfile.email}</span>
                              </div>
                            </div>
                          </div>

                          {/* Profile Quick Edit Tab Block */}
                          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-card-padding shadow-xs space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30">
                              <Edit3 className="w-4 h-4 text-primary" />
                              <h3 className="font-display font-bold text-xs text-on-surface uppercase tracking-wider">USE PROFILE EDIT</h3>
                            </div>

                            <p className="text-[11px] text-on-surface-variant">Update details of the currently acting personnel. Modifications persist live:</p>
                            
                            <div className="space-y-3 text-xs">
                              <div>
                                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Full Operator Name</label>
                                <input
                                  type="text"
                                  value={editName}
                                  placeholder={activeProfile.name}
                                  onChange={(e) => {
                                    setEditName(e.target.value);
                                    updateProfile(activeProfile.id, { name: e.target.value });
                                  }}
                                  className="w-full px-3 py-1.5 border border-outline-variant bg-surface-container-low rounded text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Corporate Role & Title</label>
                                <select
                                  value={editRole}
                                  onChange={(e) => {
                                    setEditRole(e.target.value);
                                    updateProfile(activeProfile.id, { role: e.target.value });
                                  }}
                                  className="w-full px-3 py-1.5 border border-outline-variant bg-surface-container-low rounded text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                                >
                                  <option value="Enterprise Admin">Enterprise Admin</option>
                                  <option value="Procurement Specialist">Procurement Specialist</option>
                                  <option value="Retail Cashier">Retail Cashier</option>
                                  <option value="Executive Officer">Executive Officer</option>
                                  <option value="Associate Clerk">Associate Clerk</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Corporate Email Address</label>
                                <input
                                  type="email"
                                  value={editEmail}
                                  placeholder={activeProfile.email}
                                  onChange={(e) => {
                                    setEditEmail(e.target.value);
                                    updateProfile(activeProfile.id, { email: e.target.value });
                                  }}
                                  className="w-full px-3 py-1.5 border border-outline-variant bg-surface-container-low rounded text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Portrait Avatar Preset</label>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {presetAvatars.map((av, index) => (
                                    <button
                                      key={index}
                                      onClick={() => {
                                        setEditAvatar(av.url);
                                        updateProfile(activeProfile.id, { avatarUrl: av.url });
                                      }}
                                      title={av.name}
                                      className={`h-8 w-8 rounded-full overflow-hidden border cursor-pointer transition-all ${
                                        activeProfile.avatarUrl === av.url ? "ring-2 ring-primary border-transparent scale-105" : "border-outline-variant opacity-70 hover:opacity-100"
                                      }`}
                                    >
                                      <img src={av.url} alt="" className="h-full w-full object-cover" />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-[#006e2a]/5 border border-[#006e2a]/15 text-[#006e2a] rounded p-2 flex items-center justify-between text-[10px] font-mono mt-2">
                                <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Fields live auto-saved</span>
                                <span className="text-[8px] uppercase bg-[#006e2a]/10 px-1.5 rounded">{activeProfile.name.split(" ")[0]} Active</span>
                              </div>

                            </div>
                          </div>

                        </div>
                      </div>

                      {/* ROW 3: ALL PERSONNEL DIRECTORY Node & CREATE PROFILE */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                        
                        {/* CORPORATE PERSONNEL LISTING DIRECTORY (7 COLS) */}
                        <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-card-padding shadow-xs space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30">
                            <Users className="w-4 h-4 text-primary" />
                            <h3 className="font-display font-bold text-xs text-on-surface uppercase tracking-wider">Corporate Personnel Directory Node</h3>
                          </div>
                          
                          <p className="text-[11px] text-on-surface-variant">Click to shift current acting session and perform checkout transactions as this user:</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {profiles.map((prof) => (
                              <div 
                                key={prof.id} 
                                className={`p-3 rounded-lg border flex flex-col justify-between transition-all gap-2.5 ${
                                  activeProfile.id === prof.id 
                                    ? "bg-primary/5 border-primary shadow-xs" 
                                    : "bg-surface-container-low/60 border-outline-variant/30 hover:bg-surface-container-low hover:border-outline-variant"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant shrink-0">
                                    <img src={prof.avatarUrl} alt="" className="h-full w-full object-cover" />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-xs text-on-surface truncate">{prof.name}</h4>
                                    <p className="text-[9px] text-on-surface-variant truncate uppercase tracking-wider font-mono leading-none mt-0.5">{prof.role}</p>
                                    <p className="text-[9px] text-primary mt-0.5 font-semibold font-mono">{prof.branch}</p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-2 text-[9px]">
                                  <span className="text-on-surface-variant font-mono">{prof.email}</span>
                                  {activeProfile.id === prof.id ? (
                                    <span className="font-bold text-[#006e2a] bg-[#006e2a]/10 px-2 py-0.5 rounded border border-[#006e2a]/20 uppercase">ACTING</span>
                                  ) : (
                                    <button 
                                      onClick={() => {
                                        setActiveProfile(prof);
                                        // Update edit fields state too
                                        setEditName(prof.name);
                                        setEditEmail(prof.email);
                                        setEditRole(prof.role);
                                        setEditBranch(prof.branch);
                                        setEditAvatar(prof.avatarUrl);
                                      }}
                                      className="font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary px-2.5 py-0.5 rounded transition-colors cursor-pointer"
                                    >
                                      ACT AS
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* CREATE PROFILE DESK PORTAL (5 COLS) */}
                        <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-card-padding shadow-xs space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30">
                            <UserPlus className="w-4 h-4 text-primary" />
                            <h3 className="font-display font-bold text-xs text-on-surface uppercase tracking-wider font-sans">CRATE PROFILE (Provision New Member)</h3>
                          </div>

                          <p className="text-[11px] text-on-surface-variant">Register employee metadata. Once provisioned, they immediately display in active directories:</p>
                          
                          <div className="space-y-2.5 text-xs">
                            <div>
                              <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-0.5">New Operator Full Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Liam Sterling"
                                value={newProfileName}
                                onChange={(e) => setNewProfileName(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-outline-variant bg-surface-container-low rounded text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-0.5">Role Title</label>
                                <select
                                  value={newProfileRole}
                                  onChange={(e) => setNewProfileRole(e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-outline-variant bg-surface-container-low rounded text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                                >
                                  <option value="Enterprise Admin">Enterprise Admin</option>
                                  <option value="Procurement Specialist">Procurement Specialist</option>
                                  <option value="Retail Cashier">Retail Cashier</option>
                                  <option value="Inventory Analyst">Inventory Analyst</option>
                                  <option value="Associate Clerk">Associate Clerk</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-0.5">Access Branch</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Kyoto HQ"
                                  value={newProfileBranch}
                                  onChange={(e) => setNewProfileBranch(e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-outline-variant bg-surface-container-low rounded text-xs font-bold"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-0.5 font-sans">Corporate Email</label>
                              <input
                                type="email"
                                placeholder="liam.s@sheeterp.com"
                                value={newProfileEmail}
                                onChange={(e) => setNewProfileEmail(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-outline-variant bg-surface-container-low rounded text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                              />
                            </div>

                            <div>
                              <span className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Portrait Avatar Select</span>
                              <div className="flex gap-2 font-sans select-none">
                                {presetAvatars.slice(0, 4).map((preset, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setNewProfileAvatar(preset.url)}
                                    className={`h-7 w-7 rounded-full overflow-hidden border cursor-pointer transition-all ${
                                      newProfileAvatar === preset.url ? "ring-2 ring-primary border-transparent scale-105" : "border-outline-variant opacity-60 hover:opacity-100"
                                    }`}
                                  >
                                    <img src={preset.url} alt="" className="h-full w-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            </div>

                            <button 
                              onClick={() => {
                                if (!newProfileName) {
                                  alert("Please fill in the profile name!");
                                  return;
                                }
                                const emailToUse = newProfileEmail || `${newProfileName.toLowerCase().replace(/\s+/g, ".")}@sheeterp.com`;
                                const newId = `prof-${Date.now()}`;
                                const newProf = {
                                  id: newId,
                                  name: newProfileName,
                                  role: newProfileRole,
                                  branch: newProfileBranch,
                                  avatarUrl: newProfileAvatar,
                                  email: emailToUse
                                };
                                addProfile(newProf);
                                setActiveProfile(newProf);
                                // Reset fields
                                setNewProfileName("");
                                setNewProfileEmail("");
                                
                                // Set edit state bindings to newly selected profile
                                setEditName(newProfileName);
                                setEditEmail(emailToUse);
                                setEditRole(newProfileRole);
                                setEditBranch(newProfileBranch);
                                setEditAvatar(newProfileAvatar);

                                alert(`Successfully provisioned Security Ledger Profile Node: ${newProfileName}! Active acting session shifted.`);
                              }}
                              className="mt-2 w-full py-2 bg-primary hover:bg-primary/90 text-white text-xs font-black rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow-sm transition-transform active:scale-[0.98]"
                            >
                              <UserPlus className="h-3 h-3" />
                              PROVISION NEW PROFILE
                            </button>

                          </div>
                        </div>

                      </div>

                    </div>
                  );
                default:
                  return <POSDashboard />;
              }
            })()
          ) : (
            // ERP App Views Routing Switch
            (() => {
              switch (erpView) {
                case "StockOverview":
                case "ProductMaster":
                  return <ERPStockOverview />;
                case "MovementHistory":
                  return <ERPMovementHistory />;
                case "ProductEditor":
                  return <ERPProductEditor />;
                case "PurchaseOrders":
                  return <ERPPurchaseOrders />;
                case "Suppliers":
                  return (
                    <div className="glass-card bg-surface-container-lowest border-outline-variant p-6 rounded-xl animate-fade-in space-y-6">
                      <h2 className="font-display font-bold text-xl text-on-surface">Registered Vendors Partners Panel</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-surface-container-low border rounded-lg">
                          <h4 className="font-bold text-on-surface">Sonic Components Ltd.</h4>
                          <p className="text-xs text-on-surface-variant mt-1">Lead average: 14 Days • Reliability: 98.4%</p>
                        </div>
                        <div className="p-4 bg-surface-container-low border rounded-lg">
                          <h4 className="font-bold text-on-surface">Global Audio Wholesalers</h4>
                          <p className="text-xs text-on-surface-variant mt-1">Lead average: 21 Days • Reliability: 87.8%</p>
                        </div>
                      </div>
                    </div>
                  );
                case "Warehouse":
                  return (
                    <div className="glass-card bg-surface-container-lowest border-outline-variant p-6 rounded-xl animate-fade-in text-center space-y-3">
                      <Warehouse className="w-12 h-12 text-primary mx-auto" />
                      <h2 className="font-display font-bold text-lg text-on-surface">Warehouse Zone Mapping</h2>
                      <p className="text-xs text-on-surface-variant">Zone A (consumables), Zone B (electronics networking), Zone C (server bays).</p>
                    </div>
                  );
                case "Analytics":
                  return (
                    <div className="glass-card bg-surface-container-lowest border-outline-variant p-6 rounded-xl animate-fade-in text-center space-y-4">
                      <LineChart className="w-16 h-16 text-primary mx-auto" strokeWidth={1.5} />
                      <h2 className="font-display font-bold text-xl text-on-surface">Enterprise Logistics Intelligence</h2>
                      <p className="text-xs text-on-surface-variant max-w-md mx-auto">Interactive logistics turnovers, demand forecasts, and shrinkage logs are analyzed in back-office master. Direct sync is active.</p>
                    </div>
                  );
                case "GoogleSheets":
                  return <ERPGoogleSheets />;
                case "StaffDesk":
                  return <ERPStaffDesk />;
                default:
                  return <ERPStockOverview />;
              }
            })()
          )}
          </div>
        </main>
      </div>

      {/* MOBILE NAV HELPER GRID */}
      <nav className="h-14 border-t border-outline-variant bg-surface-container-lowest fixed bottom-0 left-0 right-0 flex md:hidden items-center justify-around z-40 select-none px-2 shadow-md">
        <button 
          onClick={() => {
            setAppSuite("POS");
            setPosView("Dashboard");
          }}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer ${appSuite === "POS" ? "text-primary" : "text-on-surface-variant"}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[9px] font-semibold mt-0.5">POS</span>
        </button>
        <button 
          onClick={() => {
            setAppSuite("POS");
            setPosView("QuickBilling");
          }}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer ${posView === "QuickBilling" && appSuite === "POS" ? "text-primary" : "text-on-surface-variant"}`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="text-[9px] font-semibold mt-0.5">Billing</span>
        </button>
        <button 
          onClick={() => {
            setAppSuite("ERP");
            setErpView("StockOverview");
          }}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer ${appSuite === "ERP" ? "text-[#001f3f]" : "text-on-surface-variant"}`}
        >
          <Warehouse className="w-4 h-4" />
          <span className="text-[9px] font-semibold mt-0.5">ERP HQ</span>
        </button>
      </nav>

      {/* FLOATING ACTION OVERLAY - EMPLOYEE IDENTITY PORTAL MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-outline-variant/35 flex justify-between items-center bg-surface-container-low">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-display font-black text-base text-on-surface">Employee Identity Portal</h3>
                  <p className="text-[11px] text-on-surface-variant">Switch corporate roles, alter active personnel or register new nodes.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-xs font-bold text-on-surface-variant hover:text-error bg-surface-container-lowest border border-outline-variant hover:border-error/25 px-3 py-1 rounded transition-colors cursor-pointer animate-fade-in"
              >
                Close Desk
              </button>
            </div>

            {/* Menu Tabs */}
            <div className="flex border-b border-outline-variant pb-0 bg-surface-container-low/30 text-xs font-bold select-none">
              <button
                onClick={() => setProfileTab("switch")}
                className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition-all ${
                  profileTab === "switch" ? "border-primary text-primary bg-surface-container-lowest" : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Switch Acting Profile
              </button>
              <button
                onClick={() => setProfileTab("edit")}
                className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition-all ${
                  profileTab === "edit" ? "border-primary text-primary bg-surface-container-lowest" : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Edit Current Details
              </button>
              <button
                onClick={() => setProfileTab("create")}
                className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition-all ${
                  profileTab === "create" ? "border-primary text-primary bg-surface-container-lowest" : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Register New Member
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              
              {profileTab === "switch" && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs text-on-surface-variant">Choose a teammate's context to adopt their corporate identity signature:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {profiles.map((prof) => (
                      <div 
                        key={prof.id}
                        onClick={() => {
                          setActiveProfile(prof);
                          setEditName(prof.name);
                          setEditEmail(prof.email);
                          setEditRole(prof.role);
                          setEditBranch(prof.branch);
                          setEditAvatar(prof.avatarUrl);
                        }}
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none active:scale-95 ${
                          activeProfile.id === prof.id 
                            ? "bg-primary/5 border-primary shadow-xs" 
                            : "bg-surface-container-low/40 border-outline-variant/30 hover:bg-surface-container-low hover:border-outline-variant"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-full overflow-hidden border shrink-0">
                            <img src={prof.avatarUrl} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-on-surface truncate">{prof.name}</h4>
                            <p className="text-[10px] text-on-surface-variant truncate uppercase tracking-wider leading-none mt-0.5">{prof.role}</p>
                            <span className="text-[9px] text-primary/80 font-bold font-mono mt-0.5 block">{prof.branch}</span>
                          </div>
                        </div>
                        {activeProfile.id === prof.id && (
                          <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center border border-primary/30 shrink-0">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profileTab === "edit" && (
                <div className="space-y-4 text-xs animate-fade-in">
                  <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/30">
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-primary relative shrink-0">
                      <img src={activeProfile.avatarUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">Modifying identity of: <span className="text-primary font-bold">{activeProfile.name}</span></h4>
                      <p className="text-[10px] text-on-surface-variant font-mono">ID reference tag: {activeProfile.id}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Full Operator Name</label>
                      <input
                        type="text"
                        value={editName}
                        placeholder={activeProfile.name}
                        onChange={(e) => {
                          setEditName(e.target.value);
                          updateProfile(activeProfile.id, { name: e.target.value });
                        }}
                        className="w-full px-3 py-1.5 border border-outline-variant bg-surface-container-low rounded text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Corporate Access Role</label>
                      <select
                        value={editRole}
                        onChange={(e) => {
                          setEditRole(e.target.value);
                          updateProfile(activeProfile.id, { role: e.target.value });
                        }}
                        className="w-full px-3 py-1.5 border border-outline-variant bg-surface-container-low rounded text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="Enterprise Admin">Enterprise Admin</option>
                        <option value="Procurement Specialist">Procurement Specialist</option>
                        <option value="Retail Cashier">Retail Cashier</option>
                        <option value="Executive Officer">Executive Officer</option>
                        <option value="Associate Clerk">Associate Clerk</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Active Email Address</label>
                      <input
                        type="email"
                        value={editEmail}
                        placeholder={activeProfile.email}
                        onChange={(e) => {
                          setEditEmail(e.target.value);
                          updateProfile(activeProfile.id, { email: e.target.value });
                        }}
                        className="w-full px-3 py-1.5 border border-outline-variant bg-surface-container-low rounded text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5 font-sans">Avatar Preset badge</label>
                      <div className="flex gap-2">
                        {presetAvatars.map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setEditAvatar(preset.url);
                              updateProfile(activeProfile.id, { avatarUrl: preset.url });
                            }}
                            className={`h-8 w-8 rounded-full overflow-hidden border cursor-pointer transition-all ${
                              activeProfile.avatarUrl === preset.url ? "ring-2 ring-primary border-transparent scale-105" : "border-outline-variant opacity-70"
                            }`}
                          >
                            <img src={preset.url} alt="" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#006e2a]/5 border border-[#006e2a]/15 text-[#006e2a] rounded p-2.5 flex items-center justify-between text-[10px] font-mono mt-3">
                    <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Auto-saved instantly inside persistent state.</span>
                  </div>
                </div>
              )}

              {profileTab === "create" && (
                <div className="space-y-3 text-xs animate-fade-in">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">New Operator Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Liam Sterling"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-outline-variant bg-surface-container-low rounded text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 font-sans">Role Title</label>
                      <select
                        value={newProfileRole}
                        onChange={(e) => setNewProfileRole(e.target.value)}
                        className="w-full px-3 py-1.5 border border-outline-variant bg-surface-container-low rounded text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="Enterprise Admin">Enterprise Admin</option>
                        <option value="Procurement Specialist">Procurement Specialist</option>
                        <option value="Retail Cashier">Retail Cashier</option>
                        <option value="Inventory Analyst">Inventory Analyst</option>
                        <option value="Associate Clerk">Associate Clerk</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 font-sans">Access Branch</label>
                      <input
                        type="text"
                        placeholder="e.g. Kyoto HQ"
                        value={newProfileBranch}
                        onChange={(e) => setNewProfileBranch(e.target.value)}
                        className="w-full px-3 py-1.5 border border-outline-variant bg-surface-container-low rounded text-xs font-bold focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 font-sans">Corporate Email</label>
                    <input
                      type="email"
                      placeholder="liam.s@sheeterp.com"
                      value={newProfileEmail}
                      onChange={(e) => setNewProfileEmail(e.target.value)}
                      className="w-full px-3 py-1.5 border border-outline-variant bg-surface-container-low rounded text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5 flex items-center gap-1">Portrait Badge Selector</span>
                    <div className="flex gap-2.5">
                      {presetAvatars.map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setNewProfileAvatar(preset.url)}
                          className={`h-8 w-8 rounded-full overflow-hidden border cursor-pointer transition-all ${
                            newProfileAvatar === preset.url ? "ring-2 ring-primary border-transparent scale-105" : "border-outline-variant opacity-60"
                          }`}
                        >
                          <img src={preset.url} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!newProfileName) {
                        alert("Please fill in the profile name!");
                        return;
                      }
                      const emailToUse = newProfileEmail || `${newProfileName.toLowerCase().replace(/\s+/g, ".")}@sheeterp.com`;
                      const newId = `prof-${Date.now()}`;
                      const newProf = {
                        id: newId,
                        name: newProfileName,
                        role: newProfileRole,
                        branch: newProfileBranch,
                        avatarUrl: newProfileAvatar,
                        email: emailToUse
                      };
                      addProfile(newProf);
                      setActiveProfile(newProf);
                      setNewProfileName("");
                      setNewProfileEmail("");
                      
                      setEditName(newProfileName);
                      setEditEmail(emailToUse);
                      setEditRole(newProfileRole);
                      setEditBranch(newProfileBranch);
                      setEditAvatar(newProfileAvatar);

                      alert(`Successfully registered team member: ${newProfileName}! Active acting context transitioned.`);
                      setShowProfileModal(false);
                    }}
                    className="w-full py-2 bg-primary hover:bg-primary/95 text-white text-xs font-black rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-transform active:scale-95 mt-4"
                  >
                    <UserPlus className="h-3 h-3" />
                    CREATE PROFILE NODE
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RootDashboardContainer />
    </AppProvider>
  );
}
