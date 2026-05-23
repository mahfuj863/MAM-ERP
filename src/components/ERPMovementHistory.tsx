/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../context";
import { Movement } from "../types";
import {
  Calendar,
  Download,
  SlidersHorizontal,
  PlusCircle,
  X,
  UserCheck,
  Package,
  TrendingUp,
  Inbox,
  Truck,
  RotateCcw,
  CheckCircle,
  Bell
} from "lucide-react";

export default function ERPMovementHistory() {
  const { movements, setMovements, products, updateProduct } = useApp();
  const [filterType, setFilterType] = useState<"All" | "IN" | "OUT" | "ADJ">("All");
  const [searchSKU, setSearchSKU] = useState("");
  const [showAdjModal, setShowAdjModal] = useState(false);

  // Manual Adjust form
  const [adjSku, setAdjSku] = useState("");
  const [adjQty, setAdjQty] = useState<number>(10);
  const [adjRef, setAdjRef] = useState("MANUAL-AUDIT-Q4");
  const [adjType, setAdjType] = useState<"IN" | "OUT" | "ADJ">("ADJ");

  // Floating live toast simulation
  const [showToast, setShowToast] = useState(true);

  // Automatically dismiss toast after 9 seconds, or handle closing manually
  useEffect(() => {
    const t = setTimeout(() => {
      setShowToast(false);
    }, 12000);
    return () => clearTimeout(t);
  }, []);

  const handleManualAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjSku) {
      alert("Please select a Product SKU!");
      return;
    }

    const selectedProd = products.find(p => p.sku === adjSku);
    if (!selectedProd) return;

    // Add entry
    const delta = adjType === "OUT" ? -Math.abs(adjQty) : Math.abs(adjQty);
    
    // Update Product Stock
    const nextStock = Math.max(0, selectedProd.stockLevel + delta);
    updateProduct(adjSku, { stockLevel: nextStock });

    const newMov: Movement = {
      id: `mov-adj-${Date.now()}`,
      date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
      time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      sku: adjSku,
      description: selectedProd.name,
      type: adjType,
      quantity: Math.abs(adjQty),
      referenceId: adjRef || `ADJ-${Math.floor(10000 + Math.random() * 90000)}`,
      executedBy: "Corporate Auditor",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJvvk2zhxqrHVUGlCPfD2UpMCsFW4m5UynIJcVFCKYI_rfIGfInoYNqdZIYmA2A544yku8ISrxmkzGxTKB5aJXi6_k30RvQNT3-yRSfoPz8wHoJkipeAQWmDAa4q1EGXtc7S5VRCLWRdvCefPMMnww7BlCv-D941NFkTwS-Ybr6dwTqeLQMmid6tY5X7YD9Q4kbDI2cjz28bptMyfAPtdBEIcFdbxsTiIVmCG7vA6lC5HeI1cfR7eSG-2EROSSh2HbtvWFHHGSKDUN"
    };

    setMovements((prev) => [newMov, ...prev]);
    setShowAdjModal(false);
    
    // toast info trigger
    setShowToast(true);
  };

  const filteredMovements = movements.filter((m) => {
    const matchesType = filterType === "All" || m.type === filterType;
    const matchesSearch =
      m.sku.toLowerCase().includes(searchSKU.toLowerCase()) ||
      m.description.toLowerCase().includes(searchSKU.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalIn = movements.filter(m => m.type === "IN").reduce((acc, m) => acc + m.quantity, 0);
  const totalOut = movements.filter(m => m.type === "OUT").reduce((acc, m) => acc + m.quantity, 0);

  return (
    <div className="relative animate-fade-in">
      
      {/* FLOATING LIVE CARRIER TOAST */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#0d0d0f] text-on-surface p-4 rounded-xl border border-primary/35 shadow-2xl flex items-start gap-3 w-80 animate-slide-in">
          <Bell className="w-5 h-5 text-tertiary mt-0.5 shrink-0 animate-bounce" />
          <div className="flex-1 min-w-0">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-tertiary">Real-Time Sync Check</h4>
            <p className="text-[11px] text-zinc-300 mt-1">Carriers checked-in: <strong className="text-white">PO-88295 (200 Units)</strong> loaded securely to Warehouse Zone B.</p>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => {
                  // Push checking mock
                  const p = products[0];
                  if (p) {
                    const nextMove: Movement = {
                      id: `mov-sync-${Date.now()}`,
                      date: "Oct 24, 2023",
                      time: "15:00 PM",
                      sku: p.sku,
                      description: p.name,
                      type: "IN",
                      quantity: 200,
                      referenceId: "PO-88295",
                      executedBy: "Mike Warehouse",
                      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDgudbRpsUhRoqfgWAUe94AlALgi9MedWvZmWmp3OpWB9gOiTvpvV1Q1E7CIj5XPRMnrJzvaGYcoyCxJYYCTaaeSX-BHYEEfk52-NWl2w6_wQmgCJo2T7A5UT51frGnBcQ5G1qVG4VI8EVbF4uFSvg-ewYGADLJZFPebi1NQZEP-wxB6pZJQ1tjPhXPtFp0NouDd7jzUyj64nAaFcLDdGe6YIq51_rRAyFTqhMBSPCQNa1WJtKRpIi9Oc4sr6c3qQprQp9an3kjV-H"
                    };
                    setMovements(prev => [nextMove, ...prev]);
                    updateProduct(p.sku, { stockLevel: p.stockLevel + 200 });
                  }
                  setShowToast(false);
                }}
                className="bg-[#1a73e8] hover:bg-opacity-90 px-2 py-1 rounded text-[10px] font-bold text-white cursor-pointer"
              >
                Approve Entry
              </button>
              <button 
                onClick={() => setShowToast(false)} 
                className="text-zinc-400 hover:text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button onClick={() => setShowToast(false)} className="text-zinc-400 hover:text-white shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Breadcrumb Info Row */}
      <nav className="flex items-center text-xs text-on-surface-variant font-medium mb-3 gap-1">
        <span>Inventory</span>
        <span>&gt;</span>
        <span className="text-on-surface">Movement History</span>
      </nav>

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface">Movement History</h1>
          <p className="font-sans text-xs text-on-surface-variant mt-1 text-body-sm">Visual audit history ledger detailing stock checking, POS output, and manual adjustments.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              // Sim download CSV
              alert("Movement History CSV log sheet preparing for export...");
            }}
            className="px-4 py-2 border border-outline-variant rounded-lg font-sans text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-on-surface-variant" />
            Export CSV
          </button>
          <button 
            onClick={() => setShowAdjModal(true)}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-sans text-xs font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-sm animate-pulse"
          >
            <PlusCircle className="w-4 h-4" />
            Manual Adjustment Audit
          </button>
        </div>
      </div>

      {/* Summary KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-md mb-8">
        
        {/* Movements Count */}
        <div className="glass-card p-card-padding rounded-xl bg-surface-container-lowest border-outline-variant">
          <div className="flex justify-between items-start mb-2">
            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">TOTAL LOGGED</span>
            <UserCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-on-surface">{movements.length} Moves</h3>
            <p className="text-xs font-semibold text-tertiary mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12% vs last week
            </p>
          </div>
        </div>

        {/* Inbound totals */}
        <div className="glass-card p-card-padding rounded-xl bg-surface-container-lowest border-outline-variant">
          <div className="flex justify-between items-start mb-1">
            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider font-semibold">INBOUND UNITS</span>
            <Inbox className="w-5 h-5 text-tertiary" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-[#006e2a]">+{totalIn} units</h3>
            <div className="w-full bg-secondary-container h-1 rounded-full mt-2">
              <div className="bg-tertiary h-full rounded-full w-[65%]"></div>
            </div>
          </div>
        </div>

        {/* Outbound totals */}
        <div className="glass-card p-card-padding rounded-xl bg-surface-container-lowest border-outline-variant">
          <div className="flex justify-between items-start mb-1">
            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">OUTBOUND UNITS</span>
            <Truck className="w-5 h-5 text-error" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-error">-{totalOut} units</h3>
            <div className="w-full bg-secondary-container h-1 rounded-full mt-2">
              <div className="bg-error h-full rounded-full w-[45%]"></div>
            </div>
          </div>
        </div>

        {/* Storage status */}
        <div className="glass-card p-card-padding rounded-xl bg-surface-container-lowest border-outline-variant">
          <div className="flex justify-between items-start mb-1">
            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">STORAGE UTILIZATION</span>
            <Package className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-on-surface">92.4% Full</h3>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">Undergoing optimization in Shelf 12</p>
          </div>
        </div>
      </div>

      {/* Interactive Filters Area */}
      <div className="glass-card rounded-xl p-4 bg-surface-container-lowest border-outline-variant mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Class Selection Buttons */}
        <div className="flex border border-outline-variant rounded-lg p-1 bg-surface-container-low shrink-0 max-w-full overflow-x-auto custom-scrollbar">
          {(["All", "IN", "OUT", "ADJ"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterType === type 
                  ? "bg-surface-container-lowest text-primary font-bold shadow-xs border border-outline-variant/50" 
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {type === "All" ? "All Movements" : type === "IN" ? "IN (Stock Check-in)" : type === "OUT" ? "OUT (Sales Checkout)" : "ADJ (Audit Adjustment)"}
            </button>
          ))}
        </div>

        {/* Input SKU and reset controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <SlidersHorizontal className="absolute left-3 top-2.5 w-4 h-4 text-on-secondary-container" />
            <input
              type="text"
              placeholder="Filter by SKU or description..."
              value={searchSKU}
              onChange={(e) => setSearchSKU(e.target.value)}
              className="pl-9 pr-4 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs w-full md:w-56 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          
          {(filterType !== "All" || searchSKU !== "") && (
            <button
              onClick={() => {
                setFilterType("All");
                setSearchSKU("");
              }}
              className="px-3 py-2 border border-outline-variant text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Movements Grid System Table */}
      <div className="glass-card rounded-xl overflow-hidden bg-surface-container-lowest border-outline-variant">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                <th className="px-gutter-md py-4">TIMESTAMP ID</th>
                <th className="px-gutter-md py-4">PRODUCT / MODEL</th>
                <th className="px-gutter-md py-4 text-center">TYPE</th>
                <th className="px-gutter-md py-4 text-right">QUANTITY</th>
                <th className="px-gutter-md py-4">REFERENCE</th>
                <th className="px-gutter-md py-4">OPERATOR ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredMovements.map((m, idx) => (
                <tr key={m.id || idx} className="hover:bg-surface-container-low transition-colors">
                  
                  {/* Timestamp */}
                  <td className="px-gutter-md py-4 font-sans text-xs">
                    <span className="font-semibold text-on-surface block">{m.date}</span>
                    <span className="text-on-surface-variant block mt-0.5">{m.time}</span>
                  </td>

                  {/* Product */}
                  <td className="px-gutter-md py-4">
                    <span className="text-xs font-mono font-bold text-primary block">{m.sku}</span>
                    <span className="text-sm font-semibold text-on-surface block mt-0.5 truncate max-w-xs">{m.description}</span>
                  </td>

                  {/* Type Badge */}
                  <td className="px-gutter-md py-4 text-center">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold border flex items-center justify-center gap-1 mx-auto w-16 uppercase ${
                      m.type === "IN" 
                        ? "bg-[#e6f4ea] text-[#137333] border-[#c2e7cb]" 
                        : m.type === "OUT"
                        ? "bg-[#fce8e6] text-[#c5221f] border-[#fad2cf]"
                        : "bg-[#fef7e0] text-[#b06000] border-[#feebc8]"
                    }`}>
                      {m.type === "IN" ? "+" : m.type === "OUT" ? "-" : "±"} {m.type}
                    </span>
                  </td>

                  {/* Quantity */}
                  <td className="px-gutter-md py-4 text-right font-sans text-xs font-bold text-on-surface">
                    {m.quantity.toLocaleString()} units
                  </td>

                  {/* Reference */}
                  <td className="px-gutter-md py-4">
                    <span className="font-mono text-xs font-semibold text-on-surface-variant border-b border-dashed border-outline-variant cursor-pointer py-0.5 hover:text-primary">
                      {m.referenceId}
                    </span>
                  </td>

                  {/* Operator */}
                  <td className="px-gutter-md py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full overflow-hidden shrink-0 border border-outline-variant">
                        <img src={m.avatarUrl} alt={m.executedBy} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                      </div>
                      <span className="font-sans text-xs text-on-surface font-semibold truncate max-w-[120px]">{m.executedBy}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: MANUAL ADJUSTMENT AUDITING FORM */}
      {showAdjModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl w-[400px] max-w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-on-surface text-base">Inventory Manual Adjust Record</h3>
              <button onClick={() => setShowAdjModal(false)} className="p-1 hover:bg-surface-container-low rounded-full hover:text-error transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleManualAdjustment} className="space-y-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Select Target Sku Product</label>
                <select
                  required
                  value={adjSku}
                  onChange={(e) => setAdjSku(e.target.value)}
                  className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                >
                  <option value="">-- Choose Segment model --</option>
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} • {p.name} (stock: {p.stockLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase font-semibold">Adjustment Type</label>
                  <select
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value as "IN" | "OUT" | "ADJ")}
                    className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                  >
                    <option value="IN">IN (Audit Entry / Stock-in)</option>
                    <option value="OUT">OUT (Wastage / Stock-out)</option>
                    <option value="ADJ">ADJ (Neutral Adjustment)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={adjQty}
                    onChange={(e) => setAdjQty(Math.max(1, Number(e.target.value)))}
                    className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs text-right outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Adjustment Audit Reference</label>
                <input
                  type="text"
                  placeholder="e.g. MANUAL-AUDIT-Q4"
                  value={adjRef}
                  onChange={(e) => setAdjRef(e.target.value)}
                  className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-on-primary py-2.5 rounded-lg text-xs font-bold hover:bg-opacity-95 shadow-sm uppercase cursor-pointer"
              >
                Log Adjustment to Ledger
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
