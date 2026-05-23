/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context";
import { Product } from "../types";
import {
  googleSignIn,
  googleSignOut,
  initAuthListener,
  createSpreadsheet,
  syncProductsToSheet,
  importProductsFromSheet,
  syncPurchaseOrdersToSheet,
  syncTransactionsToSheet
} from "../lib/sheetsService";
import {
  FileSpreadsheet,
  Link2,
  Lock,
  PlusCircle,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  LogOut,
  FolderOpen,
  ArrowDownToLine,
  ArrowUpFromLine,
  Terminal,
  Layers,
  Settings,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { User } from "firebase/auth";

export default function ERPGoogleSheets() {
  const { products, setProducts, purchaseOrders, transactions } = useApp();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sheetsAuthDone, setSheetsAuthDone] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState<string>("");
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  
  // Loading & State flags
  const [isBtnLoading, setIsBtnLoading] = useState<string | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [stagedImportProducts, setStagedImportProducts] = useState<Product[]>([]);

  // Logs terminal auto-scroll ref
  const logTerminalEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString(undefined, { hour12: false });
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // Auth Lifecycle setup
  useEffect(() => {
    addLog("Configured Google Sheets service hooks. Ready.");
    const unsubscribe = initAuthListener(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        setSheetsAuthDone(true);
        addLog(`OAuth status: Connected as ${user.email}`);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setSheetsAuthDone(false);
        addLog("OAuth status: Pending manual authorization trigger.");
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync scroll for the logs
  useEffect(() => {
    logTerminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleGoogleLogin = async () => {
    setIsBtnLoading("auth");
    addLog("Launching standard Google Accounts pop-up gateway...");
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        setSheetsAuthDone(true);
        addLog(`Successfully authorized. Connected to: ${res.user.email}`);

        // Try to read cached sheet link from localStorage (convenience only)
        const savedId = localStorage.getItem("mam_erp_sheets_spreadsheet_id");
        if (savedId) {
          setSpreadsheetId(savedId);
          setSpreadsheetUrl(`https://docs.google.com/spreadsheets/d/${savedId}/edit`);
          addLog(`Cached Spreadsheet ID loaded from browser memory: ${savedId}`);
        }
      }
    } catch (err: any) {
      addLog(`Failed authorization popup: ${err.message || err}`);
    } finally {
      setIsBtnLoading(null);
    }
  };

  const handleGoogleLogout = async () => {
    addLog("Signing out and revoking session permissions...");
    try {
      await googleSignOut();
      setCurrentUser(null);
      setAccessToken(null);
      setSheetsAuthDone(false);
      addLog("Successfully logged out. Google session destroyed.");
    } catch (err: any) {
      addLog(`Logout error: ${err.message || err}`);
    }
  };

  const handleCreateNewSpreadsheet = async () => {
    if (!sheetsAuthDone) return;
    setIsBtnLoading("create");
    addLog("Initiating new Google Spreadsheet creation request on Sheets API...");
    try {
      const result = await createSpreadsheet("MAM ERP Enterprise Master Ledger");
      setSpreadsheetId(result.id);
      setSpreadsheetUrl(result.url);
      localStorage.setItem("mam_erp_sheets_spreadsheet_id", result.id);
      addLog(`SUCCESS: Built Spreadsheet "MAM ERP Enterprise Master Ledger"`);
      addLog(`Sheet ID generated: ${result.id}`);
    } catch (err: any) {
      addLog(`Spreadsheet build failed: ${err.message || err}`);
    } finally {
      setIsBtnLoading(null);
    }
  };

  // Extract ID if user pastes whole URL
  const handleSpreadsheetIdChange = (val: string) => {
    let finalId = val.trim();
    if (finalId.includes("docs.google.com/spreadsheets")) {
      // It's a spreadsheet URL!
      const regex = /\/d\/([a-zA-Z0-9-_]+)/;
      const matches = finalId.match(regex);
      if (matches && matches[1]) {
        finalId = matches[1];
        addLog(`Parsed Sheets URL and resolved Spreadsheet ID: ${finalId}`);
      }
    }
    setSpreadsheetId(finalId);
    setSpreadsheetUrl(finalId ? `https://docs.google.com/spreadsheets/d/${finalId}/edit` : "");
    if (finalId) {
      localStorage.setItem("mam_erp_sheets_spreadsheet_id", finalId);
    } else {
      localStorage.removeItem("mam_erp_sheets_spreadsheet_id");
    }
  };

  const handleSyncProducts = async () => {
    if (!spreadsheetId) {
      addLog("SYNC BLOCKED: No Target Spreadsheet ID was selected.");
      return;
    }
    setIsBtnLoading("sync_products");
    addLog(`Preparing overwrite synchronization of ${products.length} catalog items into Sheets tab...`);
    try {
      await syncProductsToSheet(spreadsheetId, products);
      addLog(`SUCCESS: Transferred ${products.length} inventory records to the "Products" sheet tab.`);
    } catch (err: any) {
      addLog(`Products transfer failed: ${err.message || err}`);
    } finally {
      setIsBtnLoading(null);
    }
  };

  const handleSyncPurchaseOrders = async () => {
    if (!spreadsheetId) {
      addLog("SYNC BLOCKED: No Target Spreadsheet ID was selected.");
      return;
    }
    setIsBtnLoading("sync_pos");
    addLog(`Preparing overwrite synchronization of ${purchaseOrders.length} Procurement bills...`);
    try {
      await syncPurchaseOrdersToSheet(spreadsheetId, purchaseOrders);
      addLog(`SUCCESS: Consolidated ${purchaseOrders.length} Purchase Invoices to the "Purchase_Orders" sheet tab.`);
    } catch (err: any) {
      addLog(`Purchase orders sync failed: ${err.message || err}`);
    } finally {
      setIsBtnLoading(null);
    }
  };

  const handleSyncTransactions = async () => {
    if (!spreadsheetId) {
      addLog("SYNC BLOCKED: No Target Spreadsheet ID was selected.");
      return;
    }
    setIsBtnLoading("sync_txs");
    addLog(`Preparing overwrite synchronization of ${transactions.length} POS receipts...`);
    try {
      await syncTransactionsToSheet(spreadsheetId, transactions);
      addLog(`SUCCESS: Generated comprehensive sync of ${transactions.length} sales receipts to the "POS_Sales_History" sheet tab.`);
    } catch (err: any) {
      addLog(`Sales history sync failed: ${err.message || err}`);
    } finally {
      setIsBtnLoading(null);
    }
  };

  // IMPORT WITH FULL SAFETY REQUIREMENTS (User confirmation modal)
  const handleInitiateImportProducts = async () => {
    if (!spreadsheetId) {
      addLog("IMPORT BLOCKED: No spreadsheet ID loaded.");
      return;
    }
    setIsBtnLoading("import_products");
    addLog("Reading 'Products' tab cell indexes from Google Sheets target...");
    try {
      const imported = await importProductsFromSheet(spreadsheetId);
      setStagedImportProducts(imported);
      setShowImportConfirm(true); // Open Safety dialog
      addLog(`Staged ${imported.length} items from Sheets. Waiting for user's confirmation signature.`);
    } catch (err: any) {
      addLog(`Data pull error: ${err.message || err}`);
    } finally {
      setIsBtnLoading(null);
    }
  };

  const handleExecuteImportConfirm = () => {
    if (stagedImportProducts.length === 0) return;
    setProducts(stagedImportProducts);
    setShowImportConfirm(false);
    addLog(`SUCCESSFULLY SIGNED: Overwrote active product catalog with ${stagedImportProducts.length} sheets products.`);
    alert(`MAM Catalog Synced! Successfully replaced active catalog memory with ${stagedImportProducts.length} verified sheets items.`);
    setStagedImportProducts([]);
  };

  return (
    <div className="animate-fade-in relative min-h-[500px]">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface flex items-center gap-2">
          <FileSpreadsheet className="w-8 h-8 text-emerald-600 shrink-0" />
          <span>Google Sheets Hub</span>
        </h1>
        <p className="font-sans text-xs text-on-surface-variant mt-1 text-body-sm">
          A secure, dual-directional synchronization tunnel mapping POS billing and capital inventory databases directly into standard Google Sheets.
        </p>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: CONNECTION DETAILS & LINK CARD */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Google Authentication status */}
          <div className="glass-card p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant flex flex-col relative overflow-hidden shadow-sm">
            <h3 className="font-display text-sm font-bold text-on-surface mb-4 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-primary" />
              <span>Google Account Authorization</span>
            </h3>

            {!sheetsAuthDone ? (
              <div className="space-y-4 py-2">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  In compliance with Google API security standards, authorize connection access to create spreadsheet files and read/write cell datasets securely.
                </p>
                
                {/* Official Material Style Auth Button */}
                <button
                  type="button"
                  disabled={isBtnLoading === "auth"}
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100 py-3 px-4 rounded-xl text-xs font-bold text-zinc-950 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>Authorize Google Workspace</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 font-bold shadow-sm">
                    {currentUser?.displayName ? currentUser.displayName[0] : "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-900 leading-tight">
                      {currentUser?.displayName || "Enterprise User"}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                      {currentUser?.email}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 uppercase tracking-wide mt-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Authorized
                    </span>
                  </div>
                  <button
                    onClick={handleGoogleLogout}
                    className="p-1.5 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 rounded-lg transition-all cursor-pointer"
                    title="Sign Out Google Developer"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Spreadsheet Target Connector */}
          <div className="glass-card p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant flex flex-col shadow-sm">
            <h3 className="font-display text-sm font-bold text-on-surface mb-4 flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-primary" />
              <span>Target Spreadsheet Setup</span>
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Connect the applet to any active spreadsheet in your Google Drive, or quickly generate a beautiful new master workbook template.
              </p>

              {/* Paste Input Container */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase font-mono">
                  Spreadsheet ID or URL
                </label>
                <input
                  type="text"
                  placeholder="Paste URL or Spreadsheet ID..."
                  value={spreadsheetId}
                  disabled={!sheetsAuthDone}
                  onChange={(e) => handleSpreadsheetIdChange(e.target.value)}
                  className="px-3 py-2 text-xs border border-outline-variant bg-surface-container-low rounded-lg outline-none focus:ring-1 focus:ring-primary w-full disabled:opacity-50"
                />
              </div>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant"></div>
                </div>
                <span className="relative px-3 bg-surface-container-lowest text-[10px] text-on-surface-variant font-extrabold uppercase">
                  OR
                </span>
              </div>

              {/* Create Template button */}
              <button
                disabled={!sheetsAuthDone || isBtnLoading === "create"}
                onClick={handleCreateNewSpreadsheet}
                className="w-full py-2.5 px-4 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <PlusCircle className="w-4 h-4" />
                <span>
                  {isBtnLoading === "create" ? "Generating Workbook..." : "Generate New Master Spreadsheet"}
                </span>
              </button>

              {/* Active Sheet Details badge */}
              {spreadsheetId && (
                <div className="p-3 bg-surface-container-low border border-outline-variant/60 rounded-xl space-y-2 mt-2">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-zinc-500">
                    <span>ACTIVE TARGET CONFIG</span>
                    <span className="text-emerald-700">MAPPED</span>
                  </div>
                  <div className="font-mono text-[10px] text-on-surface select-all break-all bg-surface-container-lowest p-2 rounded border border-outline-variant/40">
                    {spreadsheetId}
                  </div>
                  {spreadsheetUrl && (
                    <a
                      href={spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 text-[10px] bg-white border border-outline-variant hover:border-emerald-600 text-on-surface hover:text-emerald-700 rounded-lg text-center font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <ExternalLink className="w-3 h-3 text-emerald-600" />
                      Open Real Google Sheet
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: SYNC OPERATIONS HUB & LOGS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 3: Synchronization Controls Dashboard */}
          <div className="glass-card p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant flex flex-col shadow-sm">
            <h3 className="font-display text-sm font-bold text-on-surface mb-5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" />
              <span>Database Sync Desk</span>
            </h3>

            {/* Sync Hub Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Product Sync Panel */}
              <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-xl flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xs font-black text-on-surface flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Product Inventory Catalog
                  </h4>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed mt-1">
                    Direct cell matrix of SKU numbers, categories, unit markup rates, and storage quantities.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    disabled={!sheetsAuthDone || !spreadsheetId || !!isBtnLoading}
                    onClick={handleSyncProducts}
                    className="flex-1 py-1.5 bg-primary text-white hover:bg-opacity-95 text-[10px] rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-45"
                    title="Export active products to Sheets spreadsheet"
                  >
                    <ArrowUpFromLine className="w-3.5 h-3.5" />
                    Export
                  </button>
                  <button
                    disabled={!sheetsAuthDone || !spreadsheetId || !!isBtnLoading}
                    onClick={handleInitiateImportProducts}
                    className="flex-1 py-1.5 border border-outline-variant text-on-surface hover:border-emerald-600 hover:text-emerald-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 bg-white disabled:opacity-45"
                    title="Import spreadsheet products into our App catalog"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    Import
                  </button>
                </div>
              </div>

              {/* Purchase Bills Sync Panel */}
              <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-xl flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xs font-black text-on-surface flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Procurement Invoices Ledger
                  </h4>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed mt-1">
                    Maintains systemic purchase orders raised to suppliers with values and statuses.
                  </p>
                </div>
                <button
                  disabled={!sheetsAuthDone || !spreadsheetId || !!isBtnLoading}
                  onClick={handleSyncPurchaseOrders}
                  className="w-full py-1.5 bg-primary text-white hover:bg-opacity-95 text-[10px] rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-45 mt-2"
                  title="Export active purchase orders to Sheets spreadsheet"
                >
                  <ArrowUpFromLine className="w-3.5 h-3.5" />
                  Sync Purchase Orders
                </button>
              </div>

              {/* POS Sales History Sync Panel */}
              <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-xl flex flex-col justify-between space-y-4 sm:col-span-2">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-xs font-black text-on-surface flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-tertiary" />
                      POS Checkout receipts ledger
                    </h4>
                    <p className="text-[10px] text-on-surface-variant leading-relaxed mt-1">
                      Exports checked-out sales registers, invoice amounts, client identities and transacted payment routes to standard spreadsheets for bookkeeping.
                    </p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">
                    {transactions.length} receipts staged
                  </span>
                </div>
                <button
                  disabled={!sheetsAuthDone || !spreadsheetId || !!isBtnLoading}
                  onClick={handleSyncTransactions}
                  className="w-full sm:w-auto self-end px-5 py-2 bg-primary text-white hover:bg-opacity-95 text-[10px] rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-45"
                  title="Export active business receipts to Sheets spreadsheet"
                >
                  <ArrowUpFromLine className="w-3.5 h-3.5" />
                  Integrate Checkout Sales History
                </button>
              </div>

            </div>
          </div>

          {/* Card 4: LOGGING TERMINAL CONSOLE */}
          <div className="glass-card p-5 rounded-2xl bg-zinc-950 border border-zinc-900 flex flex-col shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="text-zinc-400 font-mono text-[10px] font-bold tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-500 animate-pulse" />
                SHEETS SYSTEM DIAGNOSTIC CONSOLE
              </span>
              <button
                onClick={() => setLogs([])}
                className="text-[9px] font-mono text-zinc-500 hover:text-zinc-300 font-bold uppercase cursor-pointer"
              >
                Clear Console
              </button>
            </div>
            
            {/* Terminal Window Box */}
            <div className="bg-black/40 rounded-xl p-3.5 min-h-[140px] max-h-[180px] overflow-y-auto custom-scrollbar font-mono text-[10.5px] text-zinc-400 leading-relaxed text-left space-y-1">
              {logs.map((log, idx) => {
                let col = "text-zinc-400";
                if (log.includes("SUCCESS")) col = "text-emerald-500 font-semibold";
                if (log.includes("oauth") || log.includes("OAuth") || log.includes("authorized")) col = "text-blue-400";
                if (log.includes("failed") || log.includes("BLOCKED") || log.includes("failed")) col = "text-error";
                return (
                  <div key={idx} className={`${col} break-words`}>
                    {log}
                  </div>
                );
              })}
              {logs.length === 0 && (
                <div className="text-zinc-600 italic">Console feed quiet. Ready for database synchronization triggers.</div>
              )}
              <div ref={logTerminalEndRef} />
            </div>
          </div>

        </div>

      </div>

      {/* SAFETY REQUIREMENT COMPLIANCE: EXPLICIT CONFIRMATION MODAL */}
      {showImportConfirm && stagedImportProducts.length > 0 && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            
            {/* Top caution stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-600"></div>

            <div className="flex items-start gap-4 mb-4 mt-2">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-500 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-display font-bold text-base text-zinc-950 leading-tight">
                  Overwrite local product catalog?
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                  This action replaces your active ERP inventory memory with items stored on your Google Sheets tab. This action cannot be revoked automatically.
                </p>
              </div>
            </div>

            {/* Render items comparison */}
            <div className="bg-stone-50 border rounded-xl p-3 text-left mb-5 max-h-[140px] overflow-y-auto custom-scrollbar text-xs">
              <span className="text-[10px] font-mono text-zinc-500 block uppercase mb-1.5 font-bold">
                STAGED INCOMING CELLS REGISTRY ({stagedImportProducts.length} items)
              </span>
              <div className="space-y-1 font-medium font-mono text-[10.5px] text-stone-700 divide-y divide-stone-100">
                {stagedImportProducts.map((p, i) => (
                  <div key={i} className="py-1 flex justify-between">
                    <span className="text-blue-700 font-bold">[{p.sku}] {p.name}</span>
                    <span>Qty: {p.stockLevel}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowImportConfirm(false);
                  setStagedImportProducts([]);
                  addLog("Import cancelled by user. Local data preserved.");
                }}
                className="flex-1 py-2 border border-outline-variant hover:border-black/30 bg-surface-container-low text-on-surface font-sans text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Restore Local / Cancel
              </button>
              <button
                onClick={handleExecuteImportConfirm}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-sans text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1 font-black"
                title="Overwrite current local with Sheets rows"
              >
                <CheckCircle className="w-4 h-4" />
                Sign & Authorize Overwrite
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
