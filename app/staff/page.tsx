"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Users,
  LogOut,
  Receipt,
  FileText,
  Clock,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  Printer,
  CreditCard,
  Banknote,
  Smartphone,
  RefreshCw,
  Phone,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Eye,
  X,
  Copy,
  Check,
  Mail,
  MessageSquare,
  MessageCircle,
  IndianRupee,
  Wallet,
  Landmark,
  Ticket,
  Megaphone,
  UserCheck,
  Volume2,
  Trash2,
} from "lucide-react";
import {
  StaffSession,
  getStaffSession,
  staffLogout,
  getEmployeeById,
  EmployeePermissions,
} from "@/lib/services/employee.service";
import {
  AccountTransaction,
  CounterProduct,
  ServiceChargeItem,
  getAccountTransactions,
  createAccountTransaction,
  getCounterProducts,
  getServiceChargesMaster,
  getTodayDateString,
  PaymentMethod,
  AccountCategory,
  PortalWallet,
  getPortalWallets,
  deductPortalWallet,
  CitizenInvoiceItem,
  PaymentSplit,
  getNextInvoiceNumber,
  peekNextInvoiceNumber,
} from "@/lib/services/accounts.service";
import {
  StaffAttendanceRecord,
  getTodayAttendanceRecord,
  punchInStaff,
  punchOutStaff,
  getDailyAttendance,
} from "@/lib/services/attendance.service";
import {
  AdminRequest,
  getAdminRequests,
  updateRequestStatus,
  updateRequestBilling,
  RequestStatus,
} from "@/lib/services/admin.service";
import { createServiceRequest } from "@/lib/services/request.service";
import {
  QueueToken,
  QueuePriority,
  QueueTokenStatus,
  getQueueTokens,
  issueQueueToken,
  callNextWaitingToken,
  updateQueueTokenStatus,
  deleteQueueToken,
  calculateQueueStats,
  printQueueTokenSlip,
} from "@/lib/services/token.service";

export type StaffTab = "tokens" | "reception" | "invoices" | "requests" | "khata" | "drawer" | "attendance";

interface StaffCounterPageProps {
  initialTab?: StaffTab;
  hideShiftWidgets?: boolean;
}

