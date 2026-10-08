"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Receipt,
  Store,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  saveTenantSubscription,
  TenantSubscription,
} from "@/lib/services/subscription.service";

export default function SignupPage() {
  const router = useRouter();

  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stateName, setStateName] = useState("Kerala");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(true);

  // Sync theme with landing page preference
  useEffect(() => {
    const saved = localStorage.getItem("denbooks_landing_theme");
    if (saved === "light") {
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("denbooks_landing_theme", next ? "dark" : "light");
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!shopName.trim()) {
      setError("Please enter your Shop / Center Name.");
      return;
    }
    if (!ownerName.trim()) {
      setError("Please enter the Owner's Full Name.");
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      let authUserId = "tenant_" + Date.now().toString(36);

      // 1. Sign up user in Supabase Auth (if connected)
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: ownerName.trim(),
              phone: phone.trim(),
              shop_name: shopName.trim(),
              state: stateName,
            },
          },
        });

        if (!authError && authData?.user?.id) {
          authUserId = authData.user.id;
        }
      } catch (authErr) {
        console.warn("Supabase auth offline fallback:", authErr);
      }

      // 2. Initialize 14-day full free trial in subscription service & Super Admin registry
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

      const newSub: TenantSubscription = {
        id: authUserId,
        shop_name: shopName.trim(),
        owner_name: ownerName.trim(),
        owner_phone: phone.trim(),
        owner_email: email.trim(),
        state: stateName,
        plan: "trial",
        status: "trial",
        trial_ends_at: trialEnd,
        subscription_expires_at: trialEnd,
        is_locked: false,
        created_at: now.toISOString(),
      };

      saveTenantSubscription(newSub);

      // 3. Store tenant profile for immediate offline-capable access
      if (typeof window !== "undefined") {
        const tenantProfile = {
          id: authUserId,
          name: shopName.trim(),
          owner: ownerName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          state: stateName,
          plan: "trial",
          trialDaysLeft: 14,
        };
        localStorage.setItem("denbooks_current_tenant", JSON.stringify(tenantProfile));
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create center account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`relative flex min-h-screen items-center justify-center px-4 py-12 transition-colors ${
        isDark ? "bg-[#070b13] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      {/* Background Cyber / Daylight Glow */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          isDark
            ? "bg-[linear-gradient(rgba(0,220,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,220,255,0.03)_1px,transparent_1px)]"
            : "bg-[linear-gradient(rgba(14,165,233,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.06)_1px,transparent_1px)]"
        } bg-[size:45px_45px]`}
      />
      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] ${
          isDark ? "bg-cyan-500/10" : "bg-cyan-400/15"
        }`}
      />

      <div className="relative w-full max-w-md">
        {/* Top bar with Theme Switcher */}
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
              isDark
                ? "bg-slate-900/90 border-slate-700/80 text-amber-300 hover:border-amber-400/50 hover:bg-slate-800"
                : "bg-white border-slate-300 text-slate-800 hover:border-cyan-500 shadow-xs"
            }`}
          >
            {isDark ? (
              <>
                <Sun size={13} className="text-amber-400 fill-amber-400/20" />
                <span>Bright</span>
              </>
            ) : (
              <>
                <Moon size={13} className="text-cyan-600 fill-cyan-600/20" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>

        <div
          className={`rounded-3xl border p-8 shadow-2xl backdrop-blur-xl transition-all ${
            isDark
              ? "border-slate-800/90 bg-[#0c1322]/90"
              : "border-slate-200 bg-white shadow-slate-200/60"
          }`}
        >
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
              <img
                src="/logo.png"
                alt="DenBooks 360 Logo"
                className="h-11 w-11 rounded-xl shadow-md shadow-cyan-500/25 object-cover group-hover:scale-105 transition border border-cyan-500/30"
              />
              <span className={`text-xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                DenBooks 360
              </span>
            </Link>
            <h1 className={`mt-2 text-xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>
              Register Your Center
            </h1>
            <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Start your 14-day free trial. No credit card required.
            </p>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="mt-6 space-y-3.5">
            <div>
              <label
                className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Shop / CSC Center Name
              </label>
              <div className="relative">
                <Store size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Friends Cyber World & Akshaya"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs outline-none focus:border-cyan-400 transition ${
                    isDark
                      ? "border-slate-700/80 bg-slate-900/90 text-white placeholder-slate-500"
                      : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Owner Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-cyan-400 transition ${
                    isDark
                      ? "border-slate-700/80 bg-slate-900/90 text-white placeholder-slate-500"
                      : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  State / Region
                </label>
                <select
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-xs outline-none focus:border-cyan-400 transition cursor-pointer ${
                    isDark
                      ? "border-slate-700/80 bg-slate-900/90 text-white"
                      : "border-slate-300 bg-slate-50 text-slate-900"
                  }`}
                >
                  <option value="Kerala">Kerala</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Other">Other States</option>
                </select>
              </div>
            </div>

            <div>
              <label
                className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Mobile Number
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs outline-none focus:border-cyan-400 transition ${
                    isDark
                      ? "border-slate-700/80 bg-slate-900/90 text-white placeholder-slate-500"
                      : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="owner@yourcenter.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs outline-none focus:border-cyan-400 transition ${
                    isDark
                      ? "border-slate-700/80 bg-slate-900/90 text-white placeholder-slate-500"
                      : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Create Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs outline-none focus:border-cyan-400 transition ${
                    isDark
                      ? "border-slate-700/80 bg-slate-900/90 text-white placeholder-slate-500"
                      : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 py-3 text-xs font-black text-slate-950 hover:brightness-110 transition shadow-lg shadow-cyan-400/25 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Creating Center Workspace..." : "Create My Center Account"}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered?{" "}
            <Link href="/login" className="font-bold text-cyan-500 hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
