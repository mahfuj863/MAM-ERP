/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context";
import { Product } from "../types";
import {
  TrendingUp,
  AlertTriangle,
  Boxes,
  Plus,
  Search,
  CheckCircle,
  TrendingDown,
  Edit2,
  ChevronRight,
  Filter,
  X,
  Upload,
  Download,
  Trash2,
  AlertCircle,
  FileSpreadsheet,
  QrCode,
  Printer
} from "lucide-react";
import QRCode from "qrcode";

export default function ERPStockOverview() {
  const { products, setErpView, setEditingProductSku, suppliers, setProducts, settings } = useApp();
  const [activeTab, setActiveTab] = useState<"all" | "low" | "out">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDrawer, setShowAddDrawer] = useState(false);

  // States for CSV Bulk Import
  const [showImportModal, setShowImportModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [importStats, setImportStats] = useState({ newCount: 0, updateCount: 0 });
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  // QR Code Generation States
  const [qrProduct, setQrProduct] = useState<Product | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const handleShowQrCode = (product: Product) => {
    setQrProduct(product);
    const packet = `${product.sku} - ${product.name}`;
    QRCode.toDataURL(packet, {
      margin: 2,
      width: 300,
      color: {
        dark: "#0f172a", // deep modern slate/charcoal
        light: "#ffffff"
      }
    })
      .then((url) => {
        setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error("QR Code Generation failed", err);
      });
  };

  // New product form states
  const [newSku, setNewSku] = useState("");
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState<Product["category"]>("Electronics");
  const [newStock, setNewStock] = useState<number>(50);
  const [newMinStock, setNewMinStock] = useState<number>(20);
  const [newReorderPoint, setNewReorderPoint] = useState<number>(40);
  const [newCost, setNewCost] = useState<number>(100);
  const [newSell, setNewSell] = useState<number>(185);
  const [newDesc, setNewDesc] = useState("");

  const totalVaultValue = products.reduce((acc, p) => acc + (p.stockLevel * p.costPrice), 0);
  const lowStockProducts = products.filter(p => p.stockLevel <= p.minStockLevel && p.stockLevel > 0);
  const outOfStockProducts = products.filter(p => p.stockLevel <= 0);

  const displayedProducts = products.filter(p => {
    // Tab filters
    if (activeTab === "low" && p.stockLevel > p.minStockLevel) return false;
    if (activeTab === "out" && p.stockLevel > 0) return false;

    // Search query filters
    const query = searchQuery.toLowerCase();
    const matchesQuery = p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
    return matchesQuery;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku || !newName) return;

    let status: Product["status"] = "Healthy";
    if (newStock <= 0) status = "Out of Stock";
    else if (newStock <= newMinStock) status = "Low Stock";
    else if (newStock > newReorderPoint) status = "Optimal";

    const added: Product = {
      sku: newSku,
      name: newName,
      category: newCat,
      stockLevel: newStock,
      minStockLevel: newMinStock,
      reorderPoint: newReorderPoint,
      costPrice: newCost,
      sellPrice: newSell,
      suggestedMsrp: newSell * 1.15,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJuBL9dD7_bxJvErfYzAEJMKW4UN_1A2Yxg60H2oWccw8jI99wbPEyMu4ShuFizb063hf0HbntCSIMRDN9ZRVjmppRdELjnGpTbNu_eSRmIZ_N9yCdIJQLOsGAo2UY-YDGfGOAbiBgbrr6I47IqnLsvM2jxmDUPITUm32SfWyTq4gUhRnm0KayafFkX2Vynv8rnssRiD6lWgkaG4ng_JYKh5gkBng6lMbnJPpenb5XPnWziaMtwwhjmK-emFGhlWDBr6-rlLg8KPE1", // default bottle thumbnail
      location: "Zone A - Shelf 1",
      status,
      description: newDesc || "Custom product created in ERP Product Master registry."
    };

    setProducts((prev) => [...prev, added]);
    setShowAddDrawer(false);
    
    // Reset form
    setNewSku("");
    setNewName("");
    setNewCat("Electronics");
    setNewStock(50);
    setNewMinStock(20);
    setNewReorderPoint(40);
    setNewCost(100);
    setNewSell(185);
    setNewDesc("");
  };

  // CSV Template downloader
  const handleDownloadTemplate = () => {
    const csvContent = "sku,name,category,stockLevel,minStockLevel,reorderPoint,costPrice,sellPrice,location,description\n" +
      "SKU-PR-001,Fibre Keyboard Pro,Electronics,85,15,30,45.00,79.99,Zone B - Shelf 4,High end mechanical switches\n" +
      "SKU-PR-002,Organic Green Juice,Beverages,120,20,40,2.10,4.50,Zone C - Cold Rack,Organic cold-pressed energy drink\n" +
      "SKU-PR-003,Premium Notebook,Office Supplies,250,50,100,1.20,3.99,Zone A - Drawer 2,120 page hardcover blank pages\n" +
      "SKU-PR-004,Spicy Mix Peanuts,Snacks,15,30,60,0.80,1.99,Zone D - Shelf 1,Salted spicy snacks pack";
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sheeterp_product_master_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Drag and Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv")) {
        processCSV(file);
      } else {
        setFileError("Please upload a valid CSV file (.csv format only)");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith(".csv")) {
        processCSV(file);
      } else {
        setFileError("Please upload a valid CSV file (.csv format only)");
      }
    }
  };

  // Core parser
  const processCSV = (file: File) => {
    setFileName(file.name);
    setFileError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setFileError("The file appears to be empty.");
          return;
        }

        const lines = text.split(/\r?\n/);
        if (lines.length === 0 || !lines[0].trim()) {
          setFileError("No data found in the CSV file.");
          return;
        }

        // Handle headers
        const headersRaw = lines[0].split(/[;,]/);
        const headers = headersRaw.map(h => h.replace(/^["']|["']$/g, "").trim().toLowerCase());

        // Validate basic headers
        const hasSku = headers.includes("sku");
        const hasName = headers.includes("name");
        if (!hasSku || !hasName) {
          setFileError("Invalid CSV headers. CSV must contain at least 'sku' and 'name' columns.");
          return;
        }

        const parsedRows: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const matches: string[] = [];
          let insideQuote = false;
          let currentToken = "";

          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              insideQuote = !insideQuote;
            } else if ((char === ',' || char === ';') && !insideQuote) {
              matches.push(currentToken.trim());
              currentToken = "";
            } else {
              currentToken += char;
            }
          }
          matches.push(currentToken.trim());

          const cleanedTokens = matches.map(t => t.replace(/^["']|["']$/g, "").trim());
          if (cleanedTokens.length === 0 || (cleanedTokens.length === 1 && cleanedTokens[0] === "")) continue;

          const record: any = {};
          headers.forEach((header, index) => {
            record[header] = cleanedTokens[index] !== undefined ? cleanedTokens[index] : "";
          });
          parsedRows.push(record);
        }

        if (parsedRows.length === 0) {
          setFileError("No viable product records were found inside the CSV.");
          return;
        }

        const mapped: Product[] = parsedRows.map(row => {
          const sku = (row.sku || row.model || row["model sku"] || "").toUpperCase().trim();
          const name = row.name || row.title || row.label || row["product label name"] || row["product name"] || "";
          const categoryRaw = row.category || row.class || "Electronics";
          
          let category: Product["category"] = "Electronics";
          const catLower = categoryRaw.toLowerCase();
          if (catLower.includes("bev")) category = "Beverages";
          else if (catLower.includes("snack") || catLower.includes("food")) category = "Snacks";
          else if (catLower.includes("office") || catLower.includes("supply")) category = "Office Supplies";
          else if (catLower.includes("access")) category = "Accessories";
          else if (catLower.includes("network")) category = "Networking";
          else if (catLower.includes("work") || catLower.includes("station")) category = "Workstation";
          else if (catLower.includes("server")) category = "Server";
          else if (catLower.includes("periph")) category = "Peripherals";

          const stockLevel = parseInt(row.stocklevel || row.stock || row.quantity || row.qty || "0") || 0;
          const minStockLevel = parseInt(row["minstocklevel"] || row.minstock || row["min stock"] || "10") || 10;
          const reorderPoint = parseInt(row["reorderpoint"] || row.reorder || row["reorder point"] || "20") || 20;

          const costPrice = parseFloat(row["costprice"] || row.cost || row["cost price"] || "0") || 0;
          const sellPrice = parseFloat(row["sellprice"] || row.sell || row.retail || row["retail price"] || row["sell price"] || "0") || 0;
          
          const suggestedMsrp = parseFloat(row["suggestedmsrp"] || row.msrp || row["msrp value"] || "") || (sellPrice * 1.15);
          const location = row.location || row.zone || "Zone A - Shelf 1";
          const description = row.description || row.desc || "Bulk imported product SKU.";

          let status: Product["status"] = "Healthy";
          if (stockLevel <= 0) status = "Out of Stock";
          else if (stockLevel <= minStockLevel) status = "Low Stock";
          else if (stockLevel > reorderPoint) status = "Optimal";

          return {
            sku,
            name,
            category,
            stockLevel,
            minStockLevel,
            reorderPoint,
            costPrice,
            sellPrice,
            suggestedMsrp,
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJuBL9dD7_bxJvErfYzAEJMKW4UN_1A2Yxg60H2oWccw8jI99wbPEyMu4ShuFizb063hf0HbntCSIMRDN9ZRVjmppRdELjnGpTbNu_eSRmIZ_N9yCdIJQLOsGAo2UY-YDGfGOAbiBgbrr6I47IqnLsvM2jxmDUPITUm32SfWyTq4gUhRnm0KayafFkX2Vynv8rnssRiD6lWgkaG4ng_JYKh5gkBng6lMbnJPpenb5XPnWziaMtwwhjmK-emFGhlWDBr6-rlLg8KPE1",
            location,
            status,
            description
          };
        }).filter(p => p.sku && p.name);

        if (mapped.length === 0) {
          setFileError("Mapping failure: Header cells exist but no lines could be successfully converted.");
          return;
        }

        // Count new vs updates
        let newCount = 0;
        let updateCount = 0;
        mapped.forEach(mp => {
          const exists = products.some(p => p.sku === mp.sku);
          if (exists) {
            updateCount++;
          } else {
            newCount++;
          }
        });

        setParsedProducts(mapped);
        setImportStats({ newCount, updateCount });
      } catch (err) {
        setFileError("Parsing failure. Make sure CSV values are cleanly comma/semicolon delimited.");
        console.error(err);
      }
    };
    reader.onerror = () => {
      setFileError("Reader error: Failed to import local text file.");
    };
    reader.readAsText(file);
  };

  const handleCommitImport = () => {
    if (parsedProducts.length === 0) return;

    setProducts((prev) => {
      const prevMap = new Map(prev.map(p => [p.sku, p]));
      parsedProducts.forEach(mp => {
        prevMap.set(mp.sku, mp);
      });
      return Array.from(prevMap.values());
    });

    alert(`Successfully compiled and upserted ${parsedProducts.length} product SKU records to the global catalog inventory!`);
    
    // Cleanup states
    setParsedProducts([]);
    setFileName("");
    setFileError(null);
    setShowImportModal(false);
  };

  return (
    <div className="relative animate-fade-in pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface">Inventory HQ</h1>
          <p className="font-sans text-xs text-on-surface-variant mt-1 text-body-sm">Pro-Ledger Enterprise Unified Stock Master database control board.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 border border-outline-variant hover:border-primary/40 hover:bg-surface-container-high text-on-surface rounded-lg font-sans text-xs font-semibold bg-surface-container-low transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Upload className="w-4 h-4 text-primary" />
            Bulk Import CSV
          </button>
          <button
            onClick={() => setShowAddDrawer(true)}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-sans text-xs font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Single SKU Product
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter-md mb-8">
        
        {/* Total Stock Value */}
        <div className="glass-card p-card-padding rounded-xl bg-surface-container-lowest border-outline-variant hover:shadow-xs transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">TOTAL VALUE (VAULT)</span>
            <Boxes className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-on-surface">
              {settings.currencySymbol}{totalVaultValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs font-semibold text-tertiary mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12.5% increase vs last quarter
            </p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-card p-card-padding rounded-xl bg-surface-container-lowest border-error/20">
          <div className="flex justify-between items-start mb-1">
            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">REORDER THRESHOLDS</span>
            <AlertTriangle className="w-5 h-5 text-error" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-error">
              {lowStockProducts.length + outOfStockProducts.length} Items
            </h3>
            <p className="text-xs font-semibold text-error mt-2 flex items-center gap-1">
              Requires immediate action
            </p>
          </div>
        </div>

        {/* Arriving Shipments */}
        <div className="glass-card p-card-padding rounded-xl bg-surface-container-lowest border-outline-variant">
          <div className="flex justify-between items-start mb-1">
            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">INBOUND CARRIER SHIPMENTS</span>
            <TrendingUp className="w-5 h-5 text-tertiary" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-on-surface">
              12 Active
            </h3>
            <p className="text-xs font-semibold text-on-surface-variant mt-2">
              3 arriving within 24 hours
            </p>
          </div>
        </div>
      </div>

      {/* Product List Core Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter-md">
        
        {/* Table Content */}
        <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden bg-surface-container-lowest border-outline-variant">
          <div className="p-card-padding border-b border-outline-variant flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            
            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === "all" ? "bg-primary-fixed text-on-primary-fixed font-bold border border-primary/20" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"}`}
              >
                All Products ({products.length})
              </button>
              <button 
                onClick={() => setActiveTab("low")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === "low" ? "bg-error-container text-on-error-container font-bold border border-error/20" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"}`}
              >
                Low Stock ({lowStockProducts.length})
              </button>
              <button 
                onClick={() => setActiveTab("out")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === "out" ? "bg-error text-white font-bold" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"}`}
              >
                Out of Stock ({outOfStockProducts.length})
              </button>
            </div>

            {/* Table Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search SKU model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  <th className="px-gutter-md py-3">SKU / PRODUCT NAME</th>
                  <th className="px-gutter-md py-3 text-center">CATEGORY</th>
                  <th className="px-gutter-md py-3 text-right">STOCK LEVEL</th>
                  <th className="px-gutter-md py-3 text-right">MSRP VALUE</th>
                  <th className="px-gutter-md py-3 text-center">STATUS</th>
                  <th className="px-gutter-md py-3 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {displayedProducts.map((p) => {
                  const percent = Math.min(100, Math.max(0, (p.stockLevel / p.reorderPoint) * 100));
                  
                  return (
                    <tr key={p.sku} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-gutter-md py-4 font-sans">
                        <span className="text-xs font-mono font-bold text-primary block">{p.sku}</span>
                        <span className="text-sm font-semibold text-on-surface block mt-0.5">{p.name}</span>
                      </td>
                      <td className="px-gutter-md py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          p.category === "Electronics"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : p.category === "Beverages"
                            ? "bg-tertiary/10 text-tertiary border-tertiary/20"
                            : "bg-surface-container-high text-on-surface-variant border-outline-variant"
                        }`}>
                          {p.category}
                        </span>
                      </td>
                      <td className="px-gutter-md py-4 text-right">
                        <div className="font-sans text-xs font-bold text-on-surface">
                          {p.stockLevel} units
                        </div>
                        <div className="w-24 bg-surface-container-high h-1 rounded-full mt-1.5 ml-auto overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              p.stockLevel <= p.minStockLevel ? "bg-error" : "bg-tertiary"
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-gutter-md py-4 font-sans text-xs font-bold text-on-surface text-right">
                        {settings.currencySymbol}{(p.stockLevel * p.costPrice).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </td>
                      <td className="px-gutter-md py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                          p.status === "Healthy" || p.status === "Optimal"
                            ? "bg-tertiary/10 text-tertiary border-tertiary/20"
                            : p.status === "Low Stock"
                            ? "bg-error-container/20 text-error border-error/20"
                            : "bg-error text-white font-semibold"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-gutter-md py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingProductSku(p.sku);
                              setErpView("ProductEditor");
                            }}
                            className="px-2 py-1.5 border border-outline-variant hover:border-primary hover:text-primary rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                            title="Edit Product Info"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit Info
                          </button>
                          <button
                            onClick={() => handleShowQrCode(p)}
                            className="px-2 py-1.5 border border-outline-variant hover:border-tertiary hover:text-tertiary text-on-surface hover:text-tertiary rounded text-[11px] font-bold flex items-center gap-1 bg-surface-container-low cursor-pointer transition-all"
                            title="Generate QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5 text-tertiary" />
                            QR Code
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Dashboard panel */}
        <div className="space-y-gutter-md">
          
          {/* Turnover speed graph mock */}
          <div className="glass-card rounded-xl p-card-padding bg-surface-container-lowest border-outline-variant">
            <h3 className="font-display text-sm font-bold text-on-surface mb-3">Stock Velocity Metric</h3>
            <div className="flex items-center gap-4 bg-tertiary/5 border border-tertiary/25 p-3 rounded-lg">
              <TrendingUp className="w-8 h-8 text-tertiary" />
              <div>
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">ANNUAL TURNOVER CAP</p>
                <p className="font-display text-xl font-bold text-on-surface">14.2x Velocity</p>
              </div>
            </div>
            {/* Visual graph line */}
            <div className="h-28 w-full mt-4 flex items-end justify-between border-b border-outline-variant pb-1">
              <div className="w-8 bg-tertiary/10 rounded h-[30%]"></div>
              <div className="w-8 bg-tertiary/10 rounded h-[45%]"></div>
              <div className="w-8 bg-tertiary/15 rounded h-[40%]"></div>
              <div className="w-8 bg-tertiary/10 rounded h-[62%]"></div>
              <div className="w-8 bg-tertiary/20 rounded h-[70%]"></div>
              <div className="w-8 bg-tertiary/30 rounded h-[90%] font-bold"></div>
            </div>
          </div>

          {/* Vendors rating */}
          <div className="glass-card rounded-xl p-card-padding bg-surface-container-lowest border-outline-variant">
            <h3 className="font-display text-sm font-bold text-on-surface mb-3">Top Suppliers Quality</h3>
            <div className="space-y-3 pb-2">
              {suppliers.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center bg-surface-container-low p-2 rounded border border-outline-variant/30">
                  <div className="min-w-0">
                    <span className="font-sans text-xs font-bold text-on-surface block truncate">{s.name}</span>
                    <span className="text-[10px] text-body-xs text-on-surface-variant">{s.leadTime} lead average</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-sans text-xs font-bold text-[#006e2a] block">{s.reliability}%</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-outline block">COMPLIANT</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => setShowAddDrawer(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all z-30 cursor-pointer"
        title="Add New Stock Product SKU"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* DRAWER LAYER / SLIDEOUT SHEET FOR REGISTERING A NEW SKU */}
      {showAddDrawer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end animate-fade-in">
          <div className="w-[450px] bg-surface-container-lowest border-l border-outline-variant p-6 h-full flex flex-col justify-between shadow-2xl relative animate-slide-in">
            
            {/* Header */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-bold text-on-surface">Register Product SKU</h3>
                <button 
                  onClick={() => setShowAddDrawer(false)} 
                  className="p-1 hover:bg-surface-container-low rounded-full hover:text-error transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase">Model SKU</label>
                    <input
                      type="text"
                      required
                      placeholder="AUD-HD-2024"
                      value={newSku}
                      onChange={(e) => setNewSku(e.target.value)}
                      className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase">Category</label>
                    <select
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value as Product["category"])}
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
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Product Label Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ultra Headset Q4"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase">Current Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newStock}
                      onChange={(e) => setNewStock(Number(e.target.value))}
                      className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs text-right outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase font-semibold">Min Stock</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newMinStock}
                      onChange={(e) => setNewMinStock(Number(e.target.value))}
                      className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs text-right outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase">Reorder Point</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newReorderPoint}
                      onChange={(e) => setNewReorderPoint(Number(e.target.value))}
                      className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs text-right outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase">Cost Price ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newCost}
                      onChange={(e) => setNewCost(Number(e.target.value))}
                      className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs text-right outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase font-semibold">Retail Price ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newSell}
                      onChange={(e) => setNewSell(Number(e.target.value))}
                      className="px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs text-right outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Description & Log</label>
                  <textarea
                    rows={2}
                    placeholder="Provide description..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="px-3 py-1.5 border border-outline-variant bg-surface-container-low rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary py-3 rounded-lg text-xs font-bold hover:bg-opacity-95 shadow-md uppercase cursor-pointer"
                >
                  Save to Product Registry
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CSV BULK IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-outline-variant/35 flex justify-between items-center bg-surface-container-low">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-display font-black text-base text-on-surface">Bulk Product Catalog CSV Sync Desk</h3>
                  <p className="text-[11px] text-on-surface-variant">Update stock registries, register dozens of new model SKUs in one go.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setParsedProducts([]);
                  setFileName("");
                  setFileError(null);
                }}
                className="text-xs font-bold text-on-surface-variant hover:text-error bg-surface-container-lowest border border-outline-variant hover:border-error/25 px-3 py-1 rounded transition-colors cursor-pointer animate-fade-in"
              >
                Close Desk
              </button>
            </div>

            {/* Instruction Area */}
            <div className="px-5 py-3 border-b border-outline-variant/30 bg-surface-container-lowest flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="text-[11px] text-on-surface-variant leading-relaxed">
                <span className="font-bold text-on-surface">CSV Column Requirements:</span> Columns must include <code className="px-1 py-0.5 rounded bg-surface-container-low font-mono text-primary font-bold">sku</code> and <code className="px-1 py-0.5 rounded bg-surface-container-low font-mono text-primary font-bold">name</code>. Optional metrics: <span className="font-medium text-on-surface">category, stockLevel, minStockLevel, costPrice, sellPrice, location</span>.
              </div>
              <button
                onClick={handleDownloadTemplate}
                className="px-3 py-1 bg-surface-container-low border border-outline-variant hover:border-primary/45 rounded font-sans text-[10px] font-bold text-primary flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV Template
              </button>
            </div>

            {/* Body Workspace */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4 min-h-0 bg-surface-bright/30">
              
              {/* Drag and Drop Box */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 transition-all duration-250 flex flex-col items-center justify-center text-center relative ${
                  dragActive 
                    ? "border-primary bg-primary/5 scale-102" 
                    : parsedProducts.length > 0 
                    ? "border-primary/40 bg-primary/2" 
                    : "border-outline-variant hover:border-primary/50 bg-surface-container-low/20"
                }`}
              >
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {parsedProducts.length === 0 ? (
                  <label htmlFor="csv-file-input" className="w-full h-full cursor-pointer flex flex-col items-center justify-center py-4">
                    <div className="h-12 w-12 rounded-full bg-outline-variant/20 flex items-center justify-center text-on-surface-variant mb-3 group-hover:scale-105 transition-transform">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-bold text-xs text-on-surface">Drag & drop your formatted CSV here</p>
                    <p className="text-[10px] text-on-surface-variant mt-1.5">or <span className="text-primary font-bold underline">browse local files</span> (.csv format, Max 5MB)</p>
                  </label>
                ) : (
                  <div className="w-full flex items-center justify-between p-2bg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary-fixed/20 flex items-center justify-center text-primary-fixed shrink-0">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-xs text-on-surface">{fileName}</p>
                        <p className="text-[10px] text-body-xs text-on-surface-variant">Active CSV model file loaded successfully</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setParsedProducts([]);
                        setFileName("");
                        setFileError(null);
                      }}
                      className="p-1 px-2.5 rounded border border-error/15 hover:border-error hover:bg-error/10 text-error text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
                      title="Clear Loaded File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Discard File
                    </button>
                  </div>
                )}
              </div>

              {/* Error indicator */}
              {fileError && (
                <div className="p-3 bg-error-container/15 border border-error/25 text-error rounded-xl flex items-start gap-2.5 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Execution Error:</span> {fileError}
                  </div>
                </div>
              )}

              {/* Statistics & Preview Table */}
              {parsedProducts.length > 0 && (
                <div className="space-y-3 animate-fade-in">
                  
                  {/* Stats Counter Bar */}
                  <div className="grid grid-cols-3 gap-3 bg-surface-container-low border border-outline-variant/40 p-3 rounded-xl text-center select-none">
                    <div>
                      <span className="block text-[9px] font-sans font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">TOTAL SCANNED</span>
                      <span className="font-display font-bold text-base text-on-surface">{parsedProducts.length}</span>
                    </div>
                    <div className="border-x border-outline-variant/50">
                      <span className="block text-[9px] font-sans font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">NEW SKU REGISTRIES</span>
                      <span className="font-display font-medium text-base text-tertiary">+{importStats.newCount}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-sans font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">OVERWRITE UPDATES</span>
                      <span className="font-display font-medium text-base text-amber-500">{importStats.updateCount}</span>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="border border-outline-variant/40 rounded-xl overflow-hidden bg-surface-container-low/20">
                    <div className="p-2.5 px-4 bg-surface-container-low border-b border-outline-variant/45 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Parsed Records Preview
                    </div>
                    <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-surface-container-low/40 border-b border-outline-variant/35 text-[10px] font-bold text-on-surface-variant uppercase">
                            <th className="p-2 px-3">SKU</th>
                            <th className="p-2">PRODUCT NAME</th>
                            <th className="p-2">CATEGORY</th>
                            <th className="p-2 text-right">QTY</th>
                            <th className="p-2 text-right">COST</th>
                            <th className="p-2 text-right">SELL</th>
                            <th className="p-2 text-center">ACTION Badges</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/25">
                          {parsedProducts.slice(0, 15).map((p, idx) => {
                            const isNew = !products.some(orig => orig.sku === p.sku);
                            return (
                              <tr key={idx} className="hover:bg-surface-container-low/20">
                                <td className="p-2 px-3 font-mono font-bold text-primary">{p.sku}</td>
                                <td className="p-2 font-medium text-on-surface truncate max-w-[150px]">{p.name}</td>
                                <td className="p-2 text-on-surface-variant">{p.category}</td>
                                <td className="p-2 text-right font-mono text-on-surface">{p.stockLevel}</td>
                                <td className="p-2 text-right font-mono text-on-surface-variant">{settings.currencySymbol}{p.costPrice.toFixed(2)}</td>
                                <td className="p-2 text-right font-mono text-on-surface">{settings.currencySymbol}{p.sellPrice.toFixed(2)}</td>
                                <td className="p-2 text-center">
                                  {isNew ? (
                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-tertiary/10 text-tertiary border border-tertiary/20">NEW SKU</span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">OVERWRITE</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {parsedProducts.length > 25 && (
                        <div className="p-2 text-center border-t border-outline-variant/30 text-[10px] text-on-surface-variant font-mono">
                          And {parsedProducts.length - 25} more records parsed...
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Bottom Controls */}
            <div className="p-5 border-t border-outline-variant/40 bg-surface-container-low flex justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setParsedProducts([]);
                  setFileName("");
                  setFileError(null);
                }}
                className="px-4 py-2 bg-surface-container-lowest hover:bg-surface-container-lowest/80 text-on-surface-variant hover:text-on-surface border border-outline-variant rounded-lg text-xs font-black transition-colors cursor-pointer"
              >
                DISCARD IMPORT DRAFT
              </button>
              <button
                type="button"
                disabled={parsedProducts.length === 0}
                onClick={handleCommitImport}
                className={`px-5 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all select-none shadow-sm ${
                  parsedProducts.length > 0 
                    ? "bg-primary text-white cursor-pointer hover:bg-opacity-95 active:scale-95" 
                    : "bg-surface-container-highest text-outline cursor-not-allowed"
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                AUTHORIZE BULK CATALOG WRITE
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PRODUCT QR CODE VIEW MODAL */}
      {qrProduct && qrCodeDataUrl && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-sm shadow-2xl p-6 relative overflow-hidden flex flex-col items-center text-center">
            
            {/* Background design accents */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-tertiary to-secondary-container"></div>
            
            {/* Header / Brand */}
            <div className="w-full flex justify-between items-center mb-4 mt-2">
              <div className="flex items-center gap-1.5 text-left">
                <QrCode className="h-4 w-4 text-primary animate-pulse" />
                <span className="font-display font-black text-xs text-on-surface uppercase tracking-wider">MAM ERP Catalog</span>
              </div>
              <button 
                onClick={() => {
                  setQrProduct(null);
                  setQrCodeDataUrl("");
                }}
                className="text-xs font-bold text-on-surface-variant hover:text-error bg-surface-container-low hover:bg-error/10 border border-outline-variant rounded-full p-1.5 transition-all cursor-pointer"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Product description and metadata */}
            <div className="mb-4">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wide">
                {qrProduct.sku}
              </span>
              <h3 className="font-display font-bold text-base text-on-surface mt-2 px-1 leading-tight">
                {qrProduct.name}
              </h3>
              <p className="text-[10px] text-on-surface-variant mt-1">
                Category: <span className="font-semibold text-on-surface">{qrProduct.category}</span> • Stock: <span className={`font-semibold ${qrProduct.stockLevel <= qrProduct.minStockLevel ? 'text-error' : 'text-tertiary'}`}>{qrProduct.stockLevel} units</span>
              </p>
            </div>

            {/* QR Code Canvas Frame */}
            <div className="bg-white border text-center border-outline-variant/40 p-4 rounded-xl shadow-inner relative group transition-transform hover:scale-102 flex flex-col items-center justify-center">
              <img 
                src={qrCodeDataUrl} 
                alt={`${qrProduct.name} QR Code`} 
                className="w-44 h-44 object-contain"
              />
              <div className="mt-2 text-[9px] font-mono text-zinc-500 tracking-wide select-all">
                {qrProduct.sku} - {qrProduct.name}
              </div>
            </div>

            {/* Scanning guidance */}
            <div className="mt-4 p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl w-full text-left text-[11px] text-on-surface-variant leading-relaxed">
              <p className="text-on-surface font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-tertiary shrink-0" />
                POS Quick Scan Enabled
              </p>
              <p className="mt-1 text-[10px]">
                This QR Code conforms to standard keyboard emulation scanning. Scan it in the **MAM ERP POS Terminal** to search or add instantly.
              </p>
            </div>

            {/* Action buttons */}
            <div className="mt-5 w-full flex gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${qrProduct.sku}`);
                  alert(`Copied SKU "${qrProduct.sku}" to clipboard!`);
                }}
                className="flex-1 py-2 border border-outline-variant hover:border-primary/40 bg-surface-container-low text-on-surface font-sans text-xs font-bold rounded-lg hover:bg-surface-container-medium transition-colors cursor-pointer"
              >
                Copy SKU
              </button>
              <button
                type="button"
                onClick={() => {
                  const printWindow = window.open("", "_blank");
                  if (printWindow) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Print QR Label - ${qrProduct.sku}</title>
                          <style>
                            body { font-family: sans-serif; text-align: center; padding: 40px; color: #0f172a; margin: 0; }
                            .card { border: 2px solid #cbd5e1; border-radius: 16px; padding: 32px; display: inline-block; max-width: 320px; }
                            .sku { font-family: monospace; font-size: 14px; font-weight: bold; padding: 4px 8px; background: #eff6ff; color: #1d4ed8; border-radius: 4px; text-transform: uppercase; }
                            h2 { margin: 16px 0 8px 0; font-size: 18px; font-weight: 800; }
                            img { border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; background: white; margin: 16px 0; }
                            .logo { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: bold; margin-bottom: 20px; }
                          </style>
                        </head>
                        <body>
                          <div class="card">
                            <div class="logo">MAM ERP CATALOG LABEL</div>
                            <span class="sku">${qrProduct.sku}</span>
                            <h2>${qrProduct.name}</h2>
                            <img src="${qrCodeDataUrl}" width="180" height="180" />
                            <p style="font-size: 11px; color: #64748b; margin-top: 12px;">Scan at register for immediate catalog ring up</p>
                          </div>
                          <script>
                            window.onload = function() { window.print(); window.close(); }
                          </script>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                  } else {
                    window.print();
                  }
                }}
                className="px-4 py-2 bg-primary hover:bg-opacity-95 text-white font-sans text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Label
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
