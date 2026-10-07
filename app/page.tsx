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
} from "lucide-react";

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="relative min-h-screen bg-[#070b13] text-slate-100 overflow-x-hidden">
      {/* Background Neon Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,220,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,220,255,0.03)_1px,transparent_1px)] bg-[size:45px_45px]" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[130px]" />

      {/* NAVBAR */}
      <nav className="relative z-10 border-b border-slate-800/80 bg-[#070b13]/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25">
              <Receipt size={22} />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white">DenBooks</span>
              <span className="ml-1 text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-full">SaaS</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition">Features</a>
            <a href="#pricing" className="hover:text-cyan-400 transition">Pricing Plans</a>
            <a href="#benefits" className="hover:text-cyan-400 transition">Why DenBooks?</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-400/20 hover:brightness-110 transition"
            >
              Start Free Trial
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 px-6 pt-20 pb-16 text-center lg:pt-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-bold text-cyan-300 backdrop-blur-md">
            <Sparkles size={14} className="text-cyan-400" />
            <span>Built Specifically for CSCs, Cyber Cafés & Akshaya Centers</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Never lose track of{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Portal Advance Balances
            </span>{" "}
            & Counter Cash again.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg">
            DenBooks is the modern accounts manager and POS for digital service centers. Reconcile e-District & CSC wallets, issue instant thermal slips, track customer credit (Khata), and monitor daily profit in real time.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-cyan-400/25 hover:bg-cyan-300 transition"
            >
              Start 14-Day Free Trial
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-bold text-white hover:border-slate-500 transition"
            >
              Explore Live Demo
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>Setup in 60 seconds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>Thermal printer ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE HIGHLIGHTS */}
      <section id="features" className="relative z-10 px-6 py-16 border-t border-slate-800/80 bg-slate-950/40">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Everything in One Place</h2>
            <p className="mt-2 text-3xl font-black text-white">Why General Accounting Apps Fail for CSCs</p>
            <p className="mt-3 text-sm text-slate-400">
              Apps like Tally and Vyapar aren't designed for multi-portal pass-through fees (Govt Fee vs Service Charge). DenBooks separates government charges from your actual shop revenue automatically.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-800 bg-[#0e1625]/90 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-5">
                <Wallet size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Portal Advance Balances</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Track live balances across your Bank, CSC Digital Seva, e-District, and utility wallets. Automatic balance low-alerts prevent payment failures.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-800 bg-[#0e1625]/90 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-5">
                <Printer size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Instant Thermal Receipts</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Print 58mm, 80mm, and A4 receipts for Xerox, Photos, and online application slips. Includes QR code for customers to track application status.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-800 bg-[#0e1625]/90 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-5">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Govt Fee vs Real Profit</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                A ₹2500 passport fee isn't your income! DenBooks cleanly isolates pass-through government wallet deductions from your actual ₹250 shop processing charge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Affordable Plans for Every Center</h2>
          <p className="mt-2 text-3xl font-black text-white sm:text-4xl">Simple, Transparent Pricing</p>
          <p className="mt-3 text-sm text-slate-400 max-w-lg mx-auto">
            Choose monthly flexibility or save 25% with annual billing. Cancel anytime.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                billingCycle === "monthly" ? "bg-cyan-400 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                billingCycle === "annual" ? "bg-cyan-400 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              Annual Billing (Save 25%)
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-3 text-left">
            {/* Starter */}
            <div className="rounded-3xl border border-slate-800 bg-[#0e1625] p-7 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <p className="text-xs text-slate-400 mt-1">Perfect for single-owner CSCs & cyber cafés.</p>
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
                    <span>Thermal Printer & PDF Slips</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Customer Khata (Credit) Tracker</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?plan=starter"
                className="mt-8 block text-center rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-xs font-bold text-white hover:border-cyan-400 transition"
              >
                Start 14-Day Trial
              </Link>
            </div>

            {/* Pro (Highlighted) */}
            <div className="relative rounded-3xl border-2 border-cyan-400 bg-gradient-to-b from-[#112138] to-[#0c1524] p-7 shadow-2xl shadow-cyan-500/10 flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-cyan-400 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950">
                Most Popular
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Pro Center</h3>
                <p className="text-xs text-slate-400 mt-1">For multi-staff Akshaya, CSC & Xerox hubs.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    {billingCycle === "monthly" ? "₹399" : "₹299"}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Unlimited Staff Logins with PINs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Isolated Shift Cash Drawers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Unlimited Portal & Bank Wallets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>First-Come-First-Serve Queue Tokens</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>CSV/Excel Daybook Export</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?plan=pro"
                className="mt-8 block text-center rounded-xl bg-cyan-400 py-2.5 text-xs font-black text-slate-950 hover:bg-cyan-300 transition shadow-lg shadow-cyan-400/20"
              >
                Get Started with Pro
              </Link>
            </div>

            {/* Enterprise / Multi-Branch */}
            <div className="rounded-3xl border border-slate-800 bg-[#0e1625] p-7 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Multi-Branch</h3>
                <p className="text-xs text-slate-400 mt-1">For operators managing multiple outlets.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    {billingCycle === "monthly" ? "₹799" : "₹599"}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Up to 3 Shop Locations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Centralized Owner Financial Dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Priority WhatsApp Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Custom Brand Logo on Receipts</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?plan=enterprise"
                className="mt-8 block text-center rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-xs font-bold text-white hover:border-cyan-400 transition"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 px-6 py-8 text-center text-xs text-slate-500">
        <p>© 2026 DenBooks 360 SaaS. Built with ❤️ for Digital Service Centers.</p>
      </footer>
    </div>
  );
}
