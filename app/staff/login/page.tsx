"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  Phone,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Users,
} from "lucide-react";
import { staffLogin, getStaffSession, staffLogout } from "@/lib/services/employee.service";


export default function StaffLoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [centerName, setCenterName] = useState("DenBooks Counter Desk");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("denbooks_current_tenant");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.name) setCenterName(parsed.name);
        }
      } catch {}

      if (window.location.search.includes("switch=true")) {
        staffLogout();
        return;
      }
    }
    // If already logged in, redirect straight to staff workspace
    const session = getStaffSession();
    if (session) {
      router.replace("/staff");
      return;
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError("Please enter your mobile phone number or name.");
      return;
    }
    if (!pin.trim()) {
      setError("Please enter your 4-digit PIN.");
      return;
    }

    setLoading(true);
    try {
      await staffLogin(identifier.trim(), pin.trim());
      router.replace("/staff");
    } catch (err: any) {
      const msg: string = err.message || "";
      if (msg.includes("No active employee")) {
        setError("Mobile number not recognised. Ask your admin to add you in Employee Management first.");
      } else if (msg.includes("Incorrect")) {
        setError("Incorrect PIN. Please try again or contact your admin.");
      } else {
        setError(msg || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b13] px-4 py-8 text-slate-100">
      {/* Background Cyber Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,220,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,220,255,0.03)_1px,transparent_1px)] bg-[size:45px_45px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[100px]" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-slate-800/90 bg-[#0c1322]/90 p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 text-cyan-300 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
              <Users size={28} />
            </div>

            <h1 className="mt-4 text-xl font-black uppercase tracking-wider text-white">
              {centerName}
            </h1>
            <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-400/20">
              <ShieldCheck size={13} />
              <span>Staff Counter Desk Login</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Enter your registered mobile number and PIN to begin your counter shift.
            </p>
          </div>

          {error && (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                Staff Mobile Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  4-Digit Security PIN
                </label>
                <span className="text-[10px] text-slate-500">Contact admin if forgotten</span>
              </div>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPin ? "text" : "password"}
                  required
                  maxLength={6}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 pl-10 pr-11 py-2.5 text-base font-mono font-bold tracking-widest text-emerald-400 placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-3 text-sm font-bold text-slate-950 hover:brightness-110 transition shadow-lg shadow-cyan-500/25 disabled:opacity-50"
            >
              <LogIn size={16} />
              <span>{loading ? "Verifying PIN..." : "Login to Counter Desk"}</span>
            </button>
          </form>


          {/* Admin Switcher */}
          <div className="mt-6 text-center">
            <a
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition"
            >
              <span>Are you the Shop Owner / Admin?</span>
              <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
