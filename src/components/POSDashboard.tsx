/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context";
import {
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  Receipt,
  ArrowUp,
  BarChart3,
  Search,
  Plus,
  Bell,
  HelpCircle,
  Settings,
  Calendar,
  Download,
  Store,
  Users,
  LogOut,
  ChevronDown,
  Filter,
  MoreVertical
} from "lucide-react";

export default function POSDashboard() {
  const { transactions, products, setAppSuite, setPosView, settings } = useApp();
  const [chartType, setChartType] = useState<"revenue" | "goal">("revenue");
  const [activeBar, setActiveBar] = useState<string | null>(null);

  // Filter out low stock count
  const lowStockProducts = products.filter(p => p.stockLevel <= p.minStockLevel);
  const lowStockCount = lowStockProducts.length;

  const chartData = {
    revenue: [
      { day: "Mon", value: "$4.2k", height: "h-[60%]" },
      { day: "Tue", value: "$5.1k", height: "h-[72%]" },
      { day: "Wed", value: "$3.8k", height: "h-[54%]" },
      { day: "Thu", value: "$7.2k", height: "h-[85%]" },
      { day: "Fri", value: "$6.8k", height: "h-[90%]" },
      { day: "Sat", value: "$8.4k", height: "h-[98%]" },
      { day: "Sun", value: "$2.1k", height: "h-[40%]" }
    ],
    goal: [
      { day: "Mon", value: "$5.0k", height: "h-[70%]" },
      { day: "Tue", value: "$5.0k", height: "h-[70%]" },
      { day: "Wed", value: "$5.0k", height: "h-[70%]" },
      { day: "Thu", value: "$5.0k", height: "h-[70%]" },
      { day: "Fri", value: "$6.0k", height: "h-[85%]" },
      { day: "Sat", value: "$8.0k", height: "h-[95%]" },
      { day: "Sun", value: "$3.0k", height: "h-[45%]" }
    ]
  };

  return (
    <div className="animate-fade-in">
      {/* Header Stats & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary"></span>
            </span>
            <p className="font-sans text-xs font-semibold text-tertiary tracking-wider uppercase">Live Sync Active</p>
            <span className="text-outline-variant">•</span>
            <p className="font-sans text-xs text-on-surface-variant text-body-sm">Last update: Just now</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-outline-variant rounded-lg font-sans text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-2 cursor-pointer shadow-xs">
            <Calendar className="w-4 h-4 text-on-surface-variant" />
            This Week
            <ChevronDown className="w-3 w-3 text-on-surface-variant ml-1" />
          </button>
          <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-sans text-xs font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-sm">
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-md mb-8">
        {/* Today's Sales */}
        <div className="glass-card p-card-padding rounded-xl bg-surface-container-lowest border-outline-variant hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">TODAY'S SALES</span>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-display text-2xl font-bold text-on-surface">{settings.currencySymbol}12,450</h3>
            <div className="flex items-center justify-between gap-2 mt-2">
              <span className="flex items-center text-tertiary text-xs font-bold gap-0.5">
                <ArrowUp className="w-3.5 h-3.5" />
                12%
              </span>
              <svg className="w-24 h-8 text-tertiary" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 25 Q 15 20, 25 22 T 50 15 T 75 18 T 100 5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="glass-card p-card-padding rounded-xl bg-surface-container-lowest border-outline-variant">
          <div className="flex justify-between items-start mb-2">
            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">NET PROFIT</span>
            <TrendingUp className="w-5 h-5 text-tertiary" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-display text-2xl font-bold text-on-surface">{settings.currencySymbol}3,200</h3>
            <p className="text-xs font-semibold text-on-surface-variant mt-2">25% margin</p>
            <div className="w-full bg-secondary-container h-1.5 rounded-full mt-2">
              <div className="bg-tertiary h-full rounded-full w-[25%] transition-all duration-500"></div>
            </div>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="glass-card p-card-padding rounded-xl bg-surface-container-lowest border-error/20 hover:border-error transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">LOW STOCK</span>
            <AlertTriangle className="w-5 h-5 text-error" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-display text-2xl font-bold text-error">{lowStockCount} Items</h3>
            <p className="text-xs font-semibold text-error mt-2">Requires attention</p>
            <div className="flex -space-x-2 mt-2 overflow-hidden">
              <div className="h-6 w-fit px-1.5 rounded-full bg-error-container border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold text-on-error-container">SKU-A</div>
              <div className="h-6 w-fit px-1.5 rounded-full bg-error-container border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold text-on-error-container">SKU-B</div>
              <div className="h-6 w-8 rounded-full bg-error-container border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold text-on-error-container">+{Math.max(0, lowStockCount - 2)}</div>
            </div>
          </div>
        </div>

        {/* Outstanding Dues */}
        <div className="glass-card p-card-padding rounded-xl bg-surface-container-lowest border-outline-variant">
          <div className="flex justify-between items-start mb-2">
            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">OUTSTANDING</span>
            <Receipt className="w-5 h-5 text-secondary" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-display text-2xl font-bold text-on-surface">{settings.currencySymbol}1,150</h3>
            <p className="text-xs font-semibold text-on-surface-variant mt-2">Across 14 invoices</p>
            <button 
              onClick={() => {
                setAppSuite("ERP");
                setPosView("Dashboard");
              }}
              className="text-primary text-xs font-bold mt-2 hover:underline text-left w-fit cursor-pointer"
            >
              View AR Report →
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter-md">
        {/* Sales Trend Chart Area */}
        <div className="lg:col-span-2 glass-card rounded-xl p-card-padding bg-surface-container-lowest">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-bold text-on-surface">Sales Trend</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setChartType("revenue")}
                className={`px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${chartType === "revenue" ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-high text-on-surface-variant"}`}
              >
                REVENUE
              </button>
              <button 
                onClick={() => setChartType("goal")}
                className={`px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${chartType === "goal" ? "bg-secondary-fixed text-on-secondary-fixed" : "bg-surface-container-high text-on-surface-variant"}`}
              >
                GOAL
              </button>
            </div>
          </div>
          
          <div className="h-[280px] w-full relative flex items-end justify-between px-2 pt-4 border-b border-outline-variant">
            {chartData[chartType].map((bar, i) => (
              <div 
                key={i} 
                onMouseEnter={() => setActiveBar(bar.day)} 
                onMouseLeave={() => setActiveBar(null)}
                className={`w-10 bg-primary/10 rounded-t-lg relative group transition-all duration-300 cursor-pointer ${activeBar === bar.day ? "bg-primary/20 scale-102" : ""}`} 
                style={{ height: chartType === "revenue" ? `${[60, 72, 54, 85, 90, 98, 40][i]}%` : `${[70, 70, 70, 70, 85, 95, 45][i]}%` }}
              >
                <div className={`absolute bottom-0 w-full bg-primary-container rounded-t-lg transition-all duration-500`} style={{ height: "85%" }}></div>
                
                {/* Floating Tooltip */}
                {activeBar === bar.day && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface rounded px-2 py-1 text-[11px] font-semibold shadow-md whitespace-nowrap z-20">
                    {bar.day}: {bar.value.replace("$", settings.currencySymbol)}
                  </div>
                )}
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-sans text-xs text-on-surface-variant font-medium">{bar.day}</span>
              </div>
            ))}
          </div>
          <div className="h-6"></div>
        </div>

        {/* Top Selling Products */}
        <div className="glass-card rounded-xl p-card-padding bg-surface-container-lowest">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-bold text-on-surface">Top Sellers</h3>
            <button onClick={() => setPosView("QuickBilling")} className="text-primary text-xs font-semibold hover:underline cursor-pointer">View All</button>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-sans text-sm font-semibold text-on-surface">Premium Headset X2</span>
                <span className="font-sans text-xs text-on-surface-variant font-medium">420 sold</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full w-[85%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-sans text-sm font-semibold text-on-surface">Eco-Glass Flask</span>
                <span className="font-sans text-xs text-on-surface-variant font-medium font-medium">315 sold</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full rounded-full w-[65%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-sans text-sm font-semibold text-on-surface">Precision Mouse V3</span>
                <span className="font-sans text-xs text-on-surface-variant font-medium">280 sold</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full w-[55%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-sans text-sm font-semibold text-on-surface">Smart Watch Elite</span>
                <span className="font-sans text-xs text-on-surface-variant font-medium">190 sold</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full w-[40%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="lg:col-span-3 glass-card rounded-xl overflow-hidden mt-2 bg-surface-container-lowest">
          <div className="px-card-padding py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
            <h3 className="font-display text-lg font-bold text-on-surface">Recent Transactions</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-surface-container-low rounded-lg cursor-pointer text-on-surface-variant border border-outline-variant">
                <Filter className="w-4 h-4" />
              </button>
              <button onClick={() => setPosView("QuickBilling")} className="p-2 hover:bg-surface-container-low rounded-lg cursor-pointer text-on-surface-variant border border-outline-variant">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  <th className="px-gutter-md py-3">Invoice #</th>
                  <th className="px-gutter-md py-3">Customer</th>
                  <th className="px-gutter-md py-3">Date</th>
                  <th className="px-gutter-md py-3 text-right">Amount</th>
                  <th className="px-gutter-md py-3 text-center">Status</th>
                  <th className="px-gutter-md py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {transactions.slice(0, 4).map((tx, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-gutter-md py-4 font-sans text-sm font-semibold text-on-surface">{tx.invoiceId}</td>
                    <td className="px-gutter-md py-4 font-sans text-sm text-on-surface">{tx.customerName}</td>
                    <td className="px-gutter-md py-4 font-sans text-xs text-on-surface-variant">{tx.date}</td>
                    <td className="px-gutter-md py-4 font-sans text-sm text-right font-bold text-on-surface">
                      {settings.currencySymbol}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-gutter-md py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        tx.status === "PAID" 
                          ? "bg-tertiary/10 text-tertiary border-tertiary/20" 
                          : tx.status === "PENDING"
                          ? "bg-secondary-container/50 text-on-secondary-container border-outline-variant"
                          : "bg-error/10 text-error border-error/20"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-gutter-md py-4">
                      <button className="text-on-surface-variant cursor-pointer hover:text-primary p-1 rounded-full hover:bg-surface-container-high transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
