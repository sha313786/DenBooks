"use client";

import React, { useEffect, useState } from "react";
import AccountsModule from "@/components/AccountsModule";
import Link from "next/link";
import { Receipt, LogOut, Store, CreditCard, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const [shopName, setShopName] = useState("My CSC Center");
  const [ownerName, setOwnerName] = useState("Owner");
  const [trialDaysLeft, setTrialDaysLeft] = useState(14);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("denbooks_current_tenant");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.name) setShopName(parsed.name);
          if (parsed.owner) setOwnerName(parsed.owner);
          if (parsed.trialDaysLeft !== undefined) setTrialDaysLeft(parsed.trialDaysLeft);
        } catch {}
      }
    }
  }, []);

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
            <p className="text-[11px] text-slate-400">Powered by DenBooks 360 SaaS</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/#pricing"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1.5 text-xs font-black text-slate-950 hover:brightness-110 transition shadow-sm"
          >
            <CreditCard size={13} />
            <span>Upgrade Subscription</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <LogOut size={14} />
            <span>Exit</span>
          </Link>
        </div>
      </header>

      {/* Embedded Standalone Accounts / Daybook Engine */}
      <main className="flex-1 p-4 md:p-6">
        <AccountsModule />
      </main>
    </div>
  );
}
