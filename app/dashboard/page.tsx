"use client";

import React, { useEffect, useState } from "react";
import { AccountsModule } from "@/components/AccountsModule";
import Link from "next/link";
import {
  Receipt,
  LogOut,
  Store,
  CreditCard,
  Sparkles,
  Settings,
  X,
  Save,
  CheckCircle2,
  Phone,
  MapPin,
  Building,
  User,
} from "lucide-react";

export default function DashboardPage() {
  const [shopName, setShopName] = useState("My CSC Center");
  const [ownerName, setOwnerName] = useState("Owner");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [stateName, setStateName] = useState("Kerala");
  const [trialDaysLeft, setTrialDaysLeft] = useState(14);

  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("denbooks_current_tenant");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.name) setShopName(parsed.name);
          if (parsed.owner) setOwnerName(parsed.owner);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.address) setAddress(parsed.address);
          if (parsed.state) setStateName(parsed.state);
          if (parsed.trialDaysLeft !== undefined) setTrialDaysLeft(parsed.trialDaysLeft);
        } catch {}
      }
    }
  }, []);

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    const updated = {
      name: shopName.trim() || "My CSC Center",
      owner: ownerName.trim() || "Owner",
      phone: phone.trim(),
      address: address.trim(),
      state: stateName,
      trialDaysLeft,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("denbooks_current_tenant", JSON.stringify(updated));
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSettings(false);
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col">
      {/* SaaS Top Header */}
      <header className="border-b border-slate-800/80 bg-[#0c1322] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 text-slate-950 font-black shadow-md shadow-cyan-400/20">
            <Receipt size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white">{shopName}</span>
              <span className="text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} />
                <span>Pro Trial ({trialDaysLeft}d left)</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {ownerName} • {stateName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-cyan-400 hover:text-white transition shadow-sm"
          >
            <Settings size={14} className="text-cyan-400" />
            <span>Center Settings</span>
          </button>

          <Link
            href="/#pricing"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1.5 text-xs font-black text-slate-950 hover:brightness-110 transition shadow-sm"
          >
            <CreditCard size={13} />
            <span>Upgrade</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition ml-1"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Exit</span>
          </Link>
        </div>
      </header>

      {/* Embedded Standalone Accounts / Daybook Engine */}
      <main className="flex-1 p-4 md:p-6">
        <AccountsModule />
      </main>

      {/* CENTER SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-[#0c1322] p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                  <Settings size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Center Profile & Settings</h2>
                  <p className="text-xs text-slate-400">Configure your shop details shown on thermal receipts.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {saveSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                <CheckCircle2 size={16} />
                <span>Center settings saved successfully!</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveSettings} className="mt-5 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Shop / Center Name (Receipt Header)
                </label>
                <div className="relative">
                  <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Friends Cyber World & Akshaya"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Owner Name
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    State / Region
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition"
                  >
                    <option value="Kerala">Kerala</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Other">Other States</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Contact Mobile Number
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Shop Address / Location
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Near Bus Stand, Main Road, Palakkad"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition resize-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-cyan-300 transition shadow-lg shadow-cyan-400/20"
                >
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
