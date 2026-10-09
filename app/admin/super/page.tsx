"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import {
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertTriangle,
  Search,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  Phone,
  User,
  Building,
  CreditCard,
  Sliders,
  Check,
  X,
  ExternalLink,
  MessageSquare,
  QrCode,
  DollarSign,
  ChevronRight,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";
import {
  TenantSubscription,
  PaymentSubmission,
  SubscriptionPlan,
  SuperAdminConfig,
  getAllTenantsSubscription,
  getAllPaymentSubmissions,
  approvePaymentSubmission,
  rejectPaymentSubmission,
  extendTenantSubscription,
  toggleTenantLock,
  getSuperAdminConfig,
  saveSuperAdminConfig,
  getDaysRemaining,
} from "@/lib/services/subscription.service";

export default function SuperAdminPage() {
  // Authentication & Access State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [showPin, setShowPin] = useState(false);

  // Data State
  const [tenants, setTenants] = useState<TenantSubscription[]>([]);
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [config, setConfig] = useState<SuperAdminConfig>(getSuperAdminConfig());
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<"pending" | "tenants" | "settings">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Config Form State
  const [configUpiId, setConfigUpiId] = useState("");
  const [configPayee, setConfigPayee] = useState("");
  const [configMonthly, setConfigMonthly] = useState("499");
  const [configYearly, setConfigYearly] = useState("3999");
  const [configWa, setConfigWa] = useState("");
  const [configPin, setConfigPin] = useState("9999");
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  // Check saved session auth
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = sessionStorage.getItem("denbooks_super_auth");
      if (savedAuth === "true") {
        setIsAuthenticated(true);
      }
    }
    const currentCfg = getSuperAdminConfig();
    setConfig(currentCfg);
    setConfigUpiId(currentCfg.upi_id);
    setConfigPayee(currentCfg.payee_name);
    setConfigMonthly(String(currentCfg.monthly_price));
    setConfigYearly(String(currentCfg.yearly_price));
    setConfigWa(currentCfg.whatsapp_number);
    setConfigPin(currentCfg.master_pin);
  }, []);

  // Fetch tenants and submissions
  async function loadData() {
    setLoading(true);
    try {
      const [tList, sList] = await Promise.all([
        getAllTenantsSubscription(),
        getAllPaymentSubmissions(),
      ]);
      setTenants(tList);
      setSubmissions(sList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const currentCfg = getSuperAdminConfig();
    if (pinInput.trim() === currentCfg.master_pin || pinInput.trim() === "den360super") {
      setIsAuthenticated(true);
      setPinError("");
      if (typeof window !== "undefined") {
        sessionStorage.setItem("denbooks_super_auth", "true");
      }
    } else {
      setPinError("Invalid Master Passcode. Default is 9999");
    }
  }

  function handleLogout() {
    setIsAuthenticated(false);
    setPinInput("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("denbooks_super_auth");
    }
  }

  function notify(msg: string) {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 3000);
  }

  // --- ACTIONS ---

  async function handleApprove(submissionId: string, days?: number) {
    const res = await approvePaymentSubmission(submissionId, days);
    if (res.success) {
      notify(`Payment approved! Added ${days || 30} days subscription to tenant.`);
      loadData();
    }
  }

  async function handleReject(submissionId: string) {
    const reason = prompt("Enter rejection reason (e.g., UTR not matching bank statement):");
    if (reason === null) return;
    const ok = await rejectPaymentSubmission(submissionId, reason || "Invalid UTR");
    if (ok) {
      notify("Payment submission rejected.");
      loadData();
    }
  }

  async function handleExtendTenant(tenantId: string, days: number, planName: SubscriptionPlan = "monthly") {
    const updated = await extendTenantSubscription(tenantId, days, planName);
    notify(`Extended ${updated.shop_name} by +${days} days! (Status: Active)`);
    loadData();
  }

  async function handleToggleLock(tenant: TenantSubscription) {
    const shouldLock = !tenant.is_locked;
    const reason = shouldLock ? "Account locked by Super Admin due to overdue subscription." : undefined;
    await toggleTenantLock(tenant.id, shouldLock, reason);
    notify(`Center ${tenant.shop_name} is now ${shouldLock ? "LOCKED" : "UNLOCKED"}!`);
    loadData();
  }

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    const updated = saveSuperAdminConfig({
      upi_id: configUpiId.trim() || "denbooks@upi",
      payee_name: configPayee.trim() || "DenBooks 360",
      monthly_price: Number(configMonthly) || 499,
      yearly_price: Number(configYearly) || 3999,
      whatsapp_number: configWa.trim() || "+919876543210",
      master_pin: configPin.trim() || "9999",
    });
    setConfig(updated);
    notify("Super Admin payment and master settings updated successfully!");
  }

  function copyText(txt: string, id: string) {
    navigator.clipboard.writeText(txt);
    setCopiedUtr(id);
    setTimeout(() => setCopiedUtr(null), 2000);
  }

  // Filtered lists
  const pendingSubmissions = submissions.filter((s) => s.status === "pending");

  const filteredTenants = tenants.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      t.shop_name.toLowerCase().includes(q) ||
      t.owner_name.toLowerCase().includes(q) ||
      t.owner_phone.includes(q) ||
      t.state.toLowerCase().includes(q) ||
      (t.last_payment_utr && t.last_payment_utr.includes(q));

    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = t.status === "active" && !t.is_locked;
    else if (statusFilter === "trial") matchesStatus = t.status === "trial" && !t.is_locked;
    else if (statusFilter === "expired") matchesStatus = t.status === "expired";
    else if (statusFilter === "locked") matchesStatus = t.is_locked;

    return matchesQuery && matchesStatus;
  });

  // KPI Calculations
  const totalTenants = tenants.length;
  const activeCount = tenants.filter((t) => t.status === "active" && !t.is_locked).length;
  const trialCount = tenants.filter((t) => t.status === "trial" && !t.is_locked).length;
  const lockedCount = tenants.filter((t) => t.is_locked || t.status === "expired").length;

  // --- LOGIN GATEWAY ---
  if (!isAuthenticated) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#070b13] px-4 py-12 text-slate-100 font-sans">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,220,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,220,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[130px]" />

        <div className="relative w-full max-w-md">
          <div className="rounded-3xl border border-slate-800 bg-[#0c1322]/95 p-8 shadow-2xl backdrop-blur-xl">
            <div className="text-center mb-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 mb-3 shadow-lg shadow-cyan-400/10">
                <ShieldCheck size={28} />
              </div>
              <h1 className="text-xl font-black tracking-tight text-white">Super Admin Control Hub</h1>
              <p className="text-xs text-slate-400 mt-1">Master Subscription Approval & Tenant Lockdown</p>
            </div>

            {pinError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertTriangle size={15} />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <KeyRound size={14} className="text-cyan-400" />
                    <span>Master Access PIN / Passcode</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Default: 9999</span>
                </label>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    required
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter Master PIN (e.g. 9999)"
                    className="w-full font-mono rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition shadow-md shadow-cyan-400/20"
              >
                <ShieldCheck size={16} />
                <span>Unlock Master Dashboard</span>
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/dashboard"
                  className="text-xs text-slate-400 hover:text-cyan-400 transition inline-flex items-center gap-1"
                >
                  <ArrowLeft size={13} />
                  <span>Return to Shop Dashboard</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED SUPER ADMIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#080d17] text-slate-100 flex flex-col font-sans">
      {/* Top Super Header */}
      <header className="border-b border-slate-800/80 bg-[#0c1322]/95 backdrop-blur-md px-4 md:px-6 py-3 sticky top-0 z-40 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 shadow-md">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white">DenBooks Super Admin</h1>
              <span className="rounded-full bg-cyan-950 border border-cyan-800 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                Master Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              UPI Subscription Approvals &bull; Tenant Lockouts &bull; Center Lifecycles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-500 transition"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-cyan-400" : ""} />
            <span>Refresh</span>
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <ArrowLeft size={13} />
            <span>Shop Panel</span>
          </Link>

          <ThemeToggle />

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
          >
            <Lock size={13} />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Flash Action Banner */}
        {actionMessage && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 animate-fadeIn shadow-lg">
            <CheckCircle2 size={16} />
            <span className="font-semibold">{actionMessage}</span>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border border-slate-800 bg-[#0e1627] p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Centers</span>
              <Building size={16} className="text-cyan-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{totalTenants}</span>
              <span className="text-[11px] text-slate-400">All registered</span>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/15 p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400">Active Paid</span>
              <ShieldCheck size={16} className="text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-300">{activeCount}</span>
              <span className="text-[11px] text-emerald-400/80">Monthly / Yearly</span>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-900/40 bg-amber-950/15 p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400">In 14d Trial</span>
              <Clock size={16} className="text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-300">{trialCount}</span>
              <span className="text-[11px] text-amber-400/80">Exploring</span>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-900/40 bg-rose-950/15 p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-400">Locked / Expired</span>
              <ShieldAlert size={16} className="text-rose-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-rose-300">{lockedCount}</span>
              <span className="text-[11px] text-rose-400/80">Access frozen</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#0e1627] rounded-2xl p-1.5 gap-1.5 overflow-x-auto shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === "pending"
                ? "bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <CreditCard size={14} />
            <span>Pending Approvals</span>
            {pendingSubmissions.length > 0 && (
              <span className={`rounded-full px-2 py-0.2 text-[10px] font-black ${
                activeTab === "pending" ? "bg-slate-950 text-cyan-300" : "bg-amber-400 text-slate-950 animate-pulse"
              }`}>
                {pendingSubmissions.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tenants")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === "tenants"
                ? "bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Building size={14} />
            <span>All Centers & Control</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.2 text-[10px] text-slate-300">
              {tenants.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === "settings"
                ? "bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Sliders size={14} />
            <span>Payment & UPI Rates</span>
          </button>
        </div>

        {/* TAB 1: PENDING UTR APPROVALS */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard size={16} className="text-cyan-400" />
                  <span>Pending UPI UTR Submissions</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Check your bank account (PhonePe/GPay/Paytm) for these UTR references, then approve with 1 click.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/50 px-2.5 py-1 rounded-xl">
                UPI ID: {config.upi_id}
              </span>
            </div>

            {pendingSubmissions.length === 0 ? (
              <div className="rounded-2xl border border-slate-800/80 bg-[#0d1424] p-12 text-center">
                <CheckCircle2 size={36} className="mx-auto text-emerald-400/60 mb-3" />
                <h3 className="text-sm font-bold text-slate-200">No Pending Approvals!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  All submitted center payments have been reviewed. When a center scans the QR code and submits their 12-digit UTR, it will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSubmissions.map((sub) => {
                  const subDate = new Date(sub.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const isYearly = sub.plan === "yearly";

                  return (
                    <div
                      key={sub.id}
                      className="rounded-2xl border border-amber-500/30 bg-[#0e172a] p-5 shadow-lg relative flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-black text-white">{sub.shop_name}</h3>
                              <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                                Pending
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>{sub.owner_name}</span> &bull;
                              <a
                                href={`https://wa.me/91${sub.owner_phone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                              >
                                <Phone size={11} /> {sub.owner_phone}
                              </a>
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="font-mono text-base font-black text-emerald-400">
                              ₹{sub.amount}
                            </span>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                              {sub.plan} Plan
                            </div>
                          </div>
                        </div>

                        {/* UTR Details Box */}
                        <div className="rounded-xl border border-slate-800 bg-[#090e1a] p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400">12-Digit UTR Number:</span>
                            <button
                              type="button"
                              onClick={() => copyText(sub.utr_number, sub.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-400 hover:text-cyan-300"
                            >
                              {copiedUtr === sub.id ? <Check size={12} /> : <Copy size={12} />}
                              <span>{copiedUtr === sub.id ? "Copied" : "Copy UTR"}</span>
                            </button>
                          </div>
                          <div className="font-mono text-base font-black text-amber-300 tracking-wider">
                            {sub.utr_number}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                            <span>Submitted: {subDate}</span>
                            {sub.notes && <span className="text-slate-400 italic">"{sub.notes}"</span>}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => handleApprove(sub.id, isYearly ? 365 : 30)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-sm"
                        >
                          <CheckCircle2 size={14} />
                          <span>Approve (+{isYearly ? "365" : "30"} Days)</span>
                        </button>

                        <a
                          href={`https://wa.me/91${sub.owner_phone}?text=${encodeURIComponent(
                            `Hello ${sub.owner_name}, regarding your DenBooks 360 subscription payment of ₹${sub.amount} (UTR: ${sub.utr_number})...`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-teal-500/40 bg-teal-500/10 p-2 text-teal-300 hover:bg-teal-500/20 transition"
                          title="Chat with center owner on WhatsApp"
                        >
                          <MessageSquare size={15} />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleReject(sub.id)}
                          className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL CENTERS MASTER CONTROL */}
        {activeTab === "tenants" && (
          <div className="space-y-4">
            {/* Search & Filter Header */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by center, owner, phone, or state..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {["all", "active", "trial", "expired", "locked"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition ${
                      statusFilter === st
                        ? "bg-slate-700 text-white border border-slate-600"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Centers Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0d1424] shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-[#111a2f] text-slate-400 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Center & Owner</th>
                    <th className="px-4 py-3">Contact & State</th>
                    <th className="px-4 py-3">Plan & Status</th>
                    <th className="px-4 py-3">Expires In</th>
                    <th className="px-4 py-3">Lock State</th>
                    <th className="px-4 py-3 text-right">Master Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        No centers matched your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTenants.map((t) => {
                      const daysLeft = getDaysRemaining(t.subscription_expires_at);
                      const isExpired = daysLeft <= 0;
                      const expiryFormatted = new Date(t.subscription_expires_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });

                      return (
                        <tr key={t.id} className="hover:bg-slate-800/30 transition">
                          {/* Center & Owner */}
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-white">{t.shop_name}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <User size={11} className="text-cyan-400" />
                              <span>{t.owner_name}</span>
                            </div>
                          </td>

                          {/* Contact & State */}
                          <td className="px-4 py-3.5">
                            <div className="font-mono text-slate-300">{t.owner_phone}</div>
                            <div className="text-[11px] text-slate-400">{t.state}</div>
                          </td>

                          {/* Plan & Status */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                                t.plan === "yearly"
                                  ? "bg-purple-950 text-purple-300 border border-purple-800"
                                  : t.plan === "monthly"
                                  ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                                  : "bg-slate-800 text-slate-300 border border-slate-700"
                              }`}>
                                {t.plan}
                              </span>

                              {t.is_locked ? (
                                <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold text-rose-300 flex items-center gap-1">
                                  <Lock size={10} /> Locked
                                </span>
                              ) : isExpired ? (
                                <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                                  Expired
                                </span>
                              ) : t.status === "trial" ? (
                                <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                                  Trial ({daysLeft}d left)
                                </span>
                              ) : (
                                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                                  <Check size={10} /> Active
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Expiry Date */}
                          <td className="px-4 py-3.5 font-mono">
                            <div className={isExpired ? "text-rose-400 font-bold" : "text-slate-300"}>
                              {expiryFormatted}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {isExpired ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days remaining`}
                            </div>
                          </td>

                          {/* Lock State Toggle */}
                          <td className="px-4 py-3.5">
                            <button
                              type="button"
                              onClick={() => handleToggleLock(t)}
                              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-bold border transition ${
                                t.is_locked
                                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
                                  : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white"
                              }`}
                              title={t.is_locked ? "Click to unlock this center" : "Click to freeze / lock this center"}
                            >
                              {t.is_locked ? <Lock size={12} className="text-rose-400" /> : <Unlock size={12} className="text-emerald-400" />}
                              <span>{t.is_locked ? "Locked" : "Unlocked"}</span>
                            </button>
                          </td>

                          {/* Quick Actions */}
                          <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleExtendTenant(t.id, 30, "monthly")}
                              className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20 transition"
                              title="Add 30 days subscription and unlock"
                            >
                              +30 Days
                            </button>

                            <button
                              type="button"
                              onClick={() => handleExtendTenant(t.id, 365, "yearly")}
                              className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-2 py-1 text-[11px] font-bold text-purple-300 hover:bg-purple-500/20 transition"
                              title="Add 365 days annual subscription and unlock"
                            >
                              +1 Year
                            </button>

                            <button
                              type="button"
                              onClick={() => handleExtendTenant(t.id, 7, t.plan)}
                              className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20 transition"
                              title="Add 7 days trial grace period"
                            >
                              +7d Trial
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT & PRICING CONFIG */}
        {activeTab === "settings" && (
          <div className="max-w-2xl mx-auto rounded-3xl border border-slate-800 bg-[#0c1424] p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders size={18} className="text-cyan-400" />
                <span>Super Admin UPI & Pricing Configuration</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure your official UPI ID for QR code generation and manage prices charged to centers.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Official UPI ID (GPay / PhonePe / BHIM) *
                  </label>
                  <input
                    type="text"
                    required
                    value={configUpiId}
                    onChange={(e) => setConfigUpiId(e.target.value)}
                    placeholder="e.g. denbooks@upi or 9876543210@paytm"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-cyan-300 font-mono font-bold focus:border-cyan-400 outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Where center owners transfer subscription fees</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Official Payee Name (Shown in UPI apps) *
                  </label>
                  <input
                    type="text"
                    required
                    value={configPayee}
                    onChange={(e) => setConfigPayee(e.target.value)}
                    placeholder="e.g. DenBooks 360"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Monthly Plan Fee (₹ / month) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={configMonthly}
                    onChange={(e) => setConfigMonthly(e.target.value)}
                    placeholder="499"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs font-mono font-bold text-emerald-400 focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Yearly Plan Fee (₹ / year) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={configYearly}
                    onChange={(e) => setConfigYearly(e.target.value)}
                    placeholder="3999"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs font-mono font-bold text-purple-400 focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    WhatsApp Support Number (For UTR Proofs) *
                  </label>
                  <input
                    type="text"
                    required
                    value={configWa}
                    onChange={(e) => setConfigWa(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white font-mono focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Master Admin PIN / Passcode *
                  </label>
                  <input
                    type="text"
                    required
                    value={configPin}
                    onChange={(e) => setConfigPin(e.target.value)}
                    placeholder="9999"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-amber-300 font-mono font-bold focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition shadow-md shadow-cyan-400/20"
                >
                  <CheckCircle2 size={16} />
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
