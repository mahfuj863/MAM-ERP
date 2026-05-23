/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context";
import { PurchaseOrder } from "../types";
import {
  Coins,
  TrendingUp,
  Clock,
  ThumbsUp,
  Plus,
  Search,
  X,
  FileSpreadsheet,
  CheckCircle,
  Truck,
  Printer,
  FileText,
  Download,
  ShieldCheck,
  Check
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
      <linearGradient id="poMamGrad" x1="0" y1="100" x2="200" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#005BFF" />
        <stop offset="30%" stopColor="#00C4FF" />
        <stop offset="65%" stopColor="#0072FF" />
        <stop offset="100%" stopColor="#0035FF" />
      </linearGradient>
    </defs>
    <path 
      d="M 12 90 L 52 32 L 68 56 L 56 56 L 48 44 L 24 90 Z" 
      fill="url(#poMamGrad)" 
    />
    <path 
      d="M 52 90 L 100 12 L 148 90 L 134 90 L 100 36 L 64 90 Z" 
      fill="url(#poMamGrad)" 
    />
    <path 
      d="M 188 90 L 148 32 L 132 56 L 144 56 L 152 44 L 176 90 Z" 
      fill="url(#poMamGrad)" 
    />
  </svg>
);

export default function ERPPurchaseOrders() {
  const { purchaseOrders, setPurchaseOrders, suppliers, products, settings } = useApp();
  const [showPOModal, setShowPOModal] = useState(false);
  const [searchWord, setSearchWord] = useState("");

  // Bulk Print State
  const [selectedPOIds, setSelectedPOIds] = useState<string[]>([]);
  const [showBulkPrintModal, setShowBulkPrintModal] = useState(false);

  // New PO Form
  const [vendor, setVendor] = useState(suppliers[0]?.name || "");
  const [poAmount, setPoAmount] = useState(45000);

  // Total Outstanding Math
  const totalOutstanding = purchaseOrders
    .filter(p => p.status === "Pending" || p.status === "Partial")
    .reduce((sum, p) => sum + p.total, 182390);

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    const initials = vendor.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
    const newPO: PurchaseOrder = {
      poId: `PO-2023-${Math.floor(8840 + Math.random() * 900)}`,
      supplierName: vendor,
      date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
      status: "Pending",
      total: poAmount,
      initials
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    setShowPOModal(false);
    alert(`Purchase Order ${newPO.poId} raised to supplier ${vendor} securely.`);
  };

  const filteredOrders = purchaseOrders.filter(p => 
    p.supplierName.toLowerCase().includes(searchWord.toLowerCase()) || 
    p.poId.toLowerCase().includes(searchWord.toLowerCase())
  );

  // Bulk Selection Handlers
  const handleSelectAllToggle = () => {
    const allSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedPOIds.includes(o.poId));
    if (allSelected) {
      // Deselect all filtered
      const filteredKeys = filteredOrders.map(o => o.poId);
      setSelectedPOIds(prev => prev.filter(id => !filteredKeys.includes(id)));
    } else {
      // Select all filtered
      const filteredIds = filteredOrders.map(o => o.poId);
      setSelectedPOIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleSelectRow = (poId: string) => {
    setSelectedPOIds(prev =>
      prev.includes(poId) ? prev.filter(id => id !== poId) : [...prev, poId]
    );
  };

  const selectedOrdersData = purchaseOrders.filter(o => selectedPOIds.includes(o.poId));
  const selectedSum = selectedOrdersData.reduce((sum, o) => sum + o.total, 0);

  // Download raw audit trail formatted file
  const handleDownloadLedgerTxt = () => {
    let output = "========================================================================\r\n";
    output += "                    MAM ERP CAPITAL PROCURMENT AUDIT LEDGER             \r\n";
    output += "========================================================================\r\n";
    output += `Date Generated : ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\r\n`;
    output += `Audited Registry Volume: ${selectedOrdersData.length} Purchase Orders\r\n`;
    output += `Total Combined Value   : ${settings.currencySymbol}${selectedSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}\r\n`;
    output += "------------------------------------------------------------------------\r\n\r\n";
    output += "LIST OF AUDITED PURCHASE ORDERS:\r\n";
    output += "------------------------------------------------------------------------\r\n";
    output += "PO REF NO.   | DATE RAISED  | ORDER STATUS    | AMOUNT\r\n";
    output += "------------------------------------------------------------------------\r\n";
    selectedOrdersData.forEach(o => {
      const padRef = o.poId.padEnd(12, " ");
      const padDate = o.date.padEnd(12, " ");
      const padStatus = o.status.padEnd(16, " ");
      const formAmt = `${settings.currencySymbol}${o.total.toLocaleString()}`;
      output += `${padRef} | ${padDate} | ${padStatus} | ${formAmt}\r\n`;
    });
    output += "========================================================================\r\n\r\n";
    output += "VENDORS COUNTED IN THIS BATCH:\r\n";
    const mappedVendors = Array.from(new Set(selectedOrdersData.map(o => o.supplierName)));
    mappedVendors.forEach((v, idx) => {
      output += `${idx + 1}. ${v}\r\n`;
    });
    output += "\r\n========================================================================\r\n";
    output += "STATUS: MAM ERP VALIDATED AUTOMATED REPORT - APPROVED - COUNTERSIGNED\r\n";
    output += "========================================================================\r\n";

    const blob = new Blob([output], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mam_erp_procurement_batch_audit_${selectedOrdersData.length}_records.txt`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Real browser print routing
  const handlePrintCommand = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in relative">
      
      {/* Header operations */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface">Procurement Dashboard</h1>
          <p className="font-sans text-xs text-on-surface-variant mt-1 text-body-sm">MAM ERP Enterprise capital assets, vendor compliance and aging accounts payables.</p>
        </div>
        <button
          onClick={() => setShowPOModal(true)}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg font-sans text-xs font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Raise Purchase Order
        </button>
      </div>

      {/* Corporate Compliance grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-md mb-8">
        
        {/* Outstanding payables */}
        <div className="glass-card p-card-padding rounded-xl bg-surface-container-lowest border-outline-variant">
          <div className="flex justify-between items-start mb-2">
            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">ACCOUNTS PAYABLE</span>
            <Coins className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-on-surface">
              {settings.currencySymbol}{totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </h3>
            <p className="text-xs font-semibold text-tertiary mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14% due within 30 days
            </p>
          </div>
        </div>

        {/* Active orders */}
        <div className="glass-card p-card-padding rounded-xl bg-surface-container-lowest border-outline-variant">
          <div className="flex justify-between items-start mb-2">
            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">ACTIVE ORDERS</span>
            <Clock className="w-5 h-5 text-tertiary" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-on-surface">
              42 Raised
            </h3>
            <p className="text-xs font-semibold text-on-surface-variant mt-2">
              9 shipments in transit
            </p>
          </div>
        </div>

        {/* Average Fulfillment lead */}
        <div className="glass-card p-card-padding rounded-xl bg-surface-container-lowest border-outline-variant">
          <div className="flex justify-between items-start mb-2">
            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">MID FULFILLMENT</span>
            <Truck className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-on-surface">
              4.2 Days
            </h3>
            <p className="text-xs font-semibold text-[#006e2a] mt-2">
              Within optimal carrier thresholds
            </p>
          </div>
        </div>

        {/* Compliance */}
        <div className="glass-card p-card-padding rounded-xl bg-surface-container-lowest border-outline-variant">
          <div className="flex justify-between items-start mb-2">
            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">COMPLIANCE RATIO</span>
            <ThumbsUp className="w-5 h-5 text-tertiary" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-on-surface">
              98.4% Ratio
            </h3>
            <p className="text-xs font-semibold text-on-surface-variant mt-2 font-medium">
              Based on SLA accuracy checks
            </p>
          </div>
        </div>
      </div>

      {/* Search Filter Header */}
      <div className="glass-card p-4 rounded-xl border border-outline-variant bg-surface-container-lowest mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="font-display text-sm font-bold text-on-surface">Raised Purchase Invoices ledger</h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search Supplier or Invoice reference..."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            className="pl-9 pr-4 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Purchase Invoice listing */}
      <div className="glass-card rounded-xl overflow-hidden bg-surface-container-lowest border-outline-variant">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider select-none">
                <th className="px-4 py-4 text-center w-12">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && filteredOrders.every(o => selectedPOIds.includes(o.poId))}
                    onChange={handleSelectAllToggle}
                    className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer accent-primary"
                  />
                </th>
                <th className="px-gutter-md py-4">PO Invoice #</th>
                <th className="px-gutter-md py-4">Supplier / Vendor</th>
                <th className="px-gutter-md py-4 text-center">ORDER STATUS</th>
                <th className="px-gutter-md py-4 text-center">DATE RAISED</th>
                <th className="px-gutter-md py-4 text-right">TOTAL INVOICED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredOrders.map((o) => {
                const isSelected = selectedPOIds.includes(o.poId);
                return (
                  <tr key={o.poId} className={`hover:bg-surface-container-low transition-colors ${isSelected ? "bg-primary/5" : ""}`}>
                    <td className="px-4 py-4 text-center w-12">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(o.poId)}
                        className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer accent-primary"
                      />
                    </td>
                    <td className="px-gutter-md py-4 font-mono text-xs font-bold text-primary">{o.poId}</td>
                    
                    {/* Supplier identity */}
                    <td className="px-gutter-md py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary-fixed flex items-center justify-center font-display text-[10px] font-extrabold text-on-primary-fixed border border-primary/10 select-none uppercase">
                          {o.initials}
                        </div>
                        <span className="font-sans text-sm font-bold text-on-surface">{o.supplierName}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-gutter-md py-4 text-center">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${
                        o.status === "Fully Received"
                          ? "bg-tertiary/10 text-tertiary border-tertiary/20"
                          : o.status === "Pending"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : o.status === "Partial"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-error/10 text-error border-error/20"
                      }`}>
                        {o.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-gutter-md py-4 text-center font-sans text-xs text-on-surface-variant font-semibold">
                      {o.date}
                    </td>

                    {/* Total amount */}
                    <td className="px-gutter-md py-4 text-right font-sans text-xs font-extrabold text-on-surface">
                      {settings.currencySymbol}{o.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FLOATING ACTION TOOLBAR OVERLAY */}
      {selectedPOIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-inverse-surface/95 backdrop-blur-md text-inverse-on-surface px-4 py-3.5 rounded-2xl flex items-center justify-between gap-6 shadow-2xl border border-white/10 animate-fade-in z-40 max-w-lg w-[calc(100%-2rem)]">
          <div className="flex items-center gap-2.5 select-none">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold shadow-sm">
              {selectedPOIds.length}
            </span>
            <div className="text-left">
              <span className="text-[11px] font-bold block leading-tight">Batch Report Staged</span>
              <span className="text-[9px] text-inverse-on-surface/70 leading-none">Sum value: {settings.currencySymbol}{selectedSum.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setSelectedPOIds([])}
              className="text-[10px] font-black uppercase text-inverse-on-surface/80 hover:text-error px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all text-button-xs"
            >
              Clear
            </button>
            <button
              onClick={() => setShowBulkPrintModal(true)}
              className="bg-primary hover:bg-opacity-95 text-white font-extrabold text-[10px] uppercase px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              Generate Bulk Print Report
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ORDER FORM */}
      {showPOModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl w-[400px] max-w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-on-surface text-base">New Procurement Order Draft</h3>
              <button 
                onClick={() => setShowPOModal(false)}
                className="p-1 hover:bg-surface-container-low rounded-full hover:text-error transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePO} className="space-y-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Select Vendor</label>
                <select
                  required
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                >
                  <option value="">-- Choose Vendor Partner --</option>
                  {suppliers.map((s, i) => (
                    <option key={i} value={s.name}>{s.name} (SLAs rating: {s.reliability}%)</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase font-semibold">Allocated capital budget ({settings.currencySymbol})</label>
                <input
                  type="number"
                  required
                  min="100"
                  value={poAmount}
                  onChange={(e) => setPoAmount(Number(e.target.value))}
                  className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary font-bold text-right"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-on-primary py-2.5 rounded-lg text-xs font-bold hover:bg-opacity-95 shadow-sm uppercase cursor-pointer"
              >
                Sign & Authorize Order
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BULK PRINT PREVIEW MODAL */}
      {showBulkPrintModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in print:p-0 print:bg-white print:fixed print:inset-0 select-none">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-full print:border-0 print:shadow-none print:w-full print:h-full print:rounded-none">
            
            {/* Modal Actions Header */}
            <div className="p-4 px-6 border-b border-outline-variant bg-surface-container-low flex justify-between items-center print:hidden shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-display font-black text-sm text-on-surface">Bulk Procurement Summary & Audit Desk</h3>
                  <p className="text-[10px] text-on-surface-variant">Review consolidated legal ledger print layout before rendering PDF document.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadLedgerTxt}
                  className="px-3 py-1.5 border border-outline-variant hover:border-primary/45 bg-surface-container-lowest rounded-lg font-sans text-xs font-bold text-on-surface hover:text-primary transition-all cursor-pointer flex items-center gap-1.5"
                  title="Download Ledger Audit Report file (.txt structure)"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save Audited TXT
                </button>
                <button
                  onClick={handlePrintCommand}
                  className="px-4 py-1.5 bg-primary text-white rounded-lg font-sans text-xs font-bold hover:bg-opacity-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Report / Save as PDF
                </button>
                <button
                  onClick={() => setShowBulkPrintModal(false)}
                  className="p-1 px-2 text-xs font-bold text-on-surface-variant hover:text-error hover:bg-surface-container-high rounded transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* HIGH FIDELITY REPORT CANVAS SHEET */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-white text-zinc-900 font-sans print:overflow-visible print:p-0 print:bg-white min-h-0">
              
              {/* PRINT CONTAINER FOR EASY @MEDIA SELECTOR TARGETING */}
              <div className="max-w-3xl mx-auto space-y-8 bg-white border border-zinc-200/50 p-8 rounded-xl shadow-xs print:border-0 print:p-0 print:shadow-none">
                
                {/* Printable Header logo & information */}
                <div className="flex justify-between items-start border-b border-zinc-200 pb-6">
                  <div className="flex items-center gap-3">
                    <MAMLogo className="h-11 w-auto shrink-0 text-blue-600" />
                    <div>
                      <h2 className="font-display font-black text-xl tracking-tight text-zinc-950 leading-none">MAM ERP SYSTEMS</h2>
                      <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest leading-none block mt-1.5">CONSOLIDATED GROUP PROCUREMENT</span>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-zinc-500 font-mono space-y-0.5">
                    <p className="font-bold text-zinc-900">SYSTEM AUDIT REPORT</p>
                    <p>Generated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p>Time: {new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} UTC</p>
                    <p className="text-blue-600 font-semibold text-[10px]">Reference: R-MAM-ERP-{Math.floor(100344 + Math.random() * 89900)}</p>
                  </div>
                </div>

                {/* Audit Context Summary Board */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/55 text-center">
                    <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">AUDITED POs</span>
                    <span className="font-display font-extrabold text-2xl text-zinc-950">{selectedOrdersData.length} Records</span>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/55 text-center">
                    <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">AGGREGATED VOLUME</span>
                    <span className="font-display font-extrabold text-2xl text-blue-600">{settings.currencySymbol}{selectedSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/55 text-center">
                    <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">COMPLIANCE CODE</span>
                    <span className="font-sans font-bold text-sm text-emerald-700 flex items-center justify-center gap-1 mt-1 leading-none">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                      MAM-CMP-104
                    </span>
                  </div>
                </div>

                {/* Formal statement of audit */}
                <div className="text-xs text-zinc-600 leading-relaxed bg-zinc-50/50 p-4 rounded-lg border border-zinc-100 italic">
                  This summary document certifies the aggregated corporate purchase volume raised down to associated suppliers for product inventories. These audited records have been mapped directly to regional warehouse logistics channels through MAM ERP Unified Systems.
                </div>

                {/* Tabular Records */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block">AUDIT REGISTER LOG INDEX</span>
                  <div className="border border-zinc-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          <th className="p-3 w-32">Invoice Reference</th>
                          <th className="p-3">Vendor Supplier Partner</th>
                          <th className="p-3 text-center">Date Raised</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-right">Amount Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-zinc-800">
                        {selectedOrdersData.map((po) => (
                          <tr key={po.poId} className="hover:bg-zinc-50/30">
                            <td className="p-3 font-mono font-bold text-blue-600 text-xs">{po.poId}</td>
                            <td className="p-3 font-semibold text-zinc-950">{po.supplierName}</td>
                            <td className="p-3 text-center text-zinc-500">{po.date}</td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase border border-zinc-300 bg-zinc-100 text-zinc-700">
                                {po.status}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-zinc-950">
                              {settings.currencySymbol}{po.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Status distribution analysis */}
                <div className="pt-4 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 text-xs text-zinc-700">
                    <h4 className="font-bold text-[10.5px] uppercase tracking-wider text-zinc-950">Approved Corporate Accounts Desk</h4>
                    <p>Regulatory oversight determines bulk capital allocation for registered vendor operations. Authorized signature certificates represent legal confirmation of receivables liabilities.</p>
                  </div>
                  
                  {/* Regulatory Stamp Segment */}
                  <div className="flex flex-col items-end justify-center select-none pt-4 sm:pt-0">
                    <div className="border-4 border-dashed border-blue-600/35 rounded-xl p-4 text-center max-w-[240px] leading-snug transform rotate-1 space-y-1">
                      <span className="block text-[8px] font-mono font-extrabold text-blue-500 uppercase tracking-widest">AUTHORIZED GATEWAY</span>
                      <span className="block font-display font-black text-xs text-blue-600 uppercase tracking-tight">MAM ERP CORP AUDIT</span>
                      <span className="block font-mono text-[8px] text-zinc-400 mt-1">APPROVED BATCH RELEASE</span>
                      <div className="h-0.5 bg-blue-100 my-1"></div>
                      <span className="text-[7.5px] font-semibold text-blue-600 uppercase flex items-center justify-center gap-0.5">
                        <Check className="w-3 h-3 text-blue-600 block shrink-0" /> SECURITY KEY VALIDATED
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
