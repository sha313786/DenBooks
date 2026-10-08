"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Receipt,
  Wallet,
  Clock3,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Plus,
  Printer,
  MessageCircle,
  RotateCcw,
  IndianRupee,
  Flame,
  Check,
  ExternalLink,
  X,
  FileText,
  Smartphone,
  Banknote,
  TrendingUp,
} from "lucide-react";

interface SandboxWallet {
  id: string;
  name: string;
  category: string;
  balance: number;
}

interface SandboxTransaction {
  id: string;
  time: string;
  title: string;
  category: "Govt Service" | "Counter POS" | "Shop Expense" | "Credit / Khata";
  amount: number;
  govtFee: number;
  serviceCharge: number;
  paymentMethod: "Cash" | "UPI" | "Credit";
  walletUsed?: string;
  customerName?: string;
}

const INITIAL_WALLETS: SandboxWallet[] = [
  { id: "w1", name: "CSC Digital Seva Portal", category: "Govt Portal", balance: 4320 },
  { id: "w2", name: "State e-District Wallet", category: "Govt Portal", balance: 6150 },
  { id: "w3", name: "PAN & UTIITSL Wallet", category: "Govt Portal", balance: 1870 },
  { id: "w4", name: "Operating Bank A/c", category: "Banking", balance: 7500 },
];

const INITIAL_TRANSACTIONS: SandboxTransaction[] = [
  {
    id: "tx-1",
    time: "04:12 PM",
    title: "Fresh Passport Application",
    category: "Govt Service",
    amount: 1750,
    govtFee: 1500,
    serviceCharge: 250,
    paymentMethod: "Cash",
    walletUsed: "State e-District Wallet",
    customerName: "Rajesh Kumar",
  },
  {
    id: "tx-2",
    time: "03:45 PM",
    title: "Color Xerox (x12) + Spiral Binding",
    category: "Counter POS",
    amount: 160,
    govtFee: 0,
    serviceCharge: 160,
    paymentMethod: "UPI",
    customerName: "Pooja Verma",
  },
  {
    id: "tx-3",
    time: "02:10 PM",
    title: "Premium A4 Copier Paper (2 Reams)",
    category: "Shop Expense",
    amount: -450,
    govtFee: 0,
    serviceCharge: 0,
    paymentMethod: "Cash",
  },
  {
    id: "tx-4",
    time: "01:20 PM",
    title: "Income Certificate & Land Tax Online",
    category: "Govt Service",
    amount: 280,
    govtFee: 200,
    serviceCharge: 80,
    paymentMethod: "UPI",
    walletUsed: "State e-District Wallet",
    customerName: "Sunil Nair",
  },
];

