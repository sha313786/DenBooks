"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Receipt,
  LogOut,
  Sparkles,
  Settings,
  X,
  CheckCircle2,
  Phone,
  MapPin,
  Building,
  User,
  Users,
  FileText,
  ShoppingBag,
  Clock3,
  CreditCard,
  LayoutDashboard,
  Landmark,
  Plus,
  Trash2,
  Edit2,
  KeyRound,
  Eye,
  EyeOff,
  Shield,
  Check,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  UserPlus,
  Copy,
  Wallet,
  Lock,
  Unlock,
  QrCode,
  MessageSquare,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
} from "lucide-react";
import {
  Employee,
  EmployeeRole,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/lib/services/employee.service";
import {
  PortalWallet,
  PaymentMethod,
  getPortalWallets,
  createPortalWallet,
  updatePortalWallet,
  deletePortalWallet,
  topupPortalWallet,
} from "@/lib/services/accounts.service";
import {
  TenantSubscription,
  SuperAdminConfig,
  getCurrentTenantSubscription,
  saveTenantSubscription,
  submitPaymentUTR,
  generateUpiUri,
  generateQrCodeImageUrl,
  getSuperAdminConfig,
  getDaysRemaining,
  extendTenantSubscription,
} from "@/lib/services/subscription.service";
import {
  StaffAttendanceRecord,
  getDailyAttendance,
} from "@/lib/services/attendance.service";

interface AdminHeaderLayoutProps {
  children: React.ReactNode;
}

export default function AdminHeaderLayout({ children }: AdminHeaderLayoutProps) {
  const pathname = usePathname();
  const [shopName, setShopName] = useState("My CSC Center");
  const [ownerName, setOwnerName] = useState("Owner");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [stateName, setStateName] = useState("Kerala");
  const [trialDaysLeft, setTrialDaysLeft] = useState(14);

  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"profile" | "staff" | "attendance" | "wallets" | "subscription">("profile");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [centerCode, setCenterCode] = useState("KNR059");

  // --- Attendance State ---
  const [attendanceList, setAttendanceList] = useState<StaffAttendanceRecord[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // --- Subscription & Payment State ---
  const [subState, setSubState] = useState<TenantSubscription | null>(null);
  const [superConfig, setSuperConfig] = useState<SuperAdminConfig>(getSuperAdminConfig());
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const [utrInput, setUtrInput] = useState("");
  const [utrNotes, setUtrNotes] = useState("");
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [utrSuccessMsg, setUtrSuccessMsg] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  // --- Staff Management State ---
  const [staffList, setStaffList] = useState<Employee[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffRole, setStaffRole] = useState<EmployeeRole>("Counter Staff");
  const [staffPin, setStaffPin] = useState("1234");
  const [staffIsActive, setStaffIsActive] = useState(true);
  const [staffPerms, setStaffPerms] = useState({
    canCreateInvoice: true,
    canManageRequests: false,
    canSettleCredit: true,
    canIssueTokens: false,
    canRecordExpense: true,
  });
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});
  const [copiedStaffLink, setCopiedStaffLink] = useState(false);
  const [staffActionMsg, setStaffActionMsg] = useState("");

  // --- Wallet / Bank Accounts State ---
  const [walletList, setWalletList] = useState<PortalWallet[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [showWalletForm, setShowWalletForm] = useState(false);
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [walletName, setWalletName] = useState("");
  const [walletCategory, setWalletCategory] = useState<"Govt Portal" | "Utility" | "Banking" | "Other">("Govt Portal");
  const [walletBalance, setWalletBalance] = useState("0");
  const [walletMinAlert, setWalletMinAlert] = useState("1000");
  const [walletActionMsg, setWalletActionMsg] = useState("");

  // --- Top-up Quick State ---
  const [topupTargetWallet, setTopupTargetWallet] = useState<PortalWallet | null>(null);
  const [topupAmount, setTopupAmount] = useState("2000");
  const [topupMethod, setTopupMethod] = useState<PaymentMethod>("UPI");
  const [savingTopup, setSavingTopup] = useState(false);

  // Load Tenant Profile
  function loadTenantData() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("denbooks_current_tenant");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.name) setShopName(parsed.name);
          if (parsed.owner) setOwnerName(parsed.owner);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.address) setAddress(parsed.address);
          if (parsed.state) setStateName(parsed.state);
          if (parsed.centerCode) setCenterCode(parsed.centerCode);
          if (parsed.trialDaysLeft !== undefined) setTrialDaysLeft(parsed.trialDaysLeft);
        } catch {}
      }
    }
  }

  async function loadAttendanceData(dateStr?: string) {
    setLoadingAttendance(true);
    try {
      const records = await getDailyAttendance(dateStr || attendanceDate);
      setAttendanceList(records);
    } catch (e) {
      console.warn("Attendance load error:", e);
    } finally {
      setLoadingAttendance(false);
    }
  }

  // Load Subscription & Super Config
  function loadSubscriptionData() {
    const sub = getCurrentTenantSubscription();
    setSubState(sub);
    setSuperConfig(getSuperAdminConfig());
    if (sub.trial_ends_at) {
      setTrialDaysLeft(getDaysRemaining(sub.trial_ends_at));
    }
  }

  // Real-time automatic listener for changes across settings, tabs, or Super Admin
  useEffect(() => {
    loadSubscriptionData();
    loadTenantData();

    function handleAutoSync() {
      loadSubscriptionData();
      loadTenantData();
      loadSettingsData();
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleAutoSync);
      window.addEventListener("denbooks_config_updated", handleAutoSync);
      window.addEventListener("denbooks_tenant_updated", handleAutoSync);
    }

    const timer = setInterval(() => {
      loadSubscriptionData();
    }, 4000);

    return () => {
      clearInterval(timer);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleAutoSync);
        window.removeEventListener("denbooks_config_updated", handleAutoSync);
        window.removeEventListener("denbooks_tenant_updated", handleAutoSync);
      }
    };
  }, []);

  async function handleUtrSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!utrInput.trim() || utrInput.trim().length < 6) {
      alert("Please enter a valid 12-digit UPI UTR transaction reference.");
      return;
    }
    setSubmittingUtr(true);
    try {
      const amount = selectedPlan === "yearly" ? superConfig.yearly_price : superConfig.monthly_price;
      await submitPaymentUTR({
        plan: selectedPlan,
        amount,
        utrNumber: utrInput.trim(),
        notes: utrNotes.trim() || undefined,
      });
      setUtrSuccessMsg("UTR submitted successfully! Super Admin notified for instant manual approval.");
      setUtrInput("");
      setUtrNotes("");
      loadSubscriptionData();
      setTimeout(() => setUtrSuccessMsg(""), 6000);
    } catch (err: any) {
      alert("Error submitting UTR: " + (err?.message || err));
    } finally {
      setSubmittingUtr(false);
    }
  }


  function copyUpiId() {
    navigator.clipboard.writeText(superConfig.upi_id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  }

  // Load Staff and Wallet data whenever Settings modal opens
  async function loadSettingsData() {
    setLoadingStaff(true);
    setLoadingWallets(true);
    try {
      const [emps, wList] = await Promise.all([
        getEmployees(),
        getPortalWallets(),
      ]);
      setStaffList(emps);
      setWalletList(wList);
    } catch (e) {
      console.warn("Error loading settings data:", e);
    } finally {
      setLoadingStaff(false);
      setLoadingWallets(false);
    }
  }

  useEffect(() => {
    if (showSettings) {
      loadSettingsData();
      loadSubscriptionData();
      loadTenantData();
    }
  }, [showSettings]);

  // Profile Save with immediate live sync across subscription and other tabs
  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    const cleanShop = shopName.trim() || "My CSC Center";
    const cleanOwner = ownerName.trim() || "Owner";
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim();
    const cleanState = stateName;

    const updated = {
      name: cleanShop,
      owner: cleanOwner,
      phone: cleanPhone,
      address: cleanAddress,
      state: cleanState,
      centerCode: (centerCode || "KNR059").trim().toUpperCase(),
      trialDaysLeft,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("denbooks_current_tenant", JSON.stringify(updated));

      // Also sync into subscription state immediately
      const sub = getCurrentTenantSubscription();
      sub.shop_name = cleanShop;
      sub.owner_name = cleanOwner;
      sub.owner_phone = cleanPhone;
      sub.state = cleanState;
      saveTenantSubscription(sub);
      setSubState({ ...sub });

      // Broadcast changes so any open modal or tab re-renders instantly
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("denbooks_tenant_updated", { detail: updated }));
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 1500);
  }

  // --- Staff Actions ---
  function handleOpenAddStaff() {
    setEditingStaffId(null);
    setStaffName("");
    setStaffPhone("");
    setStaffEmail("");
    setStaffRole("Counter Staff");
    setStaffPin(Math.floor(1000 + Math.random() * 9000).toString());
    setStaffIsActive(true);
    setStaffPerms({
      canCreateInvoice: true,
      canManageRequests: false,
      canSettleCredit: true,
      canIssueTokens: false,
      canRecordExpense: true,
    });
    setShowStaffForm(true);
  }

  function handleOpenEditStaff(emp: Employee) {
    setEditingStaffId(emp.id);
    setStaffName(emp.name);
    setStaffPhone(emp.phone);
    setStaffEmail(emp.email || "");
    setStaffRole(emp.role);
    setStaffPin(emp.pin);
    setStaffIsActive(emp.isActive);
    setStaffPerms({
      canCreateInvoice: emp.permissions?.canCreateInvoice ?? true,
      canManageRequests: emp.permissions?.canManageRequests ?? false,
      canSettleCredit: emp.permissions?.canSettleCredit ?? true,
      canIssueTokens: emp.permissions?.canIssueTokens ?? false,
      canRecordExpense: emp.permissions?.canRecordExpense ?? true,
    });
    setShowStaffForm(true);
  }

  async function handleSaveStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!staffName.trim()) return;

    try {
      if (editingStaffId) {
        await updateEmployee(editingStaffId, {
          name: staffName.trim(),
          phone: staffPhone.trim(),
          email: staffEmail.trim() || undefined,
          role: staffRole,
          pin: staffPin.trim() || "1234",
          isActive: staffIsActive,
          permissions: {
            canCreateInvoice: staffPerms.canCreateInvoice,
            canManageRequests: staffPerms.canManageRequests,
            canSettleCredit: staffPerms.canSettleCredit,
            canViewDaybookSummary: true,
            canIssueTokens: staffPerms.canIssueTokens,
            canRecordExpense: staffPerms.canRecordExpense,
          },
        });
        setStaffActionMsg("Staff member updated successfully!");
      } else {
        await createEmployee({
          name: staffName.trim(),
          phone: staffPhone.trim(),
          email: staffEmail.trim() || undefined,
          role: staffRole,
          pin: staffPin.trim() || "1234",
          isActive: staffIsActive,
          permissions: {
            canCreateInvoice: staffPerms.canCreateInvoice,
            canManageRequests: staffPerms.canManageRequests,
            canSettleCredit: staffPerms.canSettleCredit,
            canViewDaybookSummary: true,
            canIssueTokens: staffPerms.canIssueTokens,
            canRecordExpense: staffPerms.canRecordExpense,
          },
        });
        setStaffActionMsg("New staff member added successfully!");
      }

      setShowStaffForm(false);
      const updated = await getEmployees();
      setStaffList(updated);
      setTimeout(() => setStaffActionMsg(""), 2000);
    } catch (err: any) {
      alert("Error saving staff: " + (err?.message || err));
    }
  }

  async function handleDeleteStaff(id: string) {
    if (!confirm("Are you sure you want to remove this staff member?")) return;
    try {
      await deleteEmployee(id);
      const updated = await getEmployees();
      setStaffList(updated);
      setStaffActionMsg("Staff member removed.");
      setTimeout(() => setStaffActionMsg(""), 2000);
    } catch (err: any) {
      alert("Error removing staff: " + (err?.message || err));
    }
  }

  async function handleToggleStaffActive(emp: Employee) {
    try {
      await updateEmployee(emp.id, { isActive: !emp.isActive });
      const updated = await getEmployees();
      setStaffList(updated);
    } catch (err: any) {
      alert("Error updating status: " + (err?.message || err));
    }
  }

  function handleCopyStaffLink() {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/staff/login`;
      navigator.clipboard.writeText(url);
      setCopiedStaffLink(true);
      setTimeout(() => setCopiedStaffLink(false), 2000);
    }
  }

  // --- Wallet / Bank Actions ---
  function handleOpenAddWallet() {
    setEditingWalletId(null);
    setWalletName("");
    setWalletCategory("Govt Portal");
    setWalletBalance("0");
    setWalletMinAlert("1000");
    setShowWalletForm(true);
  }

  function handleOpenEditWallet(w: PortalWallet) {
    setEditingWalletId(w.id);
    setWalletName(w.name);
    setWalletCategory(w.category as any);
    setWalletBalance(w.balance.toString());
    setWalletMinAlert(w.min_alert_balance.toString());
    setShowWalletForm(true);
  }

  async function handleSaveWallet(e: React.FormEvent) {
    e.preventDefault();
    if (!walletName.trim()) return;

    try {
      const bal = parseFloat(walletBalance) || 0;
      const minAlert = parseFloat(walletMinAlert) || 500;

      if (editingWalletId) {
        await updatePortalWallet(editingWalletId, {
          name: walletName.trim(),
          category: walletCategory,
          balance: bal,
          min_alert_balance: minAlert,
        });
        setWalletActionMsg("Account details updated successfully!");
      } else {
        await createPortalWallet({
          name: walletName.trim(),
          category: walletCategory,
          balance: bal,
          min_alert_balance: minAlert,
        });
        setWalletActionMsg("New bank / portal account created!");
      }

      setShowWalletForm(false);
      const updated = await getPortalWallets();
      setWalletList(updated);
      setTimeout(() => setWalletActionMsg(""), 2000);
    } catch (err: any) {
      alert("Error saving account: " + (err?.message || err));
    }
  }

  async function handleDeleteWallet(id: string) {
    if (!confirm("Are you sure you want to delete this bank/portal account?")) return;
    try {
      await deletePortalWallet(id);
      const updated = await getPortalWallets();
      setWalletList(updated);
      setWalletActionMsg("Account deleted.");
      setTimeout(() => setWalletActionMsg(""), 2000);
    } catch (err: any) {
      alert("Error deleting account: " + (err?.message || err));
    }
  }

  async function handleExecuteTopup(e: React.FormEvent) {
    e.preventDefault();
    if (!topupTargetWallet) return;
    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid top-up amount.");
      return;
    }

    setSavingTopup(true);
    try {
      await topupPortalWallet(topupTargetWallet.id, amt, topupMethod);
      const updated = await getPortalWallets();
      setWalletList(updated);
      setTopupTargetWallet(null);
      setWalletActionMsg(`Deposited ₹${amt} to ${topupTargetWallet.name}!`);
      setTimeout(() => setWalletActionMsg(""), 2000);
    } catch (err: any) {
      alert("Error depositing balance: " + (err?.message || err));
    } finally {
      setSavingTopup(false);
    }
  }

  const navLinks = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Daybook", href: "/dashboard/daybook", icon: FileText },
    { label: "Counter POS", href: "/dashboard/pos", icon: ShoppingBag },
    { label: "Customer Khata", href: "/dashboard/khata", icon: Clock3 },
    { label: "Manage Staff", href: "/dashboard/staff", icon: Users },
  ];

  // Dynamic pricing calculations based on live Super Admin settings
  const currentPlanAmount = selectedPlan === "yearly" ? superConfig.yearly_price : superConfig.monthly_price;
  const yearlyPerMonth = Math.round((superConfig.yearly_price || 3999) / 12);
  const yearlySavingsPct =
    superConfig.monthly_price * 12 > superConfig.yearly_price
      ? Math.round(
          ((superConfig.monthly_price * 12 - superConfig.yearly_price) /
            (superConfig.monthly_price * 12)) *
            100
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* SaaS Top Header */}
      <header className="border-b border-slate-800/80 bg-[#0e1526]/90 backdrop-blur-md px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex h-9 w-9 shrink-0 items-center justify-center group">
            <img
              src="/logo.png"
              alt="DenBooks Logo"
              className="h-9 w-9 rounded-xl shadow-md shadow-cyan-500/25 object-cover group-hover:scale-105 transition"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-white">{shopName}</span>
              <span className="text-[10px] font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} />
                <span>Admin Suite</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {ownerName} • <span className="text-slate-300">{stateName}</span>
            </p>
          </div>
        </div>

        {/* Dedicated Module Navigation Links */}
        <nav className="flex items-center rounded-xl border border-slate-800/90 bg-[#121b2f] p-1 overflow-x-auto max-w-full shadow-inner">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                  isActive
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Subscription Status Indicator */}
          {subState && (
            <button
              type="button"
              onClick={() => {
                setSettingsTab("subscription");
                setShowSettings(true);
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition shadow-sm ${
                subState.is_locked || subState.status === "expired"
                  ? "border-rose-500/50 bg-rose-500/15 text-rose-300 animate-pulse hover:bg-rose-500/25"
                  : subState.status === "trial"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
              }`}
              title="Click to view subscription & UPI QR code"
            >
              {subState.is_locked || subState.status === "expired" ? (
                <>
                  <Lock size={12} />
                  <span>Renew Now</span>
                </>
              ) : subState.status === "trial" ? (
                <>
                  <Clock3 size={12} />
                  <span>Trial: {getDaysRemaining(subState.subscription_expires_at)}d left</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={12} />
                  <span>Pro: {getDaysRemaining(subState.subscription_expires_at)}d</span>
                </>
              )}
            </button>
          )}

          {/* Front Desk Shortcut */}
          <Link
            href="/staff"
            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/40 bg-teal-500/10 px-3 py-1.5 text-xs font-bold text-teal-300 hover:bg-teal-500/20 hover:border-teal-400 transition shadow-sm"
          >
            <span>Front Desk &rarr;</span>
          </Link>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-500 hover:text-white transition shadow-sm"
            title="Center Profile, Staff, Wallets & Subscription"
          >
            <Settings size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Super Admin Master Link */}
          <Link
            href="/admin/super"
            className="p-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition shadow-sm"
            title="Super Admin Master Dashboard"
          >
            <Shield size={14} />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition ml-1 px-2 py-1 rounded-lg hover:bg-slate-800/50"
            title="Exit Admin"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Exit</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6">
        {children}
      </main>

      {/* COMPREHENSIVE SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 md:p-6 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl rounded-3xl border border-slate-800 bg-[#0c1322] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-[#10182b] px-6 py-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                  {settingsTab === "profile" && <Settings size={18} />}
                  {settingsTab === "staff" && <Users size={18} />}
                  {settingsTab === "attendance" && <Clock3 size={18} />}
                  {settingsTab === "wallets" && <Landmark size={18} />}
                  {settingsTab === "subscription" && <CreditCard size={18} />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    {settingsTab === "profile" && "Center Profile & Settings"}
                    {settingsTab === "staff" && "Staff & Operator Management"}
                    {settingsTab === "attendance" && "Staff Daily Attendance Register"}
                    {settingsTab === "wallets" && "Bank & Portal Accounts"}
                    {settingsTab === "subscription" && "Subscription & Payment Management"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {settingsTab === "profile" && "Configure shop details printed on thermal receipts and invoices."}
                    {settingsTab === "staff" && "Manage front desk staff logins, PIN codes, and desk permissions."}
                    {settingsTab === "attendance" && "View operator punch-in/out timestamps, shift hours, and daily attendance."}
                    {settingsTab === "wallets" && "Monitor and configure digital portal balances and bank accounts."}
                    {settingsTab === "subscription" && "Direct UPI QR payment, plan selection, and UTR verification status."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSettings(false);
                  setShowStaffForm(false);
                  setShowWalletForm(false);
                  setTopupTargetWallet(null);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Settings Tab Navigation */}
            <div className="flex border-b border-slate-800 bg-[#080e1b] px-6 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSettingsTab("profile")}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition whitespace-nowrap ${
                  settingsTab === "profile"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-950/20"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Building size={14} />
                <span>Center Profile</span>
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab("staff")}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition whitespace-nowrap ${
                  settingsTab === "staff"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-950/20"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Users size={14} />
                <span>Staff Management</span>
                <span className="rounded-full bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-[10px] text-slate-300 font-mono">
                  {staffList.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSettingsTab("attendance");
                  loadAttendanceData();
                }}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition whitespace-nowrap ${
                  settingsTab === "attendance"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-950/20"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Clock3 size={14} />
                <span>Daily Attendance</span>
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab("wallets")}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition whitespace-nowrap ${
                  settingsTab === "wallets"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-950/20"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Landmark size={14} />
                <span>Bank & Wallets</span>
                <span className="rounded-full bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-[10px] text-slate-300 font-mono">
                  {walletList.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab("subscription")}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition whitespace-nowrap ${
                  settingsTab === "subscription"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-950/20"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <CreditCard size={14} />
                <span>Subscription & Billing</span>
                {subState && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                    subState.is_locked || subState.status === "expired"
                      ? "bg-rose-950 text-rose-300 border border-rose-800"
                      : subState.status === "trial"
                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                      : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  }`}>
                    {subState.is_locked
                      ? "Locked"
                      : subState.status === "trial"
                      ? `${getDaysRemaining(subState.subscription_expires_at)}d Trial`
                      : "Pro"}
                  </span>
                )}
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* TAB 1: CENTER PROFILE */}
              {settingsTab === "profile" && (
                <div>
                  {saveSuccess && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 animate-fadeIn">
                      <CheckCircle2 size={16} />
                      <span>Center profile settings saved successfully!</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                        <Building size={14} className="text-cyan-400" />
                        <span>Shop / Center Name</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="e.g. Apex Digital Seva Center"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                          <User size={14} className="text-cyan-400" />
                          <span>Owner / Operator Name</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          placeholder="e.g. Rajesh Kumar"
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                          <Phone size={14} className="text-cyan-400" />
                          <span>Contact Phone / WhatsApp</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                          <MapPin size={14} className="text-cyan-400" />
                          <span>State</span>
                        </label>
                        <select
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                        >
                          <option value="Kerala">Kerala</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Other">Other State</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                          <MapPin size={14} className="text-cyan-400" />
                          <span>Address / Town</span>
                        </label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. Main Market, Near Bus Stand"
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Center Identifier / Invoice Prefix Code */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-cyan-400" />
                          <span>Center Audit Code / Invoice Prefix *</span>
                        </label>
                        <span className="font-mono text-[11px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded">
                          Preview: INV/{centerCode || "KNR059"}/6728
                        </span>
                      </div>
                      <input
                        type="text"
                        value={centerCode}
                        onChange={(e) => setCenterCode(e.target.value.toUpperCase())}
                        placeholder="e.g. KNR059, CSC4821, AKSHAYA-01"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-mono font-bold text-cyan-300 placeholder-slate-500 focus:border-cyan-400 focus:outline-none uppercase"
                      />
                      <p className="text-[10px] text-slate-400 mt-1.5">
                        Matches your official government center code (like Akshaya or CSC). Printed on all citizen bills and thermal receipts.
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowSettings(false)}
                        className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-cyan-400 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition shadow-md shadow-cyan-400/20"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: STAFF MANAGEMENT */}
              {settingsTab === "staff" && (
                <div className="space-y-4">
                  {staffActionMsg && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                      <CheckCircle2 size={15} />
                      <span>{staffActionMsg}</span>
                    </div>
                  )}

                  {/* Staff Top Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Registered Front Desk Staff:</span>
                      <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                        {staffList.length} Active Operators
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyStaffLink}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-500 transition"
                        title="Copy Staff Login URL (/staff/login)"
                      >
                        {copiedStaffLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span>{copiedStaffLink ? "Link Copied!" : "Copy Login Link"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenAddStaff}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition shadow-sm"
                      >
                        <UserPlus size={14} />
                        <span>Add New Staff</span>
                      </button>
                    </div>
                  </div>

                  {/* Add / Edit Staff Form Drawer */}
                  {showStaffForm && (
                    <div className="rounded-2xl border border-cyan-500/40 bg-[#0e1728] p-4 space-y-3.5 shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          <UserPlus size={14} />
                          <span>{editingStaffId ? "Edit Staff Member" : "Add New Front Desk Operator"}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowStaffForm(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      <form onSubmit={handleSaveStaff} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Name *</label>
                            <input
                              type="text"
                              required
                              value={staffName}
                              onChange={(e) => setStaffName(e.target.value)}
                              placeholder="e.g. Rahul Verma"
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Role</label>
                            <select
                              value={staffRole}
                              onChange={(e) => setStaffRole(e.target.value as EmployeeRole)}
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none"
                            >
                              <option value="Counter Staff">Counter Staff (Desk)</option>
                              <option value="Operator">Operator (Services)</option>
                              <option value="Receptionist">Receptionist (Front)</option>
                              <option value="Branch Supervisor">Branch Supervisor (Admin)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Mobile Phone</label>
                            <input
                              type="tel"
                              value={staffPhone}
                              onChange={(e) => setStaffPhone(e.target.value)}
                              placeholder="e.g. 9876543210"
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-slate-300 block mb-1">4-Digit Login PIN *</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                required
                                maxLength={6}
                                value={staffPin}
                                onChange={(e) => setStaffPin(e.target.value)}
                                placeholder="1234"
                                className="w-full font-mono text-center tracking-widest font-black rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-cyan-300 focus:border-cyan-400 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setStaffPin(Math.floor(1000 + Math.random() * 9000).toString())}
                                className="rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white"
                                title="Generate Random PIN"
                              >
                                Auto
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Permissions Toggles */}
                        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-2">
                          <label className="text-[11px] font-bold text-slate-300 block">Operator Permissions:</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={staffPerms.canCreateInvoice}
                                onChange={(e) => setStaffPerms({ ...staffPerms, canCreateInvoice: e.target.checked })}
                                className="rounded accent-cyan-400"
                              />
                              <span>Create Invoices & POS Bills</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={staffPerms.canManageRequests}
                                onChange={(e) => setStaffPerms({ ...staffPerms, canManageRequests: e.target.checked })}
                                className="rounded accent-cyan-400"
                              />
                              <span>Process Service Requests</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={staffPerms.canSettleCredit}
                                onChange={(e) => setStaffPerms({ ...staffPerms, canSettleCredit: e.target.checked })}
                                className="rounded accent-cyan-400"
                              />
                              <span>Settle Customer Khata</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={staffPerms.canRecordExpense}
                                onChange={(e) => setStaffPerms({ ...staffPerms, canRecordExpense: e.target.checked })}
                                className="rounded accent-cyan-400"
                              />
                              <span>Record Cash Drawer Expenses</span>
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowStaffForm(false)}
                            className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="rounded-xl bg-cyan-400 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 shadow-sm"
                          >
                            {editingStaffId ? "Save Changes" : "Create Operator"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Staff List */}
                  {loadingStaff ? (
                    <div className="text-center py-8 text-xs text-slate-400">Loading staff records...</div>
                  ) : staffList.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center space-y-2">
                      <Users size={32} className="mx-auto text-slate-600" />
                      <p className="text-xs font-bold text-slate-300">No Staff Members Registered Yet</p>
                      <p className="text-[11px] text-slate-500">
                        Add your operators and cashiers so they can log in via PIN at /staff/login.
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenAddStaff}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-3.5 py-1.5 text-xs font-bold text-slate-950"
                      >
                        <UserPlus size={14} />
                        <span>Add First Staff</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-2.5">
                      {staffList.map((emp) => {
                        const isPinVisible = !!visiblePins[emp.id];
                        return (
                          <div
                            key={emp.id}
                            className={`rounded-2xl border p-3.5 flex flex-wrap items-center justify-between gap-3 transition ${
                              emp.isActive
                                ? "border-slate-800/90 bg-[#0e1626]"
                                : "border-slate-800/50 bg-slate-950/40 opacity-70"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-xs">
                                {emp.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-xs">{emp.name}</span>
                                  <span className="rounded-md border border-cyan-800/50 bg-cyan-950/80 px-1.5 py-0.5 text-[9.5px] font-bold text-cyan-300">
                                    {emp.role}
                                  </span>
                                  {!emp.isActive && (
                                    <span className="rounded-md bg-rose-950/80 border border-rose-800/50 px-1.5 py-0.5 text-[9.5px] font-bold text-rose-300">
                                      Suspended
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                  Phone: {emp.phone || "Not set"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* PIN display */}
                              <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs">
                                <KeyRound size={12} className="text-slate-400" />
                                <span className="font-mono font-bold text-cyan-300">
                                  {isPinVisible ? emp.pin : "••••"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setVisiblePins({ ...visiblePins, [emp.id]: !isPinVisible })}
                                  className="text-slate-400 hover:text-white ml-1"
                                  title="Toggle PIN Visibility"
                                >
                                  {isPinVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                                </button>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStaffActive(emp)}
                                  className={`rounded-lg border px-2 py-1 text-[11px] font-bold transition ${
                                    emp.isActive
                                      ? "border-emerald-500/30 text-emerald-400 hover:border-emerald-500"
                                      : "border-slate-700 text-slate-400 hover:text-white"
                                  }`}
                                  title={emp.isActive ? "Click to Suspend" : "Click to Activate"}
                                >
                                  {emp.isActive ? "Active" : "Activate"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditStaff(emp)}
                                  className="rounded-lg border border-slate-700 p-1.5 text-slate-300 hover:border-slate-500 hover:text-white transition"
                                  title="Edit Staff"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStaff(emp.id)}
                                  className="rounded-lg border border-rose-500/30 p-1.5 text-rose-400 hover:border-rose-500 transition"
                                  title="Remove Staff"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-2 text-right">
                    <Link
                      href="/dashboard/staff"
                      onClick={() => setShowSettings(false)}
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                    >
                      <span>Open Full Employee Management Hub</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB: DAILY ATTENDANCE REGISTER */}
              {settingsTab === "attendance" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Daily Staff Attendance</span>
                      <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                        {attendanceList.length} Punched Today
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => {
                          setAttendanceDate(e.target.value);
                          loadAttendanceData(e.target.value);
                        }}
                        className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => loadAttendanceData(attendanceDate)}
                        className="p-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
                        title="Refresh attendance"
                      >
                        <RefreshCw size={13} className={loadingAttendance ? "animate-spin" : ""} />
                      </button>
                    </div>
                  </div>

                  {loadingAttendance ? (
                    <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
                      <RefreshCw size={16} className="animate-spin text-cyan-400" />
                      <span>Loading attendance records...</span>
                    </div>
                  ) : attendanceList.length === 0 ? (
                    <div className="py-8 text-center rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6">
                      <Clock3 size={28} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-xs font-semibold text-slate-300">No punch records found for {attendanceDate}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Staff punch in automatically via the Front Desk counter interface.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-800 bg-[#121b2f] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <tr>
                            <th className="px-3 py-2.5">Staff Name</th>
                            <th className="px-3 py-2.5">Role</th>
                            <th className="px-3 py-2.5">Punch In</th>
                            <th className="px-3 py-2.5">Punch Out</th>
                            <th className="px-3 py-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-200">
                          {attendanceList.map((rec) => (
                            <tr key={rec.id} className="hover:bg-slate-800/40">
                              <td className="px-3 py-2 font-bold text-white">{rec.employee_name}</td>
                              <td className="px-3 py-2 text-slate-400">{rec.role}</td>
                              <td className="px-3 py-2 font-mono text-emerald-400 font-semibold">{rec.punch_in || "—"}</td>
                              <td className="px-3 py-2 font-mono text-cyan-400">{rec.punch_out || "Active"}</td>
                              <td className="px-3 py-2">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  rec.status === "Present"
                                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                    : "bg-amber-950 text-amber-300 border border-amber-800"
                                }`}>
                                  {rec.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BANK & WALLETS MANAGEMENT */}
              {settingsTab === "wallets" && (
                <div className="space-y-4">
                  {walletActionMsg && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                      <CheckCircle2 size={15} />
                      <span>{walletActionMsg}</span>
                    </div>
                  )}

                  {/* Wallet Top Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Bank Accounts & Portals:</span>
                      <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                        Total: ₹{walletList.reduce((s, w) => s + w.balance, 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenAddWallet}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition shadow-sm"
                    >
                      <Plus size={14} />
                      <span>Add Bank / Portal</span>
                    </button>
                  </div>

                  {/* Add / Edit Wallet Form */}
                  {showWalletForm && (
                    <div className="rounded-2xl border border-cyan-500/40 bg-[#0e1728] p-4 space-y-3.5 shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          <Landmark size={14} />
                          <span>{editingWalletId ? "Edit Account Details" : "Add New Bank / Portal Account"}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowWalletForm(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      <form onSubmit={handleSaveWallet} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                              Account / Portal Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={walletName}
                              onChange={(e) => setWalletName(e.target.value)}
                              placeholder="e.g. State Bank of India or UTIITSL PAN"
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Category</label>
                            <select
                              value={walletCategory}
                              onChange={(e) => setWalletCategory(e.target.value as any)}
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none"
                            >
                              <option value="Govt Portal">Govt Portal (CSC, e-District)</option>
                              <option value="Banking">Banking (SBI, Current A/c, AEPS)</option>
                              <option value="Utility">Utility (Electricity, Water, Bills)</option>
                              <option value="Other">Other Wallet</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                              {editingWalletId ? "Current Balance (₹)" : "Initial Balance (₹)"}
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={walletBalance}
                              onChange={(e) => setWalletBalance(e.target.value)}
                              placeholder="0"
                              className="w-full font-mono font-bold rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-emerald-400 focus:border-cyan-400 outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                              Min Balance Alert Threshold (₹)
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={walletMinAlert}
                              onChange={(e) => setWalletMinAlert(e.target.value)}
                              placeholder="1000"
                              className="w-full font-mono font-bold rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-amber-300 focus:border-cyan-400 outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowWalletForm(false)}
                            className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="rounded-xl bg-cyan-400 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 shadow-sm"
                          >
                            {editingWalletId ? "Save Account" : "Create Account"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Quick Top-up Modal in Settings */}
                  {topupTargetWallet && (
                    <div className="rounded-2xl border border-amber-500/40 bg-[#161a29] p-4 space-y-3 shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Plus size={14} />
                          <span>Deposit / Top Up: {topupTargetWallet.name}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setTopupTargetWallet(null)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      <form onSubmit={handleExecuteTopup} className="space-y-3">
                        <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-xs text-slate-400">Current Balance:</span>
                          <span className="font-mono text-sm font-black text-white">
                            ₹{topupTargetWallet.balance.toLocaleString("en-IN")}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Top-up Amount (₹) *</label>
                            <input
                              type="number"
                              required
                              min="1"
                              step="any"
                              value={topupAmount}
                              onChange={(e) => setTopupAmount(e.target.value)}
                              placeholder="2000"
                              className="w-full font-mono font-bold rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-emerald-400 focus:border-cyan-400 outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Source Payment Mode</label>
                            <select
                              value={topupMethod}
                              onChange={(e) => setTopupMethod(e.target.value as PaymentMethod)}
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none"
                            >
                              <option value="UPI">UPI / Scanner</option>
                              <option value="Cash">Cash Drawer</option>
                              <option value="Bank Transfer">Net Banking / Transfer</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setTopupTargetWallet(null)}
                            className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={savingTopup}
                            className="rounded-xl bg-amber-400 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-300 shadow-sm"
                          >
                            {savingTopup ? "Depositing..." : "Confirm Deposit"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Wallets Cards List */}
                  {loadingWallets ? (
                    <div className="text-center py-8 text-xs text-slate-400">Loading bank & portal accounts...</div>
                  ) : walletList.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center space-y-2">
                      <Landmark size={32} className="mx-auto text-slate-600" />
                      <p className="text-xs font-bold text-slate-300">No Bank or Portal Accounts Found</p>
                      <button
                        type="button"
                        onClick={handleOpenAddWallet}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-3.5 py-1.5 text-xs font-bold text-slate-950"
                      >
                        <Plus size={14} />
                        <span>Add First Account</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {walletList.map((wallet) => {
                        const isLow = wallet.balance <= wallet.min_alert_balance;
                        return (
                          <div
                            key={wallet.id}
                            className="rounded-2xl border border-slate-800/90 bg-[#0e1626] p-4 flex flex-col justify-between hover:border-slate-700 transition"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="rounded-md border border-cyan-800/50 bg-cyan-950/80 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                                  {wallet.category}
                                </span>
                                {isLow && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-md">
                                    <AlertTriangle size={11} />
                                    <span>Low Balance</span>
                                  </span>
                                )}
                              </div>

                              <h3 className="font-bold text-white text-sm truncate" title={wallet.name}>
                                {wallet.name}
                              </h3>

                              <div className="mt-3 flex items-baseline justify-between">
                                <div>
                                  <span className="text-[10px] text-slate-400 block">Available Balance</span>
                                  <span className="font-mono text-xl font-black text-white">
                                    ₹ {wallet.balance.toLocaleString("en-IN")}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Min alert: ₹{wallet.min_alert_balance}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => {
                                  setTopupTargetWallet(wallet);
                                  setTopupAmount("2000");
                                }}
                                className="inline-flex items-center gap-1 rounded-xl border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
                              >
                                <Plus size={12} />
                                <span>Deposit / Top Up</span>
                              </button>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditWallet(wallet)}
                                  className="rounded-lg border border-slate-700 p-1.5 text-slate-300 hover:border-slate-500 hover:text-white transition"
                                  title="Edit Account Details"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteWallet(wallet.id)}
                                  className="rounded-lg border border-rose-500/30 p-1.5 text-rose-400 hover:border-rose-500 transition"
                                  title="Delete Account"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SUBSCRIPTION & BILLING */}
              {settingsTab === "subscription" && subState && (
                <div className="space-y-5 animate-fadeIn">
                  {utrSuccessMsg && (
                    <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
                      <CheckCircle2 size={16} />
                      <span className="font-semibold">{utrSuccessMsg}</span>
                    </div>
                  )}

                  {/* Current Plan Overview Card */}
                  <div className="rounded-2xl border border-slate-800 bg-[#10182b] p-4.5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-400">Current Plan Status:</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase ${
                            subState.is_locked || subState.status === "expired"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : subState.status === "trial"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          }`}>
                            {subState.is_locked ? "Account Locked" : subState.status === "trial" ? "14-Day Free Trial" : "Active Subscription"}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white mt-1 capitalize">
                          {subState.plan} Tier &bull; {shopName}
                        </h3>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-sm font-bold text-slate-300">
                          {getDaysRemaining(subState.subscription_expires_at) <= 0
                            ? "Expired"
                            : `${getDaysRemaining(subState.subscription_expires_at)} Days Remaining`}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Expires: {new Date(subState.subscription_expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full transition-all duration-500 ${
                            subState.is_locked || subState.status === "expired"
                              ? "w-full bg-rose-500"
                              : subState.status === "trial"
                              ? "bg-gradient-to-r from-amber-500 to-cyan-400"
                              : "bg-gradient-to-r from-cyan-400 to-emerald-400"
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(8, (getDaysRemaining(subState.subscription_expires_at) / 30) * 100))}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Trial / Renewal Period</span>
                        <span>Zero Commission &bull; Flat Rate</span>
                      </div>
                    </div>

                    {subState.last_payment_utr && (
                      <div className="flex items-center justify-between rounded-xl bg-slate-900/80 px-3 py-2 text-xs border border-slate-800">
                        <span className="text-slate-400">Last Submitted UTR:</span>
                        <span className="font-mono font-bold text-amber-300">{subState.last_payment_utr}</span>
                      </div>
                    )}
                  </div>

                  {/* Plan Selection Cards */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-2">Select Subscription Plan:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Monthly Card */}
                      <button
                        type="button"
                        onClick={() => setSelectedPlan("monthly")}
                        className={`text-left rounded-2xl p-4 border transition relative ${
                          selectedPlan === "monthly"
                            ? "border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400"
                            : "border-slate-800 bg-[#0d1424] hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300">Starter Monthly</span>
                          <span className="font-mono text-base font-black text-emerald-400">₹{superConfig.monthly_price}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Full counter POS, customer khata, daily daybook & unlimited tokens.
                        </p>
                        <span className="mt-2 inline-block rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                          30 Days Validity
                        </span>
                      </button>

                      {/* Annual Card */}
                      <button
                        type="button"
                        onClick={() => setSelectedPlan("yearly")}
                        className={`text-left rounded-2xl p-4 border transition relative ${
                          selectedPlan === "yearly"
                            ? "border-purple-400 bg-purple-950/20 ring-1 ring-purple-400"
                            : "border-slate-800 bg-[#0d1424] hover:border-slate-700"
                        }`}
                      >
                        {yearlySavingsPct > 0 && (
                          <div className="absolute top-2 right-2 rounded-full bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[9px] font-black text-purple-300">
                            SAVE {yearlySavingsPct}%
                          </div>
                        )}
                        <div className="flex items-center justify-between pr-16">
                          <span className="text-xs font-bold text-slate-300">Annual Pro</span>
                          <span className="font-mono text-base font-black text-purple-400">₹{superConfig.yearly_price}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          365 days of uninterrupted service + priority WhatsApp support.
                        </p>
                        <span className="mt-2 inline-block rounded-md bg-purple-950/80 border border-purple-800/60 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                          12 Months (~₹{yearlyPerMonth}/mo)
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Direct UPI QR Code & Instructions */}
                  <div className="rounded-2xl border border-slate-800 bg-[#0c1322] p-4.5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                          <QrCode size={15} className="text-cyan-400" />
                          <span>Direct UPI QR & Zero Payment Fees</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">Scan using PhonePe, Google Pay, Paytm, BHIM, or Cred</p>
                      </div>
                      <span className="font-mono text-sm font-black text-emerald-400">
                        ₹{selectedPlan === "yearly" ? superConfig.yearly_price : superConfig.monthly_price}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* High-res Dynamic QR Code */}
                      <div className="shrink-0 p-3 rounded-2xl bg-white shadow-xl flex flex-col items-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(
                            generateUpiUri({
                              upiId: superConfig.upi_id,
                              payeeName: superConfig.payee_name,
                              amount: selectedPlan === "yearly" ? superConfig.yearly_price : superConfig.monthly_price,
                              note: `DenBooks ${selectedPlan} - ${shopName}`,
                            })
                          )}`}
                          alt="DenBooks UPI QR"
                          className="h-44 w-44 object-contain"
                        />
                        <span className="text-[10px] font-bold text-slate-700 mt-1 font-mono">
                          DenBooks 360 &bull; Instant UPI
                        </span>
                      </div>

                      {/* Right details & Intent Link */}
                      <div className="flex-1 space-y-3 w-full">
                        <div className="rounded-xl border border-slate-800 bg-[#080e1b] p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">Official UPI ID:</span>
                            <button
                              type="button"
                              onClick={copyUpiId}
                              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono font-bold flex items-center gap-1"
                            >
                              {copiedUpi ? <Check size={12} /> : <Copy size={12} />}
                              <span>{copiedUpi ? "Copied!" : "Copy"}</span>
                            </button>
                          </div>
                          <div className="font-mono text-xs font-bold text-white select-all">
                            {superConfig.upi_id}
                          </div>
                          <div className="text-[10px] text-slate-400">Payee: {superConfig.payee_name}</div>
                        </div>

                        {/* Mobile Direct Pay Button */}
                        <a
                          href={generateUpiUri({
                            upiId: superConfig.upi_id,
                            payeeName: superConfig.payee_name,
                            amount: selectedPlan === "yearly" ? superConfig.yearly_price : superConfig.monthly_price,
                            note: `DenBooks ${selectedPlan} - ${shopName}`,
                          })}
                          className="w-full flex items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition shadow-sm"
                        >
                          <CreditCard size={14} />
                          <span>Tap to Pay with Installed UPI App</span>
                        </a>

                        <p className="text-[10px] text-slate-400">
                          After transferring, copy the 12-digit <strong>UTR / UPI Ref Number</strong> from your payment receipt and submit below.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* UTR Submission Form */}
                  <div className="rounded-2xl border border-slate-800 bg-[#0d1527] p-4.5 space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-400" />
                      <span>Submit 12-Digit UTR for Manual Activation</span>
                    </h4>

                    <form onSubmit={handleUtrSubmit} className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          UPI Ref / UTR Transaction ID *
                        </label>
                        <input
                          type="text"
                          required
                          value={utrInput}
                          onChange={(e) => setUtrInput(e.target.value)}
                          placeholder="e.g. 428919028391 (12 digits)"
                          className="w-full font-mono rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-amber-300 font-bold focus:border-cyan-400 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Payment Notes (Optional)
                        </label>
                        <input
                          type="text"
                          value={utrNotes}
                          onChange={(e) => setUtrNotes(e.target.value)}
                          placeholder="e.g. Paid from GPay (Alok Verma)"
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="submit"
                          disabled={submittingUtr}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-cyan-400 py-2.5 px-4 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition shadow-md shadow-cyan-400/20"
                        >
                          <CheckCircle2 size={15} />
                          <span>{submittingUtr ? "Submitting..." : "Submit UTR for Verification"}</span>
                        </button>

                        <a
                          href={`https://wa.me/${superConfig.whatsapp_number.replace("+", "").replace(/\s+/g, "")}?text=${encodeURIComponent(
                            [
                              `*DenBooks 360 - Subscription Activation Request*`,
                              ``,
                              `🏪 *Center Name:* ${shopName}`,
                              `👤 *Owner Name:* ${ownerName}`,
                              `📞 *Phone:* ${phone || "Not set"}`,
                              `📦 *Plan:* ${selectedPlan === "yearly" ? "Annual Pro (₹" + superConfig.yearly_price + ")" : "Monthly Starter (₹" + superConfig.monthly_price + ")"}`,
                              `🧾 *UTR / Ref No:* ${utrInput.trim() || "Payment Done (Screenshot attached)"}`,
                              ``,
                              `Please verify payment and activate my center account. Thank you!`,
                            ].join("\n")
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition"
                        >
                          <MessageSquare size={14} />
                          <span>WhatsApp Proof</span>
                        </a>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LOCKOUT PAYWALL GUARD OVERLAY (When Centre Trial / Subscription Expired or Suspended) */}
      {subState && (subState.is_locked || subState.status === "expired") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050811]/95 p-4 backdrop-blur-xl font-sans animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-rose-500/40 bg-[#0c1424] p-6 sm:p-8 shadow-2xl space-y-5">
            {/* Lock Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-500/20 animate-pulse">
                <Lock size={32} />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                {subState.status === "suspended" ? "Center Temporarily Suspended" : "Free Trial Expired — Center Locked"}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                {subState.lock_reason ||
                  `Your 14-day trial period for ${shopName} has ended. Please renew your subscription to continue issuing tokens, logging daybook entries, and billing customers.`}
              </p>
            </div>

            {/* Quick Plan Switcher */}
            <div className="grid grid-cols-2 gap-2.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedPlan("monthly")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition text-center ${
                  selectedPlan === "monthly"
                    ? "bg-cyan-400 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <div>Starter Monthly</div>
                <div className="font-mono text-sm font-black">₹{superConfig.monthly_price}</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan("yearly")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition text-center ${
                  selectedPlan === "yearly"
                    ? "bg-purple-400 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <div>Annual Pro {yearlySavingsPct > 0 ? `(Save ${yearlySavingsPct}%)` : ""}</div>
                <div className="font-mono text-sm font-black">₹{superConfig.yearly_price}</div>
              </button>
            </div>

            {/* QR Code Scan Section */}
            <div className="rounded-2xl border border-slate-800 bg-[#080e1b] p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="shrink-0 p-2.5 rounded-xl bg-white shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=6&data=${encodeURIComponent(
                    generateUpiUri({
                      upiId: superConfig.upi_id,
                      payeeName: superConfig.payee_name,
                      amount: selectedPlan === "yearly" ? superConfig.yearly_price : superConfig.monthly_price,
                      note: `DenBooks ${selectedPlan} - ${shopName}`,
                    })
                  )}`}
                  alt="UPI QR Code"
                  className="h-32 w-32 object-contain"
                />
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="text-[11px] text-slate-400">Scan via PhonePe / GPay / Paytm:</div>
                <div className="font-mono text-xs font-bold text-cyan-300 select-all bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 inline-block">
                  {superConfig.upi_id}
                </div>
                <div className="text-[10px] text-slate-500">
                  Amount: <strong className="text-emerald-400 font-mono">₹{selectedPlan === "yearly" ? superConfig.yearly_price : superConfig.monthly_price}</strong>
                </div>
              </div>
            </div>

            {/* Fast UTR Submission */}
            <form onSubmit={handleUtrSubmit} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  placeholder="Enter 12-Digit UTR / UPI Ref"
                  className="flex-1 font-mono rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-amber-300 font-bold focus:border-cyan-400 outline-none"
                />
                <button
                  type="submit"
                  disabled={submittingUtr}
                  className="rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition shadow-md shadow-cyan-400/20 whitespace-nowrap"
                >
                  {submittingUtr ? "Submitting..." : "Submit UTR"}
                </button>
              </div>
            </form>

            {/* WhatsApp Hotline */}
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${superConfig.whatsapp_number.replace("+", "").replace(/\s+/g, "")}?text=${encodeURIComponent(
                  [
                    `*DenBooks 360 - Unlock & Renewal Request*`,
                    ``,
                    `🏪 *Center Name:* ${shopName}`,
                    `👤 *Owner Name:* ${ownerName}`,
                    `📞 *Phone:* ${phone || "Not set"}`,
                    `📦 *Plan:* ${selectedPlan === "yearly" ? "Annual Pro (₹" + superConfig.yearly_price + ")" : "Monthly Starter (₹" + superConfig.monthly_price + ")"}`,
                    `🧾 *UTR:* ${utrInput.trim() || "Payment Done (Receipt Attached)"}`,
                    ``,
                    `My center is locked. Please approve payment and unlock dashboard.`,
                  ].join("\n")
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition"
              >
                <MessageSquare size={14} />
                <span>WhatsApp Owner Hotline</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
