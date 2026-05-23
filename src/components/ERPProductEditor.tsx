/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../context";
import { Product } from "../types";
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Shield,
  HelpCircle,
  Truck
} from "lucide-react";

export default function ERPProductEditor() {
  const { 
    editingProductSku, 
    setEditingProductSku, 
    setErpView, 
    products, 
    updateProduct,
    suppliers,
    settings
  } = useApp();

  // Find product currently being modified
  const originProduct = products.find(p => p.sku === editingProductSku) || products[0];

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Product["category"]>("Electronics");
  const [stockLevel, setStockLevel] = useState(0);
  const [minStockLevel, setMinStockLevel] = useState(0);
  const [reorderPoint, setReorderPoint] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [suggestedMsrp, setSuggestedMsrp] = useState(0);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [autoReplenish, setAutoReplenish] = useState(true);

  // Load origin properties
  useEffect(() => {
    if (originProduct) {
      setName(originProduct.name);
      setCategory(originProduct.category);
      setStockLevel(originProduct.stockLevel);
      setMinStockLevel(originProduct.minStockLevel);
      setReorderPoint(originProduct.reorderPoint);
      setCostPrice(originProduct.costPrice);
      setSellPrice(originProduct.sellPrice);
      setSuggestedMsrp(originProduct.suggestedMsrp);
      setLocation(originProduct.location);
      setDescription(originProduct.description);
    }
  }, [originProduct]);

  // Pricing math: Margin = (Sell - Cost) / Sell * 100
  const markup = sellPrice > 0 ? ((sellPrice - costPrice) / sellPrice) * 100 : 0;

  const handleSave = () => {
    if (!name) return;
    
    // Commit to shared registry
    updateProduct(originProduct.sku, {
      name,
      category,
      stockLevel,
      minStockLevel,
      reorderPoint,
      costPrice,
      sellPrice,
      suggestedMsrp,
      location,
      description
    });

    // Alert and return
    alert(`SKU model ${originProduct.sku} properties updated and synchronized to POS catalogue successfully.`);
    setEditingProductSku(null);
    setErpView("StockOverview");
  };

  const handleDiscard = () => {
    setEditingProductSku(null);
    setErpView("StockOverview");
  };

  if (!originProduct) {
    return (
      <div className="p-8 text-center bg-surface-container-low text-on-surface-variant font-medium">
        No active product SKU loaded. Return to <button onClick={() => setErpView("StockOverview")} className="text-primary underline">Stock Overview</button>.
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative pb-12">
      
      {/* Top action breadcrumb row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 border-b border-outline-variant pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDiscard}
            className="p-2 border border-outline-variant hover:border-primary rounded-lg text-on-surface hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-mono font-bold text-primary tracking-wider block">{originProduct.sku}</span>
            <h1 className="font-display font-bold text-2xl text-on-surface block mt-0.5">Properties Terminal</h1>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleDiscard}
            className="px-4 py-2 border border-outline-variant rounded-lg font-sans text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            Discard Changes
          </button>
          <button 
            onClick={handleSave}
            className="px-5 py-2 bg-[#005bc0] text-white rounded-lg font-sans text-xs font-semibold hover:bg-opacity-95 transition-colors cursor-pointer shadow-sm"
          >
            Save SKU Changes
          </button>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter-md">
        
        {/* Left Side: Standard Information & Logistics */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass-card rounded-xl p-card-padding bg-surface-container-lowest border-outline-variant space-y-5">
            <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/30 pb-2">Basic SKU Info SHEET</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Model SKU</label>
                <div className="px-3 py-2 border border-outline-variant bg-surface-container-low text-on-surface-variant font-mono text-xs font-bold rounded-lg cursor-not-allowed select-none">
                  {originProduct.sku}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Product category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Product["category"])}
                  className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase">Product Label Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase">Catalog Description (displayed in POS)</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary"
              ></textarea>
            </div>
          </div>

          <div className="glass-card rounded-xl p-card-padding bg-surface-container-lowest border-outline-variant space-y-5">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
              <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider">Logistics, Coordinates & Threshholds</h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-primary">Auto-Replenish Active</span>
                <input
                  type="checkbox"
                  checked={autoReplenish}
                  onChange={(e) => setAutoReplenish(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
            </div>

            {/* Blue Auto-Replenishment toggle banner */}
            {autoReplenish && (
              <div className="bg-[#e8f0fe] border border-primary/20 text-[#1a73e8] rounded-xl px-4 py-3 flex items-start gap-2 text-xs">
                <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                <p><strong>Auto-replenishment is actively listening.</strong> If stock levels fall below {reorderPoint} units, a Purchase order will be raised automatically to primary vendor.</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Warehouse Bin Coordinate</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1 col-span-2 grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Safety stock thresh</label>
                  <input
                    type="number"
                    value={minStockLevel}
                    onChange={(e) => setMinStockLevel(Number(e.target.value))}
                    className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs text-right outline-none focus:ring-1 focus:ring-primary font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Trigger reorder Point</label>
                  <input
                    type="number"
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(Number(e.target.value))}
                    className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs text-right outline-none focus:ring-1 focus:ring-primary font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Economics, Costings & Pricing strategy sheet */}
        <div className="space-y-6">
          
          <div className="glass-card rounded-xl p-card-padding bg-surface-container-lowest border-outline-variant space-y-4">
            <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/30 pb-2">Pricing Strategy Metric</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 bg-[#1a73e8]/5 border border-[#1a73e8]/10 p-2.5 rounded-lg">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Unit Vendor Cost</label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="px-2 py-1.5 border border-outline-variant bg-surface-container-low rounded-lg text-xs font-bold text-right outline-none"
                />
              </div>
              <div className="flex flex-col gap-1 bg-tertiary/5 border border-tertiary/10 p-2.5 rounded-lg">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase font-semibold">Store Sell retail Price</label>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(Number(e.target.value))}
                  className="px-2 py-1.5 border border-outline-variant bg-surface-container-low rounded-lg text-xs font-extrabold text-[#006e2a] text-right outline-none"
                />
              </div>
            </div>

            {/* Visual Markup indicator */}
            <div className="border border-outline-variant/60 rounded-xl p-3 bg-surface-container-low/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant block uppercase tracking-wider">Gross margin return</span>
                <span className="font-display text-lg font-extrabold text-primary block mt-1">{markup.toFixed(1)}% MARGIN</span>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center font-display text-xs font-extrabold text-primary font-bold">
                {Math.round(markup)}%
              </div>
            </div>

            {/* MSRP check card */}
            <div className="flex justify-between items-center text-xs p-2.5 bg-surface-container-low rounded border border-outline-variant/40 mt-2">
              <span className="text-on-surface-variant font-medium">Standard catalog MSRP:</span>
              <span className="font-bold text-on-surface">{settings.currencySymbol}{suggestedMsrp.toFixed(2)}</span>
            </div>
          </div>

          {/* Suppliers segment */}
          <div className="glass-card rounded-xl p-card-padding bg-surface-container-lowest border-outline-variant">
            <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider mb-3">Approved Suppliers list</h3>
            <div className="space-y-3">
              {suppliers.slice(0, 2).map((s, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg">
                  <div className="min-w-0">
                    <span className="font-sans text-xs font-bold text-on-surface block truncate">{s.name}</span>
                    <span className="text-[9px] font-bold text-[rgb(0,111,40)] block uppercase mt-0.5">{s.status} VENDOR</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-sans text-xs font-bold text-on-surface block">{settings.currencySymbol}{(costPrice * (i === 1 ? 0.95 : 1)).toFixed(2)}</span>
                    <span className="text-[9px] text-body-xs text-on-surface-variant block">{s.leadTime} lead</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
