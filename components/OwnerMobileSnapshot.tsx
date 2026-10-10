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
  centerCode = "",
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
      <div className="rounded-2xl border dark:border-cyan-500/30 border-slate-200 dark:bg-gradient-to-br dark:from-[#0c1626] dark:via-[#0e1f38] dark:to-[#09111e] bg-white p-4 shadow-lg dark:text-white text-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {centerCode ? (
              <span className="rounded-xl dark:bg-cyan-950/80 bg-cyan-50 border dark:border-cyan-700/60 border-cyan-300 px-2.5 py-1 text-xs font-mono font-bold dark:text-cyan-300 text-cyan-800">
                🏢 {centerCode}
              </span>
            ) : null}
            <span className="text-[11px] font-semibold dark:text-slate-300 text-slate-600">
              {formattedDate}
            </span>
          </div>

          {onSwitchToDesktop && (
            <button
              type="button"
              onClick={onSwitchToDesktop}
              className="inline-flex items-center gap-1.5 rounded-xl border dark:border-slate-700 border-slate-300 dark:bg-slate-800/80 bg-slate-100 px-2.5 py-1 text-[11px] font-bold dark:text-slate-200 text-slate-700 hover:text-cyan-600 transition cursor-pointer"
            >
              <Monitor size={12} className="dark:text-cyan-400 text-cyan-600" />
              <span>Full Desktop Tables</span>
            </button>
          )}
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <div>
            <h1 className="text-base font-black tracking-tight dark:text-white text-slate-900 flex items-center gap-1.5">
              <span>Owner Evening Snapshot</span>
              <span className="rounded-full dark:bg-emerald-500/20 bg-emerald-100 dark:text-emerald-300 text-emerald-800 border dark:border-emerald-500/30 border-emerald-300 text-[9px] px-2 py-0.5 font-bold">
                LIVE
              </span>
            </h1>
            <p className="text-[11px] dark:text-slate-400 text-slate-600">
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
          <span className="text-xs font-bold dark:text-slate-300 text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <IndianRupee size={13} className="dark:text-emerald-400 text-emerald-600" />
            <span>1. Cash Handover & Revenue</span>
          </span>
          <span className="text-[10px] dark:text-slate-400 text-slate-600 font-mono">
            {summary.transactionCount} transactions
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Card A: Physical Cash in Drawer (Top Priority) */}
          <div className="rounded-2xl border dark:border-emerald-500/40 border-emerald-300 dark:bg-gradient-to-br dark:from-[#0c2419] dark:to-[#0a1813] bg-emerald-50/80 p-3.5 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider dark:text-emerald-400 text-emerald-800">
                💵 Cash in Drawer
              </span>
              <div className="h-2 w-2 rounded-full dark:bg-emerald-400 bg-emerald-600 animate-pulse" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black dark:text-white text-emerald-950 font-mono tracking-tight">
                ₹{summary.cashInHand.toLocaleString("en-IN")}
              </div>
              <p className="text-[10px] dark:text-emerald-300/80 text-emerald-700 font-medium mt-0.5">
                Staff must hand this over
              </p>
            </div>
            <div className="text-[9.5px] dark:text-slate-400 text-slate-600 pt-1 border-t dark:border-emerald-500/20 border-emerald-200">
              Cash in: ₹{summary.totalIncome > 0 ? (summary.cashInHand + summary.totalExpense).toLocaleString("en-IN") : "0"} • Exp: ₹{summary.totalExpense.toLocaleString("en-IN")}
            </div>
          </div>

          {/* Card B: UPI Received in Bank */}
          <div className="rounded-2xl border dark:border-cyan-500/40 border-sky-300 dark:bg-gradient-to-br dark:from-[#0c1c2b] dark:to-[#091520] bg-sky-50/80 p-3.5 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider dark:text-cyan-400 text-sky-800">
                📱 UPI Received
              </span>
              <CreditCard size={13} className="dark:text-cyan-400 text-sky-600" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black dark:text-white text-sky-950 font-mono tracking-tight">
                ₹{summary.upiReceived.toLocaleString("en-IN")}
              </div>
              <p className="text-[10px] dark:text-cyan-300/80 text-sky-700 font-medium mt-0.5">
                Direct in Shop Bank Account
              </p>
            </div>
            <div className="text-[9.5px] dark:text-slate-400 text-slate-600 pt-1 border-t dark:border-cyan-500/20 border-sky-200">
              GPay, PhonePe, QR receipts
            </div>
          </div>

          {/* Card C: Net Shop Profit */}
          <div
            className={`rounded-2xl border p-3.5 shadow-md flex flex-col justify-between ${
              summary.netShopProfit >= 0
                ? "dark:border-indigo-500/40 border-indigo-300 dark:bg-gradient-to-br dark:from-[#121633] dark:to-[#0b0e21] bg-indigo-50/80"
                : "dark:border-rose-500/40 border-rose-300 dark:bg-gradient-to-br dark:from-[#290e14] dark:to-[#17080b] bg-rose-50/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider dark:text-indigo-400 text-indigo-800">
                📈 Real Net Profit
              </span>
              <Sparkles size={13} className="dark:text-indigo-400 text-indigo-600" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black dark:text-white text-indigo-950 font-mono tracking-tight">
                ₹{summary.netShopProfit.toLocaleString("en-IN")}
              </div>
              <p className="text-[10px] dark:text-indigo-300/80 text-indigo-700 font-medium mt-0.5">
                Your actual earnings today
              </p>
            </div>
            <div className="text-[9.5px] dark:text-slate-400 text-slate-600 pt-1 border-t dark:border-indigo-500/20 border-indigo-200">
              Rev: ₹{summary.realShopRevenue.toLocaleString("en-IN")} • Net margin
            </div>
          </div>

          {/* Card D: Govt Pass-Through Fees */}
          <div className="rounded-2xl border dark:border-slate-700/80 border-slate-300 dark:bg-gradient-to-br dark:from-[#121724] dark:to-[#0b0e17] bg-slate-100/90 p-3.5 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider dark:text-slate-300 text-slate-700">
                🏛️ Govt Pass-Through
              </span>
              <Building size={13} className="dark:text-slate-400 text-slate-600" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black dark:text-slate-200 text-slate-900 font-mono tracking-tight">
                ₹{summary.totalGovtFees.toLocaleString("en-IN")}
              </div>
              <p className="text-[10px] dark:text-slate-400 text-slate-600 font-medium mt-0.5">
                From advance portal wallets
              </p>
            </div>
            <div className="text-[9.5px] dark:text-slate-400 text-slate-600 pt-1 border-t dark:border-slate-750 border-slate-200">
              Not counted as store taxable income
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION 2: ADVANCE PORTAL WALLETS (Recharge Alert for Tomorrow Morning) */}
      <div className="rounded-2xl border dark:border-slate-800 border-slate-200 dark:bg-[#0e1626] bg-white p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b dark:border-slate-800/80 border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl dark:bg-cyan-500/15 bg-cyan-100 dark:text-cyan-400 text-cyan-700 border dark:border-cyan-500/30 border-cyan-300">
              <Wallet size={14} />
            </div>
            <div>
              <h2 className="text-xs font-bold dark:text-white text-slate-900 tracking-wide">
                2. Running Portal Wallets
              </h2>
              <p className="text-[10px] dark:text-slate-400 text-slate-600">
                Check tonight before tomorrow&apos;s morning rush
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-black dark:text-cyan-300 text-cyan-800 dark:bg-cyan-950/80 bg-cyan-100 border dark:border-cyan-800/60 border-cyan-300 px-2 py-0.5 rounded-lg">
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
                    ? "dark:border-amber-500/40 border-amber-300 dark:bg-amber-950/20 bg-amber-50"
                    : "dark:border-slate-800 border-slate-200 dark:bg-slate-900/60 bg-slate-50"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold dark:text-white text-slate-900">
                      {wallet.name}
                    </span>
                    {isLow ? (
                      <span className="rounded-full dark:bg-amber-500/20 bg-amber-100 dark:text-amber-300 text-amber-800 border dark:border-amber-500/30 border-amber-300 text-[9px] px-1.5 py-0.2 font-bold flex items-center gap-0.5">
                        <AlertTriangle size={9} />
                        <span>Top up!</span>
                      </span>
                    ) : (
                      <span className="rounded-full dark:bg-emerald-500/20 bg-emerald-100 dark:text-emerald-300 text-emerald-800 border dark:border-emerald-500/30 border-emerald-300 text-[9px] px-1.5 py-0.2 font-bold flex items-center gap-0.5">
                        <CheckCircle2 size={9} />
                        <span>OK</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] dark:text-slate-400 text-slate-600">
                    Min alert: ₹{wallet.min_alert_balance || 1000}
                  </p>
                </div>

                <div className="text-right">
                  <div
                    className={`font-mono text-base font-black ${
                      isLow ? "dark:text-amber-400 text-amber-700" : "dark:text-white text-slate-900"
                    }`}
                  >
                    ₹{wallet.balance.toLocaleString("en-IN")}
                  </div>
                  <span className="text-[9.5px] dark:text-slate-400 text-slate-600">
                    {wallet.category || "Portal"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SECTION 3: STAFF SHIFT HANDOVER STATUS */}
      <div className="rounded-2xl border dark:border-slate-800 border-slate-200 dark:bg-[#0e1626] bg-white p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b dark:border-slate-800/80 border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl dark:bg-teal-500/15 bg-teal-100 dark:text-teal-400 text-teal-700 border dark:border-teal-500/30 border-teal-300">
              <UserCheck size={14} />
            </div>
            <div>
              <h2 className="text-xs font-bold dark:text-white text-slate-900 tracking-wide">
                3. Staff Shift Handover
              </h2>
              <p className="text-[10px] dark:text-slate-400 text-slate-600">
                Physical drawer balance per counter
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/employees"
            className="text-[11px] font-semibold dark:text-cyan-400 text-cyan-600 hover:underline"
          >
            Staff Suite &rarr;
          </Link>
        </div>

        {attendance.length === 0 ? (
          <div className="rounded-xl border dark:border-slate-850 border-slate-200 dark:bg-slate-900/40 bg-slate-50 p-3.5 text-center text-xs dark:text-slate-400 text-slate-600">
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
                  className="flex items-center justify-between p-3 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/60 bg-slate-50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold dark:text-white text-slate-900">
                        {rec.employee_name}
                      </span>
                      {isClockedOut ? (
                        <span className="rounded-full dark:bg-slate-800 bg-slate-200 dark:text-slate-300 text-slate-700 border dark:border-slate-700 border-slate-300 text-[9px] px-2 py-0.2 font-semibold">
                          🏁 Shift Done
                        </span>
                      ) : (
                        <span className="rounded-full dark:bg-emerald-500/20 bg-emerald-100 dark:text-emerald-300 text-emerald-800 border dark:border-emerald-500/30 border-emerald-300 text-[9px] px-2 py-0.2 font-bold">
                          🟢 In Shift
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] dark:text-slate-400 text-slate-600 font-mono">
                      {rec.punch_in} {rec.punch_out ? `→ ${rec.punch_out}` : ""} • {staffTxCount} bills handled
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-sm font-black dark:text-emerald-400 text-emerald-700">
                      ₹{staffCash.toLocaleString("en-IN")}
                    </div>
                    <span className="text-[9.5px] dark:text-slate-400 text-slate-600">
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
      <div className="rounded-2xl border dark:border-slate-800 border-slate-200 dark:bg-[#0e1626] bg-white p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b dark:border-slate-800/80 border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl dark:bg-amber-500/15 bg-amber-100 dark:text-amber-400 text-amber-700 border dark:border-amber-500/30 border-amber-300">
              <Clock3 size={14} />
            </div>
            <div>
              <h2 className="text-xs font-bold dark:text-white text-slate-900 tracking-wide">
                4. Customer Khata Dues
              </h2>
              <p className="text-[10px] dark:text-slate-400 text-slate-600">
                1-tap WhatsApp payment reminder
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/khata"
            className="text-[11px] font-semibold dark:text-amber-400 text-amber-700 hover:underline"
          >
            All Dues ({allPendingKhata.length}) &rarr;
          </Link>
        </div>

        {todayKhataDues.length === 0 ? (
          <div className="rounded-xl border dark:border-slate-850 border-slate-200 dark:bg-slate-900/40 bg-slate-50 p-4 text-center">
            <CheckCircle2 size={18} className="mx-auto dark:text-emerald-400 text-emerald-600 mb-1" />
            <p className="text-xs font-bold dark:text-white text-slate-900">Zero customer dues today!</p>
            <p className="text-[10px] dark:text-slate-400 text-slate-600 mt-0.5">
              All transactions for this date have been settled in Cash or UPI.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayKhataDues.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl border dark:border-amber-500/30 border-amber-300 dark:bg-amber-950/15 bg-amber-50"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold dark:text-white text-slate-900">
                    {tx.customer_name || "Citizen / Customer"}
                  </div>
                  <p className="text-[10.5px] dark:text-slate-300 text-slate-700 font-medium">
                    {tx.title}
                  </p>
                  <p className="text-[10px] dark:text-amber-400 text-amber-800 font-mono">
                    {tx.customer_phone || "No phone recorded"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono text-sm font-black dark:text-amber-300 text-amber-800">
                      ₹{tx.amount.toLocaleString("en-IN")}
                    </div>
                    <span className="text-[9px] uppercase font-bold dark:text-amber-500 text-amber-700">
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
