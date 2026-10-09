"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  Wallet,
  CreditCard,
  Sparkles,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  UserCheck,
  Building,
  RefreshCw,
  Monitor,
  Smartphone,
  Send,
  ArrowRight,
  TrendingUp,
  Receipt,
  Plus,
} from "lucide-react";
import {
  AccountTransaction,
  DaybookSummary,
  PortalWallet,
} from "@/lib/services/accounts.service";
import {
  getDailyAttendance,
  StaffAttendanceRecord,
} from "@/lib/services/attendance.service";

interface OwnerMobileSnapshotProps {
  summary: DaybookSummary;
  wallets: PortalWallet[];
  transactions: AccountTransaction[];
  selectedDate: string;
  centerCode?: string;
  centerName?: string;
  onSwitchToDesktop?: () => void;
  onOpenInvoiceModal?: () => void;
  onOpenExpenseModal?: () => void;
}

export default function OwnerMobileSnapshot({
  summary,
  wallets,
  transactions,
  selectedDate,
  centerCode = "KNR059",
  centerName = "DenBooks 360",
  onSwitchToDesktop,
  onOpenInvoiceModal,
  onOpenExpenseModal,
}: OwnerMobileSnapshotProps) {
  const [attendance, setAttendance] = useState<StaffAttendanceRecord[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  // Load staff shift attendance for the selected date
  useEffect(() => {
    let isMounted = true;
    async function loadAttendance() {
      try {
        const records = await getDailyAttendance(selectedDate);
        if (isMounted) {
          setAttendance(records);
          setLoadingAttendance(false);
        }
      } catch (err) {
        if (isMounted) setLoadingAttendance(false);
      }
    }
    loadAttendance();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Today's pending customer credit dues
  const todayKhataDues = transactions.filter(
    (t) => !t.is_settled && t.transaction_date === selectedDate
  );
  // All pending customer dues across history (optional quick reference)
  const allPendingKhata = transactions.filter((t) => !t.is_settled);

  // Helper to trigger 1-tap WhatsApp reminder
  const sendWhatsAppReminder = (tx: AccountTransaction) => {
    const rawPhone = (tx.customer_phone || "").replace(/\D/g, "");
    if (!rawPhone || rawPhone.length < 10) {
      alert("No valid 10-digit phone number found for this customer.");
      return;
    }
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const msg = `Namaskaram ${tx.customer_name || "Sir/Madam"},\n\nThis is a friendly reminder from *${centerName}* regarding your pending service payment of *₹${tx.amount}* for *${tx.title}* on ${tx.transaction_date}.\n\nPlease clear the balance via UPI or visit our counter at your earliest convenience.\n\nThank you!`;
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-4 pb-12 font-sans">
      {/* 1. Header Banner: Owner Mobile Command */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0c1626] via-[#0e1f38] to-[#09111e] p-4 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-cyan-950/80 border border-cyan-700/60 px-2.5 py-1 text-xs font-mono font-bold text-cyan-300">
              🏢 {centerCode}
            </span>
            <span className="text-[11px] font-semibold text-slate-300">
              {formattedDate}
            </span>
          </div>

          {onSwitchToDesktop && (
            <button
              type="button"
              onClick={onSwitchToDesktop}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:text-white transition cursor-pointer"
            >
              <Monitor size={12} className="text-cyan-400" />
              <span>Full Desktop Tables</span>
            </button>
          )}
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Owner Evening Snapshot</span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] px-2 py-0.5 font-bold">
                LIVE
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              {centerName} • Cash Reconciliation & Daily Health
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenInvoiceModal && (
              <button
                type="button"
                onClick={onOpenInvoiceModal}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition"
                title="Add Bill / Invoice"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. SECTION 1: EVENING CASH HANDOVER & REVENUE (4 Big KPI Cards) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <IndianRupee size={13} className="text-emerald-400" />
            <span>1. Cash Handover & Revenue</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {summary.transactionCount} transactions
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Card A: Physical Cash in Drawer (Top Priority) */}
          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-[#0c2419] to-[#0a1813] p-3.5 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-400">
                💵 Cash in Drawer
              </span>
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-white font-mono tracking-tight">
                ₹{summary.cashInHand.toLocaleString("en-IN")}
              </div>
              <p className="text-[10px] text-emerald-300/80 font-medium mt-0.5">
                Staff must hand this over
              </p>
            </div>
            <div className="text-[9.5px] text-slate-400 pt-1 border-t border-emerald-500/20">
              Cash in: ₹{summary.totalIncome > 0 ? (summary.cashInHand + summary.totalExpense).toLocaleString("en-IN") : "0"} • Exp: ₹{summary.totalExpense.toLocaleString("en-IN")}
            </div>
          </div>

          {/* Card B: UPI Received in Bank */}
          <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-[#0c1c2b] to-[#091520] p-3.5 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-cyan-400">
                📱 UPI Received
              </span>
              <CreditCard size={13} className="text-cyan-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-white font-mono tracking-tight">
                ₹{summary.upiReceived.toLocaleString("en-IN")}
              </div>
              <p className="text-[10px] text-cyan-300/80 font-medium mt-0.5">
                Direct in Shop Bank Account
              </p>
            </div>
            <div className="text-[9.5px] text-slate-400 pt-1 border-t border-cyan-500/20">
              GPay, PhonePe, QR receipts
            </div>
          </div>

          {/* Card C: Net Shop Profit */}
          <div
            className={`rounded-2xl border p-3.5 shadow-md flex flex-col justify-between ${
              summary.netShopProfit >= 0
                ? "border-indigo-500/40 bg-gradient-to-br from-[#121633] to-[#0b0e21]"
                : "border-rose-500/40 bg-gradient-to-br from-[#290e14] to-[#17080b]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-indigo-400">
                📈 Real Net Profit
              </span>
              <Sparkles size={13} className="text-indigo-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-white font-mono tracking-tight">
                ₹{summary.netShopProfit.toLocaleString("en-IN")}
              </div>
              <p className="text-[10px] text-indigo-300/80 font-medium mt-0.5">
                Your actual earnings today
              </p>
            </div>
            <div className="text-[9.5px] text-slate-400 pt-1 border-t border-indigo-500/20">
              Rev: ₹{summary.realShopRevenue.toLocaleString("en-IN")} • Net margin
            </div>
          </div>

          {/* Card D: Govt Pass-Through Fees */}
          <div className="rounded-2xl border border-slate-700/80 bg-gradient-to-br from-[#121724] to-[#0b0e17] p-3.5 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-300">
                🏛️ Govt Pass-Through
              </span>
              <Building size={13} className="text-slate-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-slate-200 font-mono tracking-tight">
                ₹{summary.totalGovtFees.toLocaleString("en-IN")}
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                From advance portal wallets
              </p>
            </div>
            <div className="text-[9.5px] text-slate-400 pt-1 border-t border-slate-750">
              Not counted as store taxable income
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION 2: ADVANCE PORTAL WALLETS (Recharge Alert for Tomorrow Morning) */}
      <div className="rounded-2xl border border-slate-800 bg-[#0e1626] p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Wallet size={14} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide">
                2. Running Portal Wallets
              </h2>
              <p className="text-[10px] text-slate-400">
                Check tonight before tomorrow&apos;s morning rush
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-lg">
            Total: ₹{wallets.reduce((s, w) => s + w.balance, 0).toLocaleString("en-IN")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {wallets.map((wallet) => {
            const isLow = wallet.balance < (wallet.min_alert_balance || 1000);
            return (
              <div
                key={wallet.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition ${
                  isLow
                    ? "border-amber-500/40 bg-amber-950/20"
                    : "border-slate-800 bg-slate-900/60"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">
                      {wallet.name}
                    </span>
                    {isLow ? (
                      <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] px-1.5 py-0.2 font-bold flex items-center gap-0.5">
                        <AlertTriangle size={9} />
                        <span>Top up!</span>
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] px-1.5 py-0.2 font-bold flex items-center gap-0.5">
                        <CheckCircle2 size={9} />
                        <span>OK</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Min alert: ₹{wallet.min_alert_balance || 1000}
                  </p>
                </div>

                <div className="text-right">
                  <div
                    className={`font-mono text-base font-black ${
                      isLow ? "text-amber-400" : "text-white"
                    }`}
                  >
                    ₹{wallet.balance.toLocaleString("en-IN")}
                  </div>
                  <span className="text-[9.5px] text-slate-400">
                    {wallet.category || "Portal"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SECTION 3: STAFF SHIFT HANDOVER STATUS */}
      <div className="rounded-2xl border border-slate-800 bg-[#0e1626] p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30">
              <UserCheck size={14} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide">
                3. Staff Shift Handover
              </h2>
              <p className="text-[10px] text-slate-400">
                Physical drawer balance per counter
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/employees"
            className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
          >
            Staff Suite &rarr;
          </Link>
        </div>

        {attendance.length === 0 ? (
          <div className="rounded-xl border border-slate-850 bg-slate-900/40 p-3.5 text-center text-xs text-slate-400">
            {loadingAttendance
              ? "Checking attendance records..."
              : "No staff attendance punches logged for this date."}
          </div>
        ) : (
          <div className="space-y-2">
            {attendance.map((rec) => {
              // Calculate cash collected by this specific staff member
              const staffCash = transactions
                .filter(
                  (t) =>
                    (t.employee_id === rec.employee_id ||
                      t.employee_name === rec.employee_name) &&
                    t.transaction_date === selectedDate &&
                    t.payment_method === "Cash" &&
                    t.is_settled
                )
                .reduce((sum, t) => sum + t.amount, 0);

              const staffTxCount = transactions.filter(
                (t) =>
                  (t.employee_id === rec.employee_id ||
                    t.employee_name === rec.employee_name) &&
                  t.transaction_date === selectedDate
              ).length;

              const isClockedOut = Boolean(rec.punch_out);

              return (
                <div
                  key={rec.id || rec.employee_id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/60"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {rec.employee_name}
                      </span>
                      {isClockedOut ? (
                        <span className="rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[9px] px-2 py-0.2 font-semibold">
                          🏁 Shift Done
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] px-2 py-0.2 font-bold">
                          🟢 In Shift
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {rec.punch_in} {rec.punch_out ? `→ ${rec.punch_out}` : ""} • {staffTxCount} bills handled
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-sm font-black text-emerald-400">
                      ₹{staffCash.toLocaleString("en-IN")}
                    </div>
                    <span className="text-[9.5px] text-slate-400">
                      Drawer Cash
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. SECTION 4: TODAY'S KHATA DUES (1-Tap WhatsApp Reminder) */}
      <div className="rounded-2xl border border-slate-800 bg-[#0e1626] p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Clock3 size={14} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide">
                4. Customer Khata Dues
              </h2>
              <p className="text-[10px] text-slate-400">
                1-tap WhatsApp payment reminder
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/khata"
            className="text-[11px] font-semibold text-amber-400 hover:text-amber-300"
          >
            All Dues ({allPendingKhata.length}) &rarr;
          </Link>
        </div>

        {todayKhataDues.length === 0 ? (
          <div className="rounded-xl border border-slate-850 bg-slate-900/40 p-4 text-center">
            <CheckCircle2 size={18} className="mx-auto text-emerald-400 mb-1" />
            <p className="text-xs font-bold text-white">Zero customer dues today!</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              All transactions for this date have been settled in Cash or UPI.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayKhataDues.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl border border-amber-500/30 bg-amber-950/15"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">
                    {tx.customer_name || "Citizen / Customer"}
                  </div>
                  <p className="text-[10.5px] text-slate-300 font-medium">
                    {tx.title}
                  </p>
                  <p className="text-[10px] text-amber-400 font-mono">
                    {tx.customer_phone || "No phone recorded"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono text-sm font-black text-amber-300">
                      ₹{tx.amount.toLocaleString("en-IN")}
                    </div>
                    <span className="text-[9px] uppercase font-bold text-amber-500">
                      Pending
                    </span>
                  </div>

                  {tx.customer_phone && (
                    <button
                      type="button"
                      onClick={() => sendWhatsAppReminder(tx)}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 text-xs font-bold transition shadow-sm cursor-pointer"
                      title="Send WhatsApp payment reminder"
                    >
                      <MessageCircle size={13} />
                      <span className="text-[11px]">Remind</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Footer Navigation / Desktop Switch */}
      {onSwitchToDesktop && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onSwitchToDesktop}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer shadow-sm"
          >
            <Monitor size={14} className="text-cyan-400" />
            <span>Switch to Detailed Desktop Tables &rarr;</span>
          </button>
        </div>
      )}
    </div>
  );
}