export default function StaffCounterPage({ initialTab = "invoices", hideShiftWidgets = false }: StaffCounterPageProps = {}) {
  const router = useRouter();

  // Authentication & Session
  const [session, setSession] = useState<StaffSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Receptionist-only features (Issue tokens & register new citizen service requests)
  const isReceptionistOrAdmin = useMemo(() => {
    if (!session) return false;
    return (
      session.role === "Receptionist" ||
      session.employeeId === "emp-admin-owner" ||
      session.role === "Branch Supervisor"
    );
  }, [session]);

  // Active sub-tab in Staff Desk
  const [activeTab, setActiveTab] = useState<StaffTab>(initialTab);

  // Data states
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [products, setProducts] = useState<CounterProduct[]>([]);
  const [serviceCharges, setServiceCharges] = useState<ServiceChargeItem[]>([]);
  const [tokens, setTokens] = useState<QueueToken[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [centerProfile, setCenterProfile] = useState<{
    name: string;
    phone: string;
    centerCode: string;
  }>({
    name: "DenBooks Counter Desk",
    phone: "",
    centerCode: "",
  });

  // Staff Attendance State
  const [todayAttendance, setTodayAttendance] = useState<StaffAttendanceRecord | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<StaffAttendanceRecord[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("denbooks_current_tenant");
        if (stored) {
          const parsed = JSON.parse(stored);
          const cleanCenterCode = parsed.centerCode === "KNR059" ? "" : (parsed.centerCode || "");
          const cleanPhone = parsed.phone === "9876543210" ? "" : (parsed.phone || "");
          setCenterProfile({
            name: parsed.name || "DenBooks Counter Desk",
            phone: cleanPhone,
            centerCode: cleanCenterCode,
          });
        }
      } catch {}
    }
  }, []);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Queue Token (FCFS) states
  const [tokenSearchQuery, setTokenSearchQuery] = useState("");
  const [tokenStatusFilter, setTokenStatusFilter] = useState<QueueTokenStatus | "All">("All");
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokCustName, setTokCustName] = useState("");
  const [tokCustPhone, setTokCustPhone] = useState("");
  const [tokService, setTokService] = useState("Aadhaar / Citizen Services");
  const [tokPriority, setTokPriority] = useState<QueuePriority>("Normal");
  const [tokCounter, setTokCounter] = useState("Counter 1");
  const [tokNotes, setTokNotes] = useState("");
  const [savingToken, setSavingToken] = useState(false);
  const [callingToken, setCallingToken] = useState(false);

  // Reception Customer Intake Mode State
  const [receptionCustName, setReceptionCustName] = useState("");
  const [receptionCustPhone, setReceptionCustPhone] = useState("");
  const [receptionSelectedServices, setReceptionSelectedServices] = useState<string[]>([]);
  const [receptionCustomService, setReceptionCustomService] = useState("");
  const [receptionPriority, setReceptionPriority] = useState<QueuePriority>("Normal");
  const [receptionNotes, setReceptionNotes] = useState("");
  const [receptionSubmitting, setReceptionSubmitting] = useState(false);

  // Add Invoice Modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invMode, setInvMode] = useState<"citizen" | "counter" | "custom">("citizen");
  const [invCustomerName, setInvCustomerName] = useState("");
  const [invCustomerPhone, setInvCustomerPhone] = useState("");
  const [invRefId, setInvRefId] = useState("");
  const [invPaymentMethod, setInvPaymentMethod] = useState<PaymentMethod>("Cash");
  const [invIsCredit, setInvIsCredit] = useState(false);

  // Multi-Item Citizen Invoicing state (matches AceApp)
  const [invItems, setInvItems] = useState<CitizenInvoiceItem[]>([
    {
      id: "it-1",
      service_name: "Building Tax Online Payment",
      wallet_id: "",
      wallet_name: "",
      online_payment: 0,
      charges: 100,
      total: 100,
    },
  ]);
  const [invCashAmount, setInvCashAmount] = useState<string>("");
  const [invUpiAmount, setInvUpiAmount] = useState<string>("");
  const [invCreditAmount, setInvCreditAmount] = useState<string>("0");
  const [invQuickAddServiceId, setInvQuickAddServiceId] = useState<string>("");

  // Legacy single inputs for compatibility
  const [invServiceId, setInvServiceId] = useState("");
  const [invServiceName, setInvServiceName] = useState("");
  const [invGovtFee, setInvGovtFee] = useState("0");
  const [invServiceCharge, setInvServiceCharge] = useState("");
  const [invNotes, setInvNotes] = useState("");

  // Counter POS inputs
  const [invCart, setInvCart] = useState<Array<{ product: CounterProduct; qty: number }>>([]);
  const [invCustomItem, setInvCustomItem] = useState("");
  const [invCustomRate, setInvCustomRate] = useState("");
  const [invCustomQty, setInvCustomQty] = useState("1");

  // Custom bill inputs
  const [invCustomTitle, setInvCustomTitle] = useState("");
  const [invCustomAmount, setInvCustomAmount] = useState("");
  const [invCustomCategory, setInvCustomCategory] = useState<AccountCategory>("Service Request");

  const [savingInvoice, setSavingInvoice] = useState(false);
  const [invAutoPrint, setInvAutoPrint] = useState(false);

  // New Request Modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqCustName, setReqCustName] = useState("");
  const [reqCustPhone, setReqCustPhone] = useState("");
  const [reqService, setReqService] = useState("");
  const [reqGovtFee, setReqGovtFee] = useState("0");
  const [reqServiceCharge, setReqServiceCharge] = useState("100");
  const [reqNotes, setReqNotes] = useState("");
  const [savingRequest, setSavingRequest] = useState(false);

  // View Customer Request Modal & Filter state
  const [viewingRequest, setViewingRequest] = useState<AdminRequest | null>(null);
  const [requestSearchQuery, setRequestSearchQuery] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState<RequestStatus | "All">("All");
  const [requestScopeFilter, setRequestScopeFilter] = useState<"all" | "my">("all");
  const [updatingReqStatus, setUpdatingReqStatus] = useState(false);
  const [copiedReqId, setCopiedReqId] = useState(false);

  // Expense Modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expCategory, setExpCategory] = useState<AccountCategory>("Paper & Stationery");
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expMethod, setExpMethod] = useState<PaymentMethod>("Cash");
  const [expDesc, setExpDesc] = useState("");
  const [savingExp, setSavingExp] = useState(false);

  // Portal Wallets state (read-only monitoring for counter operators)
  const [wallets, setWallets] = useState<PortalWallet[]>([]);
  const [invWalletId, setInvWalletId] = useState<string>("");
  const [invLinkedRequestId, setInvLinkedRequestId] = useState<string | null>(null);

  // Verify authentication on mount
  useEffect(() => {
    const activeSession = getStaffSession();
    if (activeSession) {
      setSession(activeSession);
      if (activeSession.role === "Receptionist") {
        setActiveTab("tokens");
      }
      setLoadingSession(false);
      return;
    }

    // Check if user is an Admin / Owner logged in via Supabase previewing the staff counter desk
    const isDevAdmin =
      typeof document !== "undefined" && document.cookie.includes("sb-");

    if (isDevAdmin) {
      const ownerSession: StaffSession = {
        employeeId: "emp-admin-owner",
        employeeName: "Admin (Owner)",
        phone: "Administrator",
        role: "Branch Supervisor",
        loginTime: new Date().toISOString(),
        token: `owner-${Date.now()}`,
        permissions: {
          canCreateInvoice: true,
          canManageRequests: true,
          canSettleCredit: true,
          canViewDaybookSummary: true,
          canIssueTokens: true,
        },
      };
      try {
        localStorage.removeItem("dd_staff_session_v1");
        localStorage.setItem("dd_staff_session_v2", JSON.stringify(ownerSession));
        document.cookie = `dd_staff_session=${encodeURIComponent(
          JSON.stringify(ownerSession)
        )}; path=/; max-age=86400; SameSite=Lax`;
      } catch {}
      setSession(ownerSession);
      setLoadingSession(false);
      return;
    }

    // Not authenticated, redirect to staff login
    window.location.replace("/staff/login");
  }, [router]);

  // Load business data (isolated to logged-in counter employee)
  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const today = getTodayDateString();
      const currentSession = getStaffSession();
      const empId = currentSession?.employeeId;
      const isSupervisorOrOwner = currentSession?.role === "Branch Supervisor" || empId === "emp-owner";

      // Separate feed: Counter employees only load transactions they entered during their shift
      const txList = await getAccountTransactions({
        date: today,
        employeeId: isSupervisorOrOwner ? undefined : empId,
      });
      const [reqList, walletList, tokenList] = await Promise.all([
        getAdminRequests().catch(() => []),
        getPortalWallets(),
        getQueueTokens(today).catch(() => []),
      ]);
      setTransactions(txList);
      setRequests(reqList);
      setWallets(walletList);
      setTokens(tokenList);
      setProducts(getCounterProducts());
      setServiceCharges(getServiceChargesMaster());

      if (empId) {
        try {
          const [myAtt, dailyAtt] = await Promise.all([
            getTodayAttendanceRecord(empId, today),
            getDailyAttendance(today),
          ]);
          setTodayAttendance(myAtt);
          setAttendanceRecords(dailyAtt);
        } catch (attErr) {
          console.warn("Attendance load error:", attErr);
        }
      }
    } catch (e) {
      console.error("Staff data load error:", e);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session, loadData]);

  async function handlePunchIn() {
    if (!session) return;
    try {
      const rec = await punchInStaff(session.employeeId, session.employeeName, session.role);
      setTodayAttendance(rec);
      const today = getTodayDateString();
      const dailyAtt = await getDailyAttendance(today);
      setAttendanceRecords(dailyAtt);
    } catch (e) {
      console.error("Punch in error:", e);
    }
  }

  async function handlePunchOut() {
    if (!session) return;
    if (!confirm("Are you sure you want to clock out and end your attendance for today?")) return;
    try {
      const rec = await punchOutStaff(session.employeeId);
      setTodayAttendance(rec);
      const today = getTodayDateString();
      const dailyAtt = await getDailyAttendance(today);
      setAttendanceRecords(dailyAtt);
    } catch (e) {
      console.error("Punch out error:", e);
    }
  }

  function handleLogout() {
    if (confirm("End your shift and logout from Counter Desk?")) {
      staffLogout();
      router.replace("/staff/login");
    }
  }

  // Queue stats and filtered tokens
  const queueStats = useMemo(() => calculateQueueStats(tokens), [tokens]);

  const filteredTokens = useMemo(() => {
    return tokens.filter((t) => {
      if (tokenStatusFilter !== "All" && t.status !== tokenStatusFilter) return false;
      if (tokenSearchQuery.trim()) {
        const q = tokenSearchQuery.toLowerCase();
        const matchNum = t.token_number.toLowerCase().includes(q);
        const matchCust = t.customer_name.toLowerCase().includes(q);
        const matchPhone = t.customer_phone?.toLowerCase().includes(q);
        const matchService = t.service_requested.toLowerCase().includes(q);
        return matchNum || matchCust || matchPhone || matchService;
      }
      return true;
    });
  }, [tokens, tokenStatusFilter, tokenSearchQuery]);

  // Queue actions
  async function handleIssueToken(printSlip: boolean = false) {
    if (!tokCustName.trim()) {
      alert("Please enter customer name.");
      return;
    }
    setSavingToken(true);
    try {
      const created = await issueQueueToken({
        customer_name: tokCustName.trim(),
        customer_phone: tokCustPhone.trim() || undefined,
        service_requested: tokService.trim() || "General Counter Service",
        priority: tokPriority,
        counter_assigned: tokCounter,
        notes: tokNotes.trim() || undefined,
        employee_name: session?.employeeName || "Reception Desk",
      });

      setTokens((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);
      setShowTokenModal(false);
      setTokCustName("");
      setTokCustPhone("");
      setTokNotes("");

      if (printSlip) {
        printQueueTokenSlip(created);
      }
    } catch (e: any) {
      alert("Error issuing token: " + (e?.message || e));
    } finally {
      setSavingToken(false);
    }
  }

  async function handleCallNext(counterNumber: string = "Counter 1") {
    setCallingToken(true);
    try {
      const nextToken = await callNextWaitingToken(counterNumber, session?.employeeName || "Receptionist");
      if (!nextToken) {
        alert("No customers waiting in queue right now!");
        return;
      }
      setTokens((prev) =>
        prev.map((t) => (t.id === nextToken.id ? nextToken : t))
      );

      // Audio Announcement via Browser SpeechSynthesis
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          const utterance = new SpeechSynthesisUtterance(
            `Token number ${nextToken.token_number}, please proceed to ${nextToken.counter_assigned || "Counter 1"}`
          );
          utterance.rate = 0.95;
          utterance.pitch = 1.05;
          window.speechSynthesis.speak(utterance);
        } catch {}
      }
    } catch (e: any) {
      console.error("Call next error:", e);
    } finally {
      setCallingToken(false);
    }
  }

  async function handleUpdateToken(id: string, status: QueueTokenStatus) {
    try {
      const updated = await updateQueueTokenStatus(id, status);
      setTokens((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e: any) {
      console.error("Update token error:", e);
    }
  }

  function handleConvertTokenToRequest(tok: QueueToken) {
    setReqCustName(tok.customer_name);
    setReqCustPhone(tok.customer_phone || "");
    setReqService(tok.service_requested);
    setReqNotes(`Queue Token #${tok.token_number} [${tok.priority} Priority]. ${tok.notes || ""}`.trim());
    setReqGovtFee("0");
    setReqServiceCharge("100");
    handleUpdateToken(tok.id, "Serving");
    setShowRequestModal(true);
  }

  function handleConvertTokenToInvoice(tok: QueueToken) {
    const isCounter =
      tok.service_requested.toLowerCase().includes("xerox") ||
      tok.service_requested.toLowerCase().includes("print") ||
      tok.service_requested.toLowerCase().includes("lamination") ||
      tok.service_requested.toLowerCase().includes("photo");

    setInvCustomerName(tok.customer_name);
    setInvCustomerPhone(tok.customer_phone || "");
    const nextSeq = peekNextInvoiceNumber(centerProfile.centerCode || "");
    setInvRefId(nextSeq);
    setInvNotes(`Token #${tok.token_number} - ${tok.service_requested}`);
    setInvPaymentMethod("Cash");
    setInvIsCredit(false);
    handleUpdateToken(tok.id, "Serving");

    if (isCounter) {
      setInvMode("counter");
      setInvCart([]);
    } else {
      setInvMode("citizen");
      const serviceParts = tok.service_requested.split(/[,+]/).map((s) => s.trim()).filter(Boolean);
      const defaultWallet = wallets.length > 0 ? wallets[0] : null;
      const initialItems: CitizenInvoiceItem[] = serviceParts.length > 0
        ? serviceParts.map((sName, idx) => {
            const matched = serviceCharges.find(
              (sc) => sc.serviceName.toLowerCase() === sName.toLowerCase()
            );
            const chg = matched ? matched.defaultCharge : 100;
            return {
              id: `it-${Date.now()}-${idx}`,
              service_name: matched ? matched.serviceName : sName,
              wallet_id: defaultWallet?.id || "",
              wallet_name: defaultWallet?.name || "",
              online_payment: 0,
              charges: chg,
              total: chg,
            };
          })
        : [
            {
              id: `it-${Date.now()}-0`,
              service_name: tok.service_requested,
              wallet_id: defaultWallet?.id || "",
              wallet_name: defaultWallet?.name || "",
              online_payment: 0,
              charges: 100,
              total: 100,
            },
          ];
      setInvItems(initialItems);
      const sumTotal = initialItems.reduce((acc, it) => acc + it.total, 0);
      setInvCashAmount(String(sumTotal));
      setInvUpiAmount("");
      setInvCreditAmount("0");
    }

    setShowInvoiceModal(true);
  }

  // Invoice calculations
  const invCitizenOnlineTotal = useMemo(() => {
    return invItems.reduce((acc, it) => acc + (Number(it.online_payment) || 0), 0);
  }, [invItems]);

  const invCitizenChargesTotal = useMemo(() => {
    return invItems.reduce((acc, it) => acc + (Number(it.charges) || 0), 0);
  }, [invItems]);

  const invTotalAmount = useMemo(() => {
    if (invMode === "citizen") {
      return invItems.reduce(
        (sum, item) => sum + (Number(item.online_payment) || 0) + (Number(item.charges) || 0),
        0
      );
    }
    if (invMode === "counter") {
      let total = invCart.reduce((sum, item) => sum + item.product.rate * item.qty, 0);
      const cr = parseFloat(invCustomRate) || 0;
      const cq = parseInt(invCustomQty, 10) || 0;
      if (invCustomItem.trim() && cr > 0 && cq > 0) total += cr * cq;
      return total;
    }
    if (invMode === "custom") {
      return parseFloat(invCustomAmount) || 0;
    }
    return 0;
  }, [invMode, invItems, invCart, invCustomItem, invCustomRate, invCustomQty, invCustomAmount]);

  const allocatedCash = parseFloat(invCashAmount) || 0;
  const allocatedUpi = parseFloat(invUpiAmount) || 0;
  const allocatedCredit = parseFloat(invCreditAmount) || 0;
  const totalAllocated = allocatedCash + allocatedUpi + allocatedCredit;
  const allocationRemaining = invTotalAmount - totalAllocated;
  const isCreditActive = allocatedCredit > 0;

  function handleAddInvoiceItem(serviceName = "", defaultCharge = 50, onlinePayment = 0) {
    const defaultWallet = wallets.length > 0 ? wallets[0] : null;
    const newItem: CitizenInvoiceItem = {
      id: `it-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      service_name: serviceName || "General Citizen Service",
      wallet_id: defaultWallet?.id || "",
      wallet_name: defaultWallet?.name || "",
      online_payment: onlinePayment,
      charges: defaultCharge,
      total: onlinePayment + defaultCharge,
    };
    const next = [...invItems, newItem];
    setInvItems(next);
    const newTotal = next.reduce((acc, it) => acc + (Number(it.online_payment) || 0) + (Number(it.charges) || 0), 0);
    if (allocatedCredit === 0 && allocatedUpi === 0) {
      setInvCashAmount(String(newTotal));
    }
  }

  function handleUpdateInvoiceItem(id: string, updates: Partial<CitizenInvoiceItem>) {
    setInvItems((prev) => {
      const next = prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        if (updates.wallet_id !== undefined) {
          const w = wallets.find((wal) => wal.id === updates.wallet_id);
          updated.wallet_name = w ? w.name : "";
        }
        const op = Number(updated.online_payment) || 0;
        const ch = Number(updated.charges) || 0;
        updated.total = op + ch;
        return updated;
      });
      const newTotal = next.reduce(
        (acc, it) => acc + (Number(it.online_payment) || 0) + (Number(it.charges) || 0),
        0
      );
      if (allocatedCredit === 0 && allocatedUpi === 0) {
        setInvCashAmount(String(newTotal));
      }
      return next;
    });
  }

  function handleRemoveInvoiceItem(id: string) {
    if (invItems.length <= 1) return;
    setInvItems((prev) => {
      const next = prev.filter((it) => it.id !== id);
      const newTotal = next.reduce(
        (acc, it) => acc + (Number(it.online_payment) || 0) + (Number(it.charges) || 0),
        0
      );
      if (allocatedCredit === 0 && allocatedUpi === 0) {
        setInvCashAmount(String(newTotal));
      }
      return next;
    });
  }

  function handleSetAllCash() {
    setInvCashAmount(String(invTotalAmount));
    setInvUpiAmount("");
    setInvCreditAmount("0");
    setInvPaymentMethod("Cash");
    setInvIsCredit(false);
  }

  function handleSetAllUpi() {
    setInvCashAmount("");
    setInvUpiAmount(String(invTotalAmount));
    setInvCreditAmount("0");
    setInvPaymentMethod("UPI");
    setInvIsCredit(false);
  }

  function handleSetAllCredit() {
    setInvCashAmount("");
    setInvUpiAmount("");
    setInvCreditAmount(String(invTotalAmount));
    setInvPaymentMethod("Cash");
    setInvIsCredit(true);
  }

  function openInvoiceModalDialog() {
    setInvMode("citizen");
    setInvLinkedRequestId(null);
    setInvCustomerName("");
    setInvCustomerPhone("");
    const nextSeq = peekNextInvoiceNumber(centerProfile.centerCode || "");
    setInvRefId(nextSeq);
    setInvPaymentMethod("Cash");
    setInvIsCredit(false);
    setInvNotes("");
    const services = getServiceChargesMaster();
    const defaultWallet = wallets.length > 0 ? wallets[0] : null;
    const initialCharge = services.length > 0 ? services[0].defaultCharge : 100;
    const initialService = services.length > 0 ? services[0].serviceName : "Building Tax Online Payment";
    setInvItems([
      {
        id: `it-${Date.now()}-1`,
        service_name: initialService,
        wallet_id: defaultWallet?.id || "",
        wallet_name: defaultWallet?.name || "",
        online_payment: 0,
        charges: initialCharge,
        total: initialCharge,
      },
    ]);
    setInvCashAmount(String(initialCharge));
    setInvUpiAmount("");
    setInvCreditAmount("0");
    setInvServiceId(services[0]?.id || "");
    setInvServiceName(initialService);
    setInvServiceCharge(String(initialCharge));
    setInvGovtFee("0");
    setInvWalletId(defaultWallet?.id || "");
    setInvCart([]);
    setInvCustomItem("");
    setInvCustomRate("");
    setInvCustomQty("1");
    setInvCustomTitle("");
    setInvCustomAmount("");
    setShowInvoiceModal(true);
  }

  // Reception Customer Intake Mode Handlers
  async function handleReceptionIssueToken(printSlip: boolean = false) {
    if (!receptionCustName.trim()) {
      alert("Please enter customer name.");
      return;
    }
    const selected = [...receptionSelectedServices];
    if (receptionCustomService.trim()) selected.push(receptionCustomService.trim());
    const serviceName = selected.length > 0 ? selected.join(", ") : "General Citizen Consultation";

    setReceptionSubmitting(true);
    try {
      const created = await issueQueueToken({
        customer_name: receptionCustName.trim(),
        customer_phone: receptionCustPhone.trim() || undefined,
        service_requested: serviceName,
        priority: receptionPriority,
        counter_assigned: "Counter 1",
        notes: receptionNotes.trim() || undefined,
        employee_name: session?.employeeName || "Reception Desk",
      });

      setTokens((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);
      setReceptionCustName("");
      setReceptionCustPhone("");
      setReceptionSelectedServices([]);
      setReceptionCustomService("");
      setReceptionNotes("");

      if (printSlip) {
        printQueueTokenSlip(created);
      } else {
        alert(`Token #${created.token_number} issued for ${created.customer_name}!`);
      }
    } catch (e: any) {
      alert("Error issuing token: " + (e?.message || e));
    } finally {
      setReceptionSubmitting(false);
    }
  }

  function handleReceptionDirectBill() {
    if (!receptionCustName.trim()) {
      alert("Please enter customer name.");
      return;
    }
    const selected = [...receptionSelectedServices];
    if (receptionCustomService.trim()) selected.push(receptionCustomService.trim());
    const defaultWallet = wallets.length > 0 ? wallets[0] : null;

    const itemsToBill: CitizenInvoiceItem[] = selected.length > 0
      ? selected.map((sName, idx) => {
          const clean = sName.trim().toLowerCase();
          const matched = serviceCharges.find(
            (sc) => {
              const scName = sc.serviceName.trim().toLowerCase();
              return scName === clean || scName.includes(clean) || clean.includes(scName);
            }
          );
          const chg = matched ? matched.defaultCharge : 50;
          return {
            id: `it-${Date.now()}-${idx}`,
            service_name: matched ? matched.serviceName : sName,
            wallet_id: defaultWallet?.id || "",
            wallet_name: defaultWallet?.name || "",
            online_payment: 0,
            charges: chg,
            total: chg,
          };
        })
      : [
          {
            id: `it-${Date.now()}-0`,
            service_name: "General Citizen Service",
            wallet_id: defaultWallet?.id || "",
            wallet_name: defaultWallet?.name || "",
            online_payment: 0,
            charges: 50,
            total: 50,
          },
        ];

    setInvMode("citizen");
    setInvCustomerName(receptionCustName.trim());
    setInvCustomerPhone(receptionCustPhone.trim());
    const nextSeq = peekNextInvoiceNumber(centerProfile.centerCode || "");
    setInvRefId(nextSeq);
    setInvNotes(receptionNotes.trim());
    setInvItems(itemsToBill);
    const sumTotal = itemsToBill.reduce((acc, it) => acc + it.total, 0);
    setInvCashAmount(String(sumTotal));
    setInvUpiAmount("");
    setInvCreditAmount("0");
    setInvPaymentMethod("Cash");
    setInvIsCredit(false);
    setShowInvoiceModal(true);
  }

  function addInvProduct(prod: CounterProduct) {
    setInvCart((prev) => {
      const idx = prev.findIndex((p) => p.product.id === prod.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].qty += 1;
        return copy;
      }
      return [...prev, { product: prod, qty: 1 }];
    });
  }

  function updateInvQty(productId: string, delta: number) {
    setInvCart((prev) =>
      prev
        .map((p) => (p.product.id === productId ? { ...p, qty: p.qty + delta } : p))
        .filter((p) => p.qty > 0)
    );
  }

  // Save Invoice & optionally print slip
  async function handleSaveInvoice(printSlip: boolean = false) {
    if (invTotalAmount <= 0) {
      alert("Please enter a valid amount greater than ₹0.");
      return;
    }

    const cashVal = parseFloat(invCashAmount) || 0;
    const upiVal = parseFloat(invUpiAmount) || 0;
    const creditVal = parseFloat(invCreditAmount) || 0;
    const sumAllocated = cashVal + upiVal + creditVal;

    // Check payment split allocation matches total bill
    if (Math.abs(sumAllocated - invTotalAmount) > 0.01) {
      alert(
        `Payment breakdown (₹${sumAllocated.toFixed(2)}) does not match Total Payable (₹${invTotalAmount.toFixed(2)}). Please allocate remaining ₹${(
          invTotalAmount - sumAllocated
        ).toFixed(2)} to Cash, UPI, or Khata.`
      );
      return;
    }

    // Credit (Khata) transactions strictly require Customer Name & valid Mobile Phone for WhatsApp reminders
    if (creditVal > 0) {
      const trimmedName = invCustomerName.trim();
      if (!trimmedName || trimmedName.toLowerCase() === "walk-in customer" || trimmedName.toLowerCase() === "walk-in") {
        alert("Customer Name is required for Credit (Khata) transactions so customer accounts and WhatsApp payment reminders can be tracked.");
        return;
      }
      const cleanPhone = invCustomerPhone.trim().replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        alert("A valid 10-digit Customer Mobile Phone number is required for Credit (Khata) transactions to send WhatsApp payment reminders.");
        return;
      }
    }

    let title = "";
    let description = "";
    let category: AccountCategory = "Service Request";
    let govtFee = 0;
    let serviceCharge = 0;
    let savedItems: CitizenInvoiceItem[] | undefined = undefined;

    if (invMode === "citizen") {
      // Validate all items have a title
      for (let i = 0; i < invItems.length; i++) {
        if (!invItems[i].service_name.trim()) {
          alert(`Item #${i + 1} is missing a Service Name. Please enter or select a service.`);
          return;
        }
      }

      // Check wallet balances for online_payment
      const walletRequirements: Record<string, { name: string; amount: number }> = {};
      for (const it of invItems) {
        const op = Number(it.online_payment) || 0;
        if (op > 0 && it.wallet_id) {
          if (!walletRequirements[it.wallet_id]) {
            const w = wallets.find((wal) => wal.id === it.wallet_id);
            walletRequirements[it.wallet_id] = { name: w?.name || "Selected Wallet", amount: 0 };
          }
          walletRequirements[it.wallet_id].amount += op;
        }
      }

      for (const [wId, req] of Object.entries(walletRequirements)) {
        const w = wallets.find((wal) => wal.id === wId);
        if (w && (w.balance <= 0 || w.balance < req.amount)) {
          alert(
            `Cannot save transaction: Wallet account "${req.name}" has balance ₹${w.balance.toLocaleString("en-IN")}, but items require ₹${req.amount.toLocaleString("en-IN")} for Online Payments. Please deposit funds or choose another wallet.`
          );
          return;
        }
      }

      govtFee = invItems.reduce((acc, it) => acc + (Number(it.online_payment) || 0), 0);
      serviceCharge = invItems.reduce((acc, it) => acc + (Number(it.charges) || 0), 0);
      title = invItems.length === 1 ? invItems[0].service_name : `Citizen Services (${invItems.length} items)`;
      description = invItems.map((it) => `${it.service_name} (Fee: ₹${it.online_payment}, Chg: ₹${it.charges})`).join(" | ") + (invNotes.trim() ? ` | Notes: ${invNotes.trim()}` : "");
      savedItems = invItems.map((it) => ({
        ...it,
        online_payment: Number(it.online_payment) || 0,
        charges: Number(it.charges) || 0,
        total: (Number(it.online_payment) || 0) + (Number(it.charges) || 0),
      }));
    } else if (invMode === "counter") {
      if (invCart.length === 0 && (!invCustomItem.trim() || !invCustomRate)) {
        alert("Please add at least one item to the cart.");
        return;
      }
      category = "Counter Sale";
      const itemsList = invCart
        .map((p) => `${p.product.name} (x${p.qty})`)
        .concat(invCustomItem.trim() ? [`${invCustomItem.trim()} (x${invCustomQty || 1})`] : []);
      description = itemsList.join(", ");
      title =
        invCart.length === 1 && !invCustomItem.trim()
          ? `${invCart[0].product.name} (x${invCart[0].qty})`
          : `Counter Bill: ${itemsList.length} items`;
      govtFee = 0;
      serviceCharge = invTotalAmount;
    } else {
      if (!invCustomTitle.trim()) {
        alert("Please enter a title for the bill.");
        return;
      }
      title = invCustomTitle.trim();
      category = invCustomCategory;
      description = invNotes.trim() || "Custom Invoice";
      govtFee = 0;
      serviceCharge = invTotalAmount;
    }

    setSavingInvoice(true);
    try {
      const centerCode = centerProfile.centerCode || "";
      const actualInvNumber = getNextInvoiceNumber(centerCode);

      const paymentMethod: PaymentMethod =
        creditVal > 0 && cashVal === 0 && upiVal === 0
          ? "Cash"
          : upiVal > 0 && cashVal === 0 && creditVal === 0
          ? "UPI"
          : "Cash";

      const newTx = await createAccountTransaction({
        transaction_date: getTodayDateString(),
        type: "income",
        category,
        title,
        description,
        amount: invTotalAmount,
        govt_fee: govtFee,
        service_charge: serviceCharge,
        payment_method: paymentMethod,
        reference_id: actualInvNumber,
        customer_name: invCustomerName.trim() || "Walk-in Customer",
        customer_phone: invCustomerPhone.trim() || undefined,
        is_settled: creditVal <= 0,
        employee_id: session?.employeeId || "emp-1",
        employee_name: session?.employeeName || "Counter Staff",
        items: savedItems,
        payment_split: { cash: cashVal, upi: upiVal, credit: creditVal },
        invoice_number: actualInvNumber,
      });

      setTransactions((prev) => [newTx, ...prev]);
      setShowInvoiceModal(false);

      // Deduct wallets for multi-item citizen billing
      if (invMode === "citizen" && savedItems) {
        const walletDeductions: Record<string, number> = {};
        for (const it of savedItems) {
          if (it.wallet_id && it.online_payment > 0) {
            walletDeductions[it.wallet_id] = (walletDeductions[it.wallet_id] || 0) + it.online_payment;
          }
        }
        for (const [wId, amt] of Object.entries(walletDeductions)) {
          try {
            await deductPortalWallet(wId, amt);
          } catch (e) {
            console.warn("Wallet deduction failed for", wId, e);
          }
        }
        const updatedWallets = await getPortalWallets();
        setWallets(updatedWallets);
      }

      // If this invoice was linked to a citizen service request, synchronize billing & payment
      if (invLinkedRequestId) {
        try {
          const payStatus = creditVal > 0 ? "Unpaid" : "Paid";
          await updateRequestBilling(
            invLinkedRequestId,
            invTotalAmount,
            payStatus,
            undefined,
            govtFee,
            serviceCharge
          );
          const freshRequests = await getAdminRequests();
          setRequests(freshRequests);
        } catch (e) {
          console.warn("Request billing sync warning:", e);
        }
      }

      if (printSlip) {
        handlePrintReceipt(newTx);
      }
    } catch (err: any) {
      alert("Failed to save invoice.");
      console.error(err);
    } finally {
      setSavingInvoice(false);
    }
  }

  // Handle Recording Shop Expense
  async function handleSaveExpense(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(expAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid expense amount greater than ₹0.");
      return;
    }
    if (!expTitle.trim()) {
      alert("Please enter a title or item description for the expense.");
      return;
    }

    setSavingExp(true);
    try {
      const newTx = await createAccountTransaction({
        transaction_date: getTodayDateString(),
        type: "expense",
        category: expCategory,
        title: expTitle.trim(),
        description: expDesc.trim() || undefined,
        amount: amt,
        payment_method: expMethod,
        reference_id: `EXP-${Date.now().toString().slice(-6)}`,
        is_settled: true,
        employee_id: session?.employeeId || "emp-staff",
        employee_name: session?.employeeName || "Counter Staff",
      });

      setTransactions((prev) => [newTx, ...prev]);
      setShowExpenseModal(false);
      setExpTitle("");
      setExpAmount("");
      setExpDesc("");
    } catch (err: any) {
      console.error(err);
      alert("Failed to record expense.");
    } finally {
      setSavingExp(false);
    }
  }

  // Universal Thermal & A4 Receipt Print Function
  function handlePrintReceipt(tx: AccountTransaction) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const formattedDate = new Date(tx.created_at || tx.transaction_date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const isDue = !tx.is_settled;
    const invNumber = tx.reference_id || `INV-${tx.id.slice(-6).toUpperCase()}`;

    const numGovtFee = typeof tx.govt_fee === "number" ? tx.govt_fee : parseFloat(String(tx.govt_fee || 0)) || 0;
    const numServiceCharge = typeof tx.service_charge === "number" ? tx.service_charge : parseFloat(String(tx.service_charge || 0)) || 0;
    const hasGovtFee = numGovtFee > 0;
    const finalGovtFee = numGovtFee;
    const finalServiceFee = numServiceCharge > 0 ? numServiceCharge : hasGovtFee ? Math.max(0, tx.amount - finalGovtFee) : tx.amount;

    let cleanDesc = (tx.description || "").trim();
    cleanDesc = cleanDesc.replace(/Category:[^|]+(\|)?/gi, "").trim();
    cleanDesc = cleanDesc.replace(/Official Fee:[^|]+(\|)?/gi, "").trim();
    cleanDesc = cleanDesc.replace(/Service (?:Fee|Charge):[^|]+/gi, "").trim();
    cleanDesc = cleanDesc.replace(/^[|\s-]+|[|\s-]+$/g, "").trim();
    if (
      cleanDesc.toLowerCase() === tx.title.toLowerCase() ||
      cleanDesc.toLowerCase().startsWith("category:") ||
      cleanDesc.toLowerCase() === "custom invoice" ||
      cleanDesc.toLowerCase() === "counter bill" ||
      cleanDesc.toLowerCase() === "counter sale"
    ) {
      cleanDesc = "";
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Receipt - ${invNumber} - ${centerProfile.name}</title>
          <style id="dynamic-page-style">
            @page { size: 80mm auto; margin: 3mm; }
            @media print {
              body { width: 72mm; margin: 0 auto !important; }
            }
          </style>
          <style>
            * { box-sizing: border-box; }
            @media print {
              .no-print { display: none !important; }
              body { background: #fff !important; padding: 0 !important; margin: 0 auto !important; }
              .receipt-wrap { box-shadow: none !important; border: none !important; margin: 0 auto !important; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
              color: #000;
              background: #f1f5f9;
              margin: 0;
              padding: 12px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .no-print-bar {
              width: 100%;
              max-width: 440px;
              background: #0f172a;
              color: #f8fafc;
              padding: 8px 12px;
              border-radius: 8px;
              margin-bottom: 12px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 8px;
              flex-wrap: wrap;
            }
            .mode-btn {
              background: #1e293b;
              color: #94a3b8;
              border: 1px solid #334155;
              padding: 4px 8px;
              border-radius: 5px;
              font-size: 11px;
              font-weight: 600;
              cursor: pointer;
            }
            .mode-btn.active {
              background: #0284c7;
              color: #fff;
              border-color: #38bdf8;
            }
            .print-btn {
              background: #059669;
              color: #fff;
              border: none;
              padding: 5px 12px;
              border-radius: 5px;
              font-size: 11px;
              font-weight: bold;
              cursor: pointer;
            }
            .receipt-wrap { background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
            .receipt-80mm { width: 72mm; padding: 6px; font-size: 11px; line-height: 1.35; }
            .receipt-58mm { width: 48mm; padding: 4px; font-size: 9.5px; line-height: 1.25; }
            .receipt-a4 { width: 140mm; padding: 20px; font-size: 12px; line-height: 1.45; border: 1.5px solid #000; border-radius: 4px; }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .title { font-size: 16px; font-weight: 900; letter-spacing: 0.8px; margin-bottom: 2px; }
            .subtitle { font-size: 9px; color: #444; margin-bottom: 5px; }
            .divider { border-top: 1px dashed #777; margin: 6px 0; }
            .divider-double { border-top: 2px solid #000; margin: 6px 0; }
            .meta-table { width: 100%; font-size: 10px; margin-bottom: 4px; }
            .meta-table td { padding: 1.5px 0; vertical-align: top; }
            .items-table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 10.5px; }
            .items-table th { border-bottom: 1.5px solid #000; padding: 4px 0; text-align: left; }
            .items-table td { padding: 3px 0; vertical-align: top; }
            .total-row { font-size: 13px; font-weight: 900; }
            .badge { display: inline-block; padding: 2px 7px; border-radius: 3px; font-weight: 900; font-size: 10px; border: 1.5px solid #000; }
            .footer { font-size: 9px; text-align: center; margin-top: 10px; color: #444; }
          </style>
        </head>
        <body>
          <div class="no-print-bar no-print">
            <div style="font-size: 11px; font-weight: 600;">Paper Format:</div>
            <div style="display: flex; gap: 4px;">
              <button type="button" class="mode-btn active" data-mode="80mm" onclick="setPrinterMode('80mm')">80mm Thermal</button>
              <button type="button" class="mode-btn" data-mode="58mm" onclick="setPrinterMode('58mm')">58mm Thermal</button>
              <button type="button" class="mode-btn" data-mode="a4" onclick="setPrinterMode('a4')">A4 / A5 Slip</button>
            </div>
            <button type="button" class="print-btn" onclick="window.print()">🖨️ Print Slip</button>
          </div>

          <div id="receipt-container" class="receipt-wrap receipt-80mm">
            <div class="center">
              <div class="title">${centerProfile.name}</div>
              <div class="subtitle">E-Services • CSC • Citizen Portals • Xerox & Printing</div>
              <div class="bold" style="font-size: 11px; text-transform: uppercase;">TAX INVOICE / CASH RECEIPT</div>
            </div>

            <div class="divider"></div>

            <table class="meta-table">
              <tr>
                <td><strong>Invoice #:</strong> ${invNumber}</td>
                <td class="right"><strong>Date:</strong> ${formattedDate}</td>
              </tr>
              <tr>
                <td><strong>Customer:</strong> ${tx.customer_name || "Walk-in Customer"}</td>
                <td class="right"><strong>Phone:</strong> ${tx.customer_phone || "—"}</td>
              </tr>
              <tr>
                <td><strong>Payment:</strong> ${tx.payment_method}</td>
                <td class="right">
                  <span class="badge">${isDue ? "UNPAID (DUE)" : "PAID"}</span>
                </td>
              </tr>
            </table>

            <div class="divider"></div>

            ${
              tx.items && tx.items.length > 0
                ? `
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 18px;">#</th>
                  <th>Service / Item</th>
                  <th class="right">Online Fee</th>
                  <th class="right">Charges</th>
                  <th class="right">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${tx.items
                  .map(
                    (it, idx) => `
                <tr style="border-bottom: 0.5px solid #eee;">
                  <td style="font-weight: bold; color: #555; vertical-align: top;">${idx + 1}</td>
                  <td>
                    <div class="bold" style="font-size: 10.5px; color: #000;">${it.service_name}</div>
                    ${it.wallet_name ? `<div style="font-size: 8px; color: #666;">Wallet: ${it.wallet_name}</div>` : ""}
                  </td>
                  <td class="right" style="font-size: 10px; color: #333; vertical-align: top;">₹${(it.online_payment || 0).toFixed(2)}</td>
                  <td class="right" style="font-size: 10px; color: #333; vertical-align: top;">₹${(it.charges || 0).toFixed(2)}</td>
                  <td class="right bold" style="font-size: 10.5px; vertical-align: top;">₹${(it.total || ((it.online_payment || 0) + (it.charges || 0))).toFixed(2)}</td>
                </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <div class="divider-double"></div>

            <table style="width: 100%; font-size: 10.5px;">
              ${numGovtFee > 0 ? `
              <tr>
                <td>Official / Online Fee (Pass-through):</td>
                <td class="right">₹${numGovtFee.toFixed(2)}</td>
              </tr>
              ` : ""}
              <tr>
                <td>Center Processing Charges:</td>
                <td class="right">₹${numServiceCharge.toFixed(2)}</td>
              </tr>
              <tr class="total-row" style="font-size: 13px; font-weight: 900;">
                <td style="padding-top: 4px;">NET TOTAL:</td>
                <td class="right" style="padding-top: 4px;">₹${tx.amount.toFixed(2)}</td>
              </tr>
            </table>

            ${tx.payment_split ? `
            <div class="divider"></div>
            <table style="width: 100%; font-size: 10px; margin-top: 2px;">
              <tr style="font-weight: bold; color: #333; text-transform: uppercase;">
                <td colspan="2">Payment Details:</td>
              </tr>
              ${tx.payment_split.cash > 0 ? `<tr><td>&bull; Cash Paid:</td><td class="right font-mono">₹${tx.payment_split.cash.toFixed(2)}</td></tr>` : ""}
              ${tx.payment_split.upi > 0 ? `<tr><td>&bull; UPI / Online:</td><td class="right font-mono">₹${tx.payment_split.upi.toFixed(2)}</td></tr>` : ""}
              ${tx.payment_split.credit > 0 ? `<tr style="color: #b91c1c; font-weight: bold;"><td>&bull; Khata Due:</td><td class="right font-mono">₹${tx.payment_split.credit.toFixed(2)}</td></tr>` : ""}
            </table>
            ` : ""}
            `
                : `
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${
                  hasGovtFee
                    ? `
                <tr>
                  <td colspan="2" style="padding-top: 4px; padding-bottom: 2px;">
                    <div class="bold" style="font-size: 11.5px; color: #000;">${tx.title}</div>
                    ${cleanDesc ? `<div style="font-size: 9px; color: #555; margin-top: 1px;">${cleanDesc}</div>` : ""}
                  </td>
                </tr>
                <tr style="color: #222;">
                  <td style="padding-left: 10px; font-size: 10.5px; padding-top: 2px; padding-bottom: 2px;">&bull; Official / Portal Fee</td>
                  <td class="right" style="font-size: 10.5px; padding-top: 2px; padding-bottom: 2px; white-space: nowrap;">₹${finalGovtFee.toFixed(2)}</td>
                </tr>
                <tr style="color: #222;">
                  <td style="padding-left: 10px; font-size: 10.5px; padding-top: 2px; padding-bottom: 2px;">&bull; Center Processing Fee</td>
                  <td class="right" style="font-size: 10.5px; padding-top: 2px; padding-bottom: 2px; white-space: nowrap;">₹${finalServiceFee.toFixed(2)}</td>
                </tr>
                `
                    : `
                <tr>
                  <td style="padding-top: 3px; padding-bottom: 3px;">
                    <div class="bold" style="font-size: 11.5px; color: #000;">${tx.title}</div>
                    ${cleanDesc && cleanDesc !== tx.title ? `<div style="font-size: 9px; color: #555; margin-top: 1px;">${cleanDesc}</div>` : ""}
                  </td>
                  <td class="right bold" style="font-size: 11px; white-space: nowrap; vertical-align: top; padding-top: 3px;">₹${tx.amount.toFixed(2)}</td>
                </tr>
                `
                }
              </tbody>
            </table>

            <div class="divider-double"></div>

            <table style="width: 100%; font-size: 11px;">
              <tr class="total-row">
                <td>NET TOTAL:</td>
                <td class="right">₹${tx.amount.toFixed(2)}</td>
              </tr>
            </table>
            `
            }

            <div class="divider"></div>

            <div class="footer">
              <p>Thank you for choosing ${centerProfile.name}!</p>
              <p style="font-size: 8px; margin-top: 3px;">Computer generated receipt • Counter: ${session?.employeeName || "Staff"}</p>
              <p style="font-size: 7.5px; margin-top: 2px; color: #555; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Powered by DenBooks 360</p>
            </div>
          </div>

          <script>
            function setPrinterMode(mode) {
              try { localStorage.setItem('dd_receipt_mode', mode); } catch (e) {}
              var container = document.getElementById('receipt-container');
              if (container) container.className = 'receipt-wrap receipt-' + mode;
              document.querySelectorAll('.mode-btn').forEach(function(btn) {
                if (btn.getAttribute('data-mode') === mode) btn.classList.add('active');
                else btn.classList.remove('active');
              });
              var pageStyle = document.getElementById('dynamic-page-style');
              if (pageStyle) {
                if (mode === '58mm') pageStyle.innerHTML = '@page { size: 58mm auto; margin: 2mm; } @media print { body { width: 48mm; margin: 0 auto !important; } }';
                else if (mode === 'a4') pageStyle.innerHTML = '@page { size: A4 portrait; margin: 15mm; } @media print { body { width: 140mm; margin: 0 auto !important; } }';
                else pageStyle.innerHTML = '@page { size: 80mm auto; margin: 3mm; } @media print { body { width: 72mm; margin: 0 auto !important; } }';
              }
            }
            window.onload = function() {
              var saved = '80mm';
              try { saved = localStorage.getItem('dd_receipt_mode') || '80mm'; } catch(e) {}
              setPrinterMode(saved);
              setTimeout(function() { window.print(); }, 250);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  // Create new customer service request
  async function handleCreateServiceRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!reqCustName.trim() || !reqCustPhone.trim() || !reqService.trim()) {
      alert("Please fill in customer name, phone number, and service.");
      return;
    }

    setSavingRequest(true);
    try {
      const gf = parseFloat(reqGovtFee) || 0;
      const sc = parseFloat(reqServiceCharge) || 0;
      const totalAmt = gf + sc;

      await createServiceRequest({
        fullName: reqCustName.trim(),
        phone: reqCustPhone.trim(),
        service: reqService.trim(),
        contactMethod: "Phone",
        description: reqNotes.trim() || `Counter Customer Application: ${reqService.trim()}`,
      });

      // Also record in daybook transaction
      await createAccountTransaction({
        transaction_date: getTodayDateString(),
        type: "income",
        category: "Service Request",
        title: reqService.trim(),
        description: `Customer Request: ${reqCustName.trim()} (${reqCustPhone.trim()})`,
        amount: totalAmt,
        govt_fee: gf,
        service_charge: sc,
        payment_method: "Cash",
        customer_name: reqCustName.trim(),
        customer_phone: reqCustPhone.trim(),
        is_settled: true,
        employee_id: session?.employeeId || "emp-1",
        employee_name: session?.employeeName || "Counter Staff",
      });

      setShowRequestModal(false);
      setReqCustName("");
      setReqCustPhone("");
      setReqService("");
      setReqNotes("");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to create request.");
    } finally {
      setSavingRequest(false);
    }
  }

  // Shift Drawer Summary (Today's statistics)
  const shiftSummary = useMemo(() => {
    let totalCash = 0;
    let totalUpi = 0;
    let totalCredit = 0;
    let totalTurnover = 0;
    let billCount = 0;
    let totalExpense = 0;
    let cashExpense = 0;
    let upiExpense = 0;
    let expenseCount = 0;

    transactions.forEach((tx) => {
      if (tx.type === "income") {
        totalTurnover += tx.amount;
        billCount += 1;
        if (!tx.is_settled) {
          totalCredit += tx.amount;
        } else if (tx.payment_method === "Cash") {
          totalCash += tx.amount;
        } else {
          totalUpi += tx.amount;
        }
      } else if (tx.type === "expense") {
        totalExpense += tx.amount;
        expenseCount += 1;
        if (tx.payment_method === "Cash") {
          cashExpense += tx.amount;
        } else {
          upiExpense += tx.amount;
        }
      }
    });

    const netCashInHand = Math.max(0, totalCash - cashExpense);

    return {
      totalCash,
      totalUpi,
      totalCredit,
      totalTurnover,
      billCount,
      totalExpense,
      cashExpense,
      upiExpense,
      expenseCount,
      netCashInHand,
    };
  }, [transactions]);

  // Unsettled Khata / Dues list
  const khataList = useMemo(() => {
    return transactions.filter((tx) => !tx.is_settled);
  }, [transactions]);

  // Filtered transactions for search
  const filteredTx = useMemo(() => {
    return transactions.filter((tx) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        tx.title.toLowerCase().includes(q) ||
        (tx.customer_name || "").toLowerCase().includes(q) ||
        (tx.customer_phone || "").includes(q) ||
        (tx.reference_id || "").toLowerCase().includes(q)
      );
    });
  }, [transactions, searchQuery]);

  // Filtered requests for search & status filter
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (requestScopeFilter === "my" && session?.employeeId) {
        if (req.employee_id !== session.employeeId) return false;
      }
      if (requestStatusFilter !== "All" && req.status !== requestStatusFilter) {
        return false;
      }
      if (!requestSearchQuery.trim()) return true;
      const q = requestSearchQuery.toLowerCase();
      const idMatch = (req.request_id || "").toLowerCase().includes(q);
      const nameMatch = (req.customers?.full_name || "").toLowerCase().includes(q);
      const phoneMatch = (req.customers?.phone || "").includes(q);
      const servMatch = (req.service || "").toLowerCase().includes(q);
      const descMatch = (req.description || "").toLowerCase().includes(q);
      return idMatch || nameMatch || phoneMatch || servMatch || descMatch;
    });
  }, [requests, requestScopeFilter, requestStatusFilter, requestSearchQuery, session]);

  // Update status for a citizen request
  async function handleUpdateRequestStatus(reqId: string, newStatus: RequestStatus) {
    setUpdatingReqStatus(true);
    try {
      await updateRequestStatus(reqId, newStatus);
      setRequests((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: newStatus } : r))
      );
      if (viewingRequest && viewingRequest.id === reqId) {
        setViewingRequest({ ...viewingRequest, status: newStatus });
      }
    } catch (e) {
      console.error("Failed to update status:", e);
      alert("Failed to update request status.");
    } finally {
      setUpdatingReqStatus(false);
    }
  }

  // Pre-fill invoice modal directly from a service request
  function createInvoiceForRequest(req: AdminRequest) {
    setInvMode("citizen");
    setInvLinkedRequestId(req.id);
    setInvCustomerName(req.customers?.full_name || "Citizen Customer");
    setInvCustomerPhone(req.customers?.phone || "");
    setInvRefId(req.request_id || `INV-${Date.now().toString().slice(-6)}`);

    const requestedService = (req.service || "Citizen Service").trim();
    setInvServiceName(requestedService);

    // Look for exact or fuzzy match in service charges catalog
    const match = serviceCharges.find(
      (s) =>
        s.serviceName.trim().toLowerCase() === requestedService.toLowerCase() ||
        s.serviceName.toLowerCase().includes(requestedService.toLowerCase()) ||
        requestedService.toLowerCase().includes(s.serviceName.toLowerCase())
    );

    if (match) {
      setInvServiceId(match.id);
    } else {
      setInvServiceId("__custom__");
    }

    // Set official govt/portal fee
    const gf =
      typeof req.govt_fee === "number" && !isNaN(req.govt_fee)
        ? req.govt_fee
        : parseFloat(String(req.govt_fee || 0)) || 0;
    setInvGovtFee(String(gf));

    // Set service charge
    let sc = 0;
    if (typeof req.service_charge === "number" && !isNaN(req.service_charge) && req.service_charge > 0) {
      sc = req.service_charge;
    } else if (req.amount !== null && req.amount !== undefined && !isNaN(Number(req.amount)) && Number(req.amount) > 0) {
      sc = Math.max(0, Number(req.amount) - gf);
    } else if (match) {
      sc = match.defaultCharge;
    } else {
      sc = 50;
    }
    setInvServiceCharge(String(sc));

    setInvNotes(req.description || "");
    setInvPaymentMethod("Cash");
    setInvIsCredit(req.payment_status === "Unpaid");
    setViewingRequest(null);
    setShowInvoiceModal(true);
  }

  // Print official job slip / acknowledgment slip
  function handlePrintRequestSlip(req: AdminRequest) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const formattedDate = new Date(req.created_at).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const trackingUrl = typeof window !== "undefined"
      ? `${window.location.origin}/request-status?requestId=${encodeURIComponent(req.request_id)}`
      : `https://digitalden360.com/request-status?requestId=${encodeURIComponent(req.request_id)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=2&data=${encodeURIComponent(trackingUrl)}`;

    const numGovtFee = typeof req.govt_fee === "number" ? req.govt_fee : parseFloat(String(req.govt_fee || 0)) || 0;
    const numServiceCharge = typeof req.service_charge === "number" ? req.service_charge : parseFloat(String(req.service_charge || 0)) || 0;
    const totalAmt = req.amount !== null && req.amount !== undefined ? Number(req.amount) : (numGovtFee + numServiceCharge);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Job Slip - ${req.request_id} - ${centerProfile.name}</title>
          <style id="dynamic-page-style">
            @page { size: 80mm auto; margin: 3mm; }
            @media print { body { width: 72mm; margin: 0 auto !important; } }
          </style>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
              color: #000;
              background: #fff;
              font-size: 11px;
              line-height: 1.35;
              padding: 6px;
            }
            .mode-bar {
              background: #f1f5f9;
              padding: 6px 10px;
              margin-bottom: 10px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-family: sans-serif;
            }
            .mode-btn {
              background: #fff;
              border: 1px solid #cbd5e1;
              border-radius: 4px;
              padding: 3px 8px;
              font-size: 10px;
              cursor: pointer;
              font-weight: 600;
            }
            .mode-btn.active {
              background: #0284c7;
              color: #fff;
              border-color: #0284c7;
            }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0; }
            }
            .receipt-wrap {
              width: 100%;
              margin: 0 auto;
            }
            .receipt-58mm { max-width: 52mm; font-size: 9.5px; }
            .receipt-80mm { max-width: 76mm; font-size: 11px; }
            .receipt-a4 { max-width: 160mm; font-size: 13px; }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: 800; }
            .shop-name {
              font-size: 15px;
              font-weight: 900;
              letter-spacing: 0.5px;
            }
            .tagline {
              font-size: 8.5px;
              font-weight: bold;
              text-transform: uppercase;
              margin-top: 1px;
              color: #333;
            }
            .contact-line { font-size: 9px; color: #444; margin-top: 2px; }
            .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
            .divider-double { border-bottom: 2px solid #000; margin: 6px 0; }
            .info-table { width: 100%; font-size: inherit; margin: 4px 0; border-collapse: collapse; }
            .info-table td { padding: 1.5px 0; vertical-align: top; }
            .badge {
              display: inline-block;
              padding: 1px 5px;
              border: 1px solid #000;
              border-radius: 3px;
              font-size: 9px;
              font-weight: bold;
            }
            .qr-sec { text-align: center; margin: 8px 0 4px; }
            .qr-sec img { width: 90px; height: 90px; display: inline-block; }
            .qr-text { font-size: 8.5px; color: #444; margin-top: 2px; }
            .footer { text-align: center; font-size: 9px; margin-top: 6px; color: #333; }
          </style>
        </head>
        <body>
          <div class="no-print mode-bar">
            <span style="font-size: 11px; font-weight: 700;">Format:</span>
            <div style="display: flex; gap: 4px;">
              <button class="mode-btn" data-mode="58mm" onclick="setPrinterMode('58mm')">58mm Thermal</button>
              <button class="mode-btn active" data-mode="80mm" onclick="setPrinterMode('80mm')">80mm Thermal</button>
              <button class="mode-btn" data-mode="a4" onclick="setPrinterMode('a4')">A4 Slip</button>
            </div>
            <button class="mode-btn" style="background:#0284c7; color:#fff;" onclick="window.print()">Print</button>
          </div>

          <div id="receipt-container" class="receipt-wrap receipt-80mm">
            <div class="center">
              <div class="shop-name">${centerProfile.name}</div>
              <div class="tagline">Citizen Services • Online Application Desk</div>
              <div class="contact-line">${centerProfile.phone ? `Mob: +91 ${centerProfile.phone} • ` : ""}CSC & Citizen Services</div>
            </div>

            <div class="divider-double"></div>

            <div class="center bold" style="font-size: 11.5px; letter-spacing: 0.5px;">
              SERVICE APPLICATION JOB SLIP
            </div>

            <table class="info-table">
              <tr>
                <td style="width: 45%;"><strong>Token / Ref:</strong></td>
                <td class="right font-mono bold" style="font-size: 10.5px;">${req.request_id}</td>
              </tr>
              <tr>
                <td><strong>Date & Time:</strong></td>
                <td class="right">${formattedDate}</td>
              </tr>
              <tr>
                <td><strong>Customer:</strong></td>
                <td class="right bold">${req.customers?.full_name || "Citizen Customer"}</td>
              </tr>
              ${req.customers?.phone ? `
              <tr>
                <td><strong>Mobile:</strong></td>
                <td class="right font-mono">${req.customers.phone}</td>
              </tr>
              ` : ""}
              <tr>
                <td><strong>Status:</strong></td>
                <td class="right"><span class="badge">${req.status.toUpperCase()}</span></td>
              </tr>
            </table>

            <div class="divider"></div>

            <div style="margin: 4px 0;">
              <div class="bold" style="font-size: 11px;">Service: ${req.service}</div>
              ${req.description ? `<div style="font-size: 9.5px; color: #444; margin-top: 2px;">Note: ${req.description}</div>` : ""}
            </div>

            <div class="divider"></div>

            <table class="info-table">
              ${numGovtFee > 0 ? `
              <tr>
                <td>Govt / Portal Fee:</td>
                <td class="right">₹${numGovtFee.toFixed(2)}</td>
              </tr>
              ` : ""}
              ${numServiceCharge > 0 ? `
              <tr>
                <td>Service Charge:</td>
                <td class="right">₹${numServiceCharge.toFixed(2)}</td>
              </tr>
              ` : ""}
              <tr style="font-weight: 800; font-size: 11.5px;">
                <td>ESTIMATED / TOTAL:</td>
                <td class="right">₹${totalAmt.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Payment Status:</td>
                <td class="right bold">${req.payment_status === "Paid" ? "PAID" : "UNPAID (COLLECT ON DELIVERY)"}</td>
              </tr>
            </table>

            <div class="qr-sec">
              <img src="${qrCodeUrl}" alt="Track QR" />
              <div class="qr-text">Scan with phone camera to track status live</div>
            </div>

            <div class="divider"></div>

            <div class="footer">
              <p>Please keep this slip safe to collect your documents</p>
              <p style="font-size: 8px; margin-top: 3px;">Counter: ${session?.employeeName || "Operator"} • ${centerProfile.name}</p>
            </div>
          </div>

          <script>
            function setPrinterMode(mode) {
              try { localStorage.setItem('dd_receipt_mode', mode); } catch (e) {}
              var container = document.getElementById('receipt-container');
              if (container) container.className = 'receipt-wrap receipt-' + mode;
              document.querySelectorAll('.mode-btn').forEach(function(btn) {
                if (btn.getAttribute('data-mode') === mode) btn.classList.add('active');
                else btn.classList.remove('active');
              });
              var pageStyle = document.getElementById('dynamic-page-style');
              if (pageStyle) {
                if (mode === '58mm') pageStyle.innerHTML = '@page { size: 58mm auto; margin: 2mm; } @media print { body { width: 48mm; margin: 0 auto !important; } }';
                else if (mode === 'a4') pageStyle.innerHTML = '@page { size: A4 portrait; margin: 15mm; } @media print { body { width: 140mm; margin: 0 auto !important; } }';
                else pageStyle.innerHTML = '@page { size: 80mm auto; margin: 3mm; } @media print { body { width: 72mm; margin: 0 auto !important; } }';
              }
            }
            window.onload = function() {
              var saved = '80mm';
              try { saved = localStorage.getItem('dd_receipt_mode') || '80mm'; } catch(e) {}
              setPrinterMode(saved);
              setTimeout(function() { window.print(); }, 250);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  function printShiftTallySlip() {
    const printWindow = window.open("", "_blank", "width=420,height=650");
    if (!printWindow) {
      window.print();
      return;
    }
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shift Closing Tally Slip - ${centerProfile.name}</title>
          <style>
            @page { size: 80mm auto; margin: 3mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; margin: 8px; font-size: 11px; color: #111; line-height: 1.35; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .right { text-align: right; }
            .shop-title { font-size: 13px; font-weight: 800; text-transform: uppercase; margin-bottom: 2px; }
            .sub { font-size: 9.5px; color: #555; }
            .divider { border-bottom: 1px dashed #777; margin: 7px 0; }
            .divider-double { border-bottom: 2px double #333; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin: 3.5px 0; }
            .cash-box { border: 1.5px solid #111; padding: 6px; margin: 8px 0; background: #fafafa; border-radius: 4px; }
            .footer-sig { margin-top: 24px; padding-top: 8px; display: flex; justify-content: space-between; font-size: 9px; }
            @media print {
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="shop-title">${centerProfile.name}</div>
            <div class="sub">SHIFT CLOSING TALLY & CASH RECONCILIATION</div>
            <div class="sub">Date: ${new Date().toLocaleDateString("en-IN")} • ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            <div class="sub">Operator: <strong>${session?.employeeName || "Front Desk Staff"}</strong> (${session?.role || "Staff"})</div>
          </div>

          <div class="divider-double"></div>

          <div class="row">
            <span>Total Bills Issued:</span>
            <span class="bold">${shiftSummary.billCount}</span>
          </div>
          <div class="row">
            <span>Physical Cash Collected:</span>
            <span class="bold">+ ₹ ${shiftSummary.totalCash.toFixed(2)}</span>
          </div>
          ${
            shiftSummary.cashExpense > 0
              ? `<div class="row" style="color: #b91c1c;">
                   <span>Less: Cash Expenses (Drawer):</span>
                   <span class="bold">- ₹ ${shiftSummary.cashExpense.toFixed(2)}</span>
                 </div>`
              : ""
          }
          <div class="row">
            <span>Online / UPI Collected:</span>
            <span>₹ ${shiftSummary.totalUpi.toFixed(2)}</span>
          </div>
          ${
            shiftSummary.upiExpense > 0
              ? `<div class="row">
                   <span>UPI / Online Expenses:</span>
                   <span>- ₹ ${shiftSummary.upiExpense.toFixed(2)}</span>
                 </div>`
              : ""
          }
          <div class="row">
            <span>Pending Customer Credit (Khata):</span>
            <span>₹ ${shiftSummary.totalCredit.toFixed(2)}</span>
          </div>

          <div class="divider"></div>

          <div class="cash-box">
            <div class="row bold" style="font-size: 13px;">
              <span>PHYSICAL CASH IN DRAWER:</span>
              <span>₹ ${shiftSummary.netCashInHand.toFixed(2)}</span>
            </div>
            <div style="font-size: 8.5px; color: #555; margin-top: 2px;">
              Physical cash amount to be verified and handed over.
            </div>
          </div>

          <div class="footer-sig">
            <div>
              Handed Over By:<br/><br/>
              <strong>${session?.employeeName || "Staff"}</strong>
            </div>
            <div class="right">
              Received By / Shop Owner:<br/><br/>
              ____________________
            </div>
          </div>

          <div class="divider" style="margin-top: 14px;"></div>
          <div class="center sub" style="font-size: 8px;">
            Powered by DenBooks 360
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 200);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  }

  if (loadingSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#070b13] text-slate-300 gap-3 px-4">
        <RefreshCw size={28} className="animate-spin text-cyan-400" />
        <span className="text-sm font-semibold tracking-wide">Loading counter session...</span>
        <p className="text-xs text-slate-500">Connecting to {centerProfile.name}</p>
        <a
          href="/staff/login"
          className="mt-3 rounded-xl border border-slate-700 bg-slate-850 px-4 py-2 text-xs font-semibold text-cyan-400 hover:border-cyan-400 hover:text-cyan-300 transition"
        >
          Go to Staff Login &rarr;
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* 1. Counter Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0e1526]/90 backdrop-blur-md px-4 md:px-6 py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/staff" className="flex h-9 w-9 shrink-0 items-center justify-center group">
              <img
                src="/logo.png"
                alt="DenBooks Logo"
                className="h-9 w-9 rounded-xl shadow-md shadow-cyan-500/20 object-cover group-hover:scale-105 transition"
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white">DenBooks Front Desk</span>
                {todayAttendance && todayAttendance.punch_in && !todayAttendance.punch_out ? (
                  <span className="rounded-full bg-teal-950/70 text-teal-300 border border-teal-800/60 px-2 py-0.5 text-[10px] font-bold">
                    🟢 Active Shift
                  </span>
                ) : todayAttendance && todayAttendance.punch_out ? (
                  <span className="rounded-full bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 text-[10px] font-bold">
                    🏁 Shift Ended
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-950/70 text-amber-300 border border-amber-800/60 px-2 py-0.5 text-[10px] font-bold">
                    ⏳ Not Clocked In
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Citizen Services • Counter Billing • Xerox & Applications</p>
            </div>
          </div>

          {/* Active Employee Info & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Center Code Badge */}
            {centerProfile.centerCode ? (
              <span className="hidden md:inline-flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-750 px-2.5 py-1 text-xs font-mono font-bold text-cyan-300" title="Center Audit Code">
                🏢 {centerProfile.centerCode}
              </span>
            ) : null}

            {/* Attendance Punch In / Punch Out Widget (hidden on Attendance tab where dedicated banner exists) */}
            {activeTab !== "attendance" && (
              todayAttendance && todayAttendance.punch_in && !todayAttendance.punch_out ? (
                <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1">
                  <span className="text-[11px] font-bold text-emerald-300">🟢 In: {todayAttendance.punch_in}</span>
                  <button
                    type="button"
                    onClick={handlePunchOut}
                    className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-200 transition"
                    title="Punch out from shift"
                  >
                    Clock Out
                  </button>
                </div>
              ) : todayAttendance && todayAttendance.punch_out ? (
                <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-400 font-medium">
                  <span>🏁 Shift Done ({todayAttendance.punch_in} - {todayAttendance.punch_out})</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handlePunchIn}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300 transition shadow-sm"
                  title="Punch in to record shift attendance"
                >
                  <UserCheck size={13} />
                  <span>Clock In</span>
                </button>
              )
            )}

            {/* Quick Admin Dashboard switch if admin/supervisor */}
            {(session?.role === "Branch Supervisor" || session?.employeeId === "emp-admin-owner") && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition shadow-sm"
              >
                <span>&larr; Admin Suite</span>
              </Link>
            )}

            <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-[#121b2f] px-3 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/20 font-bold text-cyan-300 text-xs">
                {session?.employeeName.charAt(0) || "S"}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">{session?.employeeName}</div>
                <div className="text-[10px] text-cyan-400 font-medium leading-tight">{session?.role}</div>
              </div>
            </div>

            <ThemeToggle />

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20 transition shadow-sm"
              title="Logout and end current shift"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Modern Segmented Front Desk Navigation Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0e1526] p-2.5 shadow-md">
          {/* Module Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-0.5 rounded-xl bg-slate-100 dark:bg-[#090d16]/70 border border-slate-200 dark:border-slate-800/60 flex-wrap sm:flex-nowrap">
            <Link
              href="/staff/tokens"
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "tokens"
                  ? "bg-pink-100 text-pink-700 border border-pink-300 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/40 font-bold shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/40"
              }`}
            >
              <Ticket size={13} className={activeTab === "tokens" ? "text-pink-600 dark:text-pink-400" : "text-slate-500"} />
              <span>Queue Tokens</span>
              {queueStats.waitingCount > 0 && (
                <span className="rounded-full bg-pink-500 text-slate-950 font-black px-1.5 py-0.2 text-[10px]">
                  {queueStats.waitingCount}
                </span>
              )}
            </Link>

            <Link
              href="/staff/reception"
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "reception"
                  ? "bg-violet-100 text-violet-700 border border-violet-300 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/40 font-bold shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/40"
              }`}
            >
              <Sparkles size={13} className={activeTab === "reception" ? "text-violet-600 dark:text-violet-400" : "text-slate-500"} />
              <span>Reception Intake</span>
            </Link>

            <Link
              href="/staff/invoices"
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "invoices"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/40"
              }`}
            >
              <Receipt size={13} className={activeTab === "invoices" ? "text-slate-950" : "text-slate-500"} />
              <span>Invoices & Bills</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${activeTab === "invoices" ? "bg-slate-950 text-cyan-300" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400"}`}>
                {transactions.length}
              </span>
            </Link>

            <Link
              href="/staff/requests"
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "requests"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/40"
              }`}
            >
              <FileText size={13} className={activeTab === "requests" ? "text-slate-950" : "text-slate-500"} />
              <span>Citizen Requests</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${activeTab === "requests" ? "bg-slate-950 text-cyan-300" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400"}`}>
                {requests.length}
              </span>
            </Link>

            <Link
              href="/staff/khata"
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "khata"
                  ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-400/40 font-bold shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/40"
              }`}
            >
              <Clock size={13} className={activeTab === "khata" ? "text-amber-600 dark:text-amber-400" : "text-slate-500"} />
              <span>Customer Khata</span>
              {khataList.length > 0 && (
                <span className="rounded-full bg-amber-200 text-amber-800 border border-amber-300 dark:bg-amber-500/30 dark:text-amber-300 dark:border-amber-500/40 px-1.5 py-0.2 text-[10px] font-bold">
                  {khataList.length}
                </span>
              )}
            </Link>

            <Link
              href="/staff/drawer"
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "drawer"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/40 font-bold shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/40"
              }`}
            >
              <Banknote size={13} className={activeTab === "drawer" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"} />
              <span>Shift Drawer</span>
            </Link>

            <Link
              href="/staff/attendance"
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "attendance"
                  ? "bg-teal-100 text-teal-800 border border-teal-300 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/40 font-bold shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/40"
              }`}
            >
              <UserCheck size={13} className={activeTab === "attendance" ? "text-teal-600 dark:text-teal-400" : "text-slate-500"} />
              <span>Attendance</span>
              {todayAttendance && (
                <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 px-1.5 py-0.2 text-[10px] font-bold">
                  {todayAttendance.punch_out ? "Done" : "In"}
                </span>
              )}
            </Link>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isReceptionistOrAdmin && (
              <button
                type="button"
                onClick={() => {
                  setTokCustName("");
                  setTokCustPhone("");
                  setTokService("Aadhaar / Citizen Services");
                  setTokPriority("Normal");
                  setTokCounter("Counter 1");
                  setTokNotes("");
                  setShowTokenModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-pink-500/30 bg-pink-500/10 px-3 py-1.5 text-xs font-bold text-pink-700 dark:text-pink-300 hover:bg-pink-500/20 transition shadow-sm"
                title="Issue sequential queue token for arriving citizen (First-Come, First-Served)"
              >
                <Ticket size={13} />
                <span>Issue Token</span>
              </button>
            )}

            {isReceptionistOrAdmin && activeTab !== "requests" && (
              <button
                type="button"
                onClick={() => setShowRequestModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/70 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-slate-500 hover:text-white transition shadow-sm"
              >
                <Plus size={13} />
                <span>New Request</span>
              </button>
            )}

            {(!session?.permissions || session?.permissions.canRecordExpense !== false) && (
              <button
                type="button"
                onClick={() => {
                  setExpTitle("");
                  setExpAmount("");
                  setExpDesc("");
                  setExpCategory("Paper & Stationery");
                  setExpMethod("Cash");
                  setShowExpenseModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-500/20 hover:border-red-400 transition shadow-sm"
                title="Record shop expense paid from cash drawer or staff UPI"
              >
                <ArrowDownRight size={13} />
                <span>Add Expense</span>
              </button>
            )}

            <button
              type="button"
              onClick={openInvoiceModalDialog}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-3.5 py-1.5 text-xs font-black text-slate-950 hover:brightness-110 transition shadow-md shadow-cyan-400/20"
            >
              <Receipt size={14} />
              <span>Add Invoice</span>
            </button>
          </div>
        </div>

        {/* 1-Screen Consolidated Command Bar: 4 Wallets (Left) + 4 Shift KPIs (Right) (Only on Invoices overview) */}
        {activeTab === "invoices" && !hideShiftWidgets && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Left: 4 Portal Wallets (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] p-3.5 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-50 dark:bg-cyan-400/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-400/20">
                    <Landmark size={13} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Bank & Portal Accounts
                  </span>
                </div>
                <span className="font-mono text-xs font-black text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 px-2 py-0.5 rounded-md">
                  Total: ₹{wallets.reduce((s, w) => s + w.balance, 0).toLocaleString("en-IN")}
                </span>
              </div>

              {/* 2x2 Wallet Grid */}
              <div className="grid grid-cols-2 gap-2">
                {wallets.map((wallet) => {
                  const isLow = wallet.balance <= wallet.min_alert_balance;
                  return (
                    <div
                      key={wallet.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-slate-900/80 p-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-slate-800 dark:text-slate-300 truncate" title={wallet.name}>
                          {wallet.name}
                        </span>
                        {isLow && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 animate-pulse" title="Low Balance" />
                        )}
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                          ₹{wallet.balance.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          min ₹{wallet.min_alert_balance}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: 4 Shift Financial KPI Cards + Operator Badge (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] p-3.5 shadow-md flex flex-col justify-between">
              {/* Operator info strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Shift Operator: <span className="text-cyan-700 dark:text-cyan-300">{session?.employeeName}</span> ({session?.role})
                  </span>
                  <span className="rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50 px-1.5 py-0.2 text-[9.5px] font-bold">
                    Isolated Drawer
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Personal daily tally
                </span>
              </div>

              {/* 4 Shift KPI Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Today's Invoices */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 p-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="text-[10px] font-semibold uppercase">Bills Issued</span>
                    <Receipt size={12} className="text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="mt-1 font-mono text-lg font-black text-slate-900 dark:text-white">
                    {shiftSummary.billCount}
                  </div>
                  <div className="text-[9.5px] text-slate-500 dark:text-slate-400">Today's count</div>
                </div>

                {/* Cash in Drawer */}
                <div className="rounded-xl border border-emerald-300 dark:border-emerald-500/25 bg-emerald-50 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-emerald-950/20 p-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400">
                    <span className="text-[10px] font-semibold uppercase">Cash Drawer</span>
                    <Banknote size={12} />
                  </div>
                  <div className="mt-1 font-mono text-lg font-black text-emerald-900 dark:text-emerald-300">
                    ₹{shiftSummary.netCashInHand.toFixed(0)}
                  </div>
                  <div className="text-[9.5px] text-emerald-700 dark:text-emerald-400/70">
                    {shiftSummary.cashExpense > 0 ? `After -₹${shiftSummary.cashExpense.toFixed(0)} exp` : "Physical tally"}
                  </div>
                </div>

                {/* UPI / Online */}
                <div className="rounded-xl border border-sky-300 dark:border-cyan-500/25 bg-sky-50 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-cyan-950/20 p-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-sky-800 dark:text-cyan-400">
                    <span className="text-[10px] font-semibold uppercase">UPI / Online</span>
                    <Smartphone size={12} />
                  </div>
                  <div className="mt-1 font-mono text-lg font-black text-sky-900 dark:text-cyan-300">
                    ₹{shiftSummary.totalUpi.toFixed(0)}
                  </div>
                  <div className="text-[9.5px] text-sky-700 dark:text-cyan-400/70">QR / Scanner</div>
                </div>

                {/* Total Turnover / Expenses */}
                <div className="rounded-xl border border-teal-300 dark:border-teal-500/25 bg-teal-50 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-teal-950/20 p-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-teal-800 dark:text-teal-400">
                    <span className="text-[10px] font-semibold uppercase">Shift Sales</span>
                    <TrendingUp size={12} />
                  </div>
                  <div className="mt-1 font-mono text-lg font-black text-teal-950 dark:text-white">
                    ₹{shiftSummary.totalTurnover.toFixed(0)}
                  </div>
                  <div className="text-[9.5px] text-teal-700 dark:text-teal-400/70">
                    {shiftSummary.totalExpense > 0 ? `₹${shiftSummary.totalExpense.toFixed(0)} exp logged` : "Counter total"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 0: QUEUE TOKENS (FIRST-COME, FIRST-SERVED) */}
        {activeTab === "tokens" && (
          <div className="space-y-6">
            {/* 1. Queue Status & Call Next Hero Banner */}
            <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-[#0c1322] p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-slate-950 font-black shadow-lg shadow-pink-500/30">
                  <Megaphone size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base tracking-wide">
                      Citizen Queue Management
                    </span>
                    <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-300 border border-pink-500/30">
                      FCFS Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Call next waiting citizen, print 58mm/80mm thermal queue slips, and convert directly to counter billing or service applications.
                  </p>
                </div>
              </div>

              {/* Call Next Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={callingToken || queueStats.waitingCount === 0}
                  onClick={() => handleCallNext("Counter 1")}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-3 text-xs font-black text-slate-950 hover:brightness-110 active:scale-95 transition shadow-lg shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Megaphone size={16} className={callingToken ? "animate-bounce" : ""} />
                  <span>{callingToken ? "Calling..." : "📢 Call Next Citizen"}</span>
                </button>
              </div>
            </div>

            {/* 2. 4 Metric KPI Cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Now Serving */}
              <div className="rounded-2xl border border-pink-500/30 bg-pink-950/20 p-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-300 uppercase tracking-wider">Now Serving</span>
                  <Megaphone size={16} className="text-pink-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">
                    {queueStats.currentServing ? queueStats.currentServing.token_number : "None"}
                  </span>
                  {queueStats.currentServing && (
                    <span className="text-xs font-semibold text-pink-300">
                      at {queueStats.currentServing.counter_assigned || "Counter 1"}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-pink-300/80 truncate">
                  {queueStats.currentServing ? queueStats.currentServing.customer_name : "Click 'Call Next' to invite"}
                </div>
              </div>

              {/* Card 2: Waiting in Line */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Waiting in Line</span>
                  <Clock size={16} className="text-amber-400" />
                </div>
                <div className="mt-2 text-2xl font-black text-amber-300">
                  {queueStats.waitingCount} <span className="text-xs font-semibold text-amber-400/80 font-sans">citizens</span>
                </div>
                <div className="mt-1 text-[11px] text-amber-400/80">
                  First-Come, First-Served queue
                </div>
              </div>

              {/* Card 3: Total Issued Today */}
              <div className="rounded-2xl border border-slate-800 bg-[#0c1322] p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Issued Today</span>
                  <Ticket size={16} className="text-teal-400" />
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  {queueStats.total}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {queueStats.completedCount} Served • {queueStats.cancelledCount} Cancelled
                </div>
              </div>

              {/* Card 4: Est. Wait Time */}
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Est. Wait Time</span>
                  <TrendingUp size={16} className="text-cyan-400" />
                </div>
                <div className="mt-2 text-2xl font-black text-cyan-300">
                  ~{queueStats.estimatedWaitMinutes} <span className="text-xs font-semibold text-cyan-400/80 font-sans">mins</span>
                </div>
                <div className="mt-1 text-[11px] text-cyan-400/80">
                  Based on ~6 min average per service
                </div>
              </div>
            </div>

            {/* 3. Search and Status Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search token #, citizen name, phone, or service..."
                  value={tokenSearchQuery}
                  onChange={(e) => setTokenSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-pink-400 transition"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(["All", "Waiting", "Serving", "Completed", "Cancelled"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setTokenStatusFilter(st)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                      tokenStatusFilter === st
                        ? "bg-pink-500 text-slate-950 font-black shadow-md shadow-pink-500/20"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {st === "All"
                      ? `All (${tokens.length})`
                      : st === "Waiting"
                      ? `Waiting (${queueStats.waitingCount})`
                      : st === "Serving"
                      ? `Serving (${queueStats.servingCount})`
                      : st === "Completed"
                      ? `Completed (${queueStats.completedCount})`
                      : `Cancelled (${queueStats.cancelledCount})`}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Live Queue Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0c1322] shadow-xl shadow-black/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Token #</th>
                      <th className="px-4 py-3">Citizen Name & Phone</th>
                      <th className="px-4 py-3">Service Required</th>
                      <th className="px-4 py-3">Assigned Counter</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Wait Time</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredTokens.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                          No tokens match the selected filter. {isReceptionistOrAdmin ? 'Click "+ Issue Token (FCFS)" to register arriving citizens!' : 'Waiting for Reception desk to issue new queue tokens.'}
                        </td>
                      </tr>
                    ) : (
                      filteredTokens.map((tok) => {
                        const isServing = tok.status === "Serving";
                        const isWaiting = tok.status === "Waiting";
                        const isCompleted = tok.status === "Completed";
                        const isCancelled = tok.status === "Cancelled";

                        return (
                          <tr
                            key={tok.id}
                            className={`transition ${
                              isServing
                                ? "bg-pink-950/20 border-l-4 border-pink-500"
                                : "hover:bg-slate-900/40"
                            }`}
                          >
                            {/* Token # and Priority */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-black text-pink-300 bg-pink-500/10 border border-pink-500/30 px-2.5 py-1 rounded-lg">
                                  {tok.token_number}
                                </span>
                                {tok.priority !== "Normal" && (
                                  <span
                                    className={`rounded-md px-1.5 py-0.5 text-[9.5px] font-bold ${
                                      tok.priority === "Urgent"
                                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    }`}
                                  >
                                    {tok.priority}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Citizen Info */}
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-white text-xs">{tok.customer_name}</div>
                              {tok.customer_phone ? (
                                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Phone size={10} className="text-cyan-400" />
                                  <span className="font-mono">{tok.customer_phone}</span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-500">Walk-in</span>
                              )}
                            </td>

                            {/* Service */}
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-slate-200">{tok.service_requested}</div>
                              {tok.notes && (
                                <div className="text-[10px] text-slate-400 max-w-xs truncate">{tok.notes}</div>
                              )}
                            </td>

                            {/* Counter */}
                            <td className="px-4 py-3.5">
                              <span className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-300 border border-slate-700">
                                {tok.counter_assigned || "Counter 1"}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5 text-center">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                                  isCompleted
                                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                    : isServing
                                    ? "bg-pink-500/20 text-pink-300 border-pink-400/40 animate-pulse"
                                    : isWaiting
                                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                    : "bg-slate-800 text-slate-400 border-slate-700"
                                }`}
                              >
                                {tok.status.toUpperCase()}
                              </span>
                            </td>

                            {/* Wait Time */}
                            <td className="px-4 py-3.5 text-center font-mono text-[11px] text-slate-400">
                              {Math.max(1, Math.round((Date.now() - new Date(tok.created_at).getTime()) / 60000))} min
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {isWaiting && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateToken(tok.id, "Serving")}
                                    className="rounded-lg bg-pink-500/20 border border-pink-500/40 px-2.5 py-1 text-[11px] font-bold text-pink-300 hover:bg-pink-500/30 transition flex items-center gap-1"
                                    title="Call this citizen to counter"
                                  >
                                    <Megaphone size={11} />
                                    <span>Call</span>
                                  </button>
                                )}

                                {/* Convert to Service Request (Receptionist Only) */}
                                {isReceptionistOrAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => handleConvertTokenToRequest(tok)}
                                    className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:border-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
                                    title="Create Citizen Application / Service Request from Token"
                                  >
                                    <FileText size={11} />
                                    <span>Request</span>
                                  </button>
                                )}

                                {/* Convert to Counter POS & Xerox */}
                                <button
                                  type="button"
                                  onClick={() => handleConvertTokenToInvoice(tok)}
                                  className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:border-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
                                  title="Bill for Counter POS / Xerox / Printing"
                                >
                                  <Receipt size={11} />
                                  <span>Bill</span>
                                </button>

                                {/* Thermal Slip Print */}
                                <button
                                  type="button"
                                  onClick={() => printQueueTokenSlip(tok)}
                                  className="rounded-lg border border-slate-700 bg-slate-800/80 p-1 text-slate-300 hover:border-pink-400 hover:text-pink-300 transition"
                                  title="Print 58mm/80mm Thermal Queue Slip"
                                >
                                  <Printer size={13} />
                                </button>

                                {isServing && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateToken(tok.id, "Completed")}
                                    className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition flex items-center gap-1"
                                    title="Mark token completed"
                                  >
                                    <Check size={11} />
                                    <span>Done</span>
                                  </button>
                                )}

                                {!isCompleted && !isCancelled && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Cancel token ${tok.token_number} for ${tok.customer_name}?`)) {
                                        handleUpdateToken(tok.id, "Cancelled");
                                      }
                                    }}
                                    className="rounded-lg border border-slate-800 p-1 text-slate-500 hover:bg-red-500/20 hover:text-red-300 transition"
                                    title="Cancel Token"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 0.5: RECEPTION CITIZEN INTAKE DESK */}
        {activeTab === "reception" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-r from-[#141226] via-[#161b33] to-[#0c1626] p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  <Sparkles size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base tracking-wide">
                      Reception Citizen Intake Desk
                    </span>
                    <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-500/30">
                      Front-Desk Express
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Fast citizen registration with multi-service chip selection. Issue sequential queue tokens or jump directly to multi-item billing.
                  </p>
                </div>
              </div>

            </div>

            {/* Reception Form Card */}
            <div className="rounded-2xl border border-slate-800 bg-[#0e1526] p-5 sm:p-6 shadow-md space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-200 block mb-1">
                    Citizen Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abdul Rahman / Deepa K"
                    value={receptionCustName}
                    onChange={(e) => setReceptionCustName(e.target.value)}
                    className="w-full rounded-xl border border-slate-750 bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-white outline-none focus:border-violet-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-200 block mb-1">
                    Mobile Phone Number (WhatsApp Reminders)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9847012345 (10-digit)"
                    value={receptionCustPhone}
                    onChange={(e) => setReceptionCustPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-750 bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-white outline-none focus:border-violet-400"
                  />
                </div>
              </div>

              {/* Multi-Service Chips Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-200">
                    Select Required Services (Multi-Select Chips)
                  </label>
                  <span className="text-[11px] text-violet-400 font-semibold">
                    {receptionSelectedServices.length} service{receptionSelectedServices.length === 1 ? "" : "s"} selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    "Building Tax Online Payment",
                    "National / State Scholarship",
                    "Motor Vehicle e-Challan / Tax",
                    "Passport Seva Online",
                    "Income / Caste Certificate (e-District)",
                    "Birth / Death / Marriage Certificate",
                    "Aadhaar Update & Verification",
                    "Jeevan Pramaan Life Certificate",
                    "Ration Card Amendment",
                    "KSEB / Water Bill Payment",
                    "Photocopy / Xerox & Scanning",
                    "New PAN Card / Correction",
                    "Employment Exchange Renewal",
                    "Land Tax / Thandapper (Revenue Portal)",
                    "CMDRF / Welfare Fund Application",
                  ].map((serviceName) => {
                    const isSelected = receptionSelectedServices.includes(serviceName);
                    return (
                      <button
                        key={serviceName}
                        type="button"
                        onClick={() => {
                          setReceptionSelectedServices((prev) =>
                            isSelected ? prev.filter((s) => s !== serviceName) : [...prev, serviceName]
                          );
                        }}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold transition border flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-violet-600 text-white keep-white border-violet-500 shadow-sm font-bold"
                            : "bg-slate-900/90 text-slate-300 border-slate-750 hover:border-slate-600 hover:text-white"
                        }`}
                      >
                        <span>{isSelected ? "✓" : "+"}</span>
                        <span>{serviceName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Service & Priority */}
              <div className="grid gap-4 sm:grid-cols-3 pt-1">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Other / Custom Service Not In List
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Legal Affidavit, PSC Profile Update"
                    value={receptionCustomService}
                    onChange={(e) => setReceptionCustomService(e.target.value)}
                    className="w-full rounded-xl border border-slate-750 bg-slate-900 px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Priority Level
                  </label>
                  <select
                    value={receptionPriority}
                    onChange={(e) => setReceptionPriority(e.target.value as QueuePriority)}
                    className="w-full rounded-xl border border-slate-750 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-violet-400"
                  >
                    <option value="Normal">Normal Queue</option>
                    <option value="Urgent">⚡ Urgent Priority</option>
                    <option value="Senior Citizen / PWD">🧓 Senior Citizen / PWD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Intake Notes / Token Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brought old ration card and Aadhaar original"
                  value={receptionNotes}
                  onChange={(e) => setReceptionNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-750 bg-slate-900 px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-400"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={receptionSubmitting}
                  onClick={() => handleReceptionIssueToken(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-pink-500 hover:bg-pink-400 py-3 text-xs font-bold text-slate-950 transition shadow-md shadow-pink-500/20 disabled:opacity-50"
                >
                  <Printer size={15} />
                  <span>Issue & Print Queue Token</span>
                </button>

                <button
                  type="button"
                  disabled={receptionSubmitting}
                  onClick={() => handleReceptionIssueToken(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-pink-500/40 bg-pink-500/15 hover:bg-pink-500/25 px-5 py-3 text-xs font-bold text-pink-700 dark:text-pink-200 transition shadow-sm"
                >
                  <Ticket size={15} />
                  <span>Issue Digital Token</span>
                </button>

                <button
                  type="button"
                  onClick={handleReceptionDirectBill}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:brightness-110 px-6 py-3 text-xs font-black text-slate-950 transition shadow-md shadow-cyan-400/20"
                >
                  <Receipt size={15} />
                  <span>Proceed to Invoicing &rarr;</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: INVOICES & BILLS */}
        {activeTab === "invoices" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search invoice #, customer name, phone, or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition"
                />
              </div>

              <button
                type="button"
                onClick={loadData}
                disabled={loadingData}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white"
              >
                <RefreshCw size={13} className={loadingData ? "animate-spin text-cyan-400" : ""} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0c1322] shadow-xl shadow-black/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Invoice # / Ref</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Particulars / Service</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3 text-right">Amount (₹)</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Print</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredTx.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                          No transactions recorded yet today. Click "+ Add Invoice" or "+ Add Expense" above!
                        </td>
                      </tr>
                    ) : (
                      filteredTx.map((tx) => {
                        const isExpense = tx.type === "expense";
                        return (
                          <tr key={tx.id} className={`hover:bg-slate-900/40 transition ${isExpense ? "bg-red-950/10" : ""}`}>
                            <td className="px-4 py-3.5 font-mono text-xs">
                              <span className={isExpense ? "text-red-400" : "text-cyan-300"}>
                                {tx.reference_id || `${isExpense ? "EXP" : "INV"}-${tx.id.slice(-6).toUpperCase()}`}
                              </span>
                            </td>

                            <td className="px-4 py-3.5">
                              {isExpense ? (
                                <div>
                                  <span className="inline-flex items-center gap-1 rounded bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-300">
                                    <ArrowDownRight size={10} />
                                    <span>Shop Expense</span>
                                  </span>
                                  <div className="text-[10px] text-slate-400 mt-0.5">{tx.category}</div>
                                </div>
                              ) : (
                                <div>
                                  <div className="font-bold text-white text-xs">{tx.customer_name || "Walk-in Customer"}</div>
                                  {tx.customer_phone && (
                                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                      <Phone size={10} />
                                      <span>{tx.customer_phone}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="font-bold text-slate-200">{tx.title}</div>
                              {tx.description && tx.description !== tx.title && (
                                <div className="text-[10px] text-slate-400 truncate max-w-xs">{tx.description}</div>
                              )}
                            </td>

                            <td className="px-4 py-3.5">
                              <span className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-300 border border-slate-700">
                                {tx.payment_method === "Cash" ? "💵 Cash" : tx.payment_method === "UPI" ? "📱 UPI" : "🏦 Bank"}
                              </span>
                            </td>

                            <td className={`px-4 py-3.5 text-right font-mono font-bold text-sm ${isExpense ? "text-red-400" : "text-emerald-400"}`}>
                              {isExpense ? "- " : "+ "}₹ {tx.amount.toFixed(2)}
                            </td>

                            <td className="px-4 py-3.5 text-center">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                                  isExpense
                                    ? "bg-red-500/15 text-red-300 border-red-500/30"
                                    : tx.is_settled
                                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                }`}
                              >
                                {isExpense ? "EXPENSE" : tx.is_settled ? "PAID" : "DUE"}
                              </span>
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              {!isExpense && (
                                <button
                                  type="button"
                                  onClick={() => handlePrintReceipt(tx)}
                                  className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-300 transition"
                                  title="Print Thermal / A4 Receipt Slip"
                                >
                                  <Printer size={14} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CITIZEN SERVICE REQUESTS */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Active Citizen Service Applications</h3>
                <p className="text-xs text-slate-400">Track, view customer requirements, update statuses, and print job slips.</p>
              </div>
              {isReceptionistOrAdmin && (
                <button
                  type="button"
                  onClick={() => setShowRequestModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:brightness-110 shadow-md shadow-cyan-500/20 transition self-start sm:self-auto"
                >
                  <Plus size={14} />
                  <span>New Service Request</span>
                </button>
              )}
            </div>

            {/* Search & Status Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0c1322] p-3 rounded-2xl border border-slate-800">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search token #, customer name, mobile, service..."
                    value={requestSearchQuery}
                    onChange={(e) => setRequestSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition"
                  />
                </div>

                {/* Scope Toggle: All Applications vs My Handled */}
                <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/90 p-1 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setRequestScopeFilter("all")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      requestScopeFilter === "all"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All ({requests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestScopeFilter("my")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 ${
                      requestScopeFilter === "my"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>My Handled</span>
                    <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-cyan-300">
                      {requests.filter((r) => r.employee_id === session?.employeeId).length}
                    </span>
                  </button>
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {(["All", "Pending", "Processing", "Completed", "Rejected"] as const).map((st) => {
                  const count = st === "All" ? requests.length : requests.filter((r) => r.status === st).length;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setRequestStatusFilter(st)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                        requestStatusFilter === st
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                          : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      {st} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Request Cards Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRequests.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-slate-800 bg-[#0c1322] p-10 text-center text-slate-400 text-xs">
                  No matching service requests found.
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-2xl border border-slate-800 bg-[#0c1322] p-4 flex flex-col justify-between hover:border-slate-700/80 transition shadow-sm space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setViewingRequest(req)}
                          className="font-mono text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline tracking-tight text-left"
                          title="Click to view full customer request"
                        >
                          {req.request_id}
                        </button>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            req.status === "Completed"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                              : req.status === "Processing"
                              ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/30"
                              : req.status === "Rejected"
                              ? "bg-red-500/20 text-red-300 border-red-400/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-400/30"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-white text-sm line-clamp-1">{req.service}</h4>
                        <div className="text-xs text-slate-300 mt-1 flex items-center justify-between">
                          <span className="font-semibold text-white truncate max-w-[140px]">
                            {req.customers?.full_name || "Walk-in Citizen"}
                          </span>
                          {req.customers?.phone && (
                            <span className="font-mono text-slate-400 text-[11px]">{req.customers.phone}</span>
                          )}
                        </div>
                        {req.description && (
                          <p className="text-[11px] text-slate-400 mt-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 line-clamp-2">
                            {req.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Fee</span>
                        <span className="font-mono font-bold text-emerald-300 text-sm">
                          ₹ {req.amount ? Number(req.amount).toFixed(2) : "0.00"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => createInvoiceForRequest(req)}
                          className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-2.5 py-1.5 text-xs font-bold text-slate-950 hover:brightness-110 transition shadow-sm"
                          title="Generate bill & invoice for this citizen application"
                        >
                          <Receipt size={13} />
                          <span>Invoice</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setViewingRequest(req)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/25 transition"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>

                        {req.status !== "Completed" && (
                          <button
                            type="button"
                            onClick={async () => {
                              await updateRequestStatus(req.id, "Completed");
                              loadData();
                            }}
                            className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-2 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition"
                            title="Mark as Completed"
                          >
                            <CheckCircle2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER KHATA & DUES */}
        {activeTab === "khata" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-amber-300">Pending Customer Khata (Credit Due)</h3>
                <p className="text-xs text-amber-200/80">Collect payments from customers who have pending balances.</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-amber-300/80 block uppercase">Total Dues to Collect</span>
                <span className="font-mono text-xl font-black text-amber-300">
                  ₹ {shiftSummary.totalCredit.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0c1322]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Particulars</th>
                      <th className="px-4 py-3 text-right">Due Amount (₹)</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {khataList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                          🎉 No pending customer dues right now!
                        </td>
                      </tr>
                    ) : (
                      khataList.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-900/40">
                          <td className="px-4 py-3 font-bold text-white">{tx.customer_name || "Walk-in"}</td>
                          <td className="px-4 py-3 font-mono">{tx.customer_phone || "—"}</td>
                          <td className="px-4 py-3">{tx.title}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-amber-300">
                            ₹ {tx.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {tx.customer_phone ? (
                                <a
                                  href={`https://wa.me/${
                                    tx.customer_phone.replace(/\D/g, "").length === 10
                                      ? `91${tx.customer_phone.replace(/\D/g, "")}`
                                      : tx.customer_phone.replace(/\D/g, "")
                                  }?text=${encodeURIComponent(
                                    `Namaste ${tx.customer_name || "Customer"} 🙏\nThis is a gentle payment reminder from ${centerProfile.name} regarding your pending balance of ₹${tx.amount.toFixed(2)} for "${tx.title}".\n${centerProfile.phone ? `You can pay via UPI to ${centerProfile.phone}.\n` : ""}Thank you!`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                                  title="Send WhatsApp Payment Reminder"
                                >
                                  <MessageCircle size={12} />
                                  <span>Remind</span>
                                </a>
                              ) : null}

                              {session?.role === "Receptionist" || (session?.permissions && !session.permissions.canSettleCredit) ? (
                                <span
                                  className="inline-block text-[10.5px] text-slate-500 font-semibold px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800"
                                  title="Settling customer debt/khata is restricted to counter operators & supervisors"
                                >
                                  🔒 Cashier Only
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    alert(`Collected ₹${tx.amount} from ${tx.customer_name}. Marked settled.`);
                                    setTransactions((prev) =>
                                      prev.map((t) => (t.id === tx.id ? { ...t, is_settled: true } : t))
                                    );
                                  }}
                                  className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition"
                                >
                                  Collect & Settle
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SHIFT DRAWER TALLY */}
        {activeTab === "drawer" && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Top 4 Quick Shift Summary Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="rounded-2xl border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/80 dark:bg-gradient-to-br dark:from-[#0c1322] dark:to-[#0f241d] p-4 shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Cash in Drawer</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                    <Banknote size={15} />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="font-mono text-2xl font-black text-emerald-900 dark:text-emerald-300">
                    ₹ {shiftSummary.netCashInHand.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-emerald-700 dark:text-slate-400 mt-0.5">Physical cash ready for handover</p>
                </div>
              </div>

              <div className="rounded-2xl border border-sky-300 dark:border-cyan-500/30 bg-sky-50/80 dark:bg-gradient-to-br dark:from-[#0c1322] dark:to-[#102236] p-4 shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 dark:text-cyan-400">UPI / Online</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 dark:bg-cyan-500/20 text-sky-700 dark:text-cyan-400">
                    <Smartphone size={15} />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                    ₹ {shiftSummary.totalUpi.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-sky-700 dark:text-slate-400 mt-0.5">QR & online settlements</p>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50/80 dark:bg-gradient-to-br dark:from-[#0c1322] dark:to-[#261f12] p-4 shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Customer Dues</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                    <Clock3 size={15} />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="font-mono text-2xl font-black text-amber-900 dark:text-amber-300">
                    ₹ {shiftSummary.totalCredit.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-amber-700 dark:text-slate-400 mt-0.5">Pending khata balances</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gradient-to-br dark:from-[#0c1322] dark:to-[#161c2c] p-4 shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Bills Issued</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <Receipt size={15} />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                    {shiftSummary.billCount}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Completed transactions</p>
                </div>
              </div>
            </div>

            {/* Main 2-Column Side-by-Side Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Shift Drawer Reconciliation & Breakdown (7 cols) */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] p-5 md:p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
                      <Receipt size={17} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Shift Drawer Reconciliation</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Cash in drawer report to hand over to shop owner</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-500">Operator:</span>
                    <div className="font-bold text-cyan-700 dark:text-cyan-300">{session?.employeeName}</div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{session?.role}</span>
                  </div>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800/80">
                    <span className="text-slate-600 dark:text-slate-400 font-sans">Total Bills / Invoices Issued:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{shiftSummary.billCount} bills</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800/80">
                    <span className="text-slate-600 dark:text-slate-400 font-sans">Physical Cash Collected:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">+ ₹ {shiftSummary.totalCash.toFixed(2)}</span>
                  </div>
                  {shiftSummary.cashExpense > 0 && (
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800/80">
                      <span className="text-rose-600 dark:text-rose-400 font-sans">Less: Cash Drawer Expenses Paid:</span>
                      <span className="font-bold text-rose-700 dark:text-rose-400">- ₹ {shiftSummary.cashExpense.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800/80">
                    <span className="text-slate-600 dark:text-slate-400 font-sans">Online / UPI Collected:</span>
                    <span className="font-bold text-cyan-700 dark:text-cyan-300">₹ {shiftSummary.totalUpi.toFixed(2)}</span>
                  </div>
                  {shiftSummary.upiExpense > 0 && (
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800/80">
                      <span className="text-slate-600 dark:text-slate-400 font-sans">Online / UPI Expenses Paid:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">- ₹ {shiftSummary.upiExpense.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800/80">
                    <span className="text-slate-600 dark:text-slate-400 font-sans">Pending Customer Credit (Khata):</span>
                    <span className="font-bold text-amber-700 dark:text-amber-300">₹ {shiftSummary.totalCredit.toFixed(2)}</span>
                  </div>
                </div>

                {/* Net Physical Cash Box */}
                <div className="rounded-xl border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:to-teal-950/20 p-4 flex items-center justify-between shadow-inner">
                  <div>
                    <span className="font-sans font-black text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                      Physical Cash In Drawer
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-slate-400 font-sans">
                      Verified count to physically deposit or hand over
                    </span>
                  </div>
                  <span className="font-mono font-black text-emerald-900 dark:text-emerald-300 text-2xl">
                    ₹ {shiftSummary.netCashInHand.toFixed(2)}
                  </span>
                </div>

                <div className="pt-2 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={printShiftTallySlip}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 py-3 px-4 text-xs font-bold text-slate-950 hover:brightness-110 active:scale-95 transition shadow-lg shadow-cyan-400/20 cursor-pointer"
                  >
                    <Printer size={15} />
                    <span>Print Shift Closing Tally Slip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/20 active:scale-95 transition cursor-pointer"
                  >
                    <ArrowDownRight size={14} />
                    <span>Add Expense</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Bank & Portal Accounts Standing (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] p-5 md:p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
                      <Landmark size={17} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Bank & Portal Accounts</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Live balances available for service processing</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-800/60 px-2.5 py-1 rounded-full">
                    Total: ₹{wallets.reduce((s, w) => s + (w.balance || 0), 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {wallets.map((w) => {
                    const isLow = (w.balance || 0) <= (w.min_alert_balance || 1000);
                    return (
                      <div
                        key={w.id}
                        className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 p-3.5 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-200 text-xs truncate" title={w.name}>
                              {w.name}
                            </span>
                            {isLow && (
                              <span className="rounded bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800/60 px-1.5 py-0.5 text-[9.5px] font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-600 dark:bg-rose-400 animate-pulse" />
                                <span>Low</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400 mt-1">
                            <span>{w.category}</span>
                            <span>•</span>
                            <span>Min Alert: ₹{(w.min_alert_balance || 1000).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`font-mono text-sm font-black ${isLow ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-300"}`}>
                            ₹ {(w.balance || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/30 p-3 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="text-cyan-700 dark:text-cyan-400 font-semibold">💡 Automatic Deductions:</span> Official fees for online applications (e.g. Passport, e-District, PAN) deduct directly from these portal balances.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STAFF ATTENDANCE REGISTER */}
        {activeTab === "attendance" && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Attendance Top Banner */}
            <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-r from-[#0c1f24] via-[#0f2420] to-[#0d1626] p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  <UserCheck size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base tracking-wide">
                      Staff Daily Attendance Register
                    </span>
                    {centerProfile.centerCode ? (
                      <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/30 font-mono">
                        Center: {centerProfile.centerCode}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Live clock-in and clock-out shift logging, timestamps, and staff daily attendance tracking.
                  </p>
                </div>
              </div>

              {/* Personal Punch Status Widget */}
              <div className="flex items-center gap-2.5">
                {todayAttendance && todayAttendance.punch_in && !todayAttendance.punch_out ? (
                  <button
                    type="button"
                    onClick={handlePunchOut}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition shadow-md shadow-amber-500/20"
                  >
                    <LogOut size={14} />
                    <span>Clock Out (In: {todayAttendance.punch_in})</span>
                  </button>
                ) : todayAttendance && todayAttendance.punch_out ? (
                  <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300">
                    ✅ Shift Completed ({todayAttendance.punch_in} &rarr; {todayAttendance.punch_out})
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handlePunchIn}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-black text-slate-950 transition shadow-md shadow-emerald-500/20"
                  >
                    <UserCheck size={15} />
                    <span>Clock In for Today</span>
                  </button>
                )}
              </div>
            </div>

            {/* Attendance Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="rounded-2xl border border-slate-800 bg-[#0e1526] p-4 shadow-sm">
                <span className="text-[11px] font-bold uppercase text-slate-400">Total Staff Punched In</span>
                <p className="mt-1 font-mono text-2xl font-black text-emerald-400">
                  {attendanceRecords.filter((r) => r.punch_in && !r.punch_out).length}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Currently on active duty</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0e1526] p-4 shadow-sm">
                <span className="text-[11px] font-bold uppercase text-slate-400">Completed Shifts</span>
                <p className="mt-1 font-mono text-2xl font-black text-cyan-400">
                  {attendanceRecords.filter((r) => r.punch_out).length}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Punched out successfully</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0e1526] p-4 shadow-sm">
                <span className="text-[11px] font-bold uppercase text-slate-400">Today's Date</span>
                <p className="mt-1 font-mono text-xl font-black text-slate-200">
                  {getTodayDateString()}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Branch attendance register</p>
              </div>
            </div>

            {/* Today's Staff Register Table */}
            <div className="rounded-2xl border border-slate-800 bg-[#0e1526] overflow-hidden shadow-md">
              <div className="border-b border-slate-800 bg-[#121b2f] px-5 py-3.5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Today's Branch Attendance Records</h3>
                  <p className="text-[11px] text-slate-400">All staff clock-ins and clock-outs recorded for today</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const today = getTodayDateString();
                    const all = await getDailyAttendance(today);
                    setAttendanceRecords(all);
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-850 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1"
                >
                  <RefreshCw size={12} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-[10.5px] uppercase font-bold text-slate-400">
                      <th className="py-2.5 px-4">#</th>
                      <th className="py-2.5 px-4">Employee</th>
                      <th className="py-2.5 px-4">Role</th>
                      <th className="py-2.5 px-4">Punch In</th>
                      <th className="py-2.5 px-4">Punch Out</th>
                      <th className="py-2.5 px-4">Shift Hours</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {attendanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No attendance records found for today yet. Use the Clock In button to punch in!
                        </td>
                      </tr>
                    ) : (
                      attendanceRecords.map((att, idx) => (
                        <tr key={att.id} className="hover:bg-slate-900/40 transition">
                          <td className="py-3 px-4 font-bold text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-4 font-bold text-white">{att.employee_name}</td>
                          <td className="py-3 px-4 text-slate-400">{att.role}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                            {att.punch_in || "—"}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-300">
                            {att.punch_out || <span className="text-amber-400 text-[11px]">Active</span>}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300">
                            {att.shift_hours ? `${att.shift_hours} hrs` : "—"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                att.punch_out
                                  ? "bg-slate-800 text-slate-300"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              }`}
                            >
                              {att.punch_out ? "Completed" : "On Duty"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 2.5 RECORD SHOP EXPENSE MODAL */}
      {showExpenseModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowExpenseModal(false);
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-[#121c2d] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 bg-[#162236] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-red-500/30 bg-red-500/15 p-2 text-red-300">
                  <ArrowDownRight size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Record Shop Expense</h3>
                  <p className="text-xs text-slate-400">Deducts from shift cash drawer / accounts</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Expense Category *
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as AccountCategory)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs text-white outline-none focus:border-red-400"
                >
                  <option value="Paper & Stationery">Paper & Stationery (A4, envelopes)</option>
                  <option value="Ink & Toner">Ink & Toner Refills / Cartridges</option>
                  <option value="Refreshments & Tea">Tea, Refreshments & Snacks</option>
                  <option value="Shop Electricity">Electricity & Power Bill</option>
                  <option value="Internet & WiFi">Internet Broadband Recharge</option>
                  <option value="Shop Rent">Monthly Shop Rent</option>
                  <option value="Hardware & Maintenance">Machine Repair & Maintenance</option>
                  <option value="Staff & Wages">Staff Wages / Helper</option>
                  <option value="Other Expense">Other Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Expense Item / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2 Reams A4 Paper JK Copier, Morning Tea"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs text-white outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Amount (₹) *
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-bold text-red-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="e.g. 150"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-8 pr-3 text-sm font-bold text-white outline-none focus:border-red-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Paid From
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExpMethod("Cash")}
                    className={`rounded-xl border py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      expMethod === "Cash"
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-sm"
                        : "border-slate-700 bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>💵 Cash (Drawer)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpMethod("UPI")}
                    className={`rounded-xl border py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      expMethod === "UPI"
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-sm"
                        : "border-slate-700 bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>📱 UPI / Online</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Notes / Bill Details (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Purchased from Town Book Depot"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-slate-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={savingExp}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-xs font-bold text-white hover:bg-red-600 transition shadow-md shadow-red-500/20 disabled:opacity-50"
                >
                  {savingExp ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Save Expense</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ADD INVOICE & BILL MODAL */}
      {showInvoiceModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowInvoiceModal(false);
          }}
        >
          <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-700/80 bg-[#0e1526] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-[#121b2f] px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Receipt size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">New Counter Invoice</h3>
                    <span className="font-mono text-[11px] text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                      {invRefId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Multi-service billing, automated wallet deductions & split payments</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex border-b border-slate-800 bg-[#090d16]/60 p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => setInvMode("citizen")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  invMode === "citizen"
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <span>🏛️ Citizen Invoicing (Multi-Item)</span>
              </button>
              <button
                type="button"
                onClick={() => setInvMode("counter")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  invMode === "counter"
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <span>🖨️ Counter Xerox POS</span>
              </button>
              <button
                type="button"
                onClick={() => setInvMode("custom")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  invMode === "custom"
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <span>✍️ Custom Bill</span>
              </button>
            </div>

            {/* Form wrapping scrollable body and permanent sticky footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveInvoice(invAutoPrint);
              }}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Tab 1: Citizen Multi-Item Invoicing */}
              {invMode === "citizen" && (
                <div className="space-y-3.5 rounded-xl border border-slate-800 bg-[#0e1625] p-3.5">
                  {/* Linked Request Notification Banner */}
                  {invLinkedRequestId && (
                    <div className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-cyan-400" />
                        <span className="font-semibold">Imported from Request #{invRefId}</span>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-mono">Service Auto-Linked</span>
                    </div>
                  )}

                  {/* Quick Preset Selector & Add Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/70 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-200">Quick Add Service Preset:</span>
                      <select
                        value={invQuickAddServiceId}
                        onChange={(e) => {
                          const sid = e.target.value;
                          setInvQuickAddServiceId(sid);
                          if (sid) {
                            const match = serviceCharges.find((sc) => sc.id === sid);
                            if (match) {
                              handleAddInvoiceItem(match.serviceName, match.defaultCharge, 0);
                            }
                            setInvQuickAddServiceId("");
                          }
                        }}
                        className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-white outline-none focus:border-cyan-400 max-w-[220px]"
                      >
                        <option value="">-- Choose Preset Service --</option>
                        {serviceCharges.map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {sc.serviceName} (₹{sc.defaultCharge})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddInvoiceItem("General Citizen Service", 50, 0)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition shrink-0"
                    >
                      <Plus size={13} />
                      <span>Add Row</span>
                    </button>
                  </div>

                  {/* Multi-Item Table (AceApp standard) */}
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/80 text-[10.5px] uppercase font-bold text-slate-400">
                          <th className="py-2 px-2.5 w-8 text-center">#</th>
                          <th className="py-2 px-2.5 min-w-[180px]">Service Name *</th>
                          <th className="py-2 px-2.5 w-40">Wallet (Deduct)</th>
                          <th className="py-2 px-2 w-28 text-right">Online Pay (₹)</th>
                          <th className="py-2 px-2 w-24 text-right">Charges (₹)</th>
                          <th className="py-2 px-2.5 w-24 text-right">Total (₹)</th>
                          <th className="py-2 px-1 w-8 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {invItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-900/40 transition">
                            <td className="py-2 px-2.5 text-center font-bold text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-2.5">
                              <input
                                type="text"
                                required
                                placeholder="Service description..."
                                value={item.service_name}
                                onChange={(e) =>
                                  handleUpdateInvoiceItem(item.id, { service_name: e.target.value })
                                }
                                className="w-full rounded-lg border border-slate-750 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-100 outline-none focus:border-cyan-400"
                              />
                            </td>
                            <td className="py-2 px-2.5">
                              <select
                                value={item.wallet_id}
                                onChange={(e) =>
                                  handleUpdateInvoiceItem(item.id, { wallet_id: e.target.value })
                                }
                                className="w-full rounded-lg border border-slate-750 bg-slate-900 px-2 py-1 text-[11px] text-slate-200 outline-none focus:border-cyan-400"
                              >
                                <option value="">External / None</option>
                                {wallets.map((w) => (
                                  <option key={w.id} value={w.id}>
                                    {w.name} (₹{w.balance.toLocaleString("en-IN")})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-2 text-right">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="0"
                                value={item.online_payment}
                                onChange={(e) =>
                                  handleUpdateInvoiceItem(item.id, {
                                    online_payment: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-24 rounded-lg border border-slate-750 bg-slate-900 px-2 py-1 text-xs font-mono font-bold text-right text-slate-200 outline-none focus:border-cyan-400"
                              />
                            </td>
                            <td className="py-2 px-2 text-right">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="100"
                                value={item.charges}
                                onChange={(e) =>
                                  handleUpdateInvoiceItem(item.id, {
                                    charges: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-20 rounded-lg border border-slate-750 bg-slate-900 px-2 py-1 text-xs font-mono font-bold text-right text-cyan-300 outline-none focus:border-cyan-400"
                              />
                            </td>
                            <td className="py-2 px-2.5 text-right font-mono font-black text-emerald-400 text-xs">
                              ₹{(Number(item.online_payment || 0) + Number(item.charges || 0)).toFixed(0)}
                            </td>
                            <td className="py-2 px-1 text-center">
                              {invItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInvoiceItem(item.id)}
                                  className="text-slate-500 hover:text-red-400 transition p-1"
                                  title="Delete line item"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-slate-750 bg-slate-900/90 text-xs font-bold text-slate-300">
                          <td colSpan={3} className="py-2 px-3 text-left">
                            <span className="text-slate-400">Total Items:</span> {invItems.length}
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-slate-300">
                            ₹{invCitizenOnlineTotal.toFixed(0)}
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-cyan-300">
                            ₹{invCitizenChargesTotal.toFixed(0)}
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono text-emerald-400 font-black">
                            ₹{invTotalAmount.toFixed(0)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Invoice Notes / Application Reference (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Application No. 8923048, Tatkal verification"
                      value={invNotes}
                      onChange={(e) => setInvNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-750 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Counter POS */}
              {invMode === "counter" && (
                <div className="space-y-3 rounded-xl border border-slate-800 bg-[#0e1625] p-3.5">
                  <div className="text-[11px] font-bold text-slate-300">Click to add Xerox / Print items:</div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {products.map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => addInvProduct(prod)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 hover:border-cyan-400/50"
                      >
                        <span>{prod.name}</span>
                        <span className="font-mono font-bold text-emerald-400">₹{prod.rate}</span>
                        <span className="rounded bg-cyan-500/20 px-1 text-[10px] font-bold text-cyan-300">+</span>
                      </button>
                    ))}
                  </div>

                  {invCart.length > 0 && (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 space-y-1.5">
                      {invCart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-1 text-xs text-white"
                        >
                          <div>
                            <span className="font-bold">{item.product.name}</span>
                            <span className="text-slate-400 ml-2">₹{item.product.rate} each</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-slate-800 rounded px-1.5 py-0.5">
                              <button type="button" onClick={() => updateInvQty(item.product.id, -1)} className="px-1 font-bold text-slate-400">
                                -
                              </button>
                              <span className="font-bold font-mono px-1">{item.qty}</span>
                              <button type="button" onClick={() => updateInvQty(item.product.id, 1)} className="px-1 font-bold text-slate-400">
                                +
                              </button>
                            </div>
                            <span className="font-mono font-bold text-emerald-400 w-14 text-right">
                              ₹{(item.product.rate * item.qty).toFixed(0)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Custom Bill */}
              {invMode === "custom" && (
                <div className="space-y-3 rounded-xl border border-slate-800 bg-[#0e1625] p-3.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Particulars / Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Legal Agreement & Malayalam Typing"
                      value={invCustomTitle}
                      onChange={(e) => setInvCustomTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Bill Amount (₹) *</label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      required
                      placeholder="e.g. 250"
                      value={invCustomAmount}
                      onChange={(e) => setInvCustomAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono font-bold text-emerald-400 outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              )}

              {/* Customer & Split Payment Allocation Section */}
              <div className="rounded-xl border border-slate-800 bg-[#0e1625] p-3.5 space-y-3.5">
                {/* Customer Details */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Customer Name{" "}
                      {isCreditActive ? (
                        <span className="text-amber-400 font-bold">* (Required for WhatsApp Khata)</span>
                      ) : (
                        <span className="text-slate-500">(Optional for cash)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder={isCreditActive ? "Enter Customer Full Name *" : "Walk-in Customer"}
                      value={invCustomerName}
                      onChange={(e) => setInvCustomerName(e.target.value)}
                      className={`w-full rounded-xl border bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 ${
                        isCreditActive && (!invCustomerName.trim() || invCustomerName.trim().toLowerCase() === "walk-in customer" || invCustomerName.trim().toLowerCase() === "walk-in")
                          ? "border-amber-500 ring-1 ring-amber-500/50"
                          : "border-slate-700"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Mobile Phone{" "}
                      {isCreditActive ? (
                        <span className="text-amber-400 font-bold">* (10-Digit Mobile Required)</span>
                      ) : (
                        <span className="text-slate-500">(Optional)</span>
                      )}
                    </label>
                    <input
                      type="tel"
                      placeholder={isCreditActive ? "10-digit mobile number *" : "10-digit mobile (optional)"}
                      value={invCustomerPhone}
                      onChange={(e) => setInvCustomerPhone(e.target.value)}
                      className={`w-full rounded-xl border bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 ${
                        isCreditActive && (!invCustomerPhone.trim() || invCustomerPhone.trim().replace(/\D/g, "").length < 10)
                          ? "border-amber-500 ring-1 ring-amber-500/50"
                          : "border-slate-700"
                      }`}
                    />
                  </div>
                </div>

                {isCreditActive && (
                  <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11px] text-amber-300">
                    <MessageSquare size={15} className="shrink-0 text-emerald-400" />
                    <span>Customer Name & 10-digit phone number are strictly required for Credit/Khata so WhatsApp payment reminders can be triggered automatically.</span>
                  </div>
                )}

                {/* Split Payment Allocation Inputs */}
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <label className="text-[11px] font-bold text-slate-200">
                      Payment Allocation (Cash / UPI / Khata Split):
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={handleSetAllCash}
                        className="rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-200 transition"
                      >
                        💵 All Cash
                      </button>
                      <button
                        type="button"
                        onClick={handleSetAllUpi}
                        className="rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-bold text-cyan-300 transition"
                      >
                        📱 All UPI
                      </button>
                      <button
                        type="button"
                        onClick={handleSetAllCredit}
                        className="rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300 transition"
                      >
                        ⏳ All Khata
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Cash */}
                    <div className="rounded-xl border border-slate-750 bg-slate-900/90 p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-300">💵 Cash Paid</span>
                        <span className="text-[10px] text-slate-500">Drawer</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={invCashAmount}
                        onChange={(e) => setInvCashAmount(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-100 outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* UPI */}
                    <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-cyan-300">📱 UPI / QR</span>
                        <span className="text-[10px] text-cyan-400/80">Online</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={invUpiAmount}
                        onChange={(e) => setInvUpiAmount(e.target.value)}
                        className="w-full rounded-lg border border-cyan-500/40 bg-slate-950 px-2.5 py-1.5 text-xs font-mono font-bold text-cyan-300 outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Credit / Khata */}
                    <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-amber-300">⏳ Credit / Khata</span>
                        <span className="text-[10px] text-amber-400/80">Due debt</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={invCreditAmount}
                        onChange={(e) => setInvCreditAmount(e.target.value)}
                        className="w-full rounded-lg border border-amber-500/40 bg-slate-950 px-2.5 py-1.5 text-xs font-mono font-bold text-amber-300 outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Allocation Status Indicator */}
                  {Math.abs(allocationRemaining) < 0.01 ? (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        <span>Exact bill amount allocated: <strong>₹{totalAllocated.toFixed(2)}</strong></span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-emerald-400">100% Balanced</span>
                    </div>
                  ) : allocationRemaining > 0.01 ? (
                    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300 flex items-center justify-between">
                      <span>⚠️ <strong>₹{allocationRemaining.toFixed(2)}</strong> remaining to allocate</span>
                      <button
                        type="button"
                        onClick={() => {
                          const rem = Math.max(0, allocationRemaining);
                          setInvCashAmount(String(allocatedCash + rem));
                        }}
                        className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold hover:bg-amber-500/30 transition"
                      >
                        + Add to Cash
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 flex items-center justify-between">
                      <span>⚠️ Overallocated by <strong>₹{(-allocationRemaining).toFixed(2)}</strong>! Please adjust amounts.</span>
                      <span className="font-mono text-[11px] font-bold">Exceeds Total</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Banner & Payment Breakdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-800 bg-[#121b2f] p-3.5 shadow-sm gap-2">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-300">Total Invoice Amount</span>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>Cash: <strong className="text-slate-200">₹{allocatedCash.toFixed(0)}</strong></span>
                    <span>• UPI: <strong className="text-cyan-300">₹{allocatedUpi.toFixed(0)}</strong></span>
                    {allocatedCredit > 0 && (
                      <span>• Khata Due: <strong className="text-amber-300">₹{allocatedCredit.toFixed(0)}</strong></span>
                    )}
                  </div>
                </div>
                <div className="font-mono text-2xl font-black text-cyan-300 text-right">
                  ₹{invTotalAmount.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Permanent Sticky Modal Footer - ALWAYS VISIBLE */}
            <div className="shrink-0 border-t border-slate-800 bg-[#121b2f] px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium select-none">
                <input
                  type="checkbox"
                  checked={invAutoPrint}
                  onChange={(e) => setInvAutoPrint(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-cyan-400 cursor-pointer"
                />
                <Printer size={14} className="text-cyan-400" />
                <span>Auto-print receipt slip upon saving</span>
              </label>

              <button
                type="submit"
                disabled={savingInvoice || Math.abs(allocationRemaining) > 0.01}
                className="w-full sm:w-auto sm:min-w-[220px] rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:brightness-110 active:scale-95 py-2.5 px-6 text-xs font-black text-slate-950 transition shadow-md shadow-cyan-400/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Receipt size={14} />
                <span>{savingInvoice ? "Recording..." : `Save Invoice (₹${invTotalAmount.toFixed(0)})`}</span>
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* 4. NEW SERVICE REQUEST MODAL */}
      {showRequestModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowRequestModal(false);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#0c1322] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">New Citizen Service Request</h3>
                <p className="text-[11px] text-slate-400">Generate job slip and register customer application</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateServiceRequest} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  value={reqCustName}
                  onChange={(e) => setReqCustName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Customer Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={reqCustPhone}
                  onChange={(e) => setReqCustPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Service Required *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Passport Application Online"
                  value={reqService}
                  onChange={(e) => setReqService(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Official Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={reqGovtFee}
                    onChange={(e) => setReqGovtFee(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono font-bold text-slate-300 outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Shop Fee (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="100"
                    value={reqServiceCharge}
                    onChange={(e) => setReqServiceCharge(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono font-bold text-cyan-300 outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Work Instructions / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Appointment required on next Monday morning"
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={savingRequest}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-2.5 text-xs font-bold text-slate-950"
                >
                  {savingRequest ? "Creating..." : "Create Request & Register Job"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs text-slate-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. VIEW CUSTOMER REQUEST DETAILS MODAL */}
      {viewingRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn overflow-y-auto"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setViewingRequest(null);
          }}
        >
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-700/90 bg-[#0c1322] p-6 shadow-2xl my-8 text-slate-100 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-cyan-400">
                    {viewingRequest.request_id}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                        navigator.clipboard.writeText(viewingRequest.request_id);
                        setCopiedReqId(true);
                        setTimeout(() => setCopiedReqId(false), 2000);
                      }
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-800 p-1 text-slate-400 hover:text-white transition"
                    title="Copy Token ID"
                  >
                    {copiedReqId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                      viewingRequest.status === "Completed"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                        : viewingRequest.status === "Processing"
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/30"
                        : viewingRequest.status === "Rejected"
                        ? "bg-red-500/20 text-red-300 border-red-400/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-400/30"
                    }`}
                  >
                    {viewingRequest.status}
                  </span>
                </div>
                <h3 className="text-base font-black text-white mt-1">
                  {viewingRequest.service}
                </h3>
                <p className="text-xs text-slate-400">
                  Submitted on {new Date(viewingRequest.created_at).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewingRequest(null)}
                className="rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Status Workflow Changer */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Update Application Status:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {(["Pending", "Processing", "Completed", "Rejected"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={updatingReqStatus || viewingRequest.status === st}
                    onClick={() => handleUpdateRequestStatus(viewingRequest.id, st)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                      viewingRequest.status === st
                        ? st === "Completed"
                          ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20"
                          : st === "Processing"
                          ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                          : st === "Rejected"
                          ? "bg-red-500 text-white font-black"
                          : "bg-amber-500 text-slate-950 font-black"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                    } disabled:opacity-50`}
                  >
                    {viewingRequest.status === st && <Check size={12} />}
                    <span>{st}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Details Card */}
            <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider">
                    Customer Information
                  </span>
                  <div className="text-base font-bold text-white mt-0.5">
                    {viewingRequest.customers?.full_name || "Walk-in Citizen"}
                  </div>
                  <div className="text-xs text-slate-300 font-mono mt-0.5 flex items-center gap-2">
                    {viewingRequest.customers?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={11} className="text-cyan-400" />
                        {viewingRequest.customers.phone}
                      </span>
                    )}
                    {viewingRequest.customers?.email && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Mail size={11} />
                        {viewingRequest.customers.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct Contact Actions */}
                <div className="flex items-center gap-2">
                  {viewingRequest.customers?.phone && (
                    <a
                      href={`https://wa.me/91${viewingRequest.customers.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                        `Hello ${viewingRequest.customers.full_name || "Customer"}, we are contacting you from ${centerProfile.name} regarding your request ${viewingRequest.request_id} for ${viewingRequest.service}. Current Status: ${viewingRequest.status}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition"
                    >
                      <MessageSquare size={13} />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  {viewingRequest.customers?.phone && (
                    <a
                      href={`tel:${viewingRequest.customers.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-400/40 hover:text-cyan-300 transition"
                    >
                      <Phone size={13} />
                      <span>Call</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Requirement / Description Box */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Application Requirements & Work Notes:
              </span>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
                {viewingRequest.description || "No specific instructions or remarks entered."}
              </div>
            </div>

            {/* Fee & Billing Breakdown */}
            <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <IndianRupee size={13} className="text-emerald-400" />
                  Fees & Billing Summary
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                    viewingRequest.payment_status === "Paid"
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {viewingRequest.payment_status === "Paid" ? "● PAID" : "○ UNPAID (COLLECT ON DELIVERY)"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                  <span className="text-[10px] font-medium text-slate-400 block uppercase">Govt / Portal Fee</span>
                  <span className="font-mono text-xs font-bold text-white mt-1 block">
                    ₹ {Number(viewingRequest.govt_fee || 0).toFixed(2)}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                  <span className="text-[10px] font-medium text-cyan-400 block uppercase">Service Charge</span>
                  <span className="font-mono text-xs font-bold text-cyan-300 mt-1 block">
                    ₹ {Number(viewingRequest.service_charge || (viewingRequest.amount && !viewingRequest.govt_fee ? viewingRequest.amount : 0)).toFixed(2)}
                  </span>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5">
                  <span className="text-[10px] font-medium text-emerald-400 block uppercase">Total Amount</span>
                  <span className="font-mono text-sm font-black text-emerald-300 mt-0.5 block">
                    ₹ {Number(viewingRequest.amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => createInvoiceForRequest(viewingRequest)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 shadow-md shadow-cyan-500/20 transition"
                >
                  <Receipt size={14} />
                  <span>Add Invoice & Bill</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePrintRequestSlip(viewingRequest)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-200 hover:border-cyan-400 hover:text-cyan-300 transition"
                >
                  <Printer size={14} />
                  <span>Print Job Slip</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {viewingRequest.status !== "Completed" && (
                  <button
                    type="button"
                    onClick={async () => {
                      await handleUpdateRequestStatus(viewingRequest.id, "Completed");
                      loadData();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition"
                  >
                    <CheckCircle2 size={14} />
                    <span>Mark Complete</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setViewingRequest(null)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ISSUE QUEUE TOKEN MODAL (FCFS) */}
      {showTokenModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowTokenModal(false);
          }}
        >
          <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl border border-slate-800 bg-[#0c1322] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                  <Ticket size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Issue Queue Token (FCFS)</h3>
                  <p className="text-[11px] text-slate-400">First-Come, First-Served ticket with thermal slip</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTokenModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleIssueToken(false);
              }}
              className="flex-1 overflow-y-auto p-5 space-y-4 text-xs"
            >
              {/* Customer Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Citizen / Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  value={tokCustName}
                  onChange={(e) => setTokCustName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-pink-400 transition"
                  autoFocus
                />
              </div>

              {/* Customer Phone */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Mobile Number (Optional, for SMS/WhatsApp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    maxLength={10}
                    value={tokCustPhone}
                    onChange={(e) => setTokCustPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900 pl-11 pr-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 outline-none focus:border-pink-400 transition"
                  />
                </div>
              </div>

              {/* Service Required */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Service Required *
                  </label>
                  <span className="text-[10px] text-slate-400">Quick-click preset or customize</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aadhaar Card Correction"
                  value={tokService}
                  onChange={(e) => setTokService(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-pink-400 transition"
                />

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    "Aadhaar / PVC Card",
                    "PAN Card Apply",
                    "Income / Caste Certificate",
                    "Photocopy & Xerox",
                    "Passport / Visa",
                    "Banking / Cash",
                    "Online Job Application",
                    "Utility Bill Payment",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTokService(preset)}
                      className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition ${
                        tokService === preset
                          ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                          : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority & Destination Counter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Priority Selection */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Queue Priority
                  </label>
                  <select
                    value={tokPriority}
                    onChange={(e) => setTokPriority(e.target.value as QueuePriority)}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-pink-400 transition"
                  >
                    <option value="Normal">Normal (Standard FCFS)</option>
                    <option value="Senior Citizen">Senior Citizen (Priority)</option>
                    <option value="Urgent">Urgent / Medical Emergency</option>
                  </select>
                </div>

                {/* Assigned Counter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Routing Counter Desk
                  </label>
                  <select
                    value={tokCounter}
                    onChange={(e) => setTokCounter(e.target.value)}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-pink-400 transition"
                  >
                    <option value="Counter 1">Counter 1 (Front Desk / Reception)</option>
                    <option value="Counter 2">Counter 2 (CSC Citizen Portals)</option>
                    <option value="Counter 3">Counter 3 (Printing, Xerox & DTP)</option>
                  </select>
                </div>
              </div>

              {/* Remarks / Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Notes / Particulars (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Needs 5 copies, brought original documents"
                  value={tokNotes}
                  onChange={(e) => setTokNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-pink-400 transition"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  disabled={savingToken}
                  onClick={() => handleIssueToken(true)}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-2.5 text-xs font-black text-slate-950 hover:brightness-110 shadow-md shadow-pink-500/20 transition disabled:opacity-50"
                >
                  <Printer size={14} />
                  <span>🖨️ Issue & Print Slip</span>
                </button>

                <button
                  type="submit"
                  disabled={savingToken}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:border-pink-400/40 hover:text-pink-300 transition disabled:opacity-50"
                >
                  <Ticket size={14} />
                  <span>Issue Only</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTokenModal(false)}
                  className="w-full sm:w-auto rounded-xl border border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-850 hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
