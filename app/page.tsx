"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Why do generic accounting apps (Tally, Vyapar) fail for CSC & Cyber Cafes?",
      a: "CSC centers handle pass-through government fees (e.g. ₹2,500 for a passport application) that are deducted from your portal advance wallet, while your actual shop processing fee is only ₹250. Standard apps treat the whole ₹2,750 as your shop revenue, distorting your real profit and taxes. DenBooks automatically isolates government fee pass-throughs from your real income.",
    },
    {
      q: "Does DenBooks work with my existing 58mm or 80mm thermal receipt printer?",
      a: "Yes! DenBooks generates 1-click thermal receipts in 58mm, 80mm, and A4/A5 slip formats. No special printer drivers or proprietary hardware are required. It works seamlessly via standard browser printing (Bluetooth, USB, or Wi-Fi).",
    },
    {
      q: "Can my staff use it on their own counter screens without seeing full center profit?",
      a: "Yes. DenBooks includes an isolated Front Desk Counter POS (/staff) designed for clerks and operators. Staff can issue tokens, generate invoices, bill Xerox copies, record shop expenses, and balance their shift cash drawer without having access to owner-level settings or center-wide net profit.",
    },
    {
      q: "How does Portal Advance Wallet tracking work?",
      a: "You can track running balances for CSC Digital Seva, e-District, UTIITSL/NSDL, Utility Portals, and bank accounts. When an operator records an official government fee, DenBooks automatically deducts the amount from the selected portal wallet and alerts you when balances dip below your safe threshold.",
    },
    {
      q: "Can I collect unpaid customer dues (Khata/Udhar) with WhatsApp?",
      a: "Yes! Any bill can be marked as 'Credit / Udhar'. You get an instant ledger of outstanding dues and can send 1-click WhatsApp payment reminders with the customer's balance and payment QR.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#070b13] text-slate-100 overflow-x-hidden font-sans selection:bg-cyan-400 selection:text-slate-950">
      {/* Background Neon Grid & Radial Glows */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,220,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,220,255,0.03)_1px,transparent_1px)] bg-[size:45px_45px]" />
      <div className="pointer-events-none absolute left-1/2 top-16 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-10 top-[700px] h-[450px] w-[450px] rounded-full bg-emerald-500/8 blur-[130px]" />

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#070b13]/85 backdrop-blur-md px-4 sm:px-6 py-3.5 transition">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-black shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
              <Receipt size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">DenBooks</span>
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded-full">360</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">CSC & Cyber Cafe Operating Suite</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#solutions" className="hover:text-cyan-400 transition">Solutions</a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition">How It Works</a>
            <a href="#features" className="hover:text-cyan-400 transition">Features</a>
            <a href="#pricing" className="hover:text-cyan-400 transition">Pricing Plans</a>
            <a href="#faq" className="hover:text-cyan-400 transition">FAQ</a>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/demo"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 text-xs font-bold text-slate-200 hover:border-cyan-400/50 hover:text-cyan-300 transition shadow-sm"
            >
              <Play size={12} className="text-cyan-400 fill-cyan-400" />
              <span>Live Sandbox</span>
            </Link>
            <Link
              href="/login"
              className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-4 py-2 text-xs font-black text-slate-950 shadow-md shadow-cyan-400/20 hover:brightness-110 active:scale-95 transition"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 px-4 sm:px-6 pt-16 pb-20 text-center lg:pt-24 lg:pb-28">
        <div className="mx-auto max-w-5xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-bold text-cyan-300 backdrop-blur-md shadow-sm">
            <Flame size={14} className="text-cyan-400 animate-pulse" />
            <span>Built Specifically for CSCs, Cyber Cafés & Akshaya Centers</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.12]">
            Separate Government Wallet Fees from{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Real Shop Profit.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-sm sm:text-lg text-slate-300 font-normal leading-relaxed">
            Stop guessing your daily take-home earnings with general accounting apps. DenBooks reconciles e-District & CSC advance wallets, prints instant thermal slips, manages customer Khata, and separates front desk staff drawers from executive owner accounting.
          </p>

          {/* Primary Action Buttons */}
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
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-6 py-3.5 text-sm font-bold text-white hover:border-slate-500 hover:bg-slate-800 transition"
            >
              <Play size={14} className="text-cyan-400 fill-cyan-400" />
              <span>Explore Live Sandbox</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>58mm & 80mm Thermal Printer Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Setup in 60 seconds</span>
            </div>
          </div>

          {/* HERO APP INTERACTIVE MOCKUP PREVIEW */}
          <div className="relative mt-14 mx-auto max-w-5xl rounded-3xl border border-slate-800/90 bg-[#0b1220]/95 p-3.5 sm:p-5 shadow-2xl shadow-cyan-500/10 text-left">
            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-2 font-mono text-[11px] text-slate-400 font-semibold hidden sm:inline">
                  app.denbooks360.com/dashboard (Admin Executive Suite)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
                <span className="rounded-lg bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 px-2 py-0.5">
                  Shop: Digital Den CSC
                </span>
              </div>
            </div>

            {/* Mockup Top Command Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4">
              {/* Left: Wallets mock */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-800/90 bg-[#0e1625] p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                    <Wallet size={13} className="text-cyan-400" />
                    <span>Portal Advance & Bank</span>
                  </div>
                  <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                    Total: ₹19,840
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                    <p className="text-[10px] text-slate-400 font-semibold">CSC Digital Seva</p>
                    <p className="font-mono font-bold text-white text-sm mt-0.5">₹ 4,320</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                    <p className="text-[10px] text-slate-400 font-semibold">e-District Kerala</p>
                    <p className="font-mono font-bold text-white text-sm mt-0.5">₹ 6,150</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                    <p className="text-[10px] text-slate-400 font-semibold">UTIITSL / PAN</p>
                    <p className="font-mono font-bold text-white text-sm mt-0.5">₹ 1,870</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                    <p className="text-[10px] text-slate-400 font-semibold">Shop Current A/c</p>
                    <p className="font-mono font-bold text-white text-sm mt-0.5">₹ 7,500</p>
                  </div>
                </div>
              </div>

              {/* Right: Financial KPIs mock */}
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#0e1625] to-[#0f231e] p-3 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Cash in Drawer</span>
                  <p className="font-mono font-black text-white text-lg mt-1">₹ 4,820</p>
                  <p className="text-[9.5px] text-slate-400">Physical drawer</p>
                </div>
                <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0e1625] to-[#102336] p-3 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase">UPI / Online</span>
                  <p className="font-mono font-black text-white text-lg mt-1">₹ 6,450</p>
                  <p className="text-[9.5px] text-slate-400">GPay & PhonePe</p>
                </div>
                <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-[#0e1625] to-[#171a35] p-3 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Shop Revenue</span>
                  <p className="font-mono font-black text-white text-lg mt-1">₹ 3,920</p>
                  <p className="text-[9.5px] text-slate-400">Net processing fees</p>
                </div>
                <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-[#0e1625] to-[#0d2a29] p-3 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-teal-400 uppercase">Net Profit</span>
                  <p className="font-mono font-black text-teal-300 text-lg mt-1">₹ 3,470</p>
                  <p className="text-[9.5px] text-slate-400">After -₹450 exp</p>
                </div>
              </div>
            </div>

            {/* Mockup Daybook Rows */}
            <div className="rounded-2xl border border-slate-800 bg-[#0e1625] overflow-hidden text-xs">
              <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-slate-400 font-semibold text-[11px]">
                <span>Today's Transactions Sample</span>
                <span className="text-cyan-400 font-mono">14 Entries Reconciled</span>
              </div>
              <div className="divide-y divide-slate-800/60 font-medium">
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 text-[11px]">04:12 PM</span>
                    <div>
                      <p className="text-white font-bold">Passport Application (Fresh) • Suresh K.</p>
                      <p className="text-[10px] text-slate-400">Official Portal Fee ₹1,500 (e-District Wallet) + Shop Fee ₹250</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 text-sm">+ ₹1,750</span>
                    <span className="block text-[10px] text-cyan-300 font-bold">Shop Net: ₹250</span>
                  </div>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between bg-slate-900/20">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 text-[11px]">03:45 PM</span>
                    <div>
                      <p className="text-white font-bold">Colour Xerox (x12) + Spiral Binding</p>
                      <p className="text-[10px] text-slate-400">Counter POS • Walk-in Student</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 text-sm">+ ₹160</span>
                    <span className="block text-[10px] text-cyan-300 font-bold">Shop Net: ₹160</span>
                  </div>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 text-[11px]">02:10 PM</span>
                    <div>
                      <p className="text-white font-bold">2 Reams A4 JK Copier Paper</p>
                      <p className="text-[10px] text-slate-400">Shop Operational Expense • Cash Drawer</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-red-400 text-sm">- ₹450</span>
                    <span className="block text-[10px] text-red-400/80 font-bold">Expense</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN POINT / SOLUTION COMPARISON */}
      <section id="solutions" className="relative z-10 px-4 sm:px-6 py-20 border-t border-slate-800/80 bg-slate-950/60">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">The Purpose-Built Difference</h2>
            <p className="mt-2 text-3xl font-black text-white sm:text-4xl">General Billing Apps vs. DenBooks</p>
            <p className="mt-3 text-sm text-slate-400">
              Why generic retail POS and desktop software fail for government citizen service providers.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* The Old Way */}
            <div className="rounded-3xl border border-red-500/20 bg-red-950/10 p-7 space-y-4">
              <div className="flex items-center gap-2.5 text-red-400">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/20 font-bold">✕</div>
                <h3 className="text-base font-bold">Generic Retail POS & Pen/Paper</h3>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span><b>Government fee distortion:</b> Treating a ₹1,500 govt passport fee as shop turnover, making gross tax & revenue completely incorrect.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span><b>Blind portal wallet depletion:</b> Running out of e-District or CSC wallet cash in the middle of a customer application because balances aren't tracked.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span><b>Staff drawer mismatches:</b> Counter operators mixing personal UPI with shop cash, causing arguments and missing money at evening shift close.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span><b>Uncollected Khata:</b> Forgotten customer dues scribbled on scrap paper that never get followed up or paid.</span>
                </li>
              </ul>
            </div>

            {/* The DenBooks Way */}
            <div className="rounded-3xl border-2 border-cyan-400/50 bg-gradient-to-br from-[#0c1626] to-[#0f2138] p-7 space-y-4 shadow-xl">
              <div className="flex items-center gap-2.5 text-cyan-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 font-black">✓</div>
                <h3 className="text-base font-bold text-white">The DenBooks Operating Suite</h3>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-200">
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span><b>Pass-through fee isolation:</b> Official portal fee is deducted from the portal wallet, while service charge is booked to real shop profit.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span><b>Live 4-Wallet Monitoring:</b> Real-time balances and configurable low-balance warnings across all government portals.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span><b>Role-based staff desk:</b> Isolated Front Desk POS with PIN security, queue tokens, and shift drawer cash handover tally.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
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
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Built For High-Velocity Counters</h2>
            <p className="mt-2 text-3xl font-black text-white sm:text-4xl">Everything Your Center Needs</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-3xl border border-slate-800 bg-[#0e1625] p-6 hover:border-slate-700 transition">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
                <Wallet size={22} />
              </div>
              <h3 className="text-base font-bold text-white">Portal Advance Wallets</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Track running balances for CSC Digital Seva, e-District, UTIITSL/NSDL, and Utility wallets. Top-up history and low-balance warnings ensure no citizen application stalls.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl border border-slate-800 bg-[#0e1625] p-6 hover:border-slate-700 transition">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-4">
                <Printer size={22} />
              </div>
              <h3 className="text-base font-bold text-white">Thermal Receipt Printing</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Print 58mm, 80mm, and A4 slip formats for Xerox copies, online form applications, and passport submissions. Includes tracking QR code so citizens can check status online.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl border border-slate-800 bg-[#0e1625] p-6 hover:border-slate-700 transition">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
                <TrendingUp size={22} />
              </div>
              <h3 className="text-base font-bold text-white">Govt Fee vs. Real Shop Profit</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Separates pass-through government wallet deductions from actual Xerox and processing charges. Accurately calculates real daily net profit after paper and electricity expenses.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-3xl border border-slate-800 bg-[#0e1625] p-6 hover:border-slate-700 transition">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
                <Users size={22} />
              </div>
              <h3 className="text-base font-bold text-white">Multi-Staff & Shift Drawers</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Give operators their own 4-digit PIN login. Each clerk runs an isolated Front Desk counter and produces a shift closing tally to reconcile physical cash before going home.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-3xl border border-slate-800 bg-[#0e1625] p-6 hover:border-slate-700 transition">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
                <Clock3 size={22} />
              </div>
              <h3 className="text-base font-bold text-white">Customer Khata (Credit / Udhar)</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Never lose track of pending customer dues. Track outstanding balances by customer name and phone, send 1-click WhatsApp payment reminders, and mark settled with a single tap.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-3xl border border-slate-800 bg-[#0e1625] p-6 hover:border-slate-700 transition">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20 mb-4">
                <Zap size={22} />
              </div>
              <h3 className="text-base font-bold text-white">FCFS Queue Tokens</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Manage morning crowds fairly with sequential first-come-first-serve tokens. Print queue slips, call the next citizen, and convert tokens into billing invoices instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="relative z-10 px-4 sm:px-6 py-20 border-t border-slate-800/80 bg-slate-950/40">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Transparent SaaS Pricing</h2>
          <p className="mt-2 text-3xl font-black text-white sm:text-4xl">Honest Plans with 14-Day Free Trial</p>
          <p className="mt-3 text-sm text-slate-400 max-w-lg mx-auto">
            Pick the right tier for your center. All plans include 14 days full access with zero credit card required.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="mt-8 inline-flex items-center rounded-2xl border border-slate-800 bg-slate-900/90 p-1.5 gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                billingCycle === "monthly" ? "bg-cyan-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                billingCycle === "annual" ? "bg-cyan-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 font-black border border-emerald-400/40">
                Save 25%
              </span>
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-3 text-left">
            {/* Starter */}
            <div className="rounded-3xl border border-slate-800 bg-[#0e1625] p-7 flex flex-col justify-between hover:border-slate-700 transition">
              <div>
                <h3 className="text-lg font-bold text-white">Single Counter</h3>
                <p className="text-xs text-slate-400 mt-1">For single-operator CSCs, Xerox shops & internet cafés.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    {billingCycle === "monthly" ? "₹199" : "₹149"}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Single Counter POS & Daybook</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Up to 4 Portal Advance Wallets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>58mm & 80mm Thermal Printer Slips</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Customer Khata (Credit) Tracker</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?plan=starter"
                className="mt-8 block text-center rounded-xl border border-slate-700 bg-slate-900 py-3 text-xs font-bold text-white hover:border-cyan-400 hover:text-cyan-300 transition"
              >
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Pro Center (Featured) */}
            <div className="relative rounded-3xl border-2 border-cyan-400 bg-gradient-to-b from-[#112138] to-[#0c1524] p-7 shadow-2xl shadow-cyan-500/10 flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-cyan-400 px-3.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                Most Popular
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Pro Center Hub</h3>
                <p className="text-xs text-slate-400 mt-1">For busy Akshaya, CSC & Xerox centers with multiple staff.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    {billingCycle === "monthly" ? "₹399" : "₹299"}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span><b>Unlimited Staff Logins</b> with PIN Security</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span><b>Isolated Shift Cash Drawers</b> per clerk</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Unlimited Portal & Bank Wallets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>FCFS Queue Token & Call System</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>1-Click WhatsApp Khata Reminders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Excel & CSV Daybook Export</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?plan=pro"
                className="mt-8 block text-center rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 py-3 text-xs font-black text-slate-950 hover:brightness-110 transition shadow-lg shadow-cyan-400/25"
              >
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Multi-Branch */}
            <div className="rounded-3xl border border-slate-800 bg-[#0e1625] p-7 flex flex-col justify-between hover:border-slate-700 transition">
              <div>
                <h3 className="text-lg font-bold text-white">Multi-Branch Owner</h3>
                <p className="text-xs text-slate-400 mt-1">For operators running multiple branches or franchise kiosks.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    {billingCycle === "monthly" ? "₹799" : "₹599"}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Up to 3 Center Locations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Centralized Owner Financial Dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Custom Center Logo & Header on Receipts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Priority WhatsApp & Phone Support</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?plan=multi"
                className="mt-8 block text-center rounded-xl border border-slate-700 bg-slate-900 py-3 text-xs font-bold text-white hover:border-cyan-400 hover:text-cyan-300 transition"
              >
                Contact Sales / Multi-Branch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION SECTION */}
      <section id="faq" className="relative z-10 px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Got Questions?</h2>
            <p className="mt-2 text-3xl font-black text-white">Frequently Asked Questions</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-[#0e1625] overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-white hover:text-cyan-300 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight
                      size={16}
                      className={`text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-90 text-cyan-400" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
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
      <section className="relative z-10 px-4 sm:px-6 py-20 border-t border-slate-800/80 bg-gradient-to-b from-[#070b13] via-[#0c1626] to-[#070b13] text-center">
        <div className="mx-auto max-w-4xl rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-[#0c1626] to-[#0f2138] p-8 sm:p-14 shadow-2xl shadow-cyan-500/10">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Take Control of Your Center's Accounts?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
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
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-4 text-sm font-bold text-white hover:border-slate-500 transition"
            >
              <Play size={14} className="text-cyan-400 fill-cyan-400" />
              <span>Try Sandbox Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 px-6 py-10 text-center text-xs text-slate-500 bg-[#060910]">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400 text-slate-950 font-black">
              <Receipt size={14} />
            </div>
            <span className="font-bold text-slate-300">DenBooks 360 SaaS</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <Link href="/demo" className="hover:text-white transition">Live Demo</Link>
            <Link href="/login" className="hover:text-white transition">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition">Register Center</Link>
            <Link href="/staff/login" className="hover:text-white transition">Staff Desk</Link>
          </div>
          <p>© 2026 DenBooks 360. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
