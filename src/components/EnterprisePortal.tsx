/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context";
import { CompanyInfo } from "../types";
import {
  Building,
  User,
  Lock,
  Phone,
  MapPin,
  PlusCircle,
  LogIn,
  Users,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Sparkles
} from "lucide-react";

export default function EnterprisePortal() {
  const {
    companies,
    registerCompany,
    loginAsCompany,
    loginAsStaff,
    staffMembers
  } = useApp();

  // Active form view: "login" vs "register"
  const [panelMode, setPanelMode] = useState<"login" | "register">("login");
  
  // Login flow states
  const [loginType, setLoginType] = useState<"admin" | "staff">("admin");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration flow states
  const [regCompanyName, setRegCompanyName] = useState("");
  const [regOwnerName, setRegOwnerName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Auto-set the first company for staff dropdown if empty
  React.useEffect(() => {
    if (companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (loginType === "admin") {
      const ok = loginAsCompany(loginUsername, loginPassword);
      if (ok) {
        // Success
      } else {
        setLoginError("Invalid combination of Admin login ID or Password!");
      }
    } else {
      if (!selectedCompanyId) {
        setLoginError("Please select your Parent Company first!");
        return;
      }
      const ok = loginAsStaff(selectedCompanyId, loginUsername, loginPassword);
      if (ok) {
        // Success
      } else {
        setLoginError("Incorrect staff credentials or company mismatch!");
      }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setRegSuccess(null);

    // Validate duplicates
    const isDup = companies.some(
      (c) => c.name.toLowerCase() === regCompanyName.toLowerCase() || c.username.toLowerCase() === regUsername.toLowerCase()
    );

    if (isDup) {
      setLoginError("Error: A company with this business name or Admin ID is already registered!");
      return;
    }

    const newCompany: CompanyInfo = {
      id: `comp-${Date.now()}`,
      name: regCompanyName,
      ownerName: regOwnerName,
      address: regAddress,
      phone: regPhone,
      username: regUsername,
      password: regPassword,
      registrationDate: new Date().toISOString().split("T")[0]
    };

    registerCompany(newCompany);
    setRegSuccess(`SUCCESS: "${newCompany.name}" registered! Use ID [${newCompany.username}] to login.`);
    
    // Auto populate login username for quick entry
    setLoginUsername(regUsername);
    setLoginPassword(regPassword);
    setLoginType("admin");

    // Clear registration fields
    setRegCompanyName("");
    setRegOwnerName("");
    setRegUsername("");
    setRegPassword("");
    setRegAddress("");
    setRegPhone("");

    // Flip to login panel after delay
    setTimeout(() => {
      setPanelMode("login");
      setRegSuccess(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-stone-100 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      
      {/* Background Decorative Polygons */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* Main Architectural Container */}
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        
        {/* LEFT COLUMN: BRAND PROMOTION HERO */}
        <div className="md:col-span-5 bg-gradient-to-br from-primary via-blue-900 to-indigo-950 p-8 flex flex-col justify-between text-left text-white relative">
          
          <div className="space-y-6">
            {/* Mountain Peak branding */}
            <div className="flex items-center gap-3 bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
              <Building className="w-5 h-5 text-white" />
              <span className="font-display font-black text-xs tracking-wider uppercase">MAM POS-ERP</span>
            </div>

            <div className="space-y-3 pt-6">
              <h1 className="font-display text-2xl md:text-3xl font-black leading-tight tracking-tight">
                PROTOMO Multi-Tenant Enterprise Systems
              </h1>
              <p className="text-xs text-blue-100 leading-relaxed font-medium">
                Integrated software suite with complete multi-company isolation. Secure staff roster workspaces, quick cash billing terminals, and real-time Google Sheets database mirroring.
              </p>
            </div>
          </div>

          {/* Business Features Bullet list */}
          <div className="space-y-4 pt-8">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg text-emerald-300">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">Fresh Tenancy Databases</h4>
                <p className="text-[10px] text-blue-200 mt-0.5">Every newly registered business triggers clean, zero-leak database memory containers.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg text-emerald-300">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">Interactive Roster Management</h4>
                <p className="text-[10px] text-blue-200 mt-0.5">Define employee user ID / passwords for Cashier logins on different operational terminals.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg text-emerald-300">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">Pristine Direct Printing</h4>
                <p className="text-[10px] text-blue-200 mt-0.5">Print high-fidelity receipts to PDF cleanly without surrounding website clutter.</p>
              </div>
            </div>
          </div>

          {/* Bottom branding marker */}
          <div className="pt-8 border-t border-white/10 flex justify-between items-center text-[10px] text-blue-200 font-mono">
            <span>SECURED BY SHA-256</span>
            <span>PROTOMO HQ</span>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE INTERACTIVE CONVERSATION CONTROLLER */}
        <div className="md:col-span-7 p-8 flex flex-col justify-between bg-zinc-950 text-left relative">
          
          {/* Header Action Swapper */}
          <div className="flex justify-between items-center border-b border-zinc-800/80 pb-4 shrink-0">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-stone-300">
              {panelMode === "login" ? "Operational Login Gate" : "Corporate Registration Hub"}
            </h3>

            <div className="flex bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
              <button
                onClick={() => { setPanelMode("login"); setLoginError(null); }}
                className={`px-3 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  panelMode === "login" ? "bg-zinc-800 text-stone-100" : "text-stone-500 hover:text-stone-300"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setPanelMode("register"); setLoginError(null); }}
                className={`px-3 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  panelMode === "register" ? "bg-zinc-800 text-stone-100" : "text-stone-500 hover:text-stone-300"
                }`}
              >
                Register Business
              </button>
            </div>
          </div>

          {/* Core Body Container */}
          <div className="flex-1 py-6 flex flex-col justify-center min-h-0">
            
            {loginError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-900 text-red-300 text-xs rounded-xl font-medium">
                {loginError}
              </div>
            )}

            {regSuccess && (
              <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-900 text-emerald-300 text-xs rounded-xl font-medium">
                {regSuccess}
              </div>
            )}

            {/* 1. LOGIN MODE SCREEN */}
            {panelMode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Switch between Admin login vs Staff login */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 border border-zinc-800/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setLoginType("admin"); setLoginError(null); }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      loginType === "admin"
                        ? "bg-primary text-white font-extrabold shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Company Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginType("staff"); setLoginError(null); }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      loginType === "staff"
                        ? "bg-primary text-white font-extrabold shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Employee / Staff</span>
                  </button>
                </div>

                {/* If Staff Login: We must select parent company context first */}
                {loginType === "staff" && (
                  <div className="flex flex-col gap-1 inline-animation">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase font-mono tracking-wider">
                      Select Tenant Enterprise
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCompanyId}
                        onChange={(e) => setSelectedCompanyId(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-xs font-semibold text-zinc-300 focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                      >
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <Building className="w-4 h-4 text-zinc-500 absolute right-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Login User ID Fields */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase font-mono tracking-wider">
                    {loginType === "admin" ? "Master Admin Username" : "Staff User Login ID"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={loginType === "admin" ? "e.g. admin" : "e.g. mahfuj"}
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-2.5 pl-9 rounded-xl text-xs font-mono text-zinc-100 outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                    <User className="w-4 h-4 text-zinc-600 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase font-mono tracking-wider">
                      Security Password
                    </label>
                    <span className="text-[10px] text-primary hover:underline cursor-pointer">
                      Demo logins: admin passcode is [123]
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-2.5 pl-9 rounded-xl text-xs font-mono text-zinc-100 outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                    <Lock className="w-4 h-4 text-zinc-600 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-primary to-indigo-600 hover:opacity-95 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95 text-sm uppercase font-display"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Verify Credentials & Boot Dashboard</span>
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-800"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">Or Quick Evaluation</span>
                  <div className="flex-grow border-t border-zinc-800"></div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    loginAsCompany("admin", "123");
                  }}
                  className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-stone-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 hover:bg-zinc-850"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Enter Demo Workspace (Alex Rivera Hub)</span>
                </button>
              </form>
            ) : (
              
              /* 2. REGISTRATION MODE SCREEN */
              <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar pr-2">
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase font-mono tracking-wider">
                      Business Company Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. PROTOMO CO."
                        required
                        value={regCompanyName}
                        onChange={(e) => setRegCompanyName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 py-2 pr-4 rounded-lg text-xs text-zinc-100 outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase font-mono tracking-wider">
                      Business Proprietor / Owner
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Mahfuj Alom"
                        required
                        value={regOwnerName}
                        onChange={(e) => setRegOwnerName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 py-2 pr-4 rounded-lg text-xs text-zinc-100 outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase font-mono tracking-wider">
                      Admin Login Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. protomo"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 py-2 rounded-lg text-xs font-mono text-zinc-100 outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase font-mono tracking-wider">
                      Admin Security Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Create passcode..."
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 py-2 rounded-lg text-xs font-mono text-zinc-100 outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase font-mono tracking-wider">
                    Official Head Office Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Merul Badda, Dhaka, Bangladesh"
                      required
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-2 py-2 pl-8 rounded-lg text-xs text-zinc-100 outline-none focus:ring-1 focus:ring-primary"
                    />
                    <MapPin className="w-3.5 h-3.5 text-zinc-600 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase font-mono tracking-wider">
                    Contact Phone Number (Bangladeshi support ready)
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="e.g. +880 1700-000000"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-2 py-2 pl-8 rounded-lg text-xs text-zinc-100 outline-none focus:ring-1 focus:ring-primary font-mono"
                    />
                    <Phone className="w-3.5 h-3.5 text-zinc-600 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white text-xs font-black rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95 font-display"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Execute Corporate Registration & Initialize Memory</span>
                </button>
              </form>
            )}

          </div>

          {/* Footer Guidelines */}
          <div className="border-t border-zinc-900 pt-3 select-none flex items-center justify-between text-[10px] text-zinc-600 font-mono mt-4 shrink-0">
            <span>PROTOMO V2.1 ERP ENGINE</span>
            <span>SYSTEM STANDBY</span>
          </div>

        </div>

      </div>

    </div>
  );
}
