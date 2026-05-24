/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context";
import { Product, Customer } from "../types";
import { 
  Search, 
  Trash2, 
  UserPlus, 
  CheckCircle,
  Printer,
  X,
  CreditCard,
  DollarSign,
  Wallet,
  ChevronDown,
  BadgeAlert,
  QrCode,
  Sparkles
} from "lucide-react";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POSQuickBilling() {
  const { 
    products, 
    updateProduct, 
    transactions, 
    addTransaction, 
    addMovement, 
    customers, 
    addCustomer,
    activeProfile,
    settings,
    currentCompany
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>("All Items");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("Walk-in Customer");
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<"Cash" | "Card" | "Credit">("Cash");
  const [searchSKU, setSearchSKU] = useState<string>("");

  // Print Mode State (standard standard paper or quick 80mm roll POS thermal receipt)
  const [printReceiptMode, setPrintReceiptMode] = useState<"standard" | "thermal">("thermal");

  // Customer modal
  const [showCustModal, setShowCustModal] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");

  // Receipt Modal
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState("");
  const [lastReceiptTx, setLastReceiptTx] = useState<any>(null);

  // Scan Simulator & Real-time camera stream states
  const [showScanSimulator, setShowScanSimulator] = useState(false);
  const [selectedScannerProduct, setSelectedScannerProduct] = useState<Product | null>(null);
  const [scanningActive, setScanningActive] = useState(false);
  const [scanStatusMessage, setScanStatusMessage] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Cart Synchronizer Engine Key base
  const syncKey = currentCompany ? `mam_erp_sync_cart_${currentCompany.id}` : "mam_erp_sync_cart_demo";
  const [cart, setCart] = useState<CartItem[]>([]);

  // On mount and key switch, parse active cart
  React.useEffect(() => {
    const saved = localStorage.getItem(syncKey);
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error("Cart hydration error", e);
      }
    }
  }, [syncKey]);

  // Synchronize and invoke standard storage event on tab instances
  const saveCartAndSync = (nextCart: CartItem[]) => {
    setCart(nextCart);
    localStorage.setItem(syncKey, JSON.stringify(nextCart));
  };

  // Listen to incoming remote camera scan triggers from smartphone browsers on same session
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === syncKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          
          // Count items before & after to play a physical scan sound
          const prevCount = cart.reduce((acc, c) => acc + c.quantity, 0);
          const nextCount = parsed.reduce((acc: number, c: any) => acc + c.quantity, 0);
          
          setCart(parsed);

          if (nextCount > prevCount) {
            // Play physical laser beep
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
            } catch (err) {
              console.log("Browser alert audio blocked by security rules page");
            }
          }
        } catch (err) {
          console.error("Failed to parse synchronized cart", err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [syncKey, cart]);

  // Unified camera streaming trigger routine
  const startLiveCamera = async () => {
    try {
      setScanStatusMessage("Requesting rear phone camera scan permission...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setScanStatusMessage("SMARTPHONE CAMERA LIVE AND REGISTERED! Aim at package label...");
    } catch (err) {
      try {
        const streamFallback = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraStream(streamFallback);
        if (videoRef.current) {
          videoRef.current.srcObject = streamFallback;
        }
        setCameraActive(true);
        setScanStatusMessage("Camera active (Standard Default). Align QR/Barcode center.");
      } catch (fallbackErr: any) {
        setScanStatusMessage(
          "HARDWARE CAMERA NOT GRANTED: " + (fallbackErr.message || "Blocked. Initializing Interactive Testing Mode.")
        );
      }
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const handleSimulatedScan = () => {
    if (!selectedScannerProduct) {
      setScanStatusMessage("Please choose a physical product SKU to scan!");
      return;
    }
    setScanningActive(true);
    setScanStatusMessage("Synthesizing barcode optical laser stream...");
    
    setTimeout(() => {
      // Direct scanner acoustic beep
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
      } catch (e) {
        console.error("Simulator scan beep muted");
      }
      
      // Add product item directly
      const idx = cart.findIndex(item => item.product.sku === selectedScannerProduct.sku);
      let nextCart = [...cart];
      if (idx > -1) {
        nextCart[idx] = { ...nextCart[idx], quantity: nextCart[idx].quantity + 1 };
      } else {
        nextCart = [...cart, { product: selectedScannerProduct, quantity: 1 }];
      }
      
      saveCartAndSync(nextCart);
      setScanningActive(false);
      setScanStatusMessage(`SUCCESS: Instantly scanned product SKU "${selectedScannerProduct.sku}" over Real-Time Sync protocol!`);
    }, 600);
  };

  // Filter products for POS
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "All Items" || p.category === selectedCategory;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Category list
  const categories = ["All Items", "Electronics", "Beverages", "Snacks", "Office Supplies", "Accessories"];

  const addToCart = (product: Product) => {
    if (product.stockLevel <= 0) {
      alert(`${product.name} is currently out of stock!`);
      return;
    }
    const idx = cart.findIndex(item => item.product.sku === product.sku);
    let nextCart = [...cart];
    if (idx > -1) {
      const currentQty = cart[idx].quantity;
      if (currentQty >= product.stockLevel) {
        alert(`Cannot add more. Only ${product.stockLevel} units available in stock.`);
        return;
      }
      nextCart[idx] = { ...nextCart[idx], quantity: currentQty + 1 };
    } else {
      nextCart = [...cart, { product, quantity: 1 }];
    }
    saveCartAndSync(nextCart);
  };

  const updateCartQty = (sku: string, delta: number) => {
    const nextCart = cart.map(item => {
      if (item.product.sku === sku) {
        const product = products.find(p => p.sku === sku);
        const maxStock = product ? product.stockLevel : 999;
        const nextQty = item.quantity + delta;
        if (nextQty > maxStock) {
          alert(`Only ${maxStock} units of ${item.product.name} are available in stock.`);
          return item;
        }
        return { ...item, quantity: Math.max(1, nextQty) };
      }
      return item;
    }).filter(item => item.quantity > 0);
    saveCartAndSync(nextCart);
  };

  const removeFromCart = (sku: string) => {
    const nextCart = cart.filter(item => item.product.sku !== sku);
    saveCartAndSync(nextCart);
  };

  const clearCart = () => {
    saveCartAndSync([]);
    setDiscount(0);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName) return;
    const email = newCustEmail || `${newCustName.toLowerCase().replace(/\s+/g, '')}@email.com`;
    const accNo = `ACC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName,
      email,
      accountNo: accNo
    };
    addCustomer(newCust);
    setSelectedCustomer(newCustName);
    setShowCustModal(false);
    setNewCustName("");
    setNewCustEmail("");
  };

  // Financial Math
  const subtotal = cart.reduce((sum, item) => sum + (item.product.sellPrice * item.quantity), 0);
  const vat = subtotal * (settings.billingVat / 100);
  const totalPayable = Math.max(0, (subtotal + vat) - discount);

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      alert("Please add products to the cart first!");
      return;
    }

    const posInvoiceId = `POS-${Math.floor(88000 + Math.random() * 900)}`;
    
    // Deduct stock levels in ERP in real-time
    cart.forEach(item => {
      const targetProduct = products.find(p => p.sku === item.product.sku);
      if (targetProduct) {
        const nextStock = targetProduct.stockLevel - item.quantity;
        updateProduct(item.product.sku, { stockLevel: Math.max(0, nextStock) });
      }

      // Add a ledger movement record!
      addMovement({
        id: `mov-${Date.now()}-${item.product.sku}`,
        date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
        time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        sku: item.product.sku,
        description: item.product.name,
        type: "OUT",
        quantity: item.quantity,
        referenceId: posInvoiceId,
        executedBy: activeProfile.name,
        avatarUrl: activeProfile.avatarUrl
      });
    });

    // Create a real transaction invoice
    const newTx = {
      invoiceId: posInvoiceId,
      customerName: selectedCustomer,
      date: `${new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })} • ${new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`,
      amount: totalPayable,
      status: "PAID" as const,
      paymentMode: paymentMode
    };

    addTransaction(newTx);
    setLastInvoiceId(posInvoiceId);
    setLastReceiptTx({
      id: posInvoiceId,
      customer: selectedCustomer,
      date: newTx.date,
      items: [...cart],
      subtotal,
      vat,
      discount,
      total: totalPayable,
      paymentMode
    });

    // Reset checkout forms
    setShowReceipt(true);
    saveCartAndSync([]);
    setDiscount(0);
  };

  return (
    <div className="flex animate-fade-in gap-gutter-md -m-margin-page h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Left Column: Product Selection */}
      <div className="flex-1 p-margin-page overflow-y-auto custom-scrollbar">
        {/* Category Filter and Search Container */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat 
                    ? "bg-primary text-on-primary shadow-sm" 
                    : "bg-surface-container-highest text-on-surface-variant hover:bg-secondary-container"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search SKU or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <button
              onClick={() => {
                setShowScanSimulator(true);
                setScanStatusMessage("Waiting for trigger pull...");
                if (products.length > 0) {
                  setSelectedScannerProduct(products[0]);
                }
              }}
              className="px-3 py-2 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-lg font-sans text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-primary/20 shrink-0"
              title="Activate Barcode Simulated Gun"
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span>Simulate Scan</span>
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
          {filteredProducts.map((p) => {
            const isLowStock = p.stockLevel > 0 && p.stockLevel <= p.minStockLevel;
            const isOut = p.stockLevel <= 0;

            return (
              <div
                key={p.sku}
                onClick={() => addToCart(p)}
                className="bg-surface-container-lowest border border-outline-variant p-card-padding rounded-xl hover:shadow-md transition-shadow cursor-pointer group active:scale-[0.98] select-none flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square bg-surface-container-low rounded-lg mb-3 overflow-hidden border border-outline-variant/10">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-display text-sm font-bold text-on-surface truncate">{p.name}</h3>
                  <p className="text-[10px] text-on-surface-variant mb-2">SKU: {p.sku}</p>
                </div>

                <div className="flex justify-between items-end mt-2">
                  <span className="font-display text-base font-bold text-primary">
                    ${p.sellPrice.toFixed(2)}
                  </span>
                  
                  {isOut ? (
                    <span className="text-[9px] font-bold uppercase bg-error/10 text-error px-2 py-0.5 rounded border border-error/20">
                      Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="text-[9px] font-bold uppercase bg-error-container/20 text-error px-2 py-0.5 rounded border border-error/20">
                      Low Stock: {p.stockLevel}
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase bg-tertiary-container/15 text-tertiary px-2 py-0.5 rounded border border-tertiary/20">
                      In Stock: {p.stockLevel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Cart Sidebar */}
      <aside className="w-[360px] bg-surface-container-lowest border-l border-outline-variant flex flex-col shadow-[-4px_0_10px_rgba(0,0,0,0.015)]">
        {/* Cart Header */}
        <div className="p-card-padding border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <div>
            <h2 className="font-display text-base font-bold text-on-surface">Current Cart</h2>
            <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Order #POS-88291</p>
          </div>
          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="text-error font-sans text-xs font-semibold hover:bg-error-container/20 px-3 py-1 rounded transition-colors disabled:opacity-40 cursor-pointer"
          >
            Clear All
          </button>
        </div>

        {/* Customer select region */}
        <div className="p-4 border-b border-outline-variant bg-surface-bright/50">
          <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Select Customer</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={selectedCustomer}
                onChange={(e) => {
                  if (e.target.value === "+ Add New Customer") {
                    setShowCustModal(true);
                  } else {
                    setSelectedCustomer(e.target.value);
                  }
                }}
                className="w-full pl-3 pr-8 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-semibold text-on-surface focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} {c.accountNo ? `(${c.accountNo})` : ""}
                  </option>
                ))}
                <option value="+ Add New Customer" className="text-primary font-bold">+ Register New Customer</option>
              </select>
              <ChevronDown className="w-4 h-4 text-on-surface-variant absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
            <button
              onClick={() => setShowCustModal(true)}
              className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors text-primary"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface-bright/10">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-on-surface-variant opacity-60">
              <Trash2 className="w-12 h-12 text-outline-variant mb-2" />
              <p className="text-xs font-medium">Your sales cart is empty</p>
              <p className="text-[10px] text-outline mt-1">Click on products on the left to add items</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.sku} className="flex gap-3 border-b border-outline-variant/30 pb-3">
                <div className="w-11 h-11 rounded bg-surface-container-low border border-outline-variant/10 overflow-hidden shrink-0">
                  <img src={item.product.imageUrl} alt={item.product.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-sans text-xs font-bold text-on-surface truncate block">{item.product.name}</span>
                    <span className="font-sans text-xs font-bold text-on-surface">${(item.product.sellPrice * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <div className="flex items-center border border-outline-variant rounded bg-surface-container-lowest overflow-hidden">
                      <button 
                        onClick={() => updateCartQty(item.product.sku, -1)}
                        className="w-7 h-7 flex items-center justify-center text-on-surface-variant text-xs hover:bg-surface-container-high font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-on-surface">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQty(item.product.sku, 1)}
                        className="w-7 h-7 flex items-center justify-center text-on-surface-variant text-xs hover:bg-surface-container-high font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product.sku)}
                      className="text-error opacity-50 hover:opacity-100 p-1 cursor-pointer transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sales Logs */}
        {cart.length === 0 && transactions.length > 0 && (
          <div className="px-4 py-3 border-t border-outline-variant bg-surface-bright/40">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Recent Sales Terminal Logs</p>
            <div className="space-y-1.5">
              {transactions.slice(0, 2).map((t, i) => (
                <div key={i} className="flex justify-between items-center text-[11px] p-2 bg-surface-container-lowest rounded border border-outline-variant/40">
                  <span className="font-semibold text-primary">{t.invoiceId}</span>
                  <span className="text-on-surface-variant">{t.customerName}</span>
                  <span className="font-bold text-tertiary">${t.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial calculations */}
        <div className="p-4 bg-surface-bright border-t border-outline-variant">
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs text-on-surface-variant font-medium">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant font-medium">
              <span>VAT ({settings.billingVat}%)</span>
              <span>{settings.currencySymbol}{vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-surface-variant font-medium">Discount</span>
              <div className="flex items-center border border-outline-variant rounded px-2 py-1 bg-surface-container-lowest">
                <span className="text-xs text-on-surface-variant mr-1">$</span>
                <input
                  type="number"
                  min="0"
                  max={subtotal + vat}
                  value={discount === 0 ? "" : discount}
                  placeholder="0.00"
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  className="w-16 border-none focus:ring-0 text-right p-0 text-xs font-bold"
                />
              </div>
            </div>
            <div className="flex justify-between pt-2 border-t border-outline-variant mt-2">
              <span className="font-display text-sm font-bold text-on-surface">Total Payable</span>
              <span className="font-display text-base font-bold text-primary">${totalPayable.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment mode choice */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => setPaymentMode("Cash")}
              className={`flex flex-col items-center justify-center py-2 border-2 rounded-lg transition-all cursor-pointer ${
                paymentMode === "Cash" 
                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20" 
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <Wallet className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Cash</span>
            </button>
            <button
              onClick={() => setPaymentMode("Card")}
              className={`flex flex-col items-center justify-center py-2 border-2 rounded-lg transition-all cursor-pointer ${
                paymentMode === "Card" 
                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20" 
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <CreditCard className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Card</span>
            </button>
            <button
              onClick={() => setPaymentMode("Credit")}
              className={`flex flex-col items-center justify-center py-2 border-2 rounded-lg transition-all cursor-pointer ${
                paymentMode === "Credit" 
                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20" 
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <DollarSign className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Credit</span>
            </button>
          </div>

          <button
            onClick={handleCompleteSale}
            disabled={cart.length === 0}
            className="w-full bg-primary text-on-primary py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer hover:bg-opacity-95 active:scale-[0.98] transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            Complete Sale & Print
          </button>
        </div>
      </aside>

      {/* MODAL: Register customer */}
      {showCustModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant w-80 shadow-xl max-w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-on-surface text-sm">Register New Customer</h3>
              <button onClick={() => setShowCustModal(false)} className="text-on-surface-variant hover:text-error">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Johnson"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="px-3 py-2 border border-outline-variant rounded-lg text-xs bg-surface-container-low focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. sarah.j@email.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="px-3 py-2 border border-outline-variant rounded-lg text-xs bg-surface-container-low focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-on-primary py-2 rounded-lg text-xs font-bold hover:bg-opacity-90 shadow-xs cursor-pointer"
              >
                Register & Select
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Receipt Print Simulation */}
      {showReceipt && lastReceiptTx && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in p-4 overflow-y-auto">
          <div id="print-receipt-modal" className="bg-surface-container-lowest border border-outline-variant rounded-xl w-96 shadow-2xl p-6 max-w-full my-auto text-on-surface font-sans">
            <div className="flex justify-between items-start mb-4 border-b border-outline-variant/50 pb-2">
              <div>
                <h3 className="font-display font-extrabold text-[#005bc0] text-lg">MAM ERP POS</h3>
                <p className="text-[10px] text-on-surface-variant">Main Branch - Receipt Invoice</p>
              </div>
              <button onClick={() => setShowReceipt(false)} className="p-1 hover:bg-surface-container-low rounded-full hover:text-error transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-1 my-4">
              <CheckCircle className="w-12 h-12 text-tertiary mx-auto" />
              <h4 className="font-display font-bold text-sm text-tertiary">Receipt Printed Successfully</h4>
              <p className="text-[11px] text-on-surface-variant">Invoice Reference: {lastReceiptTx.id}</p>
            </div>

            <div className="border-t border-b border-dashed border-outline-variant py-2 my-4 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-on-surface-variant">Date:</span><span className="font-semibold">{lastReceiptTx.date}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Customer:</span><span className="font-semibold">{lastReceiptTx.customer}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Payment Method:</span><span className="font-semibold uppercase font-bold text-primary">{lastReceiptTx.paymentMode}</span></div>
            </div>

            <div className="space-y-2 py-2">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/30 pb-1">Line Items</p>
              {lastReceiptTx.items.map((it: any, i: number) => (
                <div key={i} className="flex justify-between text-xs">
                  <div>
                    <span className="font-medium">{it.product.name}</span>
                    <span className="text-on-surface-variant text-[11px] ml-1">x{it.quantity}</span>
                  </div>
                  <span className="font-semibold">${(it.product.sellPrice * it.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-outline-variant pt-2 mt-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-on-surface-variant"><span>Subtotal:</span><span>{settings.currencySymbol}{lastReceiptTx.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-on-surface-variant"><span>VAT ({settings.billingVat}%):</span><span>{settings.currencySymbol}{lastReceiptTx.vat.toFixed(2)}</span></div>
              {lastReceiptTx.discount > 0 && (
                <div className="flex justify-between text-error font-medium"><span>Discount:</span><span>-{settings.currencySymbol}{lastReceiptTx.discount.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between font-display font-extrabold text-sm text-primary pt-1 border-t border-outline-variant/30">
                <span>Total Paid:</span>
                <span>{settings.currencySymbol}{lastReceiptTx.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center mt-6 pt-4 border-t border-outline-variant/50 space-y-2">
              <div className="h-8 w-44 bg-surface-container-highest rounded border border-outline-variant/60 mx-auto flex items-center justify-center font-mono text-[10px] tracking-widest opacity-85 select-none">
                |||| | ||| | |||
              </div>
              <p className="text-[9px] text-on-surface-variant">Thank you for business and shopping!</p>
            </div>

             <button
              onClick={() => {
                const printWindow = window.open("", "_blank");
                if (printWindow) {
                  const itemsHtml = lastReceiptTx.items.map((it: any) => `
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px;">${it.product.name}</td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: center; font-size: 13px;">x${it.quantity}</td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 13px; font-weight: bold;">${settings.currencySymbol}${(it.product.sellPrice * it.quantity).toFixed(2)}</td>
                    </tr>
                  `).join("");

                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Invoice Receipt - ${lastReceiptTx.id}</title>
                        <style>
                          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 40px; margin: 0; background: #fff; line-height: 1.5; }
                          .receipt-container { max-width: 480px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
                          .header { text-align: center; margin-bottom: 24px; border-bottom: 2px dashed #e2e8f0; padding-bottom: 20px; }
                          .brand { font-size: 22px; font-weight: 800; color: #005bc0; letter-spacing: -0.5px; text-transform: uppercase; margin: 0; }
                          .branch { font-size: 11px; color: #64748b; margin-top: 4px; font-weight: 500; }
                          .meta-info { display: flex; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 24px; background: #f8fafc; padding: 12px; border-radius: 8px; }
                          .meta-item { display: flex; flex-direction: column; }
                          .meta-label { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; margin-bottom: 2px; }
                          .meta-value { font-weight: 600; }
                          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                          th { text-align: left; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
                          .totals { border-top: 2px dashed #e2e8f0; padding-top: 16px; margin-top: 16px; }
                          .total-row { display: flex; justify-content: space-between; font-size: 13px; color: #475569; margin-bottom: 6px; }
                          .grand-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 12px; }
                          .footer { text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
                          .barcode { font-family: monospace; font-size: 12px; letter-spacing: 4px; color: #94a3b8; font-weight: 500; margin-bottom: 6px; }
                          .thanks { font-size: 11px; color: #64748b; font-weight: 500; }
                        </style>
                      </head>
                      <body>
                        <div class="receipt-container">
                          <div class="header">
                            <h1 class="brand">MAM ERP TERMINAL</h1>
                            <div class="branch">Main Branch & Distribution Outlet</div>
                          </div>
                          
                          <div class="meta-info">
                            <div class="meta-item">
                              <span class="meta-label">INVOICE ID</span>
                              <span class="meta-value">${lastReceiptTx.id}</span>
                            </div>
                            <div class="meta-item" style="text-align: right;">
                              <span class="meta-label">DATE & TIME</span>
                              <span class="meta-value">${lastReceiptTx.date}</span>
                            </div>
                          </div>

                          <table>
                            <thead>
                              <tr>
                                <th style="width: 50%;">Item</th>
                                <th style="width: 20%; text-align: center;">Qty</th>
                                <th style="width: 30%; text-align: right;">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${itemsHtml}
                            </tbody>
                          </table>

                          <div class="totals">
                            <div class="total-row">
                              <span>Subtotal</span>
                              <span>${settings.currencySymbol}${lastReceiptTx.subtotal.toFixed(2)}</span>
                            </div>
                            <div class="total-row">
                              <span>VAT (${settings.billingVat}%)</span>
                              <span>${settings.currencySymbol}${lastReceiptTx.vat.toFixed(2)}</span>
                            </div>
                            ${lastReceiptTx.discount > 0 ? `
                              <div class="total-row" style="color: #ef4444; font-weight: 500;">
                                <span>Discount Apply</span>
                                <span>-${settings.currencySymbol}${lastReceiptTx.discount.toFixed(2)}</span>
                              </div>
                            ` : ""}
                            <div class="grand-total">
                              <span>TOTAL ACCRUED</span>
                              <span>${settings.currencySymbol}${lastReceiptTx.total.toFixed(2)}</span>
                            </div>
                          </div>

                          <div class="footer">
                            <div class="barcode">|||| | ||| | ||| | ||</div>
                            <div class="thanks">Thank you for your business! Code compliant POS register.</div>
                          </div>
                        </div>
                        <script>
                          window.onload = function() {
                            window.print();
                            // Optional: close after print dialog finishes (delayed to make sure printing triggers)
                            setTimeout(function() { window.close(); }, 500);
                          }
                        </script>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                } else {
                  window.print();
                }
              }}
              className="mt-6 w-full py-2 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" /> Print PDF Hardcopy
            </button>
          </div>
        </div>
      )}

      {/* SIMULATED QR / BARCODE SCANNER MODAL */}
      {showScanSimulator && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col items-center">
            
            {/* Top design header bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-tertiary to-primary"></div>
            
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-5 mt-1">
              <div className="flex items-center gap-2 text-left">
                <QrCode className="h-5 w-5 text-tertiary animate-pulse" />
                <div>
                  <h3 className="font-display font-black text-sm text-on-surface leading-tight">MAM Optical Laser Desk</h3>
                  <p className="text-[10px] text-on-surface-variant">Continuous simulation barcode & QR target receiver</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowScanSimulator(false);
                  setScanStatusMessage("");
                }}
                className="text-xs font-bold text-on-surface-variant hover:text-error bg-surface-container-low hover:bg-error/10 border border-outline-variant rounded-full p-1.5 transition-all cursor-pointer hover:scale-105"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Target Select Dropdown */}
            <div className="w-full flex flex-col gap-1 mb-4 text-left">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase">Select target product payload catalog</label>
              <select
                value={selectedScannerProduct ? selectedScannerProduct.sku : ""}
                onChange={(e) => {
                  const skuValue = e.target.value;
                  const matching = products.find(p => p.sku === skuValue);
                  if (matching) {
                    setSelectedScannerProduct(matching);
                    setScanStatusMessage("Tag loaded. Ready for scan trigger.");
                  }
                }}
                className="w-full px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary cursor-pointer font-semibold text-on-surface"
              >
                {products.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    [{p.sku}] {p.name} (${p.sellPrice})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Detail Info Panel */}
            {selectedScannerProduct && (
              <div className="w-full p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl mb-5 text-left text-xs space-y-1">
                <div className="flex justify-between text-on-surface-variant text-[10px] font-mono">
                  <span>SKU DESCRIPTOR</span>
                  <span>STOCK LEVEL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary font-mono">{selectedScannerProduct.sku}</span>
                  <span className={`font-bold ${selectedScannerProduct.stockLevel <= selectedScannerProduct.minStockLevel ? 'text-error animate-pulse' : 'text-emerald-700'}`}>
                    {selectedScannerProduct.stockLevel} units
                  </span>
                </div>
                <div className="pt-2 border-t border-outline-variant/20 flex justify-between text-[11px]">
                  <span className="text-on-surface font-semibold">{selectedScannerProduct.name}</span>
                  <span className="font-bold text-on-surface">${selectedScannerProduct.sellPrice.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* VISUAL BARCODE & SCANNING LASER AREA */}
            <div className="w-full h-32 bg-stone-950 border border-zinc-800 rounded-xl flex flex-col items-center justify-center relative overflow-hidden p-4 select-none shadow-inner">
              
              {/* Vertical lines simulating barcode */}
              <div className="flex justify-between items-center h-16 w-3/4 opacity-80 gap-0.5 pointer-events-none">
                <div className="w-1.5 h-full bg-zinc-100"></div>
                <div className="w-0.5 h-full bg-zinc-100"></div>
                <div className="w-2.5 h-full bg-zinc-100"></div>
                <div className="w-0.5 h-full bg-zinc-100"></div>
                <div className="w-1 h-full bg-zinc-100"></div>
                <div className="w-3 h-full bg-zinc-100"></div>
                <div className="w-0.5 h-full bg-zinc-100"></div>
                <div className="w-1.5 h-full bg-zinc-100"></div>
                <div className="w-2 h-full bg-zinc-100"></div>
                <div className="w-0.5 h-full bg-zinc-100"></div>
                <div className="w-1 h-full bg-zinc-100"></div>
                <div className="w-2.5 h-full bg-zinc-100"></div>
                <div className="w-0.5 h-full bg-zinc-100"></div>
              </div>
              
              {/* Label beneath barcode */}
              <div className="text-[10px] font-mono tracking-widest text-zinc-400 mt-2 z-10 select-all">
                {selectedScannerProduct ? `${selectedScannerProduct.sku}` : "000000000000"}
              </div>

              {/* DYNAMIC SHINING RED LASER GRID */}
              {scanningActive && (
                <>
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,1)] z-20 animate-pulse pointer-events-none"></div>
                  <div className="absolute inset-0 bg-red-500/10 mix-blend-overlay animate-pulse pointer-events-none"></div>
                </>
              )}
            </div>

            {/* SCAN STATUS CONSOLE DIALOGUE */}
            <div className="w-full mt-4 min-h-[44px] flex items-center justify-center text-center p-2 rounded-lg bg-surface-container-high/40 border border-outline-variant/20">
              <span className={`text-xs font-bold leading-tight ${scanStatusMessage.startsWith("SUCCESS") ? "text-emerald-700" : scanningActive ? "text-primary animate-pulse" : "text-on-surface-variant"}`}>
                {scanStatusMessage}
              </span>
            </div>

            {/* PULL TRIGGER ACTION BUTTONS */}
            <div className="mt-5 w-full flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowScanSimulator(false);
                  setScanStatusMessage("");
                }}
                className="flex-1 py-1.5 border border-outline-variant hover:border-primary/45 bg-surface-container-low text-on-surface font-sans text-xs font-bold rounded-xl hover:bg-surface-container-medium transition-colors cursor-pointer"
              >
                Close Gun
              </button>
              <button
                type="button"
                disabled={scanningActive || !selectedScannerProduct}
                onClick={handleSimulatedScan}
                className={`px-6 py-1.5 rounded-xl font-sans text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 select-none ${
                  scanningActive 
                    ? "bg-surface-container-highest text-outline cursor-not-allowed" 
                    : "bg-tertiary hover:bg-opacity-95 text-white cursor-pointer active:scale-95"
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0 text-white" />
                PULL SCAN TRIGGER
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
