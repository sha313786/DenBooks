"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Receipt,
  LogOut,
  Sparkles,
  Settings,
  X,
  CheckCircle2,
  Phone,
  MapPin,
  Building,
  User,
  Users,
  FileText,
  ShoppingBag,
  Clock3,
  CreditCard,
  LayoutDashboard,
} from "lucide-react";

interface AdminHeaderLayoutProps {
  children: React.ReactNode;
}

export default function AdminHeaderLayout({ children }: AdminHeaderLayoutProps) {
  const pathname = usePathname();
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

  const navLinks = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Daybook", href: "/dashboard/daybook", icon: FileText },
    { label: "Counter POS", href: "/dashboard/pos", icon: ShoppingBag },
    { label: "Customer Khata", href: "/dashboard/khata", icon: Clock3 },
    { label: "Manage Staff", href: "/dashboard/staff", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* SaaS Top Header */}
      <header className="border-b border-slate-800/80 bg-[#0e1526]/90 backdrop-blur-md px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 text-slate-950 font-black shadow-md shadow-cyan-500/20">
            <Receipt size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-white">{shopName}</span>
              <span className="text-[10px] font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} />
                <span>Admin Suite</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {ownerName} • <span className="text-slate-300">{stateName}</span>
            </p>
          </div>
        </div>

        {/* Dedicated Module Navigation Links */}
        <nav className="flex items-center rounded-xl border border-slate-800/90 bg-[#121b2f] p-1 overflow-x-auto max-w-full shadow-inner">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                  isActive
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Staff Counter Desk Shortcut */}
          <Link
            href="/staff"
            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/40 bg-teal-500/10 px-3 py-1.5 text-xs font-bold text-teal-300 hover:bg-teal-500/20 hover:border-teal-400 transition shadow-sm"
          >
            <span>Front Desk &rarr;</span>
          </Link>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-500 hover:text-white transition shadow-sm"
            title="Center Profile & Receipt Settings"
          >
            <Settings size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition ml-1 px-2 py-1 rounded-lg hover:bg-slate-800/50"
            title="Exit Admin"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Exit</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6">
        {children}
      </main>

      {/* CENTER SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-[#0c1322] p-6 shadow-2xl">
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

            <form onSubmit={handleSaveSettings} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <Building size={14} className="text-cyan-400" />
                  <span>Shop / Center Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Apex Digital Seva Center"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <User size={14} className="text-cyan-400" />
                    <span>Owner / Operator Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Phone size={14} className="text-cyan-400" />
                    <span>Contact Phone / WhatsApp</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <MapPin size={14} className="text-cyan-400" />
                    <span>State</span>
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="Kerala">Kerala</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Other">Other State</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <MapPin size={14} className="text-cyan-400" />
                    <span>Address / Town</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Main Market, Near Bus Stand"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-400 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition shadow-md shadow-cyan-400/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