export default function DemoSandboxPage() {
  const [activeTab, setActiveTab] = useState<"admin" | "staff">("admin");
  const [wallets, setWallets] = useState<SandboxWallet[]>(INITIAL_WALLETS);
  const [transactions, setTransactions] = useState<SandboxTransaction[]>(INITIAL_TRANSACTIONS);
  const [cashDrawer, setCashDrawer] = useState(4820);
  const [upiTotal, setUpiTotal] = useState(6450);

  // Modals
  const [receiptModalTx, setReceiptModalTx] = useState<SandboxTransaction | null>(null);
  const [khataModalTx, setKhataModalTx] = useState<SandboxTransaction | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Counter POS quick cart state
  const [cartItems, setCartItems] = useState<{ name: string; qty: number; rate: number }[]>([
    { name: "B&W Xerox Copy", qty: 4, rate: 3 },
    { name: "PVC Smart ID Card", qty: 1, rate: 70 },
  ]);

  function showToast(msg: string) {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  }

  // Simulate Actions
  function handleSimulatePassport() {
    const govtFee = 1500;
    const shopFee = 250;
    const total = govtFee + shopFee;

    // Check if amount is 0
    if (total <= 0) {
      showToast("❌ Cannot Save: Transaction amount cannot be ₹0.");
      return;
    }

    // Check if wallet balance is 0 or insufficient
    const targetWallet = wallets.find((w) => w.id === "w2");
    if (!targetWallet || targetWallet.balance <= 0 || targetWallet.balance < govtFee) {
      showToast(`❌ Cannot Save: State e-District Wallet has ₹${targetWallet?.balance || 0} (less than fee ₹${govtFee}). Top up wallet before recording!`);
      return;
    }

    // Deduct e-District wallet
    setWallets((prev) =>
      prev.map((w) =>
        w.id === "w2" ? { ...w, balance: w.balance - govtFee } : w
      )
    );
    // Add to Cash Drawer
    setCashDrawer((prev) => prev + total);

    const newTx: SandboxTransaction = {
      id: `tx-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: "Fresh Passport Application (Govt Pass-through)",
      category: "Govt Service",
      amount: total,
      govtFee: govtFee,
      serviceCharge: shopFee,
      paymentMethod: "Cash",
      walletUsed: "State e-District Wallet",
      customerName: "Amit Sharma",
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast("✅ Passport Recorded: ₹1,500 debited from e-District Wallet & ₹250 net shop profit isolated!");
  }

  function handleSimulateTopup() {
    setWallets((prev) =>
      prev.map((w) =>
        w.id === "w2" ? { ...w, balance: w.balance + 5000 } : w
      )
    );
    showToast("💳 Topped up State e-District Wallet with +₹5,000 balance!");
  }

  function handleSimulatePOSSale() {
    const amount = 95;
    if (amount <= 0) {
      showToast("❌ Cannot Save: Transaction amount cannot be ₹0.");
      return;
    }
    setUpiTotal((prev) => prev + amount);

    const newTx: SandboxTransaction = {
      id: `tx-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: "Passport Photos (8 copies) + A4 Lamination",
      category: "Counter POS",
      amount: amount,
      govtFee: 0,
      serviceCharge: amount,
      paymentMethod: "UPI",
      customerName: "Kiran Dev",
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast("✅ Quick POS Bill: +₹95 added to UPI ledger.");
  }

  function handleSimulateExpense() {
    const expenseAmt = 120;
    if (expenseAmt <= 0) {
      showToast("❌ Cannot Save: Expense amount cannot be ₹0.");
      return;
    }
    if (cashDrawer < expenseAmt) {
      showToast("⚠️ Cash Drawer has insufficient cash for this expense!");
      return;
    }
    setCashDrawer((prev) => prev - expenseAmt);

    const newTx: SandboxTransaction = {
      id: `tx-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: "Shop Refreshments & Tea (Staff)",
      category: "Shop Expense",
      amount: -expenseAmt,
      govtFee: 0,
      serviceCharge: 0,
      paymentMethod: "Cash",
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast("📉 Recorded Shop Expense: -₹120 subtracted from Physical Cash Drawer.");
  }

  function handleResetSandbox() {
    setWallets(INITIAL_WALLETS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCashDrawer(4820);
    setUpiTotal(6450);
    setCartItems([
      { name: "B&W Xerox Copy", qty: 4, rate: 3 },
      { name: "PVC Smart ID Card", qty: 1, rate: 70 },
    ]);
    showToast("🔄 Sandbox reset to initial sample state.");
  }

  // Financial calculations
  const totalWallets = wallets.reduce((sum, w) => sum + w.balance, 0);
  const totalShopRevenue = transactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.serviceCharge, 0);
  const totalExpenses = transactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const netProfit = totalShopRevenue - totalExpenses;

  // Cart total
  const cartTotal = cartItems.reduce((acc, item) => acc + item.qty * item.rate, 0);

  return (
    <div className="relative min-h-screen bg-[#070b13] text-slate-100 flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Background Cyber Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,220,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,220,255,0.03)_1px,transparent_1px)] bg-[size:45px_45px]" />
      <div className="pointer-events-none absolute left-1/2 top-20 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[130px]" />

      {/* HEADER */}
      <header className="relative z-20 border-b border-slate-800/80 bg-[#070b13]/85 backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="DenBooks 360 Logo"
              className="h-10 w-10 rounded-xl shadow-lg shadow-cyan-500/25 object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">DenBooks 360</span>
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                  Interactive Sandbox
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Isolated Sample Center & Simulator</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSandbox}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-500 transition"
              title="Reset sandbox data"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Reset Sandbox</span>
            </button>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-md shadow-cyan-400/20 hover:brightness-110 transition"
            >
              <span>Get Real Account</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* SANDBOX BANNER */}
      <div className="relative z-10 border-b border-cyan-500/20 bg-cyan-950/30 px-4 py-2 text-center text-xs text-cyan-300">
        <span className="font-bold">🧪 Safe Sandbox Environment:</span> Showing sample data for{" "}
        <span className="font-semibold text-white">"Apex Digital Seva Kendra (Demo)"</span>. None of your real accounts or credentials are loaded.
      </div>

      {/* TOAST NOTIFICATION */}
      {notificationMsg && (
        <div className="fixed top-20 right-4 z-50 max-w-md rounded-2xl border border-emerald-500/40 bg-[#0e1625] p-3.5 shadow-2xl shadow-emerald-500/10 text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* MAIN SANDBOX INTERFACE */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-6 flex-1 w-full">
        {/* Role Switcher Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-[#0c1322] p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
                activeTab === "admin"
                  ? "bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutDashboard size={14} />
              <span>Owner & Admin Suite</span>
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
                activeTab === "staff"
                  ? "bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users size={14} />
              <span>Front Desk Counter POS</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive Simulator Active</span>
          </div>
        </div>

        {/* TAB 1: OWNER & ADMIN SUITE */}
        {activeTab === "admin" && (
          <div className="space-y-6">
            {/* Top Bar: Wallets + KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Portal Advance Wallets */}
              <div className="lg:col-span-5 rounded-3xl border border-slate-800/90 bg-[#0b1220]/90 p-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                    <Wallet size={15} className="text-cyan-400" />
                    <span>Portal Advance & Bank</span>
                  </div>
                  <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                    Total: ₹{totalWallets.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {wallets.map((w) => (
                    <div key={w.id} className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5">
                      <p className="text-[10px] text-slate-400 font-semibold truncate">{w.name}</p>
                      <p className="font-mono font-bold text-white text-sm mt-0.5">₹ {w.balance.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial KPIs */}
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-[#0e1625] to-[#0f231e] p-4 flex flex-col justify-between shadow-xl">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Cash in Drawer</span>
                  <p className="font-mono font-black text-white text-xl mt-1">₹ {cashDrawer.toLocaleString()}</p>
                  <p className="text-[9.5px] text-slate-400">Physical drawer cash</p>
                </div>
                <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0e1625] to-[#102336] p-4 flex flex-col justify-between shadow-xl">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase">UPI / Online</span>
                  <p className="font-mono font-black text-white text-xl mt-1">₹ {upiTotal.toLocaleString()}</p>
                  <p className="text-[9.5px] text-slate-400">GPay & PhonePe</p>
                </div>
                <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-[#0e1625] to-[#171a35] p-4 flex flex-col justify-between shadow-xl">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Shop Revenue</span>
                  <p className="font-mono font-black text-white text-xl mt-1">₹ {totalShopRevenue.toLocaleString()}</p>
                  <p className="text-[9.5px] text-slate-400">Pure processing fee</p>
                </div>
                <div className="rounded-3xl border border-teal-500/30 bg-gradient-to-br from-[#0e1625] to-[#0d2a29] p-4 flex flex-col justify-between shadow-xl">
                  <span className="text-[10px] font-bold text-teal-400 uppercase">Net Profit</span>
                  <p className="font-mono font-black text-teal-300 text-xl mt-1">₹ {netProfit.toLocaleString()}</p>
                  <p className="text-[9.5px] text-slate-400">After ₹{totalExpenses} expenses</p>
                </div>
              </div>
            </div>

            {/* Simulation Action Bar */}
            <div className="rounded-2xl border border-cyan-500/30 bg-[#0e1726] p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>Try Interactive Simulations (Click to Test)</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Click any button to see how DenBooks separates portal fee deductions from real income:
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleSimulatePassport}
                  className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition"
                >
                  ⚡ Record Fresh Passport (₹1,750)
                </button>
                <button
                  onClick={handleSimulateTopup}
                  className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 active:scale-95 transition"
                  title="Replenish wallet advance balance"
                >
                  💳 Top Up Wallet (+₹5,000)
                </button>
                <button
                  onClick={handleSimulatePOSSale}
                  className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-3.5 py-2 text-xs font-bold text-teal-300 hover:bg-teal-500/20 active:scale-95 transition"
                >
                  ⚡ Record Quick POS Sale (+₹95)
                </button>
                <button
                  onClick={handleSimulateExpense}
                  className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 active:scale-95 transition"
                >
                  📉 Record Shop Expense (-₹120)
                </button>
              </div>
            </div>

            {/* Daybook Ledger Table */}
            <div className="rounded-3xl border border-slate-800 bg-[#0b1220]/90 p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Sample Reconciled Daybook</h3>
                </div>
                <span className="font-mono text-xs text-slate-400">
                  {transactions.length} Sample Records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2.5">Time</th>
                      <th className="pb-2.5">Title & Customer</th>
                      <th className="pb-2.5">Category</th>
                      <th className="pb-2.5">Wallet / Mode</th>
                      <th className="pb-2.5 text-right">Total Amount</th>
                      <th className="pb-2.5 text-right">Shop Net</th>
                      <th className="pb-2.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/40 transition">
                        <td className="py-3 font-mono text-slate-400">{tx.time}</td>
                        <td className="py-3">
                          <p className="font-bold text-white">{tx.title}</p>
                          {tx.customerName && (
                            <p className="text-[10px] text-slate-400">Customer: {tx.customerName}</p>
                          )}
                        </td>
                        <td className="py-3">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              tx.category === "Govt Service"
                                ? "bg-cyan-950 text-cyan-300 border border-cyan-800/60"
                                : tx.category === "Counter POS"
                                ? "bg-teal-950 text-teal-300 border border-teal-800/60"
                                : "bg-rose-950 text-rose-300 border border-rose-800/60"
                            }`}
                          >
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3 text-[11px] text-slate-400">
                          {tx.walletUsed ? (
                            <span className="text-amber-300 font-mono">Deducted: {tx.walletUsed}</span>
                          ) : (
                            <span>{tx.paymentMethod}</span>
                          )}
                        </td>
                        <td className="py-3 text-right font-mono font-bold">
                          <span className={tx.amount < 0 ? "text-rose-400" : "text-emerald-400"}>
                            {tx.amount < 0 ? `- ₹${Math.abs(tx.amount)}` : `+ ₹${tx.amount}`}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-cyan-300">
                          {tx.serviceCharge > 0 ? `₹${tx.serviceCharge}` : "-"}
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {tx.amount > 0 && (
                              <button
                                onClick={() => setReceiptModalTx(tx)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1 text-[10px] font-semibold text-slate-300 hover:text-white hover:border-slate-500 transition"
                                title="Print Thermal Slip"
                              >
                                <Printer size={11} />
                                <span>Receipt</span>
                              </button>
                            )}
                            {tx.customerName && (
                              <button
                                onClick={() => setKhataModalTx(tx)}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                                title="WhatsApp Reminder"
                              >
                                <MessageCircle size={11} />
                                <span>WhatsApp</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FRONT DESK COUNTER POS */}
        {activeTab === "staff" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Quick Touch Counter POS Catalog */}
            <div className="lg:col-span-8 rounded-3xl border border-slate-800 bg-[#0b1220]/90 p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShoppingBag size={16} className="text-teal-400" />
                    <span>Quick Touch POS Counter Desk</span>
                  </h3>
                  <p className="text-xs text-slate-400">Touch items to add to immediate customer invoice</p>
                </div>
                <span className="text-[10px] font-bold text-teal-400 bg-teal-950/80 border border-teal-800/60 px-2.5 py-1 rounded-full">
                  Shift: Morning (Counter #1)
                </span>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { name: "B&W Xerox (Single)", rate: 3, unit: "page", icon: "📄" },
                  { name: "B&W Xerox (Both Sides)", rate: 5, unit: "sheet", icon: "📑" },
                  { name: "Colour Printout (A4)", rate: 10, unit: "page", icon: "🌈" },
                  { name: "Passport Photos (8x)", rate: 60, unit: "sheet", icon: "📷" },
                  { name: "PVC Smart ID Card", rate: 70, unit: "card", icon: "💳" },
                  { name: "A4 Lamination", rate: 25, unit: "sheet", icon: "🛡️" },
                  { name: "Spiral Book Binding", rate: 45, unit: "book", icon: "📚" },
                  { name: "Scan & Email/WhatsApp", rate: 20, unit: "doc", icon: "📤" },
                  { name: "Biodata / Job Typing", rate: 50, unit: "page", icon: "⌨️" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCartItems((prev) => {
                        const existing = prev.find((p) => p.name === item.name);
                        if (existing) {
                          return prev.map((p) =>
                            p.name === item.name ? { ...p, qty: p.qty + 1 } : p
                          );
                        }
                        return [...prev, { name: item.name, qty: 1, rate: item.rate }];
                      });
                      showToast(`Added ${item.name} to bill`);
                    }}
                    className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0e1625] p-3 text-left hover:border-teal-400 hover:bg-teal-950/20 active:scale-95 transition"
                  >
                    <div className="text-xl mb-1">{item.icon}</div>
                    <div>
                      <p className="font-bold text-white text-xs leading-snug">{item.name}</p>
                      <p className="font-mono text-teal-300 font-bold text-xs mt-1">₹ {item.rate} / {item.unit}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Queue Token Calling Preview */}
              <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Clock3 size={14} className="text-teal-400" />
                    <span>FCFS Queue Tokens (Live Counter Calling)</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400">3 in queue</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
                  <span className="rounded-xl border border-emerald-500/50 bg-emerald-950/70 text-emerald-300 px-3 py-1.5 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Token #101 • Serving Now (Passport)
                  </span>
                  <span className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-300">
                    Token #102 • Waiting
                  </span>
                  <span className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-300">
                    Token #103 • Waiting
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Active POS Bill & Thermal Print Checkout */}
            <div className="lg:col-span-4 rounded-3xl border border-teal-500/40 bg-gradient-to-b from-[#0b1220] to-[#0e1a26] p-5 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                    <Receipt size={14} />
                    <span>Active Counter Bill</span>
                  </h3>
                  <button
                    onClick={() => setCartItems([])}
                    className="text-[10px] font-bold text-slate-400 hover:text-rose-400 transition"
                  >
                    Clear Bill
                  </button>
                </div>

                {cartItems.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    Touch any item on the left to add to bill
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {cartItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between border-b border-slate-800/60 pb-2 text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {item.qty} x ₹{item.rate}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-teal-300">
                            ₹ {item.qty * item.rate}
                          </span>
                          <button
                            onClick={() =>
                              setCartItems((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 pt-4 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-400">Grand Total:</span>
                  <span className="font-mono font-black text-2xl text-white">₹ {cartTotal}</span>
                </div>

                <button
                  disabled={cartItems.length === 0 || cartTotal <= 0}
                  onClick={() => {
                    if (cartTotal <= 0) {
                      showToast("❌ Cannot Save: Bill amount cannot be ₹0. Add items to cart.");
                      return;
                    }
                    const newTx: SandboxTransaction = {
                      id: `tx-${Date.now()}`,
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      title: `Counter POS Bill (${cartItems.length} items)`,
                      category: "Counter POS",
                      amount: cartTotal,
                      govtFee: 0,
                      serviceCharge: cartTotal,
                      paymentMethod: "Cash",
                      customerName: "Walk-in Customer",
                    };
                    setCashDrawer((prev) => prev + cartTotal);
                    setTransactions((prev) => [newTx, ...prev]);
                    showToast(`✅ Counter Bill Saved: +₹${cartTotal} added to cash drawer!`);
                    setCartItems([]);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 py-3 text-xs font-black text-slate-950 hover:brightness-110 active:scale-95 disabled:opacity-40 transition shadow-lg shadow-teal-500/20"
                >
                  <Printer size={15} />
                  <span>Collect ₹{cartTotal} & 1-Click Print</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: THERMAL RECEIPT PREVIEW */}
      {receiptModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setReceiptModalTx(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            {/* Simulated 58mm Thermal Receipt Strip */}
            <div className="rounded-xl border border-slate-700 bg-white p-4 font-mono text-slate-950 text-xs shadow-inner">
              <div className="text-center border-b border-dashed border-slate-400 pb-2 mb-2">
                <h4 className="font-black text-sm uppercase">APEX DIGITAL SEVA KENDRA</h4>
                <p className="text-[10px] text-slate-600">Sample CSC & Citizen Services Hub</p>
                <p className="text-[10px] text-slate-600">GST: 32AABCU9603R1ZM</p>
              </div>

              <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-400 pb-2 mb-2">
                <div className="flex justify-between">
                  <span>Bill #: INV-2026-DEMO</span>
                  <span>{receiptModalTx.time}</span>
                </div>
                {receiptModalTx.customerName && (
                  <div>Customer: {receiptModalTx.customerName}</div>
                )}
                <div>Pay Mode: {receiptModalTx.paymentMethod}</div>
              </div>

              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-400 pb-2 mb-2">
                <div className="flex justify-between font-bold">
                  <span>{receiptModalTx.title}</span>
                  <span>₹{receiptModalTx.amount}</span>
                </div>
                {receiptModalTx.govtFee > 0 && (
                  <div className="text-[9.5px] text-slate-600 pl-2">
                    • Govt Portal Fee: ₹{receiptModalTx.govtFee}
                  </div>
                )}
                {receiptModalTx.serviceCharge > 0 && (
                  <div className="text-[9.5px] text-slate-600 pl-2">
                    • Center Service Fee: ₹{receiptModalTx.serviceCharge}
                  </div>
                )}
              </div>

              <div className="flex justify-between font-black text-sm">
                <span>TOTAL PAID:</span>
                <span>₹{receiptModalTx.amount}</span>
              </div>

              <div className="text-center text-[9px] text-slate-500 mt-3 pt-2 border-t border-dashed border-slate-400">
                Thank you for visiting Apex Seva Kendra!
                <br />
                Powered by DenBooks 360
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  showToast("Simulating 58mm / 80mm thermal print...");
                  setReceiptModalTx(null);
                }}
                className="flex-1 rounded-xl bg-cyan-400 py-2.5 text-xs font-black text-slate-950 hover:brightness-110"
              >
                Send to Thermal Printer
              </button>
              <button
                onClick={() => setReceiptModalTx(null)}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: WHATSAPP KHATA REMINDER PREVIEW */}
      {khataModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-3xl border border-emerald-500/30 bg-[#0e1625] p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setKhataModalTx(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold text-sm">
              <MessageCircle size={18} />
              <span>1-Click WhatsApp Payment Reminder</span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              DenBooks formats instant professional WhatsApp reminders with customer name, amount, and center UPI QR:
            </p>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-3.5 text-xs text-emerald-200 font-mono leading-relaxed">
              Hello {khataModalTx.customerName || "Customer"}, gentle reminder from Apex Digital Seva Kendra regarding pending payment of ₹{khataModalTx.amount} for "{khataModalTx.title}". You can pay via UPI to payments@apexseva. Thank you!
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  showToast("WhatsApp reminder simulator triggered!");
                  setKhataModalTx(null);
                }}
                className="flex-1 rounded-xl bg-emerald-400 py-2.5 text-xs font-black text-slate-950 hover:brightness-110"
              >
                Open WhatsApp Preview
              </button>
              <button
                onClick={() => setKhataModalTx(null)}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-800 px-6 py-6 text-center text-xs text-slate-500">
        <p>© 2026 DenBooks 360 Interactive Sandbox. All simulated balances and entries reset on reload.</p>
      </footer>
    </div>
  );
}
