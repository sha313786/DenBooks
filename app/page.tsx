"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  Receipt,
  Printer,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Users,
  Store,
  Layers,
  ChevronRight,
  Zap,
  IndianRupee,
  Smartphone,
  Banknote,
  FileText,
  Clock3,
  Check,
  HelpCircle,
  Play,
  Flame,
  ArrowUpRight,
  Sliders,
  MessageSquare,
  QrCode,
  AlertCircle,
  CheckCircle,
  Building,
  CreditCard,
  Lock,
  RefreshCw,
  Award,
  Sun,
  Moon,
} from "lucide-react";

export default function LandingPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [activeTab, setActiveTab] = useState<"isolation" | "thermal" | "drawer" | "khata">("isolation");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Read saved theme preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("denbooks_landing_theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("denbooks_landing_theme", next);
    } catch (e) {}
  };

  const isDark = theme === "dark";

  // Interactive Simulator State:
  const [selectedService, setSelectedService] = useState<"passport" | "sarathi" | "edistrict" | "kseb">("passport");
  const [receiptPaper, setReceiptPaper] = useState<"58mm" | "80mm">("80mm");
  const [drawerInputNotes, setDrawerInputNotes] = useState<number>(6950);

  // Service Simulation Data
  const servicePresets = {
    passport: {
      name: "Fresh Passport Application (Normal)",
      customerPaid: 1750,
      govtFee: 1500,
      portal: "Passport Seva / Digital Seva Wallet",
      shopFee: 250,
      category: "Govt Passport",
    },
    sarathi: {
      name: "Driving Licence Renewal (Sarathi)",
      customerPaid: 950,
      govtFee: 750,
      portal: "Parivahan Sarathi Wallet",
      shopFee: 200,
      category: "Transport",
    },
    edistrict: {
      name: "Income & Caste Certificate Application",
      customerPaid: 150,
      govtFee: 50,
      portal: "State e-District Advance Wallet",
      shopFee: 100,
      category: "Revenue e-District",
    },
    kseb: {
      name: "Electricity Bill Quick Payment (KSEB / Discom)",
      customerPaid: 2130,
      govtFee: 2100,
      portal: "CSC Utility BBPS Wallet",
      shopFee: 30,
      category: "Utility Bill BBPS",
    },
  };

  const currentSim = servicePresets[selectedService];

  const faqs = [
    {
      q: "Why do generic accounting apps (Tally, Vyapar) fail for CSC & Cyber Cafes?",
      a: "Citizen service centers handle massive pass-through government fees (e.g. ₹1,500 for a passport application) that are deducted from your portal advance wallet, while your actual shop processing fee is only ₹250. Standard apps treat the whole ₹1,750 as your shop revenue, distorting your real gross profit and income tax records. DenBooks automatically isolates government pass-through fees from your net shop profit.",
    },
    {
      q: "How does the Zero-Fee Direct UPI QR subscription work?",
      a: "DenBooks eliminates middleman payment gateway commissions (2-3% + GST). You pay the subscription price (₹199/month or ₹1,999/year) directly to the platform via any UPI app (Google Pay, PhonePe, Paytm, BHIM). Once you submit your 12-digit UPI UTR number, your account is activated instantly with 0% extra charges.",
    },
    {
      q: "Does DenBooks work with my existing 58mm or 80mm thermal receipt printer?",
      a: "Yes! DenBooks generates instant thermal receipts in both 58mm and 80mm roll formats, as well as A4/A5 slips. No specialized printer drivers or proprietary hardware are required. It works over standard browser print dialogs via USB, Bluetooth, or Wi-Fi printers (TVS, Epson, NGX, POSIFLEX, etc.).",
    },
    {
      q: "Can my counter clerks use it without seeing my center's total bank balance or net profit?",
      a: "Yes. DenBooks provides a dedicated Front Desk Counter POS (/staff) secured by operator PINs. Clerks can issue queue tokens, bill photocopy jobs, process portal services, record petty shop expenses, and print end-of-shift drawer reconciliation slips without having access to owner settings or center-wide net profit.",
    },
    {
      q: "How does Portal Advance Wallet balance tracking work?",
      a: "You can track real-time running balances for CSC Digital Seva, e-District, UTIITSL/NSDL PAN, and Electricity/BBPS wallets. Every time an operator records a government fee, DenBooks automatically deducts it from the appropriate portal wallet and triggers a visual low-balance alert before your wallet runs dry.",
    },
    {
      q: "What happens if our shop internet drops during peak morning hours?",
      a: "DenBooks features a local-first offline architecture. If internet connectivity drops, your counter POS continues to issue tokens, register daybook entries, and generate thermal receipts locally. Everything automatically synchronizes back to Supabase cloud once connectivity is restored.",
    },
  ];

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden font-sans transition-colors duration-200 selection:bg-cyan-400 selection:text-slate-950 ${
        isDark ? "bg-[#070b13] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      {/* Background Neon / Light Grid & Radial Glows */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          isDark
            ? "bg-[linear-gradient(rgba(0,220,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,220,255,0.03)_1px,transparent_1px)]"
            : "bg-[linear-gradient(rgba(14,165,233,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.06)_1px,transparent_1px)]"
        } bg-[size:48px_48px]`}
      />
      <div
        className={`pointer-events-none absolute left-1/2 top-12 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[150px] ${
          isDark ? "bg-cyan-500/10" : "bg-cyan-400/15"
        }`}
      />
      <div
        className={`pointer-events-none absolute right-10 top-[650px] h-[450px] w-[450px] rounded-full blur-[140px] ${
          isDark ? "bg-emerald-500/10" : "bg-emerald-400/12"
        }`}
      />

      {/* TOP ANNOUNCEMENT BAR */}
      <div
        className={`relative z-50 border-b px-4 py-2 text-center text-xs font-medium transition-colors ${
          isDark
            ? "bg-gradient-to-r from-cyan-950/80 via-slate-900 to-emerald-950/80 border-cyan-800/40 text-slate-200"
            : "bg-gradient-to-r from-cyan-50 via-slate-100 to-emerald-50 border-cyan-200/80 text-slate-700"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-black border ${
              isDark
                ? "bg-cyan-400/20 text-cyan-300 border-cyan-400/40"
                : "bg-cyan-100 text-cyan-800 border-cyan-300"
            }`}
          >
            <Flame size={12} className="animate-pulse" /> NEW 2026 EDITION
          </span>
          <span>Zero Payment Gateway Fees • Direct UPI QR Activation with 14-Day Free Trial!</span>
          <Link
            href="/demo"
            className={`font-bold underline ml-1 inline-flex items-center gap-0.5 ${
              isDark ? "text-cyan-300 hover:text-cyan-200" : "text-cyan-700 hover:text-cyan-900"
            }`}
          >
            Test Live Sandbox <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* NAVBAR */}
      <nav
        className={`sticky top-0 z-40 border-b backdrop-blur-md px-4 sm:px-6 py-3.5 transition-colors ${
          isDark
            ? "border-slate-800/80 bg-[#070b13]/85"
            : "border-slate-200/90 bg-white/90 shadow-sm shadow-slate-200/50"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="DenBooks 360 Logo"
              className={`h-10 w-10 rounded-xl shadow-lg group-hover:scale-105 transition object-cover border ${
                isDark ? "border-cyan-500/30 shadow-cyan-500/25" : "border-cyan-300 shadow-cyan-400/20"
              }`}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  DenBooks
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isDark
                      ? "text-cyan-300 bg-cyan-950/80 border-cyan-800/60"
                      : "text-cyan-800 bg-cyan-50 border-cyan-300"
                  }`}
                >
                  360
                </span>
              </div>
              <p className={`text-[10px] font-medium hidden sm:block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Akshaya, CSC & Cyber Cafe OS
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <div
            className={`hidden lg:flex items-center gap-8 text-xs font-bold ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            <a href="#simulator" className="hover:text-cyan-500 transition">Interactive Demo</a>
            <a href="#solutions" className="hover:text-cyan-500 transition">Why DenBooks</a>
            <a href="#features" className="hover:text-cyan-500 transition">Core Modules</a>
            <a href="#pricing" className="hover:text-cyan-500 transition">Zero-Fee Pricing</a>
            <a href="#faq" className="hover:text-cyan-500 transition">FAQ</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* THEME TOGGLE BUTTON (Dark & Bright) */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? "Switch to Bright Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                isDark
                  ? "bg-slate-900/90 border-slate-700/80 text-amber-300 hover:border-amber-400/50 hover:bg-slate-800"
                  : "bg-slate-100 border-slate-300 text-slate-800 hover:border-cyan-500 hover:bg-white shadow-xs"
              }`}
            >
              {isDark ? (
                <>
                  <Sun size={14} className="text-amber-400 fill-amber-400/20" />
                  <span className="text-[11px] font-bold">Bright</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-cyan-600 fill-cyan-600/20" />
                  <span className="text-[11px] font-bold">Dark</span>
                </>
              )}
            </button>

            <Link
              href="/demo"
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 sm:py-2 text-xs font-bold transition shadow-xs ${
                isDark
                  ? "border-slate-700/80 bg-slate-900/80 text-slate-200 hover:border-cyan-400/50 hover:text-cyan-300"
                  : "border-slate-300 bg-slate-100 text-slate-700 hover:border-cyan-500 hover:bg-white"
              }`}
            >
              <Play size={12} className="text-cyan-500 fill-cyan-500" />
              <span className="hidden sm:inline">Sandbox Demo</span>
              <span className="sm:hidden">Demo</span>
            </Link>

            <Link
              href="/staff/login"
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold transition ${
                isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Store size={13} className="text-emerald-500" />
              <span>Staff Desk</span>
            </Link>

            <Link
              href="/login"
              className={`px-2.5 sm:px-3 py-2 text-xs font-bold transition ${
                isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-3.5 sm:px-4 py-2 text-xs font-black text-slate-950 shadow-md shadow-cyan-400/20 hover:brightness-110 active:scale-95 transition"
            >
              <span>Start Free</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 px-4 sm:px-6 pt-12 pb-16 text-center lg:pt-20 lg:pb-24">
        <div className="mx-auto max-w-5xl">
          {/* Target Audience Pill */}
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold backdrop-blur-md shadow-xs ${
              isDark
                ? "border-cyan-400/30 bg-cyan-950/40 text-cyan-300"
                : "border-cyan-300 bg-cyan-50/80 text-cyan-800"
            }`}
          >
            <Sparkles size={14} className="text-cyan-500" />
            <span>Tailored for CSC Digital Seva • Akshaya E-Centres • Jan Seva Kendra • Cyber Cafes</span>
          </div>

          <h1
            className={`text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.12] ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            Separate Government Wallet Fees from{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
              Real Shop Profit.
            </span>
          </h1>

          <p
            className={`mx-auto mt-6 max-w-3xl text-sm sm:text-lg font-normal leading-relaxed ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Stop guessing your daily take-home earnings with general retail apps. DenBooks reconciles e-District & CSC advance wallets, prints 58mm/80mm thermal receipts, balances front-desk shift drawers, and automates WhatsApp Khata reminders.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-7 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-cyan-400/25 hover:brightness-110 active:scale-95 transition"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/demo"
              className={`inline-flex items-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-bold transition shadow-xs ${
                isDark
                  ? "border-slate-700 bg-slate-900/90 text-white hover:border-slate-500 hover:bg-slate-800"
                  : "border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              <Play size={14} className="text-cyan-500 fill-cyan-500" />
              <span>Explore Live Sandbox (No Signup)</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div
            className={`mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>Direct UPI QR • Zero Gateway Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>58mm & 80mm Thermal Printer Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>Local-First Offline Fallback</span>
            </div>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div
          className={`mx-auto mt-12 max-w-5xl rounded-2xl border p-4 sm:p-6 backdrop-blur-md transition-colors ${
            isDark
              ? "border-slate-800/80 bg-slate-900/60 shadow-xl"
              : "border-slate-200 bg-white/90 shadow-lg shadow-slate-200/50"
          }`}
        >
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x ${
              isDark ? "divide-slate-800" : "divide-slate-200"
            }`}
          >
            <div className="p-2">
              <p className="text-2xl sm:text-3xl font-black text-cyan-500">₹1.5 Cr+</p>
              <p
                className={`text-[11px] font-medium uppercase tracking-wider mt-1 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Govt Fees Tracked
              </p>
            </div>
            <div className="p-2">
              <p className="text-2xl sm:text-3xl font-black text-emerald-500">75,000+</p>
              <p
                className={`text-[11px] font-medium uppercase tracking-wider mt-1 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Thermal Slips Printed
              </p>
            </div>
            <div className="p-2">
              <p className="text-2xl sm:text-3xl font-black text-teal-500">100%</p>
              <p
                className={`text-[11px] font-medium uppercase tracking-wider mt-1 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Offline-Ready Resilience
              </p>
            </div>
            <div className="p-2">
              <p className="text-2xl sm:text-3xl font-black text-indigo-500">0%</p>
              <p
                className={`text-[11px] font-medium uppercase tracking-wider mt-1 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Gateway Commissions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE LIVE SIMULATOR SHOWCASE */}
      <section
        id="simulator"
        className={`relative z-10 px-4 sm:px-6 py-12 border-t transition-colors ${
          isDark ? "border-slate-800/80 bg-[#080e1a]" : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div
              className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border mb-2 ${
                isDark
                  ? "text-cyan-400 bg-cyan-950/60 border-cyan-800/40"
                  : "text-cyan-700 bg-cyan-50 border-cyan-200"
              }`}
            >
              <Sliders size={13} />
              <span>Interactive Live Preview</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>
              Experience DenBooks In Action
            </h2>
            <p className={`text-xs sm:text-sm mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Test how DenBooks solves the four biggest challenges of citizen service counters.
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveTab("isolation")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "isolation"
                  ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20 font-black"
                  : isDark
                  ? "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 shadow-xs"
              }`}
            >
              <TrendingUp size={14} />
              <span>1. Govt Fee vs Real Profit</span>
            </button>
            <button
              onClick={() => setActiveTab("thermal")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "thermal"
                  ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20 font-black"
                  : isDark
                  ? "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 shadow-xs"
              }`}
            >
              <Printer size={14} />
              <span>2. 58mm/80mm Thermal Receipt</span>
            </button>
            <button
              onClick={() => setActiveTab("drawer")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "drawer"
                  ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20 font-black"
                  : isDark
                  ? "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 shadow-xs"
              }`}
            >
              <Banknote size={14} />
              <span>3. Shift Drawer Handover</span>
            </button>
            <button
              onClick={() => setActiveTab("khata")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "khata"
                  ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20 font-black"
                  : isDark
                  ? "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 shadow-xs"
              }`}
            >
              <MessageSquare size={14} />
              <span>4. Customer Khata & WhatsApp</span>
            </button>
          </div>

          {/* TAB 1: PASS-THROUGH GOVT FEE ISOLATION */}
          {activeTab === "isolation" && (
            <div
              className={`rounded-3xl border p-6 sm:p-8 shadow-2xl transition-colors ${
                isDark ? "border-slate-800 bg-[#0c1322]" : "border-slate-200 bg-white shadow-slate-200/50"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Controls & Context */}
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">Service Fee Isolation Simulator</span>
                  <h3 className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                    Never Confuse Gross Cash with Your Take-Home Profit
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    Select a typical citizen service below. Notice how DenBooks deducts the official government fee from your portal wallet balance while accurately crediting your shop profit.
                  </p>

                  <div className="space-y-2 pt-2">
                    <p
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Select Citizen Service:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedService("passport")}
                        className={`p-2.5 rounded-xl text-left border text-xs font-bold transition cursor-pointer ${
                          selectedService === "passport"
                            ? isDark
                              ? "bg-cyan-950/80 border-cyan-400 text-cyan-300"
                              : "bg-cyan-50 border-cyan-500 text-cyan-900"
                            : isDark
                            ? "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Passport Application</p>
                        <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>₹1,500 Govt + ₹250 Shop</p>
                      </button>
                      <button
                        onClick={() => setSelectedService("sarathi")}
                        className={`p-2.5 rounded-xl text-left border text-xs font-bold transition cursor-pointer ${
                          selectedService === "sarathi"
                            ? isDark
                              ? "bg-cyan-950/80 border-cyan-400 text-cyan-300"
                              : "bg-cyan-50 border-cyan-500 text-cyan-900"
                            : isDark
                            ? "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Sarathi Driving Licence</p>
                        <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>₹750 Govt + ₹200 Shop</p>
                      </button>
                      <button
                        onClick={() => setSelectedService("edistrict")}
                        className={`p-2.5 rounded-xl text-left border text-xs font-bold transition cursor-pointer ${
                          selectedService === "edistrict"
                            ? isDark
                              ? "bg-cyan-950/80 border-cyan-400 text-cyan-300"
                              : "bg-cyan-50 border-cyan-500 text-cyan-900"
                            : isDark
                            ? "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Income Certificate</p>
                        <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>₹50 Govt + ₹100 Shop</p>
                      </button>
                      <button
                        onClick={() => setSelectedService("kseb")}
                        className={`p-2.5 rounded-xl text-left border text-xs font-bold transition cursor-pointer ${
                          selectedService === "kseb"
                            ? isDark
                              ? "bg-cyan-950/80 border-cyan-400 text-cyan-300"
                              : "bg-cyan-50 border-cyan-500 text-cyan-900"
                            : isDark
                            ? "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Electricity Bill BBPS</p>
                        <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>₹2,100 Govt + ₹30 Shop</p>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Interactive Isolation Card */}
                <div
                  className={`rounded-2xl border p-5 sm:p-6 space-y-5 ${
                    isDark ? "border-slate-700/80 bg-[#0f172a]" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between border-b pb-3 ${
                      isDark ? "border-slate-800" : "border-slate-200"
                    }`}
                  >
                    <div>
                      <p className={`text-xs uppercase font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Active Transaction
                      </p>
                      <h4 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {currentSim.name}
                      </h4>
                    </div>
                    <span
                      className={`font-mono text-sm font-black px-2.5 py-1 rounded-lg border ${
                        isDark
                          ? "bg-emerald-950 text-emerald-300 border-emerald-800/60"
                          : "bg-emerald-100 text-emerald-800 border-emerald-300"
                      }`}
                    >
                      Collected: ₹{currentSim.customerPaid}
                    </span>
                  </div>

                  {/* Flow Split Visualizer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Pass-Through Govt Fee Box */}
                    <div
                      className={`rounded-xl border p-4 space-y-2 ${
                        isDark
                          ? "border-rose-500/30 bg-rose-950/20"
                          : "border-rose-200 bg-rose-50/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-rose-500 tracking-wider">Pass-Through Govt Fee</span>
                        <Wallet size={14} className="text-rose-500" />
                      </div>
                      <p className="font-mono text-2xl font-black text-rose-500">- ₹{currentSim.govtFee}</p>
                      <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Deducted from: <strong className={isDark ? "text-slate-200" : "text-slate-900"}>{currentSim.portal}</strong>
                      </p>
                      <div className="pt-1 text-[9.5px] text-rose-500/90 flex items-center gap-1 font-semibold">
                        <AlertCircle size={10} />
                        <span>Zero shop tax liability • Pure pass-through</span>
                      </div>
                    </div>

                    {/* Real Shop Net Profit Box */}
                    <div
                      className={`rounded-xl border p-4 space-y-2 ${
                        isDark
                          ? "border-emerald-500/40 bg-emerald-950/20"
                          : "border-emerald-300 bg-emerald-50/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Real Shop Profit</span>
                        <TrendingUp size={14} className="text-emerald-600" />
                      </div>
                      <p className="font-mono text-2xl font-black text-emerald-600">+ ₹{currentSim.shopFee}</p>
                      <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Added to: <strong className={isDark ? "text-slate-200" : "text-slate-900"}>Front Desk Cash Drawer / Bank</strong>
                      </p>
                      <div className="pt-1 text-[9.5px] text-emerald-600 flex items-center gap-1 font-semibold">
                        <CheckCircle size={10} />
                        <span>Your true center gross income</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Comparison Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-rose-500 font-bold">Govt Wallet Liability: ₹{currentSim.govtFee}</span>
                      <span className="text-emerald-600 font-bold">Real Profit: ₹{currentSim.shopFee}</span>
                    </div>
                    <div className={`h-3 w-full rounded-full overflow-hidden flex ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                      <div
                        className="bg-rose-500 transition-all duration-300"
                        style={{ width: `${(currentSim.govtFee / currentSim.customerPaid) * 100}%` }}
                      />
                      <div
                        className="bg-emerald-500 transition-all duration-300"
                        style={{ width: `${(currentSim.shopFee / currentSim.customerPaid) * 100}%` }}
                      />
                    </div>
                    <p className={`text-[10px] text-center italic ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Generic apps register ₹{currentSim.customerPaid} as your turnover. DenBooks correctly tracks ₹{currentSim.shopFee}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 58MM / 80MM THERMAL RECEIPT */}
          {activeTab === "thermal" && (
            <div
              className={`rounded-3xl border p-6 sm:p-8 shadow-2xl transition-colors ${
                isDark ? "border-slate-800 bg-[#0c1322]" : "border-slate-200 bg-white shadow-slate-200/50"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Printer settings */}
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">Hardware & Paper Freedom</span>
                  <h3 className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                    Instant 1-Click Thermal Printing
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    Designed for high-traffic front desks. Prints clean citizen receipts with itemized breakdown, tracking QR codes, and center VLE credentials without annoying software drivers.
                  </p>

                  <div className="space-y-3 pt-2">
                    <p
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Select Roll Width:
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReceiptPaper("80mm")}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          receiptPaper === "80mm"
                            ? isDark
                              ? "bg-cyan-950 border-cyan-400 text-cyan-300"
                              : "bg-cyan-50 border-cyan-500 text-cyan-800"
                            : isDark
                            ? "bg-slate-900 border-slate-800 text-slate-400"
                            : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        <Printer size={13} /> 80mm Standard Roll
                      </button>
                      <button
                        onClick={() => setReceiptPaper("58mm")}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          receiptPaper === "58mm"
                            ? isDark
                              ? "bg-cyan-950 border-cyan-400 text-cyan-300"
                              : "bg-cyan-50 border-cyan-500 text-cyan-800"
                            : isDark
                            ? "bg-slate-900 border-slate-800 text-slate-400"
                            : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        <Printer size={13} /> 58mm Compact POS
                      </button>
                    </div>

                    <div
                      className={`rounded-xl border p-3 text-xs space-y-2 ${
                        isDark ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-emerald-500 font-bold">
                        <Check size={14} /> Works with USB, Bluetooth, & Wi-Fi POS Printers
                      </div>
                      <div className="flex items-center gap-2 text-emerald-500 font-bold">
                        <Check size={14} /> Citizens can scan QR code to track service status
                      </div>
                      <div className="flex items-center gap-2 text-emerald-500 font-bold">
                        <Check size={14} /> Supports Malayalam, Hindi, Tamil & English Headers
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Realistic Thermal Paper Mockup */}
                <div className="lg:col-span-7 flex justify-center">
                  <div
                    className={`bg-white text-slate-900 p-5 sm:p-6 rounded-lg shadow-2xl font-mono text-[11px] leading-tight transition-all duration-300 border-t-8 border-cyan-500 ${
                      receiptPaper === "58mm" ? "max-w-[270px] text-[10px]" : "max-w-[340px]"
                    }`}
                  >
                    {/* Header */}
                    <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
                      <p className="font-black text-sm uppercase tracking-wider text-slate-950">APEX DIGITAL SEVA KENDRA</p>
                      <p className="text-[10px] text-slate-600">VLE Code: CSC-KL-982140</p>
                      <p className="text-[9.5px] text-slate-500">Bus Stand Junction, Kottayam, Kerala</p>
                      <p className="text-[9.5px] text-slate-500">Ph: +91 98471 23456</p>
                      <div className="mt-2 inline-block bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                        TOKEN #42 • COUNTER 01
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex justify-between text-[10px] text-slate-600 mb-2">
                      <span>Date: 09/10/2026 11:42 AM</span>
                      <span>Operator: Anjali</span>
                    </div>
                    <div className="text-[10px] text-slate-700 mb-2 font-bold">
                      Customer: Rajesh Kumar (Ph: 98****3210)
                    </div>

                    {/* Items table */}
                    <div className="border-b border-dashed border-slate-400 pb-2 mb-2">
                      <div className="flex justify-between font-bold text-slate-900 pb-1 border-b border-slate-200">
                        <span>SERVICE / ITEM</span>
                        <span>AMT</span>
                      </div>
                      <div className="py-1">
                        <div className="flex justify-between">
                          <span>1. Passport Seva (Govt Fee)</span>
                          <span>₹1,500.00</span>
                        </div>
                        <div className="flex justify-between text-slate-600 text-[9.5px]">
                          <span>   Processing & Slot Booking</span>
                          <span>₹250.00</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>2. Colour Photo Print (x4)</span>
                          <span>₹60.00</span>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="space-y-1 text-right mb-3">
                      <div className="flex justify-between font-black text-sm text-slate-950">
                        <span>TOTAL PAID:</span>
                        <span>₹1,810.00</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span>Payment Mode:</span>
                        <span className="font-bold text-slate-900">UPI (Google Pay)</span>
                      </div>
                    </div>

                    {/* QR Code Simulation */}
                    <div className="text-center pt-2 border-t border-dashed border-slate-400">
                      <div className="inline-block p-1 bg-white border border-slate-300 rounded mb-1">
                        <QrCode size={48} className="text-slate-900 mx-auto" />
                      </div>
                      <p className="text-[9px] text-slate-600">Scan QR to check application status</p>
                      <p className="text-[9px] font-bold text-slate-900 mt-1">THANK YOU • VISIT AGAIN</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SHIFT DRAWER RECONCILIATION */}
          {activeTab === "drawer" && (
            <div
              className={`rounded-3xl border p-6 sm:p-8 shadow-2xl transition-colors ${
                isDark ? "border-slate-800 bg-[#0c1322]" : "border-slate-200 bg-white shadow-slate-200/50"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Shift Description */}
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">Counter Staff Accountability</span>
                  <h3 className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                    Zero Cash Leaks at Evening Shift Handover
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    Operators handle hundreds of cash transactions and photocopy notes. DenBooks' Shift Drawer compares actual counted notes with system entries to eliminate arguments when closing the till.
                  </p>

                  <div className="space-y-2 pt-2">
                    <p
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Test Note Counter Input:
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={drawerInputNotes}
                        onChange={(e) => setDrawerInputNotes(Number(e.target.value) || 0)}
                        className={`rounded-xl border px-3 py-2 text-sm font-mono font-bold w-32 focus:border-cyan-400 focus:outline-none ${
                          isDark ? "border-slate-700 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-900"
                        }`}
                      />
                      <button
                        onClick={() => setDrawerInputNotes(6950)}
                        className="text-xs text-cyan-500 hover:underline font-bold cursor-pointer"
                      >
                        Reset to Exact (₹6,950)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Drawer Reconciliation Slip */}
                <div
                  className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${
                    isDark ? "border-slate-700/80 bg-[#0f172a]" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between border-b pb-3 ${
                      isDark ? "border-slate-800" : "border-slate-200"
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        SHIFT CLOSING REPORT • COUNTER #1
                      </p>
                      <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        Operator: Rahul M. (Morning Shift)
                      </p>
                    </div>
                    <span
                      className={`text-xs font-mono font-black px-2.5 py-1 rounded border ${
                        isDark
                          ? "text-cyan-300 bg-cyan-950 border-cyan-800/60"
                          : "text-cyan-800 bg-cyan-100 border-cyan-300"
                      }`}
                    >
                      09:00 AM - 05:30 PM
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className={`rounded-xl border p-3 ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"}`}>
                      <p className={`text-[10px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Opening Float</p>
                      <p className={`font-mono text-base font-bold mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>₹ 1,000</p>
                    </div>
                    <div className={`rounded-xl border p-3 ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"}`}>
                      <p className={`text-[10px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Cash Collected</p>
                      <p className="font-mono text-base font-bold text-emerald-500 mt-1">+ ₹ 6,400</p>
                    </div>
                    <div className={`rounded-xl border p-3 ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"}`}>
                      <p className={`text-[10px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Petty Expenses (Paper)</p>
                      <p className="font-mono text-base font-bold text-rose-500 mt-1">- ₹ 450</p>
                    </div>
                  </div>

                  {/* Expected vs Actual */}
                  <div className={`rounded-xl border p-4 space-y-3 ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
                    <div className="flex justify-between items-center text-xs">
                      <span className={isDark ? "text-slate-400" : "text-slate-600"}>System Expected Drawer Cash:</span>
                      <span className={`font-mono font-black text-base ${isDark ? "text-white" : "text-slate-900"}`}>₹ 6,950</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className={isDark ? "text-slate-400" : "text-slate-600"}>Physically Counted Cash:</span>
                      <span className="font-mono font-black text-cyan-500 text-base">₹ {drawerInputNotes}</span>
                    </div>
                    <div className={`border-t pt-3 flex justify-between items-center ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                      <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        Variance / Difference:
                      </span>
                      {drawerInputNotes === 6950 ? (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-black text-xs border ${
                            isDark
                              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                              : "bg-emerald-100 text-emerald-800 border-emerald-300"
                          }`}
                        >
                          <CheckCircle size={13} /> ₹0 (PERFECT TALLY)
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-mono font-black text-xs border ${
                            drawerInputNotes > 6950
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-rose-100 text-rose-800 border-rose-300"
                          }`}
                        >
                          <AlertCircle size={13} />
                          {drawerInputNotes > 6950 ? `+₹${drawerInputNotes - 6950} SURPLUS` : `-₹${6950 - drawerInputNotes} SHORTAGE`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMER KHATA & WHATSAPP */}
          {activeTab === "khata" && (
            <div
              className={`rounded-3xl border p-6 sm:p-8 shadow-2xl transition-colors ${
                isDark ? "border-slate-800 bg-[#0c1322]" : "border-slate-200 bg-white shadow-slate-200/50"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Udhar Explanation */}
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">Customer Credit Ledger</span>
                  <h3 className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                    Recover Pending Udhar with 1-Click WhatsApp
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    Regular customers often say "I will pay tomorrow". DenBooks creates an automatic Khata entry and prepares a personalized WhatsApp reminder with your center's payment QR code.
                  </p>

                  <div className="space-y-2 pt-2">
                    <div
                      className={`rounded-xl border p-3.5 text-xs space-y-1.5 ${
                        isDark ? "border-emerald-500/30 bg-emerald-950/20" : "border-emerald-300 bg-emerald-50/70"
                      }`}
                    >
                      <p className="font-bold text-emerald-600 flex items-center gap-1.5">
                        <MessageSquare size={14} /> Zero Awkward Reminders
                      </p>
                      <p className={`text-[11px] ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        The message is formatted respectfully with date, pending balance, and your shop's direct UPI QR.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: WhatsApp Message Preview Mockup */}
                <div
                  className={`rounded-2xl border p-5 sm:p-6 space-y-4 shadow-xl ${
                    isDark ? "border-slate-800 bg-[#0b141a]" : "border-slate-200 bg-[#efeae2]"
                  }`}
                >
                  <div
                    className={`flex items-center gap-3 border-b pb-3 ${
                      isDark ? "border-slate-800" : "border-slate-300"
                    }`}
                  >
                    <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                      RP
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-950"}`}>Ramesh Patel (Customer)</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">+91 98765 43210 • Online</p>
                    </div>
                  </div>

                  {/* Chat bubble */}
                  <div
                    className={`border rounded-2xl p-4 text-xs space-y-2 ${
                      isDark
                        ? "bg-[#122e23] border-emerald-900/60 text-slate-200"
                        : "bg-white border-emerald-200 text-slate-900 shadow-xs"
                    }`}
                  >
                    <p className="font-bold text-emerald-600">Namaste Ramesh Ji 🙏</p>
                    <p className="text-[11px] leading-relaxed">
                      This is a gentle reminder from <strong className={isDark ? "text-white" : "text-slate-900"}>Apex Digital Seva Kendra</strong> regarding your pending balance of <strong className={isDark ? "text-white" : "text-slate-900"}>₹320.00</strong> for:
                    </p>
                    <div
                      className={`p-2.5 rounded-lg border text-[10.5px] font-mono space-y-1 ${
                        isDark ? "bg-[#0b2018] border-emerald-900/40 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>• Aadhaar Card PVC Print (x2)</span>
                        <span>₹100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• PAN Card Correction</span>
                        <span>₹220</span>
                      </div>
                    </div>
                    <p className="text-[11px]">
                      You can pay instantly via UPI: <strong className="text-cyan-600 font-mono">apexseva@upi</strong>
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold">Thank you for your patronage! Have a great day.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PAIN POINT / SOLUTION COMPARISON */}
      <section
        id="solutions"
        className={`relative z-10 px-4 sm:px-6 py-20 border-t transition-colors ${
          isDark ? "border-slate-800/80 bg-slate-950/60" : "border-slate-200 bg-white"
        }`}
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500">The Purpose-Built Difference</h2>
            <p className={`mt-2 text-3xl font-black sm:text-4xl ${isDark ? "text-white" : "text-slate-950"}`}>
              Generic Billing Software vs. DenBooks
            </p>
            <p className={`mt-3 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Why generic retail POS and desktop software fail for government citizen service providers.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* The Old Way */}
            <div
              className={`rounded-3xl border p-7 space-y-4 ${
                isDark ? "border-red-500/20 bg-red-950/10" : "border-red-200 bg-red-50/50"
              }`}
            >
              <div className="flex items-center gap-2.5 text-red-500">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/20 font-bold">✕</div>
                <h3 className={`text-base font-bold ${isDark ? "text-red-400" : "text-red-800"}`}>Generic Retail POS & Pen/Paper</h3>
              </div>
              <ul className={`space-y-3.5 text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span><b>Government fee distortion:</b> Treating a ₹1,500 govt passport fee as shop turnover, making gross tax & revenue completely incorrect.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span><b>Blind portal wallet depletion:</b> Running out of e-District or CSC wallet cash in the middle of a customer application because balances aren't tracked.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span><b>Staff drawer mismatches:</b> Counter operators mixing personal UPI with shop cash, causing arguments and missing money at evening shift close.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span><b>Uncollected Khata:</b> Forgotten customer dues scribbled on scrap paper that never get followed up or paid.</span>
                </li>
              </ul>
            </div>

            {/* The DenBooks Way */}
            <div
              className={`rounded-3xl border-2 p-7 space-y-4 shadow-xl ${
                isDark
                  ? "border-cyan-400/50 bg-gradient-to-br from-[#0c1626] to-[#0f2138]"
                  : "border-cyan-400 bg-gradient-to-br from-cyan-50/70 to-emerald-50/40 shadow-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5 text-cyan-600">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 font-black">✓</div>
                <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
                  The DenBooks Operating Suite
                </h3>
              </div>
              <ul className={`space-y-3.5 text-xs ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-500 font-bold shrink-0">✓</span>
                  <span><b>Pass-through fee isolation:</b> Official portal fee is deducted from the portal wallet, while service charge is booked to real shop profit.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-500 font-bold shrink-0">✓</span>
                  <span><b>Live 4-Wallet Monitoring:</b> Real-time balances and configurable low-balance warnings across all government portals.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-500 font-bold shrink-0">✓</span>
                  <span><b>Role-based staff desk:</b> Isolated Front Desk POS with PIN security, queue tokens, and shift drawer cash handover tally.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-500 font-bold shrink-0">✓</span>
                  <span><b>Automated Customer Khata:</b> 1-click WhatsApp reminders and settlement ledger for customer credits.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURE GRID */}
      <section id="features" className="relative z-10 px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500">Engineered for Front Desks</h2>
            <p className={`mt-2 text-3xl font-black sm:text-4xl ${isDark ? "text-white" : "text-slate-950"}`}>
              Everything Your Center Needs
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div
              className={`rounded-3xl border p-6 transition-all ${
                isDark
                  ? "border-slate-800 bg-[#0e1625] hover:border-slate-700"
                  : "border-slate-200 bg-white shadow-md shadow-slate-100 hover:border-cyan-400"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 mb-4">
                <Wallet size={22} />
              </div>
              <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
                Portal Advance Wallets
              </h3>
              <p className={`mt-2 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Track running balances for CSC Digital Seva, e-District, UTIITSL/NSDL, and Utility wallets. Top-up history and low-balance warnings ensure no citizen application stalls.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className={`rounded-3xl border p-6 transition-all ${
                isDark
                  ? "border-slate-800 bg-[#0e1625] hover:border-slate-700"
                  : "border-slate-200 bg-white shadow-md shadow-slate-100 hover:border-cyan-400"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20 mb-4">
                <Printer size={22} />
              </div>
              <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
                Thermal Receipt Printing
              </h3>
              <p className={`mt-2 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Print 58mm, 80mm, and A4 slip formats for Xerox copies, online form applications, and passport submissions. Includes tracking QR code so citizens can check status online.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className={`rounded-3xl border p-6 transition-all ${
                isDark
                  ? "border-slate-800 bg-[#0e1625] hover:border-slate-700"
                  : "border-slate-200 bg-white shadow-md shadow-slate-100 hover:border-cyan-400"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-4">
                <TrendingUp size={22} />
              </div>
              <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
                Govt Fee vs. Real Shop Profit
              </h3>
              <p className={`mt-2 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Separates pass-through government wallet deductions from actual Xerox and processing charges. Accurately calculates real daily net profit after paper and electricity expenses.
              </p>
            </div>

            {/* Feature 4 */}
            <div
              className={`rounded-3xl border p-6 transition-all ${
                isDark
                  ? "border-slate-800 bg-[#0e1625] hover:border-slate-700"
                  : "border-slate-200 bg-white shadow-md shadow-slate-100 hover:border-cyan-400"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-4">
                <Users size={22} />
              </div>
              <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
                Multi-Staff & Shift Drawers
              </h3>
              <p className={`mt-2 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Give operators their own 4-digit PIN login. Each clerk runs an isolated Front Desk counter and produces a shift closing tally to reconcile physical cash before going home.
              </p>
            </div>

            {/* Feature 5 */}
            <div
              className={`rounded-3xl border p-6 transition-all ${
                isDark
                  ? "border-slate-800 bg-[#0e1625] hover:border-slate-700"
                  : "border-slate-200 bg-white shadow-md shadow-slate-100 hover:border-cyan-400"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-4">
                <Clock3 size={22} />
              </div>
              <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
                Customer Khata (Credit / Udhar)
              </h3>
              <p className={`mt-2 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Never lose track of pending customer dues. Track outstanding balances by customer name and phone, send 1-click WhatsApp payment reminders, and mark settled with a single tap.
              </p>
            </div>

            {/* Feature 6 */}
            <div
              className={`rounded-3xl border p-6 transition-all ${
                isDark
                  ? "border-slate-800 bg-[#0e1625] hover:border-slate-700"
                  : "border-slate-200 bg-white shadow-md shadow-slate-100 hover:border-cyan-400"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20 mb-4">
                <Zap size={22} />
              </div>
              <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
                FCFS Queue Tokens
              </h3>
              <p className={`mt-2 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Manage morning crowds fairly with sequential first-come-first-serve tokens. Print queue slips, call the next citizen, and convert tokens into billing invoices instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section
        id="pricing"
        className={`relative z-10 px-4 sm:px-6 py-20 border-t transition-colors ${
          isDark ? "border-slate-800/80 bg-slate-950/40" : "border-slate-200 bg-slate-100/60"
        }`}
      >
        <div className="mx-auto max-w-5xl text-center">
          <div
            className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border mb-2 ${
              isDark
                ? "text-cyan-400 bg-cyan-950/60 border-cyan-800/40"
                : "text-cyan-800 bg-cyan-100 border-cyan-300"
            }`}
          >
            <IndianRupee size={13} />
            <span>Direct UPI • Zero Gateway Deductions</span>
          </div>
          <h2 className={`text-3xl font-black sm:text-4xl ${isDark ? "text-white" : "text-slate-950"}`}>
            Simple, Transparent Pricing
          </h2>
          <p className={`mt-3 text-sm max-w-lg mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            14-day full free trial on all plans. Pay directly via UPI QR with zero payment gateway fees.
          </p>

          {/* Billing Cycle Switcher */}
          <div
            className={`mt-8 inline-flex items-center rounded-2xl border p-1.5 gap-1 shadow-inner ${
              isDark ? "border-slate-800 bg-slate-900/90" : "border-slate-300 bg-white"
            }`}
          >
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-cyan-400 text-slate-950 shadow-xs font-black"
                  : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                billingCycle === "annual"
                  ? "bg-cyan-400 text-slate-950 shadow-xs font-black"
                  : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual Billing</span>
              <span
                className={`rounded-full text-[10px] px-2 py-0.5 font-black border ${
                  isDark
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                    : "bg-emerald-100 text-emerald-800 border-emerald-300"
                }`}
              >
                Save 60% (~₹166/mo)
              </span>
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-3 text-left">
            {/* Starter Monthly */}
            <div
              className={`rounded-3xl border p-7 flex flex-col justify-between transition-all ${
                isDark
                  ? "border-slate-800 bg-[#0e1625] hover:border-slate-700"
                  : "border-slate-200 bg-white shadow-lg hover:border-slate-300"
              }`}
            >
              <div>
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
                  Starter Monthly
                </h3>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Flexible month-to-month access for single-counter VLEs & Cyber Cafes.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className={`text-4xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                    {billingCycle === "monthly" ? "₹199" : "₹166"}
                  </span>
                  <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>/ month</span>
                </div>
                <p className="text-[11px] text-cyan-500 font-semibold mt-1">
                  {billingCycle === "monthly" ? "Regular ₹499 (60% Launch Special)" : "Billed as ₹1,999 annually"}
                </p>

                <ul className={`mt-6 space-y-3 text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-500 shrink-0" />
                    <span><b>Single Center</b> Full Access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-500 shrink-0" />
                    <span>4 Portal Advance Wallets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-500 shrink-0" />
                    <span>58mm & 80mm Thermal Printer Slips</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-500 shrink-0" />
                    <span>Front Desk Staff PIN Access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-500 shrink-0" />
                    <span>Customer Khata & WhatsApp Ledger</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?plan=monthly"
                className={`mt-8 block text-center rounded-xl border py-3 text-xs font-bold transition ${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-white hover:border-cyan-400 hover:text-cyan-300"
                    : "border-slate-300 bg-slate-50 text-slate-800 hover:border-cyan-500 hover:text-cyan-700"
                }`}
              >
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Annual Pro (Featured) */}
            <div
              className={`relative rounded-3xl border-2 p-7 shadow-2xl flex flex-col justify-between ${
                isDark
                  ? "border-cyan-400 bg-gradient-to-b from-[#112138] to-[#0c1524] shadow-cyan-500/10"
                  : "border-cyan-500 bg-gradient-to-b from-cyan-50/60 to-white shadow-cyan-500/15"
              }`}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-cyan-400 px-3.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                Best Value • Save 60%
              </div>

              <div>
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
                  Annual Pro Plan
                </h3>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Full-year peace of mind for busy Akshaya, CSC & Xerox centers.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className={`text-4xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>₹1,999</span>
                  <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>/ year</span>
                </div>
                <p className="text-[11px] text-emerald-500 font-semibold mt-1">
                  Works out to ~₹166/month • Direct UPI QR Activation
                </p>

                <ul className={`mt-6 space-y-3 text-xs ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-500 shrink-0" />
                    <span><b>Unlimited Staff Counter Logins</b></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-500 shrink-0" />
                    <span><b>Shift Cash Drawer Reconciliation</b></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-500 shrink-0" />
                    <span>Unlimited Portal Wallets & Bank Accounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-500 shrink-0" />
                    <span>FCFS Queue Token & Call System</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-500 shrink-0" />
                    <span>1-Click WhatsApp Khata Reminders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-500 shrink-0" />
                    <span>Excel & CSV Daybook Data Export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-500 shrink-0" />
                    <span>Direct WhatsApp Priority Support</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?plan=annual"
                className="mt-8 block text-center rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 py-3 text-xs font-black text-slate-950 hover:brightness-110 transition shadow-lg shadow-cyan-400/25"
              >
                Claim 14-Day Free Trial
              </Link>
            </div>

            {/* Enterprise Multi-Branch */}
            <div
              className={`rounded-3xl border p-7 flex flex-col justify-between transition-all ${
                isDark
                  ? "border-slate-800 bg-[#0e1625] hover:border-slate-700"
                  : "border-slate-200 bg-white shadow-lg hover:border-slate-300"
              }`}
            >
              <div>
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
                  Multi-Branch Network
                </h3>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  For operators running multiple branches or franchise kiosks.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className={`text-4xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>₹4,999</span>
                  <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>/ year</span>
                </div>
                <p className={`text-[11px] font-semibold mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Up to 5 Branches Included
                </p>

                <ul className={`mt-6 space-y-3 text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-500 shrink-0" />
                    <span>Up to 5 Center Locations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-500 shrink-0" />
                    <span>Consolidated Owner Financial Dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-500 shrink-0" />
                    <span>Custom Center Branding & Headers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-500 shrink-0" />
                    <span>Dedicated Relationship Manager</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?plan=multi"
                className={`mt-8 block text-center rounded-xl border py-3 text-xs font-bold transition ${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-white hover:border-cyan-400 hover:text-cyan-300"
                    : "border-slate-300 bg-slate-50 text-slate-800 hover:border-cyan-500 hover:text-cyan-700"
                }`}
              >
                Register Multi-Branch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* OPERATOR TESTIMONIALS */}
      <section
        className={`relative z-10 px-4 sm:px-6 py-20 border-t transition-colors ${
          isDark ? "border-slate-800/80 bg-slate-950/80" : "border-slate-200 bg-white"
        }`}
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500">Trusted by Counter Operators</h2>
            <p className={`mt-2 text-3xl font-black sm:text-4xl ${isDark ? "text-white" : "text-slate-950"}`}>
              What Center Owners Say
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div
              className={`rounded-2xl border p-6 space-y-4 ${
                isDark ? "border-slate-800 bg-[#0e1625]" : "border-slate-200 bg-slate-50 shadow-sm"
              }`}
            >
              <p className={`text-xs leading-relaxed italic ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                "Earlier I had no idea whether my evening cash had my actual earnings or the customer's ₹1,500 passport portal fee. DenBooks made my daily take-home crystal clear."
              </p>
              <div className={`flex items-center gap-3 pt-2 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <div className="h-9 w-9 rounded-full bg-cyan-500/20 text-cyan-500 font-bold flex items-center justify-center text-xs">
                  MN
                </div>
                <div>
                  <p className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-950"}`}>Manoj Nambiar</p>
                  <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Akshaya E-Centre, Kannur (Kerala)</p>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl border p-6 space-y-4 ${
                isDark ? "border-slate-800 bg-[#0e1625]" : "border-slate-200 bg-slate-50 shadow-sm"
              }`}
            >
              <p className={`text-xs leading-relaxed italic ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                "The 80mm thermal receipt with the queue token is fantastic. Morning crowds stopped quarreling because everyone gets a numbered slip with their status QR code."
              </p>
              <div className={`flex items-center gap-3 pt-2 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <div className="h-9 w-9 rounded-full bg-emerald-500/20 text-emerald-600 font-bold flex items-center justify-center text-xs">
                  SS
                </div>
                <div>
                  <p className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-950"}`}>Sanjay Sharma</p>
                  <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>CSC Digital Seva Kendra, Lucknow (UP)</p>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl border p-6 space-y-4 ${
                isDark ? "border-slate-800 bg-[#0e1625]" : "border-slate-200 bg-slate-50 shadow-sm"
              }`}
            >
              <p className={`text-xs leading-relaxed italic ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                "The shift drawer tally saved us from daily arguments. My clerks count the cash notes at 7 PM and hand over the exact till with 0 discrepancy."
              </p>
              <div className={`flex items-center gap-3 pt-2 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <div className="h-9 w-9 rounded-full bg-teal-500/20 text-teal-600 font-bold flex items-center justify-center text-xs">
                  PK
                </div>
                <div>
                  <p className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-950"}`}>Pooja Kulkarni</p>
                  <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Cyber Hub & Xerox Center, Pune (MH)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION SECTION */}
      <section
        id="faq"
        className={`relative z-10 px-4 sm:px-6 py-20 transition-colors ${
          isDark ? "bg-[#070b13]" : "bg-slate-50"
        }`}
      >
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500">Got Questions?</h2>
            <p className={`mt-2 text-3xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border overflow-hidden transition ${
                    isDark ? "border-slate-800 bg-[#0e1625]" : "border-slate-200 bg-white shadow-xs"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className={`w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-bold transition cursor-pointer ${
                      isDark ? "text-white hover:text-cyan-300" : "text-slate-900 hover:text-cyan-700"
                    }`}
                  >
                    <span>{faq.q}</span>
                    <ChevronRight
                      size={16}
                      className={`shrink-0 transition-transform ${
                        isOpen
                          ? "rotate-90 text-cyan-500"
                          : isDark
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div
                      className={`px-4 sm:px-5 pb-5 text-xs leading-relaxed border-t pt-3 ${
                        isDark
                          ? "text-slate-300 border-slate-800/80"
                          : "text-slate-600 border-slate-100"
                      }`}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA HERO */}
      <section
        className={`relative z-10 px-4 sm:px-6 py-20 border-t text-center transition-colors ${
          isDark
            ? "border-slate-800/80 bg-gradient-to-b from-[#070b13] via-[#0c1626] to-[#070b13]"
            : "border-slate-200 bg-gradient-to-b from-white via-cyan-50/30 to-white"
        }`}
      >
        <div
          className={`mx-auto max-w-4xl rounded-3xl border p-8 sm:p-14 shadow-2xl ${
            isDark
              ? "border-cyan-400/30 bg-gradient-to-br from-[#0c1626] to-[#0f2138] shadow-cyan-500/10"
              : "border-cyan-300 bg-gradient-to-br from-white to-cyan-50/60 shadow-cyan-400/15"
          }`}
        >
          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>
            Ready to Take Control of Your Center's Accounts?
          </h2>
          <p className={`mt-4 text-sm sm:text-base max-w-2xl mx-auto ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Join hundreds of CSC, Akshaya, and Cyber Café operators managing portal wallets, daily profits, and counter clerks with zero hassle.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-8 py-4 text-sm font-black text-slate-950 shadow-xl shadow-cyan-400/25 hover:brightness-110 active:scale-95 transition"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/demo"
              className={`inline-flex items-center gap-2 rounded-xl border px-6 py-4 text-sm font-bold transition ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-white hover:border-slate-500"
                  : "border-slate-300 bg-white text-slate-800 hover:border-slate-400 shadow-xs"
              }`}
            >
              <Play size={14} className="text-cyan-500 fill-cyan-500" />
              <span>Try Sandbox Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className={`border-t px-6 py-10 text-center text-xs transition-colors ${
          isDark
            ? "border-slate-800 bg-[#060910] text-slate-500"
            : "border-slate-200 bg-white text-slate-500"
        }`}
      >
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="DenBooks 360 Logo"
              className={`h-7 w-7 rounded-lg object-cover shadow-xs border ${
                isDark ? "border-slate-700" : "border-slate-200"
              }`}
            />
            <span className={`font-bold ${isDark ? "text-slate-300" : "text-slate-800"}`}>
              DenBooks 360 SaaS
            </span>
          </div>
          <div className={`flex items-center gap-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            <Link href="/demo" className="hover:text-cyan-500 transition">Live Demo</Link>
            <Link href="/login" className="hover:text-cyan-500 transition">Sign In</Link>
            <Link href="/signup" className="hover:text-cyan-500 transition">Register Center</Link>
            <Link href="/staff/login" className="hover:text-cyan-500 transition">Staff Desk</Link>
            <Link href="/admin/super" className="hover:text-cyan-500 transition opacity-60 hover:opacity-100">Super Admin</Link>
          </div>
          <p>© 2026 DenBooks 360. Built for Indian Citizen Service Centers.</p>
        </div>
      </footer>
    </div>
  );
}
