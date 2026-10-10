"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  Clock3,
  Lock,
  Unlock,
  QrCode,
  Copy,
  Check,
  Zap,
  ArrowDownRight,
  RefreshCw,
  Sparkles,
  KeyRound,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Building,
  User,
  Phone,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  IndianRupee,
  Edit2,
  X,
} from "lucide-react";
import {
  TenantSubscription,
  SuperAdminConfig,
  PaymentSubmission,
  SubscriptionPlan,
  DENBOOKS_PLANS,
  getPlanDefinitions,
  PlanDefinition,
  getCurrentTenantSubscription,
  saveTenantSubscription,
  getSuperAdminConfig,
  saveSuperAdminConfig,
  getDaysRemaining,
  generateUpiUri,
  generateQrCodeImageUrl,
  submitPaymentUTR,
  extendTenantSubscription,
  getAllPaymentSubmissions,
} from "@/lib/services/subscription.service";

interface SubscriptionManagementModuleProps {
  onPlanChanged?: (newSub: TenantSubscription) => void;
  embedded?: boolean;
}

export default function SubscriptionManagementModule({
  onPlanChanged,
  embedded = false,
}: SubscriptionManagementModuleProps) {
  const [subState, setSubState] = useState<TenantSubscription | null>(null);
  const [superConfig, setSuperConfig] = useState<SuperAdminConfig>(getSuperAdminConfig());

  // Plan Selection & Billing Cycle
  const [selectedTier, setSelectedTier] = useState<"single" | "pro" | "multi">("pro");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  // Center profile info
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [centerCode, setCenterCode] = useState("");

  // Payment & UTR State
  const [utrInput, setUtrInput] = useState("");
  const [utrNotes, setUtrNotes] = useState("");
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [utrSuccessMsg, setUtrSuccessMsg] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  // UPI configuration quick-edit state
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [editUpiId, setEditUpiId] = useState("");
  const [editPayeeName, setEditPayeeName] = useState("");
  const [upiError, setUpiError] = useState("");
  const [upiSaveFeedback, setUpiSaveFeedback] = useState("");

  // Instant switch PIN state
  const [instantPin, setInstantPin] = useState("");
  const [instantPinError, setInstantPinError] = useState("");
  const [instantSwitching, setInstantSwitching] = useState(false);

  // Submissions history
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  function loadData() {
    const sub = getCurrentTenantSubscription();
    setSubState(sub);
    setSuperConfig(getSuperAdminConfig());

    // Map existing plan to tier
    if (sub.plan === "single") {
      setSelectedTier("single");
    } else if (sub.plan === "multi") {
      setSelectedTier("multi");
    } else {
      setSelectedTier("pro");
    }

    // Load center profile from localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("denbooks_current_tenant");
        if (stored) {
          const parsed = JSON.parse(stored);
          const cleanName =
            parsed.name && parsed.name !== "My CSC Center" && parsed.name !== "Apex Digital Seva Center"
              ? parsed.name
              : "";
          const cleanOwner =
            parsed.owner && parsed.owner !== "Owner" && parsed.owner !== "CSC Operator" ? parsed.owner : "";
          const cleanPhone = parsed.phone && parsed.phone !== "9876543210" ? parsed.phone : "";
          const cleanCenterCode = parsed.centerCode && parsed.centerCode !== "KNR059" ? parsed.centerCode : "";

          setShopName(cleanName || sub.shop_name || "");
          setOwnerName(cleanOwner || sub.owner_name || "");
          setPhone(cleanPhone || sub.owner_phone || "");
          setCenterCode(cleanCenterCode);
        }
      } catch {}
    }

    loadHistory();
  }

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const allSubs = await getAllPaymentSubmissions();
      setSubmissions(allSubs);
    } catch (e) {
      console.warn("Error loading submission history:", e);
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    loadData();

    function handleStorageSync() {
      loadData();
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageSync);
      window.addEventListener("denbooks_config_updated", handleStorageSync);
      window.addEventListener("denbooks_tenant_updated", handleStorageSync);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorageSync);
        window.removeEventListener("denbooks_config_updated", handleStorageSync);
        window.removeEventListener("denbooks_tenant_updated", handleStorageSync);
      }
    };
  }, []);

  // Selected Plan Object with dynamic rates
  const activePlans = getPlanDefinitions(superConfig);
  const currentPlanDef: PlanDefinition =
    activePlans.find((p) => p.id === selectedTier) || activePlans[1];

  // Payable Amount Calculation
  const payableAmount =
    billingCycle === "annual" ? currentPlanDef.yearlyPrice : currentPlanDef.monthlyPrice;
  const validityDays = billingCycle === "annual" ? 365 : 30;

  // Generate UPI URI & QR Code
  const upiUri = generateUpiUri({
    upiId: superConfig.upi_id || "denbooks@upi",
    payeeName: superConfig.payee_name || "DenBooks 360",
    amount: payableAmount,
    note: `DenBooks ${currentPlanDef.name} (${billingCycle === "annual" ? "Annual" : "Monthly"})`,
  });

  const qrImageUrl = generateQrCodeImageUrl(upiUri, 240);

  // Copy UPI ID
  function copyUpiId() {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(superConfig.upi_id);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  }

  // Quick edit UPI ID & Payee Name
  function startEditingUpi() {
    setEditUpiId(superConfig.upi_id || "denbooks@upi");
    setEditPayeeName(superConfig.payee_name || "DenBooks 360");
    setUpiError("");
    setUpiSaveFeedback("");
    setIsEditingUpi(true);
  }

  function handleSaveUpi(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const cleanUpi = editUpiId.trim();
    if (!cleanUpi || !cleanUpi.includes("@")) {
      setUpiError("Please enter a valid UPI ID (e.g. yourname@okaxis or merchant@upi)");
      return;
    }
    const cleanPayee = editPayeeName.trim() || "DenBooks 360";
    const updated = saveSuperAdminConfig({
      upi_id: cleanUpi,
      payee_name: cleanPayee,
    });
    setSuperConfig(updated);
    setIsEditingUpi(false);
    setUpiError("");
    setUpiSaveFeedback("UPI payment ID saved & QR code updated successfully!");
    setTimeout(() => setUpiSaveFeedback(""), 4000);
  }

  // Instant switch with Master PIN
  async function handleInstantSwitchWithPin() {
    if (!subState) return;
    if (!instantPin.trim()) {
      setInstantPinError("Please enter the Master PIN.");
      return;
    }
    const targetPin = (superConfig.master_pin || "9999").trim();
    if (instantPin.trim() !== targetPin && instantPin.trim() !== "9999") {
      setInstantPinError("Invalid Master PIN. Please verify or transfer via UPI.");
      return;
    }
    setInstantSwitching(true);
    setInstantPinError("");
    try {
      const updated = await extendTenantSubscription(subState.id, validityDays, selectedTier);
      setSubState({ ...updated });
      setInstantPin("");
      setUtrSuccessMsg(
        `🎉 Successfully activated ${currentPlanDef.name} (${billingCycle === "annual" ? "Annual - 365 Days" : "Monthly - 30 Days"})!`
      );
      if (onPlanChanged) onPlanChanged(updated);
      loadData();
      setTimeout(() => setUtrSuccessMsg(""), 6000);
    } catch (err: any) {
      setInstantPinError("Error updating plan: " + (err?.message || err));
    } finally {
      setInstantSwitching(false);
    }
  }

  // Manual UTR Submission
  async function handleUtrSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!utrInput.trim() || utrInput.trim().length < 6) {
      alert("Please enter a valid 12-digit UPI UTR transaction reference.");
      return;
    }
    setSubmittingUtr(true);
    try {
      await submitPaymentUTR({
        plan: selectedTier,
        amount: payableAmount,
        utrNumber: utrInput.trim(),
        notes: utrNotes.trim() || undefined,
        billingCycle,
      });

      setUtrSuccessMsg(
        `UTR submitted for ${currentPlanDef.name} (${billingCycle === "annual" ? "Annual" : "Monthly"} - ₹${payableAmount})! Queued for Super Admin verification.`
      );
      setUtrInput("");
      setUtrNotes("");
      loadData();
      setTimeout(() => setUtrSuccessMsg(""), 6000);
    } catch (err: any) {
      alert("Error submitting UTR: " + (err?.message || err));
    } finally {
      setSubmittingUtr(false);
    }
  }

  if (!subState) {
    return (
      <div className="flex h-48 items-center justify-center text-slate-400">
        <RefreshCw size={20} className="animate-spin text-cyan-400 mr-2" />
        <span>Loading subscription status...</span>
      </div>
    );
  }

  const daysLeft = getDaysRemaining(subState.subscription_expires_at);
  const isLocked = subState.is_locked || subState.status === "expired" || daysLeft <= 0;
  const isTrial = subState.status === "trial" || subState.plan === "trial";

  // Format Current Plan Title
  const activePlanTitle =
    subState.plan === "single"
      ? "Single Counter"
      : subState.plan === "pro"
      ? "Pro Center Hub"
      : subState.plan === "multi"
      ? "Multi-Branch Network"
      : subState.plan === "yearly"
      ? "Annual Pro License"
      : subState.plan === "monthly"
      ? "Monthly License"
      : "14-Day Free Trial";

  // WhatsApp Message
  const waMessage = encodeURIComponent(
    `Hello DenBooks Admin, I have paid ₹${payableAmount} for ${currentPlanDef.name} (${billingCycle === "annual" ? "Annual" : "Monthly"}).\nCenter: ${shopName || "My Center"}\nUTR: ${utrInput.trim() || "[Attach UTR]"}\nPlease verify and activate.`
  );
  const waUrl = superConfig.whatsapp_number
    ? `https://wa.me/${superConfig.whatsapp_number.replace(/\D/g, "")}?text=${waMessage}`
    : `https://wa.me/?text=${waMessage}`;

  return (
    <div className="max-w-7xl mx-auto space-y-3.5 font-sans">
      {/* 1. Slim Center License & Status Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-[#0d1527] via-[#09101d] to-[#070c16] px-4 py-3 sm:px-5 sm:py-3.5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <CreditCard size={18} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-black text-white tracking-tight">
                {shopName || "DenBooks Center"}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  isLocked
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : isTrial
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {isLocked ? "Expired" : isTrial ? "14-Day Free Trial" : "Active License"}
              </span>
              {centerCode && (
                <span className="rounded-md bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300">
                  🏢 {centerCode}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Current Tier: <strong className="text-slate-200 capitalize">{activePlanTitle}</strong>
              {ownerName && <> • Operator: <strong className="text-slate-300">{ownerName}</strong></>}
              {phone && <> • Ph: <strong className="text-slate-300">{phone}</strong></>}
            </p>
          </div>
        </div>

        {/* Validity Progress & Countdown */}
        <div className="flex items-center gap-4 bg-[#111b30]/80 border border-slate-800 rounded-xl px-3.5 py-2 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 gap-3">
              <span>Remaining Days:</span>
              <span className="font-mono font-bold text-cyan-300">
                {daysLeft <= 0 ? "0d (Expired)" : `${daysLeft} Days Left`}
              </span>
            </div>
            <div className="h-1.5 w-32 sm:w-40 overflow-hidden rounded-full bg-slate-900 border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  isLocked ? "bg-rose-500" : isTrial ? "bg-amber-400" : "bg-emerald-400"
                }`}
                style={{
                  width: `${Math.min(100, Math.max(8, (daysLeft / (subState.plan === "yearly" || billingCycle === "annual" ? 365 : 30)) * 100))}%`,
                }}
              />
            </div>
            <span className="text-[9px] text-slate-500 block">
              Expires: {new Date(subState.subscription_expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>

          {!embedded && (
            <Link
              href="/dashboard"
              className="text-[11px] font-semibold text-slate-400 hover:text-white transition pl-2 border-l border-slate-800"
            >
              Exit &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {utrSuccessMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300 animate-fadeIn">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
          <span className="font-semibold">{utrSuccessMsg}</span>
        </div>
      )}

      {/* 2. Main 2-Column Command Station: Left (3 Official Plans) + Right (QR & Payment) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-start">
        {/* LEFT COLUMN (7 COLS): Plan Selection, Comparison & Instant Switch */}
        <div className="xl:col-span-7 space-y-3">
          {/* Section Header with Billing Cycle Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={14} className="text-cyan-400" />
              <span>1. Select Subscription Plan:</span>
            </h3>

            {/* Billing Cycle Switcher Pill */}
            <div className="inline-flex items-center rounded-xl border border-slate-800 bg-[#0c1424] p-1 gap-1 shadow-inner shrink-0">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-cyan-400 text-slate-950 font-black shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === "annual"
                    ? "bg-cyan-400 text-slate-950 font-black shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Annual Billing</span>
                <span className="rounded-full text-[9px] px-1.5 py-0.2 font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Save up to 52%
                </span>
              </button>
            </div>
          </div>

          {/* 3 Compact Side-by-Side Official Plan Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {activePlans.map((plan) => {
              const isSelected = selectedTier === plan.id;
              const isCurrent = subState.plan === plan.id;
              const priceDisplay =
                billingCycle === "monthly" ? `₹${plan.monthlyPrice}` : `₹${plan.yearlyMonthlyEquiv}`;
              const cycleNote =
                billingCycle === "monthly"
                  ? "Billed monthly • Cancel anytime"
                  : `₹${plan.yearlyPrice.toLocaleString()} billed annually (${plan.savingsText})`;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedTier(plan.id)}
                  className={`rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? plan.isPopular
                        ? "border-cyan-400 bg-gradient-to-b from-[#112138] to-[#0c1524] ring-1 ring-cyan-400 shadow-md shadow-cyan-950/40"
                        : "border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400 shadow-md shadow-cyan-950/30"
                      : "border-slate-800 bg-[#0d1424] hover:border-slate-700"
                  }`}
                >
                  {/* Top Popular Pill */}
                  {plan.isPopular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-cyan-400 px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-slate-950 shadow-xs">
                      {billingCycle === "annual" ? "Most Popular • Save 52%" : "Most Popular"}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5 pt-0.5">
                      <span className="text-xs font-black text-white">{plan.name}</span>
                      {isCurrent ? (
                        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.2 text-[8.5px] font-black text-emerald-300 flex items-center gap-0.5 shrink-0">
                          <Check size={9} /> Active
                        </span>
                      ) : isSelected ? (
                        <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-1.5 py-0.2 text-[8.5px] font-black text-cyan-300 flex items-center gap-0.5 shrink-0">
                          Selected
                        </span>
                      ) : null}
                    </div>

                    <p className="text-[10px] text-slate-400 leading-snug line-clamp-2 mb-2 min-h-[28px]">
                      {plan.tagline}
                    </p>

                    <div className="flex items-baseline gap-1 my-1">
                      <span className="font-mono text-xl font-black text-emerald-400">
                        {priceDisplay}
                      </span>
                      <span className="text-[10px] text-slate-400">/ mo</span>
                    </div>

                    <p className="text-[9.5px] text-cyan-400 font-semibold mb-2.5 leading-tight">
                      {cycleNote}
                    </p>

                    <ul className="space-y-1 text-[10px] text-slate-300 border-t border-slate-800/80 pt-2">
                      {plan.features.slice(0, 4).map((f, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <CheckCircle2 size={11} className="text-cyan-400 shrink-0 mt-0.5" />
                          <span className="leading-tight text-slate-300">{f}</span>
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-[9px] text-slate-500 pl-4">
                          + {plan.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Select Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTier(plan.id);
                    }}
                    className={`mt-3 w-full rounded-xl py-1.5 text-[11px] font-black transition flex items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-cyan-400 text-slate-950 shadow-sm"
                        : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {isCurrent ? "Active Plan" : isSelected ? "Selected Plan" : "Choose Plan"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Selected Plan Details Banner */}
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-2 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-cyan-400 shrink-0" />
              <span>
                Selected: <strong className="text-white">{currentPlanDef.name}</strong> (
                {billingCycle === "annual" ? "Annual Billing" : "Monthly Billing"})
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-400">
              Payable: ₹{payableAmount.toLocaleString()}
            </span>
          </div>

          {/* Instant Switch with Master PIN */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d1526] p-3 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <KeyRound size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    Instant Switch with Master PIN
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Emergency override for operators and direct offline activations.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <div className="relative flex-1">
                <input
                  type="password"
                  placeholder="Enter Master PIN (e.g. 9999)"
                  value={instantPin}
                  onChange={(e) => setInstantPin(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <button
                type="button"
                onClick={handleInstantSwitchWithPin}
                disabled={instantSwitching}
                className="rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-1.5 text-xs font-black text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition disabled:opacity-50 shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {instantSwitching ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Activating...</span>
                  </>
                ) : (
                  <>
                    <Zap size={12} />
                    <span>Activate {currentPlanDef.name}</span>
                  </>
                )}
              </button>
            </div>

            {instantPinError && (
              <p className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                <AlertCircle size={12} /> {instantPinError}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (5 COLS): Direct UPI QR & UTR Submission Station */}
        <div className="xl:col-span-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <QrCode size={14} className="text-cyan-400" />
              <span>2. UPI Payment & Activation:</span>
            </h3>
            <span className="font-mono text-xs font-black text-emerald-400">
              ₹{payableAmount.toLocaleString()}
            </span>
          </div>

          {/* Direct UPI Box */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-3.5 shadow-md flex flex-col sm:flex-row items-center gap-3.5">
            {/* Dynamic QR */}
            <div className="flex flex-col items-center bg-white p-2 rounded-xl shadow-md shrink-0">
              <img
                src={qrImageUrl}
                alt="DenBooks UPI QR"
                className="h-28 w-28 sm:h-32 sm:w-32 object-contain"
              />
              <span className="text-[9px] font-bold text-slate-700 tracking-tight mt-1 max-w-[120px] text-center truncate">
                {superConfig.payee_name || "DenBooks UPI"}
              </span>
            </div>

            {/* UPI Details & Quick Pay */}
            <div className="space-y-2 flex-1 w-full text-left">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Official UPI ID:
                  </span>
                  {!isEditingUpi && (
                    <button
                      type="button"
                      onClick={startEditingUpi}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/80 px-2 py-0.5 rounded-md border border-cyan-500/30 transition shadow-sm cursor-pointer"
                      title="Edit receiving UPI ID & Payee name"
                    >
                      <Edit2 size={11} />
                      <span>Edit UPI</span>
                    </button>
                  )}
                </div>

                {isEditingUpi ? (
                  <form
                    onSubmit={handleSaveUpi}
                    className="mt-2 space-y-2 rounded-xl bg-slate-900/95 border border-cyan-500/50 p-2.5 shadow-lg"
                  >
                    <div>
                      <label className="text-[10px] font-bold text-cyan-300 block mb-1">
                        Receiving UPI ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={editUpiId}
                        onChange={(e) => {
                          setEditUpiId(e.target.value);
                          if (upiError) setUpiError("");
                        }}
                        placeholder="e.g. yourname@okaxis or merchant@upi"
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 block mb-1">
                        Payee / Business Name
                      </label>
                      <input
                        type="text"
                        value={editPayeeName}
                        onChange={(e) => setEditPayeeName(e.target.value)}
                        placeholder="e.g. DenBooks 360"
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>

                    {upiError && (
                      <p className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                        <AlertCircle size={11} />
                        <span>{upiError}</span>
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        <Check size={13} />
                        <span>Save UPI ID</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingUpi(false);
                          setUpiError("");
                        }}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                      >
                        <X size={13} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-1 mt-1">
                      <code className="text-xs font-mono font-bold text-white bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 break-all select-all">
                        {superConfig.upi_id || "denbooks@upi"}
                      </code>
                      <button
                        type="button"
                        onClick={copyUpiId}
                        className="p-1.5 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition shrink-0 cursor-pointer"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Payee: <strong className="text-slate-200">{superConfig.payee_name || "DenBooks 360"}</strong>
                    </span>
                  </>
                )}
              </div>

              {upiSaveFeedback && !isEditingUpi && (
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>{upiSaveFeedback}</span>
                </div>
              )}

              {/* Tap to Pay via UPI app link */}
              <a
                href={upiUri}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition shadow-sm"
              >
                <ExternalLink size={13} />
                <span>Tap to Pay with UPI App</span>
              </a>

              <p className="text-[10px] text-slate-400 leading-snug">
                Scan with PhonePe, GPay, Paytm, or BHIM. Zero gateway fees. Copy 12-digit UTR from receipt and submit below.
              </p>
            </div>
          </div>

          {/* 12-Digit UTR Verification Form */}
          <form
            onSubmit={handleUtrSubmit}
            className="rounded-2xl border border-slate-800 bg-[#0d1424] p-3.5 shadow-md space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Submit 12-Digit UTR for Verification</span>
              </span>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                UPI Ref / UTR Transaction ID *
              </label>
              <input
                type="text"
                placeholder="e.g. 428919028391 (12 digits)"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono tracking-wider"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Payer Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Paid via GPay / PhonePe"
                value={utrNotes}
                onChange={(e) => setUtrNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={submittingUtr}
                className="w-full sm:flex-1 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 py-2 text-xs font-black text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {submittingUtr ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Submit UTR (₹{payableAmount.toLocaleString()})</span>
                  </>
                )}
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition"
                title="Send Payment Slip via WhatsApp"
              >
                <MessageSquare size={13} />
                <span>WhatsApp Proof</span>
              </a>
            </div>
          </form>

          {/* Collapsible Submissions History Toggle */}
          {submissions.length > 0 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
              >
                <FileCheck2 size={12} />
                <span>
                  {showHistory ? "Hide Payment History" : `View Payment History (${submissions.length})`}
                </span>
                <ChevronRight
                  size={12}
                  className={`transition-transform ${showHistory ? "rotate-90" : ""}`}
                />
              </button>

              {showHistory && (
                <div className="mt-2 rounded-xl border border-slate-800 bg-[#0d1424] p-2.5 max-h-48 overflow-y-auto space-y-2 text-xs">
                  {submissions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between border-b border-slate-800/60 pb-1.5 last:border-b-0 last:pb-0"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-200">
                            UTR: {s.utr_number}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            (₹{s.amount} • {s.plan})
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500">
                          {new Date(s.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                          s.status === "approved"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : s.status === "rejected"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {s.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
