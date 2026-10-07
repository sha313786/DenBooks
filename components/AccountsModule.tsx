"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  IndianRupee,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Calendar,
  Download,
  Printer,
  CheckCircle2,
  Clock3,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  MessageCircle,
  FileText,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Receipt,
  X,
  Send,
  Zap,
  Settings,
  RotateCcw,
  Check,
  Users,
} from "lucide-react";
import {
  AccountTransaction,
  PortalWallet,
  CounterProduct,
  DEFAULT_COUNTER_PRODUCTS,
  ServiceChargeItem,
  DEFAULT_SERVICE_CHARGES,
  TransactionType,
  PaymentMethod,
  AccountCategory,
  getTodayDateString,
  getAccountTransactions,
  createAccountTransaction,
  deleteAccountTransaction,
  settleTransaction,
  getPortalWallets,
  topupPortalWallet,
  deductPortalWallet,
  calculateDaybookSummary,
  getCounterProducts,
  saveCounterProducts,
  getServiceChargesMaster,
  saveServiceChargesMaster,
  resetAllBalancesToZero,
  resetPortalWalletsToZero,
  resetDaybookTransactions,
} from "@/lib/services/accounts.service";
import { getEmployees, Employee } from "@/lib/services/employee.service";

type AccountsSubTab = "daybook" | "counter_pos" | "khata";
const VALID_SUBTABS: AccountsSubTab[] = ["daybook", "counter_pos", "khata"];

export function AccountsModule() {
  const [subTab, setSubTabState] = useState<AccountsSubTab>("daybook");

  // Sync sub-tab with URL search parameter or localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const subParam = params.get("sub") as AccountsSubTab;
    if (subParam && VALID_SUBTABS.includes(subParam)) {
      setSubTabState(subParam);
      return;
    }
    try {
      const saved = localStorage.getItem("dd_accounts_subtab") as AccountsSubTab;
      if (saved && VALID_SUBTABS.includes(saved)) {
        setSubTabState(saved);
      }
    } catch {}
  }, []);

  const setSubTab = useCallback((tab: AccountsSubTab) => {
    setSubTabState(tab);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("dd_accounts_subtab", tab);
        const url = new URL(window.location.href);
        url.searchParams.set("sub", tab);
        window.history.replaceState({}, "", url.toString());
      } catch {}
    }
  }, []);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [wallets, setWallets] = useState<PortalWallet[]>([]);
  const [products, setProducts] = useState<CounterProduct[]>([]);
  const [serviceCharges, setServiceCharges] = useState<ServiceChargeItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [staffFilter, setStaffFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | "all">("all");

  // Modals state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invMode, setInvMode] = useState<"citizen" | "counter" | "custom">("citizen");
  const [invDate, setInvDate] = useState<string>(getTodayDateString());
  const [invCustomerName, setInvCustomerName] = useState("");
  const [invCustomerPhone, setInvCustomerPhone] = useState("");
  const [invRefId, setInvRefId] = useState("");
  const [invPaymentMethod, setInvPaymentMethod] = useState<PaymentMethod>("Cash");
  const [invIsCredit, setInvIsCredit] = useState(false);
  const [savingInvoice, setSavingInvoice] = useState(false);

  // Citizen Service Invoice inputs
  const [invServiceId, setInvServiceId] = useState("");
  const [invServiceName, setInvServiceName] = useState("");
  const [invServiceCategory, setInvServiceCategory] = useState("Govt Portals");
  const [invGovtFee, setInvGovtFee] = useState("0");
  const [invServiceCharge, setInvServiceCharge] = useState("");
  const [invWalletId, setInvWalletId] = useState("");
  const [invServiceNotes, setInvServiceNotes] = useState("");

  // Counter POS Invoice inputs
  const [invCart, setInvCart] = useState<Array<{ product: CounterProduct; qty: number }>>([]);
  const [invCustomItem, setInvCustomItem] = useState("");
  const [invCustomRate, setInvCustomRate] = useState("");
  const [invCustomQty, setInvCustomQty] = useState("1");

  // Custom Bill inputs
  const [invCustomTitle, setInvCustomTitle] = useState("");
  const [invCustomAmount, setInvCustomAmount] = useState("");
  const [invCustomCategory, setInvCustomCategory] = useState<AccountCategory>("Service Request");
  const [invCustomNotes, setInvCustomNotes] = useState("");

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [targetWallet, setTargetWallet] = useState<PortalWallet | null>(null);

  // Service Charges & Rates Pricing modal state
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingTab, setPricingTab] = useState<"counter" | "services">("counter");
  const [editingProducts, setEditingProducts] = useState<CounterProduct[]>([]);
  const [editingCharges, setEditingCharges] = useState<ServiceChargeItem[]>([]);
  const [savingPrices, setSavingPrices] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState("");

  // Reset Balances & Daybook modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");

  // Add Option Form states for Service Charges
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("Govt Portals");
  const [newServiceCharge, setNewServiceCharge] = useState("");

  // Add Option Form states for Counter POS Products
  const [showAddProdForm, setShowAddProdForm] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<"print" | "photo" | "card" | "service">("print");
  const [newProdUnit, setNewProdUnit] = useState("page");
  const [newProdRate, setNewProdRate] = useState("");

  // Form states for Expense
  const [expCategory, setExpCategory] = useState<AccountCategory>("Paper & Stationery");
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expMethod, setExpMethod] = useState<PaymentMethod>("Cash");
  const [expDesc, setExpDesc] = useState("");
  const [savingExp, setSavingExp] = useState(false);

  // Form states for Counter POS Quick Sale
  const [posCart, setPosCart] = useState<Array<{ product: CounterProduct; qty: number }>>([]);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemRate, setCustomItemRate] = useState("");
  const [customItemQty, setCustomItemQty] = useState("1");
  const [posMethod, setPosMethod] = useState<PaymentMethod>("Cash");
  const [posCustomerName, setPosCustomerName] = useState("");
  const [posCustomerPhone, setPosCustomerPhone] = useState("");
  const [posIsCredit, setPosIsCredit] = useState(false);
  const [savingPos, setSavingPos] = useState(false);

  // Form states for Wallet Topup
  const [topupAmount, setTopupAmount] = useState("3000");
  const [topupMethod, setTopupMethod] = useState<PaymentMethod>("UPI");
  const [savingTopup, setSavingTopup] = useState(false);

  // Settle credit modal/state
  const [settlingId, setSettlingId] = useState<string | null>(null);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [txList, walletList, empList] = await Promise.all([
        getAccountTransactions(),
        getPortalWallets(),
        getEmployees(),
      ]);
      setTransactions(txList);
      setWallets(walletList);
      setEmployees(empList);
      setProducts(getCounterProducts());
      setServiceCharges(getServiceChargesMaster());
    } catch (e) {
      console.error("Accounts load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openPricingModal() {
    setEditingProducts([...getCounterProducts()]);
    setEditingCharges([...getServiceChargesMaster()]);
    setShowAddServiceForm(false);
    setShowAddProdForm(false);
    setNewServiceName("");
    setNewServiceCharge("");
    setNewProdName("");
    setNewProdRate("");
    setSavedSuccessMsg("");
    setShowPricingModal(true);
  }

  function handleSaveAllPrices(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSavingPrices(true);
    try {
      saveCounterProducts(editingProducts);
      saveServiceChargesMaster(editingCharges);
      setProducts([...editingProducts]);
      setServiceCharges([...editingCharges]);
      setSavedSuccessMsg("Service charges and rates saved successfully!");
      setTimeout(() => setSavedSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save service charges.");
    } finally {
      setSavingPrices(false);
    }
  }

  function handleResetDefaultPrices() {
    if (confirm("Reset all rates to standard factory defaults?")) {
      setEditingProducts([...DEFAULT_COUNTER_PRODUCTS]);
      setEditingCharges([...DEFAULT_SERVICE_CHARGES]);
      saveCounterProducts([...DEFAULT_COUNTER_PRODUCTS]);
      saveServiceChargesMaster([...DEFAULT_SERVICE_CHARGES]);
      setProducts([...DEFAULT_COUNTER_PRODUCTS]);
      setServiceCharges([...DEFAULT_SERVICE_CHARGES]);
      setShowAddServiceForm(false);
      setShowAddProdForm(false);
      setSavedSuccessMsg("Reset to standard defaults and saved!");
      setTimeout(() => setSavedSuccessMsg(""), 3000);
    }
  }

  function handleAddServiceOption(e: React.FormEvent) {
    e.preventDefault();
    if (!newServiceName.trim()) {
      alert("Please enter a service name.");
      return;
    }
    const charge = parseFloat(newServiceCharge);
    if (isNaN(charge) || charge < 0) {
      alert("Please enter a valid default charge (₹).");
      return;
    }
    const newItem: ServiceChargeItem = {
      id: `sc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      serviceName: newServiceName.trim(),
      defaultCharge: charge,
      category: newServiceCategory.trim() || "Govt Portals",
    };
    const updated = [newItem, ...editingCharges];
    setEditingCharges(updated);
    saveServiceChargesMaster(updated);
    setServiceCharges(updated);
    setNewServiceName("");
    setNewServiceCharge("");
    setShowAddServiceForm(false);
    setSavedSuccessMsg(`Added "${newItem.serviceName}" (₹${newItem.defaultCharge}) successfully!`);
    setTimeout(() => setSavedSuccessMsg(""), 3500);
  }

  function handleDeleteCharge(id: string) {
    const updated = editingCharges.filter((item) => item.id !== id);
    setEditingCharges(updated);
    saveServiceChargesMaster(updated);
    setServiceCharges(updated);
    setSavedSuccessMsg("Service removed successfully.");
    setTimeout(() => setSavedSuccessMsg(""), 3000);
  }

  function handleAddProductOption(e: React.FormEvent) {
    e.preventDefault();
    if (!newProdName.trim()) {
      alert("Please enter a product name.");
      return;
    }
    const rate = parseFloat(newProdRate);
    if (isNaN(rate) || rate < 0) {
      alert("Please enter a valid rate (₹).");
      return;
    }
    const newProd: CounterProduct = {
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newProdName.trim(),
      rate: rate,
      unit: newProdUnit.trim() || "page",
      category: newProdCategory,
    };
    const updated = [newProd, ...editingProducts];
    setEditingProducts(updated);
    saveCounterProducts(updated);
    setProducts(updated);
    setNewProdName("");
    setNewProdRate("");
    setNewProdUnit("page");
    setShowAddProdForm(false);
    setSavedSuccessMsg(`Added "${newProd.name}" (₹${newProd.rate}/${newProd.unit}) successfully!`);
    setTimeout(() => setSavedSuccessMsg(""), 3500);
  }

  function handleDeleteProduct(id: string) {
    const updated = editingProducts.filter((p) => p.id !== id);
    setEditingProducts(updated);
    saveCounterProducts(updated);
    setProducts(updated);
    setSavedSuccessMsg("Product removed successfully.");
    setTimeout(() => setSavedSuccessMsg(""), 3000);
  }

  async function handleResetWalletsOnly() {
    setIsResetting(true);
    setResetSuccessMsg("");
    try {
      const updatedWallets = await resetPortalWalletsToZero();
      setWallets([...updatedWallets]);
      await loadData();
      setResetSuccessMsg("Portal & Bank wallets reset to ₹0 in Supabase! (Your daybook services were preserved).");
      setTimeout(() => {
        setResetSuccessMsg("");
        setShowResetModal(false);
      }, 1800);
    } catch (e: any) {
      alert("Error resetting wallets: " + (e?.message || e));
    } finally {
      setIsResetting(false);
    }
  }

  async function handleResetDaybookOnly() {
    setIsResetting(true);
    setResetSuccessMsg("");
    try {
      const updatedTx = await resetDaybookTransactions();
      setTransactions([...updatedTx]);
      await loadData();
      setResetSuccessMsg("Daybook transactions cleared from Supabase! (Wallet balances preserved).");
      setTimeout(() => {
        setResetSuccessMsg("");
        setShowResetModal(false);
      }, 1800);
    } catch (e: any) {
      alert("Error clearing daybook: " + (e?.message || e));
    } finally {
      setIsResetting(false);
    }
  }

  async function handleResetAllComplete() {
    setIsResetting(true);
    setResetSuccessMsg("");
    try {
      const { transactions: clearedTx, wallets: zeroWallets } = await resetAllBalancesToZero();
      setTransactions([...clearedTx]);
      setWallets([...zeroWallets]);
      await loadData();
      setResetSuccessMsg("Complete reset done! All wallets & daybook cleared in Supabase.");
      setTimeout(() => {
        setResetSuccessMsg("");
        setShowResetModal(false);
      }, 1800);
    } catch (e: any) {
      alert("Error resetting all balances: " + (e?.message || e));
    } finally {
      setIsResetting(false);
    }
  }

  // Daybook Summary for the selected date & staff filter
  const summary = useMemo(() => {
    const relevantTx = staffFilter === "all"
      ? transactions
      : transactions.filter((tx) => tx.employee_id === staffFilter);
    return calculateDaybookSummary(relevantTx, selectedDate);
  }, [transactions, selectedDate, staffFilter]);

  // Filtered transactions for daybook
  const filteredDaybookTx = useMemo(() => {
    return transactions.filter((tx) => {
      if (tx.transaction_date !== selectedDate) return false;
      if (filterType !== "all" && tx.type !== filterType) return false;
      if (filterMethod !== "all" && tx.payment_method !== filterMethod) return false;
      if (staffFilter !== "all" && tx.employee_id !== staffFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = tx.title.toLowerCase().includes(q);
        const matchesCust = (tx.customer_name || "").toLowerCase().includes(q);
        const matchesPhone = (tx.customer_phone || "").toLowerCase().includes(q);
        const matchesRef = (tx.reference_id || "").toLowerCase().includes(q);
        const matchesStaff = (tx.employee_name || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesCust && !matchesPhone && !matchesRef && !matchesStaff) return false;
      }
      return true;
    });
  }, [transactions, selectedDate, filterType, filterMethod, staffFilter, searchQuery]);

  // Unsettled Khata (Credit/Due) across all dates
  const khataList = useMemo(() => {
    return transactions.filter((tx) => !tx.is_settled);
  }, [transactions]);

  // Date Navigation Helpers
  function handlePrevDay() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  }

  function handleNextDay() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  }

  function handleToday() {
    setSelectedDate(getTodayDateString());
  }

  // POS Cart Total
  const posCartTotal = useMemo(() => {
    let total = posCart.reduce((sum, item) => sum + item.product.rate * item.qty, 0);
    const customRate = parseFloat(customItemRate) || 0;
    const customQty = parseInt(customItemQty, 10) || 0;
    if (customItemName.trim() && customRate > 0 && customQty > 0) {
      total += customRate * customQty;
    }
    return total;
  }, [posCart, customItemName, customItemRate, customItemQty]);

  // Add product to POS cart
  function addProductToCart(product: CounterProduct) {
    setPosCart((prev) => {
      const idx = prev.findIndex((p) => p.product.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].qty += 1;
        return copy;
      }
      return [...prev, { product, qty: 1 }];
    });
  }

  function updateCartQty(productId: string, qty: number) {
    if (qty <= 0) {
      setPosCart((prev) => prev.filter((p) => p.product.id !== productId));
    } else {
      setPosCart((prev) =>
        prev.map((p) => (p.product.id === productId ? { ...p, qty } : p))
      );
    }
  }

  // Invoice Total Amount calculation
  const invTotalAmount = useMemo(() => {
    if (invMode === "citizen") {
      const g = parseFloat(invGovtFee) || 0;
      const s = parseFloat(invServiceCharge) || 0;
      return g + s;
    }
    if (invMode === "counter") {
      let total = invCart.reduce((sum, item) => sum + item.product.rate * item.qty, 0);
      const cr = parseFloat(invCustomRate) || 0;
      const cq = parseInt(invCustomQty, 10) || 0;
      if (invCustomItem.trim() && cr > 0 && cq > 0) {
        total += cr * cq;
      }
      return total;
    }
    if (invMode === "custom") {
      return parseFloat(invCustomAmount) || 0;
    }
    return 0;
  }, [invMode, invGovtFee, invServiceCharge, invCart, invCustomItem, invCustomRate, invCustomQty, invCustomAmount]);

  function openInvoiceModal(mode: "citizen" | "counter" | "custom" = "citizen") {
    setInvMode(mode);
    setInvDate(selectedDate || getTodayDateString());
    setInvCustomerName("");
    setInvCustomerPhone("");
    setInvRefId(`INV-${Date.now().toString().slice(-6)}`);
    setInvPaymentMethod("Cash");
    setInvIsCredit(false);

    const services = getServiceChargesMaster();
    if (services.length > 0) {
      setInvServiceId(services[0].id);
      setInvServiceName(services[0].serviceName);
      setInvServiceCategory(services[0].category);
      setInvServiceCharge(String(services[0].defaultCharge));
    } else {
      setInvServiceId("custom");
      setInvServiceName("");
      setInvServiceCategory("Govt Portals");
      setInvServiceCharge("100");
    }
    setInvGovtFee("0");
    setInvWalletId("");
    setInvServiceNotes("");

    setInvCart([]);
    setInvCustomItem("");
    setInvCustomRate("");
    setInvCustomQty("1");

    setInvCustomTitle("");
    setInvCustomAmount("");
    setInvCustomCategory("Service Request");
    setInvCustomNotes("");

    setShowInvoiceModal(true);
  }

  function handleSelectServicePreset(serviceId: string) {
    setInvServiceId(serviceId);
    if (serviceId === "custom") {
      setInvServiceName("");
      setInvServiceCategory("Govt Portals");
      setInvServiceCharge("");
    } else {
      const match = serviceCharges.find((s) => s.id === serviceId);
      if (match) {
        setInvServiceName(match.serviceName);
        setInvServiceCategory(match.category);
        setInvServiceCharge(String(match.defaultCharge));
      }
    }
  }

  function addInvProduct(product: CounterProduct) {
    setInvCart((prev) => {
      const idx = prev.findIndex((p) => p.product.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].qty += 1;
        return copy;
      }
      return [...prev, { product, qty: 1 }];
    });
  }

  function updateInvQty(productId: string, delta: number) {
    setInvCart((prev) => {
      return prev
        .map((p) => (p.product.id === productId ? { ...p, qty: p.qty + delta } : p))
        .filter((p) => p.qty > 0);
    });
  }

  // Submit and Record Invoice Transaction
  async function handleSaveInvoice(printSlip: boolean = false) {
    if (invTotalAmount <= 0) {
      alert("Please enter a valid invoice amount greater than ₹0.");
      return;
    }

    let title = "";
    let description = "";
    let category: AccountCategory = "Service Request";
    let govtFee = 0;
    let serviceCharge = 0;
    let walletName: string | undefined = undefined;
    if (invWalletId) {
      const matchedWallet = wallets.find((w) => w.id === invWalletId);
      if (matchedWallet) walletName = matchedWallet.name;
    }

    if (invMode === "citizen") {
      if (!invServiceName.trim()) {
        alert("Please enter or select a service name.");
        return;
      }
      title = invServiceName.trim();
      govtFee = parseFloat(invGovtFee) || 0;
      serviceCharge = parseFloat(invServiceCharge) || 0;
      category = "Service Request";
      description = invServiceNotes.trim();
    } else if (invMode === "counter") {
      if (invCart.length === 0 && (!invCustomItem.trim() || !invCustomRate)) {
        alert("Please select at least one item from the catalog or add a custom item.");
        return;
      }
      category = "Counter Sale";
      const itemsList = invCart
        .map((p) => `${p.product.name} (x${p.qty})`)
        .concat(
          invCustomItem.trim()
            ? [`${invCustomItem.trim()} (x${invCustomQty || 1})`]
            : []
        );
      description = itemsList.join(", ");
      title =
        invCart.length === 1 && !invCustomItem.trim()
          ? `${invCart[0].product.name} (x${invCart[0].qty})`
          : `Counter Bill: ${itemsList.length} items`;
      govtFee = 0;
      serviceCharge = invTotalAmount;
    } else {
      if (!invCustomTitle.trim()) {
        alert("Please enter an invoice or service title.");
        return;
      }
      title = invCustomTitle.trim();
      category = invCustomCategory;
      description = invCustomNotes.trim() || "Custom Invoice";
      govtFee = 0;
      serviceCharge = invTotalAmount;
    }

    setSavingInvoice(true);
    try {
      const newTx = await createAccountTransaction({
        transaction_date: invDate || selectedDate,
        type: "income",
        category,
        title,
        description,
        amount: invTotalAmount,
        govt_fee: govtFee,
        service_charge: serviceCharge,
        payment_method: invPaymentMethod,
        reference_id: invRefId.trim() || `INV-${Date.now().toString().slice(-6)}`,
        customer_name: invCustomerName.trim() || "Walk-in Customer",
        customer_phone: invCustomerPhone.trim() || undefined,
        is_settled: !invIsCredit,
        wallet_name: walletName,
        employee_id: "emp-owner",
        employee_name: "Admin (Owner)",
      });

      // Deduct from portal wallet if applicable
      if (invWalletId && govtFee > 0) {
        try {
          await deductPortalWallet(invWalletId, govtFee);
          setWallets((prev) =>
            prev.map((w) =>
              w.id === invWalletId
                ? { ...w, balance: Math.max(0, w.balance - govtFee) }
                : w
            )
          );
        } catch (we) {
          console.warn("Wallet deduct notice:", we);
        }
      }

      setTransactions((prev) => [newTx, ...prev]);
      setShowInvoiceModal(false);

      if (printSlip) {
        handlePrintTxInvoice(newTx);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to record invoice transaction.");
    } finally {
      setSavingInvoice(false);
    }
  }

  // Print Invoice / Cash Receipt Slip
  function handlePrintTxInvoice(tx: AccountTransaction) {
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

    const numGovtFee =
      typeof tx.govt_fee === "number"
        ? tx.govt_fee
        : parseFloat(String(tx.govt_fee || 0)) || 0;

    let numServiceCharge =
      typeof tx.service_charge === "number"
        ? tx.service_charge
        : parseFloat(String(tx.service_charge || 0)) || 0;

    // Check if fee breakdown is encoded in description (legacy records)
    let extractedGovtFee = numGovtFee;
    let extractedServiceFee = numServiceCharge;
    if (extractedGovtFee === 0 && tx.description) {
      const gMatch = tx.description.match(/Official Fee[:\s]*₹?\s*(\d+(?:\.\d+)?)/i);
      if (gMatch) extractedGovtFee = parseFloat(gMatch[1]);
      const sMatch = tx.description.match(/Service (?:Fee|Charge)[:\s]*₹?\s*(\d+(?:\.\d+)?)/i);
      if (sMatch) extractedServiceFee = parseFloat(sMatch[1]);
    }

    const hasGovtFee = extractedGovtFee > 0;
    const finalGovtFee = extractedGovtFee;
    const finalServiceFee =
      extractedServiceFee > 0
        ? extractedServiceFee
        : hasGovtFee
        ? Math.max(0, tx.amount - finalGovtFee)
        : tx.amount;

    // Clean up description: remove internal category tags and serialized fee strings
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
          <title>Receipt - ${invNumber} - DIGITAL DEN 360</title>
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
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
              transition: all 0.15s;
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
            .receipt-wrap {
              background: #fff;
              box-shadow: 0 4px 16px rgba(0,0,0,0.08);
              transition: width 0.2s;
            }
            .receipt-80mm {
              width: 72mm;
              padding: 6px;
              font-size: 11px;
              line-height: 1.35;
            }
            .receipt-58mm {
              width: 48mm;
              padding: 4px;
              font-size: 9.5px;
              line-height: 1.25;
            }
            .receipt-a4 {
              width: 140mm;
              padding: 20px;
              font-size: 12px;
              line-height: 1.45;
              border: 1.5px solid #000;
              border-radius: 4px;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .title { font-size: 16px; font-weight: 900; letter-spacing: 0.8px; margin-bottom: 2px; }
            .receipt-58mm .title { font-size: 13px; }
            .receipt-a4 .title { font-size: 20px; }
            .subtitle { font-size: 9px; color: #444; margin-bottom: 5px; }
            .receipt-58mm .subtitle { font-size: 8px; }
            .receipt-a4 .subtitle { font-size: 11px; }
            .divider { border-top: 1px dashed #777; margin: 6px 0; }
            .divider-double { border-top: 2px solid #000; margin: 6px 0; }
            .meta-table { width: 100%; font-size: 10px; margin-bottom: 4px; }
            .receipt-58mm .meta-table { font-size: 9px; }
            .receipt-a4 .meta-table { font-size: 11px; }
            .meta-table td { padding: 1.5px 0; vertical-align: top; }
            .items-table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 10.5px; }
            .receipt-58mm .items-table { font-size: 9px; }
            .receipt-a4 .items-table { font-size: 11.5px; }
            .items-table th { border-bottom: 1.5px solid #000; padding: 4px 0; text-align: left; }
            .items-table td { padding: 3px 0; vertical-align: top; }
            .total-row { font-size: 13px; font-weight: 900; }
            .receipt-58mm .total-row { font-size: 11.5px; }
            .receipt-a4 .total-row { font-size: 15px; }
            .badge {
              display: inline-block;
              padding: 2px 7px;
              border-radius: 3px;
              font-weight: 900;
              font-size: 10px;
              border: 1.5px solid #000;
              letter-spacing: 0.5px;
            }
            .footer { font-size: 9px; text-align: center; margin-top: 10px; color: #444; }
            .receipt-a4 .footer { font-size: 10.5px; margin-top: 16px; }
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
              <div class="title">DIGITAL DEN 360</div>
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
                  <td style="padding-left: 10px; font-size: 10.5px; padding-top: 2px; padding-bottom: 2px;">&bull; Digital Den Service Charge</td>
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

            <div class="divider"></div>

            <div class="footer">
              <p>Thank you for choosing Digital Den 360!</p>
              <p style="font-size: 8px; margin-top: 3px;">Computer generated receipt • No signature required</p>
            </div>
          </div>

          <script>
            function setPrinterMode(mode) {
              try { localStorage.setItem('dd_receipt_mode', mode); } catch (e) {}
              var container = document.getElementById('receipt-container');
              if (container) {
                container.className = 'receipt-wrap receipt-' + mode;
              }
              document.querySelectorAll('.mode-btn').forEach(function(btn) {
                if (btn.getAttribute('data-mode') === mode) {
                  btn.classList.add('active');
                } else {
                  btn.classList.remove('active');
                }
              });

              var pageStyle = document.getElementById('dynamic-page-style');
              if (pageStyle) {
                if (mode === '58mm') {
                  pageStyle.innerHTML = '@page { size: 58mm auto; margin: 2mm; } @media print { body { width: 48mm; margin: 0 auto !important; } }';
                } else if (mode === 'a4') {
                  pageStyle.innerHTML = '@page { size: A4 portrait; margin: 15mm; } @media print { body { width: 140mm; margin: 0 auto !important; } }';
                } else {
                  pageStyle.innerHTML = '@page { size: 80mm auto; margin: 3mm; } @media print { body { width: 72mm; margin: 0 auto !important; } }';
                }
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

  // Submit Expense
  async function handleSaveExpense(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(expAmount);
    if (!expTitle.trim() || isNaN(amt) || amt <= 0) {
      alert("Please provide an expense title and valid amount.");
      return;
    }
    setSavingExp(true);
    try {
      const newTx = await createAccountTransaction({
        transaction_date: selectedDate,
        type: "expense",
        category: expCategory,
        title: expTitle.trim(),
        description: expDesc.trim(),
        amount: amt,
        payment_method: expMethod,
        is_settled: true,
        employee_id: "emp-owner",
        employee_name: "Admin (Owner)",
      });
      setTransactions((prev) => [newTx, ...prev]);
      setShowExpenseModal(false);
      setExpTitle("");
      setExpAmount("");
      setExpDesc("");
    } catch (err) {
      console.error(err);
      alert("Failed to save expense.");
    } finally {
      setSavingExp(false);
    }
  }

  // Submit Counter POS Quick Sale
  async function handleSaveCounterSale(e: React.FormEvent) {
    e.preventDefault();
    if (posCart.length === 0 && (!customItemName.trim() || !customItemRate)) {
      alert("Please add at least one item to the cart.");
      return;
    }
    setSavingPos(true);
    try {
      const itemsDesc = posCart
        .map((p) => `${p.product.name} (x${p.qty})`)
        .concat(
          customItemName.trim()
            ? [`${customItemName.trim()} (x${customItemQty || 1})`]
            : []
        )
        .join(", ");

      const mainTitle =
        posCart.length === 1 && !customItemName.trim()
          ? `${posCart[0].product.name} (x${posCart[0].qty})`
          : `Counter Sale: ${posCart.length + (customItemName.trim() ? 1 : 0)} items`;

      const newTx = await createAccountTransaction({
        transaction_date: selectedDate,
        type: "income",
        category: "Counter Sale",
        title: mainTitle,
        description: itemsDesc,
        amount: posCartTotal,
        govt_fee: 0,
        service_charge: posCartTotal,
        payment_method: posMethod,
        customer_name: posCustomerName.trim() || "Walk-in Customer",
        customer_phone: posCustomerPhone.trim(),
        is_settled: !posIsCredit,
        employee_id: "emp-owner",
        employee_name: "Admin (Owner)",
      });

      setTransactions((prev) => [newTx, ...prev]);
      setPosCart([]);
      setCustomItemName("");
      setCustomItemRate("");
      setCustomItemQty("1");
      setPosCustomerName("");
      setPosCustomerPhone("");
      setPosIsCredit(false);
      setShowCounterModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to record counter sale.");
    } finally {
      setSavingPos(false);
    }
  }

  // Submit Wallet Top-up
  async function handleSaveTopup(e: React.FormEvent) {
    e.preventDefault();
    if (!targetWallet) return;
    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid top-up amount.");
      return;
    }
    setSavingTopup(true);
    try {
      const updated = await topupPortalWallet(targetWallet.id, amt, topupMethod);
      setWallets((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
      await loadData();
      setShowTopupModal(false);
      setTargetWallet(null);
    } catch (err) {
      console.error(err);
      alert("Failed to top-up wallet.");
    } finally {
      setSavingTopup(false);
    }
  }

  // Settle Credit (Mark as Paid)
  async function handleSettleCredit(txId: string, method: PaymentMethod) {
    setSettlingId(txId);
    try {
      await settleTransaction(txId, method);
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === txId ? { ...t, is_settled: true, payment_method: method } : t
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to settle transaction.");
    } finally {
      setSettlingId(null);
    }
  }

  // Delete transaction
  async function handleDeleteTx(id: string) {
    if (!confirm("Are you sure you want to delete this transaction record?")) return;
    try {
      await deleteAccountTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  // Print Daily Closing Slip
  function handlePrintDaybook() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const formattedDate = new Date(selectedDate).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const rowsHtml = filteredDaybookTx
      .map(
        (tx, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>
          <strong>${tx.title}</strong>
          ${tx.customer_name ? `<br/><span style="font-size: 10px; color: #64748b;">Cust: ${tx.customer_name}</span>` : ""}
        </td>
        <td><span class="badge ${tx.type}">${tx.type.toUpperCase()}</span></td>
        <td>${tx.category}</td>
        <td>${tx.payment_method} ${tx.is_settled ? "" : "(DUE)"}</td>
        <td style="text-align: right; font-weight: 700; color: ${tx.type === "expense" ? "#dc2626" : "#059669"}">
          ${tx.type === "expense" ? "-" : "+"}₹${tx.amount.toFixed(2)}
        </td>
      </tr>
    `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Daybook Summary - ${selectedDate} - Digital Den 360</title>
          <style>
            @page { size: A4 portrait; margin: 12mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; font-size: 12px; }
            .header { border-bottom: 2px solid #0891b2; padding-bottom: 12px; margin-bottom: 14px; display: flex; justify-content: space-between; }
            .brand h1 { margin: 0; font-size: 20px; font-weight: 900; color: #0891b2; letter-spacing: 0.5px; }
            .brand p { margin: 2px 0 0 0; font-size: 11px; color: #64748b; }
            .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
            .kpi-card { border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; background: #f8fafc; }
            .kpi-label { font-size: 9px; text-transform: uppercase; font-weight: 700; color: #64748b; }
            .kpi-val { font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f1f5f9; padding: 7px 8px; text-align: left; font-size: 10px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; color: #475569; }
            td { padding: 7px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
            .badge { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; }
            .badge.income { background: #dcfce7; color: #15803d; }
            .badge.expense { background: #fee2e2; color: #b91c1c; }
            .badge.portal_topup { background: #e0f2fe; color: #0369a1; }
            .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <h1>DIGITAL DEN 360</h1>
              <p>Daily Daybook & Cash Register Statement &bull; Ph: +91 70125 84152</p>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 800; font-size: 13px;">${formattedDate}</div>
              <div style="color: #64748b; font-size: 10px; margin-top: 2px;">Generated at: ${new Date().toLocaleTimeString("en-IN")}</div>
            </div>
          </div>

          <div class="kpis">
            <div class="kpi-card">
              <div class="kpi-label">Cash In Drawer</div>
              <div class="kpi-val">₹ ${summary.cashInHand.toFixed(0)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">UPI / Bank Received</div>
              <div class="kpi-val">₹ ${summary.upiReceived.toFixed(0)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Real Shop Revenue</div>
              <div class="kpi-val" style="color: #0891b2;">₹ ${summary.realShopRevenue.toFixed(0)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Net Shop Profit</div>
              <div class="kpi-val" style="color: #059669;">₹ ${summary.netShopProfit.toFixed(0)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Transaction Title / Customer</th>
                <th>Type</th>
                <th>Category</th>
                <th>Payment Mode</th>
                <th style="text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `<tr><td colspan="6" style="text-align:center; padding: 20px; color: #64748b;">No transactions recorded for this date.</td></tr>`}
            </tbody>
          </table>

          <div class="footer">
            <div>Digital Den 360 &bull; Verified Electronic Records</div>
            <div>Signature / Verified By: ___________________________</div>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  // Export CSV
  function handleExportCsv() {
    const headers = [
      "ID",
      "Date",
      "Type",
      "Category",
      "Title",
      "Amount",
      "Wallet Fee",
      "Service Charge",
      "Payment Mode",
      "Settled",
      "Customer",
      "Phone",
    ];
    const rows = filteredDaybookTx.map((tx) => [
      `"${tx.id}"`,
      `"${tx.transaction_date}"`,
      `"${tx.type}"`,
      `"${tx.category}"`,
      `"${tx.title.replace(/"/g, '""')}"`,
      tx.amount,
      tx.govt_fee || 0,
      tx.service_charge || 0,
      `"${tx.payment_method}"`,
      tx.is_settled ? "Paid" : "Credit Due",
      `"${(tx.customer_name || "").replace(/"/g, '""')}"`,
      `"${tx.customer_phone || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `digital_den_daybook_${selectedDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* 1. Sleek Action & Date Control Bar (No duplicate titles!) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#0c1322] p-3 shadow-lg shadow-black/20">
        {/* Date Selector */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-700/80 bg-[#0e1625] p-1 text-xs">
          <button
            type="button"
            onClick={handlePrevDay}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            title="Previous Day"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1.5 px-2 font-mono font-bold text-slate-200">
            <Calendar size={13} className="text-cyan-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            title="Next Day"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={handleToday}
            className={`ml-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
              selectedDate === getTodayDateString()
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Today
          </button>
        </div>

        {/* Primary Actions & Utilities Cluster */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Add Invoice & Record Transaction Button */}
          <button
            type="button"
            onClick={() => openInvoiceModal()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:brightness-110 transition shadow-md shadow-cyan-500/20"
            title="Create and record an invoice for citizen service, counter POS, or custom bill"
          >
            <Receipt size={14} />
            <span>+ Add Invoice</span>
          </button>

          {/* Quick Add Expense Button */}
          <button
            type="button"
            onClick={() => setShowExpenseModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/20 transition"
          >
            <ArrowDownRight size={14} />
            <span>+ Add Expense</span>
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Service Charges & Rates Button */}
          <button
            type="button"
            onClick={openPricingModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-200 hover:border-cyan-400/40 hover:text-cyan-300 transition shadow-sm"
            title="Change service charges and counter rates"
          >
            <Settings size={13} />
            <span className="hidden sm:inline">Service Charges</span>
          </button>

          {/* Reset Balances / Daybook Button */}
          <button
            type="button"
            onClick={() => {
              setResetSuccessMsg("");
              setShowResetModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 transition shadow-sm cursor-pointer"
            title="Reset options for portal wallets and daybook transactions"
          >
            <RotateCcw size={13} className="text-amber-400" />
            <span>Reset ₹0</span>
          </button>

          {/* Print Daybook */}
          <button
            type="button"
            onClick={handlePrintDaybook}
            className="rounded-xl border border-slate-700/80 bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            title="Print Daily Daybook Slip"
          >
            <Printer size={15} />
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="rounded-xl border border-slate-700/80 bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            title="Export CSV"
          >
            <Download size={15} />
          </button>

          {/* Refresh from Supabase */}
          <button
            type="button"
            onClick={() => loadData()}
            disabled={loading}
            className="rounded-xl border border-slate-700/80 bg-slate-800/80 p-2 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-300 transition"
            title="Refresh latest balances & transactions from Supabase"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-cyan-400" : ""} />
          </button>
        </div>
      </div>

      {/* 2. Portal & Bank Advance Wallets (Refined, Modern Grid) */}
      <div className="rounded-2xl border border-slate-800/90 bg-[#0c1322] p-4 space-y-3 shadow-lg shadow-black/20">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
              <Wallet size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Portal Advance & Bank Wallets
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Total Balance:</span>
            <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg">
              ₹ {wallets.reduce((s, w) => s + w.balance, 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* 4 Wallet Cards Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {wallets.map((wallet) => {
            const isLow = wallet.balance <= wallet.min_alert_balance;
            return (
              <div
                key={wallet.id}
                className="rounded-xl border border-slate-800/90 bg-[#0e1625] p-3.5 hover:border-slate-700 hover:bg-[#111a2c] transition flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      wallet.category === "Banking"
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                        : wallet.category === "Other"
                        ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                        : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}>
                      {wallet.category}
                    </span>

                    {isLow && (
                      <span className="text-[10px] font-medium text-amber-400/90 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Min ₹{wallet.min_alert_balance}
                      </span>
                    )}
                  </div>

                  <h4 className="mt-2 text-xs font-bold text-white leading-snug line-clamp-1" title={wallet.name}>
                    {wallet.name}
                  </h4>

                  <div className="mt-1.5 font-mono text-xl font-black text-slate-100">
                    ₹ {wallet.balance.toLocaleString("en-IN")}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTargetWallet(wallet);
                    setShowTopupModal(true);
                  }}
                  className="mt-3 w-full inline-flex items-center justify-center gap-1 rounded-lg border border-slate-700/80 bg-slate-800/60 py-1.5 text-xs font-bold text-cyan-300 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition"
                >
                  <Plus size={13} />
                  <span>Top-up</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Staff Filter Active Indicator */}
      {staffFilter !== "all" && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/30 px-4 py-2.5 text-xs shadow-sm">
          <span className="text-cyan-300 font-semibold flex items-center gap-2">
            <Users size={14} className="text-cyan-400" />
            Filtered to operator: <strong className="text-white underline">{employees.find((e) => e.id === staffFilter)?.name || staffFilter}</strong> — Showing their individual cash drawer tally & sales
          </span>
          <button
            type="button"
            onClick={() => setStaffFilter("all")}
            className="text-cyan-400 hover:text-white underline font-bold text-xs"
          >
            Clear Filter (Show All Staff) &rarr;
          </button>
        </div>
      )}

      {/* 3. Unified Financial KPI Metric Strip (5 Modern KPI Cards) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Cash in Drawer */}
        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-[#0e1625] to-[#0f231e] p-3.5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
              Cash In Drawer
            </span>
            <div className="rounded-lg bg-emerald-500/15 p-1 text-emerald-300">
              <IndianRupee size={14} />
            </div>
          </div>
          <p className="mt-1.5 text-2xl font-black text-white font-mono">
            ₹ {summary.cashInHand.toFixed(0)}
          </p>
          <p className="text-[10.5px] text-slate-400">Physical drawer cash</p>
        </div>

        {/* UPI / Bank Received */}
        <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-[#0e1625] to-[#102336] p-3.5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
              UPI / Bank In
            </span>
            <div className="rounded-lg bg-cyan-500/15 p-1 text-cyan-300">
              <CreditCard size={14} />
            </div>
          </div>
          <p className="mt-1.5 text-2xl font-black text-white font-mono">
            ₹ {summary.upiReceived.toFixed(0)}
          </p>
          <p className="text-[10.5px] text-slate-400">GPay, PhonePe & QR</p>
        </div>

        {/* Real Shop Revenue */}
        <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-[#0e1625] to-[#171a35] p-3.5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
              Shop Revenue
            </span>
            <div className="rounded-lg bg-indigo-500/15 p-1 text-indigo-300">
              <Sparkles size={14} />
            </div>
          </div>
          <p className="mt-1.5 text-2xl font-black text-white font-mono">
            ₹ {summary.realShopRevenue.toFixed(0)}
          </p>
          <p className="text-[10.5px] text-slate-400">Services + Counter Xerox</p>
        </div>

        {/* Net Profit */}
        <div className={`rounded-xl border p-3.5 relative overflow-hidden shadow-sm ${
          summary.netShopProfit >= 0
            ? "border-teal-500/30 bg-gradient-to-br from-[#0e1625] to-[#0d2a29]"
            : "border-red-500/30 bg-gradient-to-br from-[#0e1625] to-[#2a0d0d]"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${
              summary.netShopProfit >= 0 ? "text-teal-400" : "text-red-400"
            }`}>
              Net Daily Profit
            </span>
            <div className={`rounded-lg p-1 ${
              summary.netShopProfit >= 0 ? "bg-teal-500/15 text-teal-300" : "bg-red-500/15 text-red-300"
            }`}>
              {summary.netShopProfit >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            </div>
          </div>
          <p className="mt-1.5 text-2xl font-black text-white font-mono">
            ₹ {summary.netShopProfit.toFixed(0)}
          </p>
          <p className="text-[10.5px] text-slate-400">After ₹{summary.totalExpense.toFixed(0)} expense</p>
        </div>

        {/* Customer Dues (Khata) */}
        <div
          onClick={() => setSubTab("khata")}
          className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-[#0e1625] to-[#291e10] p-3.5 relative overflow-hidden cursor-pointer hover:border-amber-400/60 transition group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
              Customer Dues (Khata)
            </span>
            <div className="rounded-lg bg-amber-500/15 p-1 text-amber-300 group-hover:scale-110 transition">
              <Clock3 size={14} />
            </div>
          </div>
          <p className="mt-1.5 text-2xl font-black text-amber-300 font-mono">
            ₹ {khataList.reduce((sum, k) => sum + k.amount, 0).toFixed(0)}
          </p>
          <p className="text-[10.5px] text-amber-400/80 flex items-center justify-between">
            <span>{khataList.length} pending</span>
            <span className="underline group-hover:text-white">View &rarr;</span>
          </p>
        </div>
      </div>

      {/* 4. Modern Segmented Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="inline-flex rounded-xl border border-slate-800 bg-[#0c1322] p-1 gap-1">
          <button
            type="button"
            onClick={() => setSubTab("daybook")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              subTab === "daybook"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_12px_rgba(8,145,178,0.25)]"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <FileText size={14} />
            <span>Daily Daybook</span>
            <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] font-bold text-slate-300">
              {filteredDaybookTx.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("counter_pos")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              subTab === "counter_pos"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_12px_rgba(8,145,178,0.25)]"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <ShoppingBag size={14} />
            <span>Walk-in Counter POS</span>
            {posCart.length > 0 && (
              <span className="rounded-full bg-cyan-400 text-slate-950 px-1.5 py-0.2 text-[10px] font-black">
                {posCart.reduce((sum, item) => sum + item.qty, 0)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubTab("khata")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              subTab === "khata"
                ? "bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Clock3 size={14} />
            <span>Customer Khata (Udhar)</span>
            {khataList.length > 0 && (
              <span className="rounded-full bg-amber-500/30 text-amber-300 px-1.5 py-0.2 text-[10px] font-bold">
                {khataList.length}
              </span>
            )}
          </button>
        </div>

        {/* Portal Wallet Fee Pass-through tag */}
        {summary.totalGovtFees > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-[#0e1625] px-3 py-1.5 rounded-lg border border-slate-800">
            <span>💳 Wallet Fees Passed:</span>
            <span className="font-mono font-bold text-slate-200">₹{summary.totalGovtFees.toFixed(0)}</span>
          </div>
        )}
      </div>

      {/* 4. Tab 1: DAYBOOK REGISTER */}
      {subTab === "daybook" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#0e1625] p-3.5">
            <div className="flex flex-1 items-center gap-2 max-w-sm rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-white">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search title, customer, ref ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Staff / Operator Filter Dropdown */}
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-xs">
                <Users size={13} className="text-cyan-400" />
                <span className="text-slate-400 font-medium">Operator:</span>
                <select
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                  className="bg-transparent text-slate-200 outline-none cursor-pointer font-bold pr-1 text-xs"
                >
                  <option value="all" className="bg-slate-900 text-slate-200">
                    All Staff (Center-wide)
                  </option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-slate-900 text-slate-200">
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/80 p-1">
                {(["all", "income", "expense", "portal_topup"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilterType(t)}
                    className={`rounded-lg px-2.5 py-1 font-semibold capitalize transition ${
                      filterType === t
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t === "portal_topup" ? "Topup" : t}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/80 p-1">
                {(["all", "Cash", "UPI"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFilterMethod(m)}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                      filterMethod === m
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0e1625]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900/60 uppercase tracking-wider text-slate-400 font-bold">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Particulars / Customer</th>
                    <th className="px-4 py-3">Type & Category</th>
                    <th className="px-4 py-3">Payment Mode</th>
                    <th className="px-4 py-3 text-right">Wallet Fee</th>
                    <th className="px-4 py-3 text-right">Shop Revenue</th>
                    <th className="px-4 py-3 text-right">Total (₹)</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredDaybookTx.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                        No transactions recorded for {selectedDate}.
                      </td>
                    </tr>
                  ) : (
                    filteredDaybookTx.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-300 whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-white text-sm leading-snug">{tx.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                            {tx.employee_name && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                                👤 {tx.employee_name}
                              </span>
                            )}
                            {tx.customer_name && (
                              <span>
                                {tx.customer_name} {tx.customer_phone ? `(${tx.customer_phone})` : ""}
                              </span>
                            )}
                            {tx.reference_id && (
                              <span className="font-mono text-cyan-300/90 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/60">
                                {tx.reference_id}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold ${
                              tx.type === "income"
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                : tx.type === "expense"
                                ? "bg-red-500/15 text-red-300 border border-red-500/30"
                                : "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                            }`}
                          >
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              tx.payment_method === "Cash"
                                ? "bg-slate-800 text-slate-300 border border-slate-700"
                                : "bg-cyan-950/50 text-cyan-300 border border-cyan-800/50"
                            }`}
                          >
                            {tx.payment_method === "Cash" ? "💵 Cash" : "📱 UPI"}
                          </span>
                          {!tx.is_settled && (
                            <span className="ml-1.5 rounded bg-amber-500/20 text-amber-300 px-2 py-0.5 text-xs font-bold">
                              DUE
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right text-slate-300 font-mono text-xs">
                          {tx.govt_fee ? `₹${tx.govt_fee}` : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-cyan-300 font-bold text-xs">
                          {tx.service_charge ? `₹${tx.service_charge}` : (tx.type === "income" ? `₹${tx.amount}` : "—")}
                        </td>
                        <td
                          className={`px-4 py-3.5 text-right font-bold text-sm font-mono whitespace-nowrap ${
                            tx.type === "expense"
                              ? "text-red-400"
                              : tx.type === "portal_topup"
                              ? "text-sky-300"
                              : "text-emerald-400"
                          }`}
                        >
                          {tx.type === "expense" ? "-" : "+"} ₹{tx.amount}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handlePrintTxInvoice(tx)}
                              className="rounded p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition"
                              title="Print Invoice / Cash Receipt"
                            >
                              <Printer size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTx(tx.id)}
                              className="rounded p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                              title="Delete Transaction"
                            >
                              <Trash2 size={15} />
                            </button>
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

      {/* 5. Tab 2: WALK-IN COUNTER POS */}
      {subTab === "counter_pos" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Product Catalog */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Quick Counter Items Catalog
                </h3>
                <span className="text-xs text-slate-400">Click to add to billing cart</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    openPricingModal();
                    setPricingTab("counter");
                    setShowAddProdForm(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-500/25 transition shadow-sm"
                >
                  <Plus size={13} />
                  <span>+ Add Product</span>
                </button>
                <button
                  type="button"
                  onClick={openPricingModal}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  <Settings size={13} />
                  <span>Edit Rates & Charges</span>
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {(products.length > 0 ? products : DEFAULT_COUNTER_PRODUCTS).map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => addProductToCart(prod)}
                  className="flex flex-col justify-between rounded-xl border border-slate-700/80 bg-[#0e1625] p-3.5 text-left hover:border-cyan-400/60 hover:bg-[#121c2d] transition group shadow-sm"
                >
                  <div>
                    <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition leading-snug">
                      {prod.name}
                    </span>
                    <span className="block mt-1 text-xs text-slate-400 font-medium capitalize">
                      Per {prod.unit}
                    </span>
                  </div>
                  <div className="mt-3.5 flex items-center justify-between">
                    <span className="text-lg font-black text-emerald-400 font-mono">
                      ₹{prod.rate}
                    </span>
                    <span className="rounded-lg bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 text-xs font-bold text-cyan-300 group-hover:bg-cyan-500/25 transition">
                      + Add
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Item Box */}
            <div className="rounded-xl border border-slate-800 bg-[#0e1625] p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                + Add Custom / One-off Counter Item
              </h4>
              <div className="grid gap-2.5 sm:grid-cols-3">
                <input
                  type="text"
                  placeholder="Item Name (e.g. Spiral Binding 120p)"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400"
                />
                <input
                  type="number"
                  placeholder="Rate per unit (₹)"
                  value={customItemRate}
                  onChange={(e) => setCustomItemRate(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={customItemQty}
                  onChange={(e) => setCustomItemQty(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Cart & Billing Checkout Box */}
          <div className="rounded-2xl border border-cyan-500/30 bg-[#0e1625] p-5 flex flex-col justify-between space-y-4 shadow-xl">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <Receipt size={22} className="text-cyan-400" />
                  <h3 className="font-black text-white text-lg tracking-wide">Counter Cart</h3>
                </div>
                {posCart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPosCart([])}
                    className="text-xs text-red-400 hover:text-red-300 font-bold bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg transition"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Items in cart */}
              <div className="mt-3.5 space-y-3 max-h-64 overflow-y-auto pr-1">
                {posCart.length === 0 && !customItemName.trim() ? (
                  <p className="py-10 text-center text-sm font-medium text-slate-400">
                    Cart is empty. Click any item on the left to add.
                  </p>
                ) : (
                  <>
                    {posCart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between rounded-xl bg-slate-900/80 p-3.5 border border-slate-800 hover:border-slate-700 transition"
                      >
                        <div className="flex-1 pr-3">
                          <p className="font-bold text-white text-base leading-snug">
                            {item.product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-slate-300">
                            <span className="font-bold text-slate-300">Rate: ₹</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.product.rate}
                              onChange={(e) => {
                                const newRate = parseFloat(e.target.value) || 0;
                                setPosCart((prev) =>
                                  prev.map((p) =>
                                    p.product.id === item.product.id
                                      ? { ...p, product: { ...p.product, rate: newRate } }
                                      : p
                                  )
                                );
                              }}
                              className="w-20 rounded-lg border-2 border-slate-600 bg-slate-950 px-2.5 py-1 text-sm font-black text-emerald-400 outline-none focus:border-cyan-400 text-center font-mono shadow-inner"
                              title="Click to edit unit rate for this sale"
                            />
                            <span className="font-bold text-slate-400">× {item.qty}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800/90 p-1 shadow-sm">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.product.id, item.qty - 1)}
                              className="h-8 w-8 rounded-lg bg-slate-700/80 text-white font-black text-sm hover:bg-slate-600 flex items-center justify-center transition active:scale-95"
                              title="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-black text-sm text-white font-mono">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.product.id, item.qty + 1)}
                              className="h-8 w-8 rounded-lg bg-slate-700/80 text-white font-black text-sm hover:bg-slate-600 flex items-center justify-center transition active:scale-95"
                              title="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-black text-cyan-300 min-w-[55px] text-right font-mono text-base">
                            ₹{item.product.rate * item.qty}
                          </span>
                        </div>
                      </div>
                    ))}

                    {customItemName.trim() && (
                      <div className="flex items-center justify-between rounded-xl bg-slate-900/80 p-3.5 border border-slate-800">
                        <div className="flex-1 pr-3">
                          <p className="font-bold text-white text-base leading-snug">
                            {customItemName} (Custom)
                          </p>
                          <span className="text-sm font-semibold text-slate-300 mt-1 block">
                            ₹{customItemRate || 0} × {customItemQty || 1}
                          </span>
                        </div>
                        <span className="font-black text-cyan-300 min-w-[55px] text-right font-mono text-base">
                          ₹{(parseFloat(customItemRate) || 0) * (parseInt(customItemQty, 10) || 1)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleSaveCounterSale} className="space-y-3.5 pt-3.5 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-sm uppercase font-extrabold text-slate-300 tracking-wider">Total Bill</span>
                <span className="text-4xl font-black text-white font-mono">₹{posCartTotal}</span>
              </div>

              {/* Payment Mode Selector */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPosMethod("Cash")}
                  className={`rounded-xl border py-3 text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                    posMethod === "Cash"
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/10"
                      : "border-slate-700 bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-base">💵</span> Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPosMethod("UPI")}
                  className={`rounded-xl border py-3 text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                    posMethod === "UPI"
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-md shadow-cyan-500/10"
                      : "border-slate-700 bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-base">📱</span> UPI / GPay
                </button>
              </div>

              {/* Customer Name & Phone (Optional) */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Customer Name (optional)"
                  value={posCustomerName}
                  onChange={(e) => setPosCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400 font-medium"
                />
                <input
                  type="text"
                  placeholder="Customer Phone (for WhatsApp slip)"
                  value={posCustomerPhone}
                  onChange={(e) => setPosCustomerPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400 font-medium"
                />
              </div>

              {/* Due / Khata Toggle */}
              <label className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={posIsCredit}
                  onChange={(e) => setPosIsCredit(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
                <span className={posIsCredit ? "font-bold text-amber-300" : "font-medium"}>
                  Mark as Credit / Udhar (Pay Later)
                </span>
              </label>

              <button
                type="submit"
                disabled={savingPos || posCartTotal <= 0}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-3.5 text-base font-extrabold text-slate-950 hover:brightness-110 disabled:opacity-50 transition shadow-lg shadow-cyan-500/20"
              >
                {savingPos ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                <span>Record Counter Sale (₹{posCartTotal})</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Tab 3: CUSTOMER KHATA (CREDIT / UDHAR) */}
      {subTab === "khata" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Customer Due Ledger (Khata / Udhar)
              </h3>
              <p className="text-xs text-slate-400">
                Track and collect unpaid customer bills with 1-click WhatsApp reminders
              </p>
            </div>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300">
              Total Outstanding: ₹{khataList.reduce((s, k) => s + k.amount, 0)}
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0e1625]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900/60 uppercase tracking-wider text-slate-400 font-bold">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Service / Particulars</th>
                    <th className="px-4 py-3 text-right">Due Amount (₹)</th>
                    <th className="px-4 py-3 text-center">Settlement</th>
                    <th className="px-4 py-3 text-center">WhatsApp Reminder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {khataList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        🎉 Great news! There are zero pending customer dues right now.
                      </td>
                    </tr>
                  ) : (
                    khataList.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3.5 font-mono text-slate-300 text-xs whitespace-nowrap">
                          {tx.transaction_date}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-white text-sm">
                          {tx.customer_name || "Walk-in Customer"}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-300 text-xs">
                          {tx.customer_phone || "—"}
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">
                          <p className="font-semibold text-white text-sm">{tx.title}</p>
                          {tx.description && (
                            <p className="text-xs text-slate-400 mt-0.5">{tx.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right font-black text-amber-300 text-base font-mono">
                          ₹{tx.amount}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={settlingId === tx.id}
                              onClick={() => handleSettleCredit(tx.id, "Cash")}
                              className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition"
                            >
                              💵 Cash
                            </button>
                            <button
                              type="button"
                              disabled={settlingId === tx.id}
                              onClick={() => handleSettleCredit(tx.id, "UPI")}
                              className="rounded-lg bg-cyan-500/15 border border-cyan-500/30 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/25 transition"
                            >
                              📱 UPI
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {tx.customer_phone ? (
                            <a
                              href={`https://wa.me/${tx.customer_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Hello ${tx.customer_name || "Customer"}, gentle reminder from DIGITAL DEN 360 regarding pending payment of ₹${tx.amount} for "${tx.title}". You can pay via UPI to 7012584152. Thank you!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                            >
                              <MessageCircle size={14} />
                              <span>Remind</span>
                            </a>
                          ) : (
                            <span className="text-xs text-slate-500">No Phone</span>
                          )}
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

      {/* MODAL 0: ADD INVOICE & RECORD TRANSACTION */}
      {showInvoiceModal && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowInvoiceModal(false);
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-[#121c2d] shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-[#162236] px-6 py-3.5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/15 p-2 text-cyan-300">
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Add Invoice & Record Transaction</h3>
                  <p className="text-xs text-slate-400">
                    Create invoice, collect payment & record income to Daybook
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1.5 border-b border-slate-800 bg-[#0e1625] px-6 py-2.5">
              <button
                type="button"
                onClick={() => setInvMode("citizen")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  invMode === "citizen"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🏛️ Citizen / Portal Service
              </button>
              <button
                type="button"
                onClick={() => setInvMode("counter")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  invMode === "counter"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🖨️ Counter POS & Xerox
              </button>
              <button
                type="button"
                onClick={() => setInvMode("custom")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  invMode === "custom"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ✍️ Custom Service Bill
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveInvoice(false);
              }}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {/* TAB 1: CITIZEN PORTAL SERVICE */}
              {invMode === "citizen" && (
                <div className="space-y-3.5 rounded-xl border border-slate-800 bg-[#0e1625] p-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Select Citizen Service Preset
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Loads standard rates automatically
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Choose Service or Custom *
                    </label>
                    <select
                      value={invServiceId}
                      onChange={(e) => handleSelectServicePreset(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                    >
                      {serviceCharges.map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.serviceName} ({sc.category}) — Default ₹{sc.defaultCharge}
                        </option>
                      ))}
                      <option value="custom">+ Other / Custom Citizen Service</option>
                    </select>
                  </div>

                  {invServiceId === "custom" && (
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Custom Service Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Land Revenue Mutation"
                          value={invServiceName}
                          onChange={(e) => setInvServiceName(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Category
                        </label>
                        <select
                          value={invServiceCategory}
                          onChange={(e) => setInvServiceCategory(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                        >
                          <option value="Govt Portals">Govt Portals</option>
                          <option value="e-District">e-District</option>
                          <option value="Utility Bills">Utility Bills</option>
                          <option value="Transport RTO">Transport RTO</option>
                          <option value="Election Commission">Election Commission</option>
                          <option value="Exam Portals">Exam Portals</option>
                          <option value="Banking / Other">Banking / Other</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Official / Wallet Fee (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={invGovtFee}
                        onChange={(e) => setInvGovtFee(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono font-bold text-slate-300 outline-none focus:border-cyan-400"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Official portal fee</span>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Digital Den Service Charge (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder="100"
                        value={invServiceCharge}
                        onChange={(e) => setInvServiceCharge(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono font-bold text-cyan-300 outline-none focus:border-cyan-400"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Processing & shop fee</span>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Deduct Portal Wallet
                      </label>
                      <select
                        value={invWalletId}
                        onChange={(e) => setInvWalletId(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-2 text-xs text-white outline-none focus:border-cyan-400"
                      >
                        <option value="">None / External Cash</option>
                        {wallets.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} (Bal: ₹{w.balance})
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Optional portal deduct</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Notes / Application Remarks (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Application No. 8923048, Tatkal, or customer instruction"
                      value={invServiceNotes}
                      onChange={(e) => setInvServiceNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: COUNTER POS & XEROX BILL */}
              {invMode === "counter" && (
                <div className="space-y-3.5 rounded-xl border border-slate-800 bg-[#0e1625] p-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Quick Counter Items & Services
                    </span>
                    <span className="text-[11px] text-slate-400">Click to add items</span>
                  </div>

                  {/* Clickable Chips */}
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {products.map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => addInvProduct(prod)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 hover:border-cyan-400/50 hover:bg-slate-800 transition"
                      >
                        <span className="font-medium">{prod.name}</span>
                        <span className="font-mono font-bold text-emerald-400">₹{prod.rate}</span>
                        <span className="rounded bg-cyan-500/20 px-1 text-[10px] font-bold text-cyan-300">+</span>
                      </button>
                    ))}
                  </div>

                  {/* Selected Cart Items */}
                  {invCart.length > 0 && (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase">Selected Bill Items</div>
                      {invCart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white"
                        >
                          <div className="flex-1">
                            <span className="font-bold">{item.product.name}</span>
                            <span className="text-slate-400 ml-2">₹{item.product.rate} / {item.product.unit}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-slate-800 rounded px-1.5 py-0.5">
                              <button
                                type="button"
                                onClick={() => updateInvQty(item.product.id, -1)}
                                className="font-bold text-slate-400 hover:text-white px-1"
                              >
                                -
                              </button>
                              <span className="font-bold font-mono px-1">{item.qty}</span>
                              <button
                                type="button"
                                onClick={() => updateInvQty(item.product.id, 1)}
                                className="font-bold text-slate-400 hover:text-white px-1"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-mono font-bold text-emerald-400 w-16 text-right">
                              ₹{(item.product.rate * item.qty).toFixed(0)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Custom item row */}
                  <div className="grid gap-2 sm:grid-cols-3 pt-1">
                    <input
                      type="text"
                      placeholder="Custom Item (e.g. Spiral Binding)"
                      value={invCustomItem}
                      onChange={(e) => setInvCustomItem(e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                    />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Rate ₹"
                      value={invCustomRate}
                      onChange={(e) => setInvCustomRate(e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={invCustomQty}
                      onChange={(e) => setInvCustomQty(e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOM INVOICE BILL */}
              {invMode === "custom" && (
                <div className="space-y-3.5 rounded-xl border border-slate-800 bg-[#0e1625] p-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Direct Custom Bill
                    </span>
                    <span className="text-[11px] text-slate-400">Any specialized work or service</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Invoice Particular / Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Malayalam DTP & Legal Agreement Typing"
                        value={invCustomTitle}
                        onChange={(e) => setInvCustomTitle(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Bill Amount (₹) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        required
                        placeholder="e.g. 350"
                        value={invCustomAmount}
                        onChange={(e) => setInvCustomAmount(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono font-bold text-emerald-400 outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Category
                      </label>
                      <select
                        value={invCustomCategory}
                        onChange={(e) => setInvCustomCategory(e.target.value as AccountCategory)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                      >
                        <option value="Service Request">Service Request</option>
                        <option value="Counter Sale">Counter Sale</option>
                        <option value="Other Income">Other Income</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Additional Notes / Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Stamp paper 5 pages printout included"
                        value={invCustomNotes}
                        onChange={(e) => setInvCustomNotes(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* COMMON CUSTOMER & PAYMENT DETAILS */}
              <div className="rounded-xl border border-slate-800 bg-[#0e1625] p-4 space-y-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block border-b border-slate-800 pb-2">
                  Customer & Payment Settlement
                </span>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      placeholder="Walk-in Customer"
                      value={invCustomerName}
                      onChange={(e) => setInvCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={invCustomerPhone}
                      onChange={(e) => setInvCustomerPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Invoice # / Ref ID
                    </label>
                    <input
                      type="text"
                      value={invRefId}
                      onChange={(e) => setInvRefId(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-cyan-300 outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                      Payment Mode
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["Cash", "UPI", "Bank Transfer"] as PaymentMethod[]).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setInvPaymentMethod(m)}
                          className={`rounded-lg py-2 text-xs font-bold border transition ${
                            invPaymentMethod === m
                              ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
                              : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                          }`}
                        >
                          {m === "Cash" ? "💵 Cash" : m === "UPI" ? "📱 UPI" : "🏦 Bank"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                      Payment Status
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInvIsCredit(false)}
                        className={`rounded-lg py-2 text-xs font-bold border transition ${
                          !invIsCredit
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                            : "bg-slate-900 border-slate-700 text-slate-400"
                        }`}
                      >
                        ✅ Paid / Settled
                      </button>
                      <button
                        type="button"
                        onClick={() => setInvIsCredit(true)}
                        className={`rounded-lg py-2 text-xs font-bold border transition ${
                          invIsCredit
                            ? "bg-amber-500/20 text-amber-300 border-amber-400/40"
                            : "bg-slate-900 border-slate-700 text-slate-400"
                        }`}
                      >
                        ⏳ Due / Khata (Udhar)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Summary Banner */}
              <div className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 to-teal-950/40 p-4">
                <div>
                  <span className="text-xs uppercase font-bold text-cyan-300 tracking-wider">
                    Total Invoice Amount
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {invPaymentMethod} • {invIsCredit ? "Pending Credit" : "Instant Settle"}
                  </p>
                </div>
                <div className="font-mono text-2xl font-black text-emerald-300">
                  ₹ {invTotalAmount.toFixed(2)}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={savingInvoice}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 transition shadow-md shadow-cyan-500/20"
                >
                  {savingInvoice ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Save & Record Invoice (₹{invTotalAmount.toFixed(0)})</span>
                </button>
                <button
                  type="button"
                  disabled={savingInvoice}
                  onClick={() => handleSaveInvoice(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/25 transition"
                >
                  <Printer size={14} />
                  <span>Save & Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD EXPENSE */}
      {showExpenseModal && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
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
                  <p className="text-xs text-slate-400">Deducts from daily shop accounts</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300">
                  Expense Category
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as AccountCategory)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs text-white outline-none focus:border-red-400"
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
                <label className="block text-xs font-semibold uppercase text-slate-300">
                  Expense Item / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2 Reams A4 Paper JK Copier"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs text-white outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300">
                  Amount (₹)
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-bold text-red-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="e.g. 450"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-8 pr-3 text-sm font-bold text-white outline-none focus:border-red-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300">
                  Paid From
                </label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExpMethod("Cash")}
                    className={`rounded-xl border py-2 text-xs font-bold transition ${
                      expMethod === "Cash"
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                        : "border-slate-700 bg-slate-900 text-slate-400"
                    }`}
                  >
                    💵 Cash (Shop Drawer)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpMethod("UPI")}
                    className={`rounded-xl border py-2 text-xs font-bold transition ${
                      expMethod === "UPI"
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                        : "border-slate-700 bg-slate-900 text-slate-400"
                    }`}
                  >
                    📱 UPI / Bank
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300">
                  Notes / Receipt Details (optional)
                </label>
                <input
                  type="text"
                  placeholder="Purchased from Town Book Depot"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-slate-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={savingExp}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-xs font-bold text-white hover:bg-red-600 transition"
                >
                  {savingExp ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Save Expense</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PORTAL WALLET TOP-UP */}
      {showTopupModal && targetWallet && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowTopupModal(false);
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-[#121c2d] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 bg-[#162236] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/15 p-2 text-cyan-300">
                  <Wallet size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Top-up Portal Wallet</h3>
                  <p className="text-xs text-slate-400 font-mono">{targetWallet.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTopupModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTopup} className="p-6 space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 flex justify-between items-center">
                <span className="text-xs text-slate-400">Current Wallet Balance:</span>
                <span className="text-lg font-black text-white font-mono">
                  ₹{targetWallet.balance}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300">
                  Top-up Amount (₹)
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-bold text-cyan-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-8 pr-3 text-sm font-bold text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[1000, 2000, 3000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(String(amt))}
                      className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-slate-300 hover:border-cyan-500/40"
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300">
                  Funding Mode
                </label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTopupMethod("UPI")}
                    className={`rounded-xl border py-2 text-xs font-bold transition ${
                      topupMethod === "UPI"
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                        : "border-slate-700 bg-slate-900 text-slate-400"
                    }`}
                  >
                    📱 UPI / Netbanking
                  </button>
                  <button
                    type="button"
                    onClick={() => setTopupMethod("Cash")}
                    className={`rounded-xl border py-2 text-xs font-bold transition ${
                      topupMethod === "Cash"
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                        : "border-slate-700 bg-slate-900 text-slate-400"
                    }`}
                  >
                    💵 Cash Out
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                ℹ Topping up this wallet will record a top-up transaction in your daybook and increment the live portal balance.
              </p>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={savingTopup}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition"
                >
                  {savingTopup ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Confirm Top-up (₹{topupAmount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowTopupModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CHANGE SERVICE CHARGES & PRICE LIST */}
      {showPricingModal && (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowPricingModal(false);
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-[#121c2d] shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-[#162236] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/15 p-2 text-cyan-300">
                  <Settings size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Service Charges & Rate Settings</h3>
                  <p className="text-xs text-slate-400">
                    Configure your centre's service charges & walk-in counter rates
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPricingModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs & Sub-actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-[#0e1625] px-6 py-2.5">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPricingTab("counter");
                    setShowAddServiceForm(false);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    pricingTab === "counter"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🖨️ Counter POS Rates ({editingProducts.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPricingTab("services");
                    setShowAddProdForm(false);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    pricingTab === "services"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🏛️ Citizen & Portal Fees ({editingCharges.length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (pricingTab === "counter") {
                      setShowAddProdForm((v) => !v);
                    } else {
                      setShowAddServiceForm((v) => !v);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition shadow-sm"
                >
                  <Plus size={13} />
                  <span>
                    {pricingTab === "counter"
                      ? (showAddProdForm ? "Hide Form" : "+ Add Product")
                      : (showAddServiceForm ? "Hide Form" : "+ Add Service")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleResetDefaultPrices}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-amber-300 transition px-2 py-1"
                  title="Reset to recommended standard rates"
                >
                  <RotateCcw size={12} />
                  <span>Reset Defaults</span>
                </button>
              </div>
            </div>

            {/* Success toast if saved */}
            {savedSuccessMsg && (
              <div className="mx-6 mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-2.5 text-xs font-semibold text-emerald-300">
                <Check size={14} />
                <span>{savedSuccessMsg}</span>
              </div>
            )}

            {/* Form list scrollable */}
            <form onSubmit={handleSaveAllPrices} className="flex-1 overflow-y-auto p-6 space-y-4">
              {pricingTab === "counter" && (
                <div className="space-y-3.5">
                  {/* Inline Add Product Form */}
                  {showAddProdForm && (
                    <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-br from-[#0b1526] to-[#0e1c33] p-4 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                        <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                          <Plus size={14} />
                          <span>Add New Counter Product / Rate Option</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAddProdForm(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="grid gap-2.5 sm:grid-cols-4">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Product / Service Name *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Photo Print A4, Lamination A3"
                            value={newProdName}
                            onChange={(e) => setNewProdName(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Category
                          </label>
                          <select
                            value={newProdCategory}
                            onChange={(e) => setNewProdCategory(e.target.value as any)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                          >
                            <option value="print">Print & Xerox</option>
                            <option value="photo">Photo Studio</option>
                            <option value="card">Smart Card / PVC</option>
                            <option value="service">Counter Service</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Unit
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. page, sheet, doc, card"
                            value={newProdUnit}
                            onChange={(e) => setNewProdUnit(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-300">Rate (₹):</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="₹ Rate"
                            value={newProdRate}
                            onChange={(e) => setNewProdRate(e.target.value)}
                            className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-emerald-300 outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddProdForm(false)}
                            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddProductOption}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition"
                          >
                            <Plus size={13} />
                            <span>Add Product</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase font-semibold border-b border-slate-800/80 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span>Service / Product Item ({editingProducts.length})</span>
                      {!showAddProdForm && (
                        <button
                          type="button"
                          onClick={() => setShowAddProdForm(true)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 transition"
                        >
                          <Plus size={11} />
                          <span>+ Add Option</span>
                        </button>
                      )}
                    </div>
                    <span>Rate (₹)</span>
                  </div>

                  <div className="grid gap-2.5">
                    {editingProducts.map((prod, idx) => (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#0e1625] px-4 py-2.5 hover:border-slate-700 transition group"
                      >
                        <div className="flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-white">{prod.name}</p>
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 capitalize">
                              {prod.category}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">Unit: {prod.unit}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-slate-400">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              required
                              value={prod.rate}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setEditingProducts((prev) =>
                                  prev.map((p, i) => (i === idx ? { ...p, rate: val } : p))
                                );
                              }}
                              className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-bold text-emerald-300 text-right outline-none focus:border-cyan-400"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400 transition"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pricingTab === "services" && (
                <div className="space-y-3.5">
                  {/* Inline Add Service Form */}
                  {showAddServiceForm && (
                    <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-br from-[#0b1526] to-[#0e1c33] p-4 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                        <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                          <Plus size={14} />
                          <span>Add New Citizen / Portal Service Option</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAddServiceForm(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="grid gap-2.5 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Service Name *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Birth Certificate, Ration Card Surrender"
                            value={newServiceName}
                            onChange={(e) => setNewServiceName(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Category
                          </label>
                          <select
                            value={newServiceCategory}
                            onChange={(e) => setNewServiceCategory(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                          >
                            <option value="Govt Portals">Govt Portals</option>
                            <option value="e-District">e-District</option>
                            <option value="Utility Bills">Utility Bills</option>
                            <option value="Transport RTO">Transport RTO</option>
                            <option value="Election Commission">Election Commission</option>
                            <option value="Exam Portals">Exam Portals</option>
                            <option value="Banking / Other">Banking / Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-300">Default Service Charge (₹):</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="₹ Charge"
                            value={newServiceCharge}
                            onChange={(e) => setNewServiceCharge(e.target.value)}
                            className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-cyan-300 outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddServiceForm(false)}
                            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddServiceOption}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition"
                          >
                            <Plus size={13} />
                            <span>Add Service</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase font-semibold border-b border-slate-800/80 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span>Citizen Portal / Certificate Service ({editingCharges.length})</span>
                      {!showAddServiceForm && (
                        <button
                          type="button"
                          onClick={() => setShowAddServiceForm(true)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 transition"
                        >
                          <Plus size={11} />
                          <span>+ Add Option</span>
                        </button>
                      )}
                    </div>
                    <span>Service Charge (₹)</span>
                  </div>

                  <div className="grid gap-2.5">
                    {editingCharges.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#0e1625] px-4 py-2.5 hover:border-slate-700 transition group"
                      >
                        <div className="flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-white">{item.serviceName}</p>
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-cyan-300">
                              {item.category}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">Standard Citizen Service</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-slate-400">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              required
                              value={item.defaultCharge}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setEditingCharges((prev) =>
                                  prev.map((c, i) =>
                                    i === idx ? { ...c, defaultCharge: val } : c
                                  )
                                );
                              }}
                              className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-bold text-cyan-300 text-right outline-none focus:border-cyan-400"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteCharge(item.id)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400 transition"
                            title="Delete Service"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <button
                  type="submit"
                  disabled={savingPrices}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 transition shadow-md shadow-cyan-500/20"
                >
                  {savingPrices ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Save All Rates & Service Charges</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPricingModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET BALANCES & DAYBOOK MODAL */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isResetting) setShowResetModal(false);
          }}
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-[#0c1322] shadow-2xl overflow-hidden p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Reset & Clear Balances</h3>
                  <p className="text-[11px] text-slate-400">Choose what to reset. Changes sync permanently to Supabase.</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setShowResetModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* Success message banner */}
            {resetSuccessMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3 text-xs text-emerald-300">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            {/* 3 Explicit Reset Options */}
            <div className="space-y-3 text-xs">
              {/* Option 1: Wallets Only */}
              <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-4 space-y-2 hover:border-cyan-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    💼 Reset Portal & Bank Wallets to ₹0 Only
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Safe for Services
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Sets e-District, CSC, Bank, and Other wallet balances to ₹0 in Supabase. <strong className="text-slate-200">Your daybook services, invoices, and sales will stay 100% safe.</strong>
                </p>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={handleResetWalletsOnly}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/15 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/25 transition disabled:opacity-50"
                >
                  {isResetting ? <RefreshCw size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                  <span>Reset Wallets to ₹0 (Keep Invoices Safe)</span>
                </button>
              </div>

              {/* Option 2: Daybook Only */}
              <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-4 space-y-2 hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    🧾 Clear Daybook Invoices & Cash Drawer
                  </span>
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Daybook Clear
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Deletes all sales and service invoices from the daybook and Supabase, resetting cash drawer to ₹0. <strong className="text-slate-200">Portal wallet balances will remain untouched.</strong>
                </p>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={handleResetDaybookOnly}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/15 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition disabled:opacity-50"
                >
                  {isResetting ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  <span>Clear Daybook Services from Supabase</span>
                </button>
              </div>

              {/* Option 3: Full Reset */}
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 flex items-center gap-1.5">
                    ⚠️ Complete Full Reset to ₹0 (Clean Slate)
                  </span>
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    Danger
                  </span>
                </div>
                <p className="text-[11px] text-rose-200/80 leading-relaxed">
                  Resets both portal wallets to ₹0 AND deletes all daybook transactions from Supabase.
                </p>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => {
                    if (confirm("Are you sure you want to reset EVERYTHING (both wallets and all daybook transactions) to ₹0? This cannot be undone.")) {
                      handleResetAllComplete();
                    }
                  }}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 py-2 text-xs font-bold text-white transition disabled:opacity-50 shadow-sm"
                >
                  {isResetting ? <RefreshCw size={13} className="animate-spin" /> : <AlertCircle size={13} />}
                  <span>Full Clean Slate (Reset Everything to ₹0)</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setShowResetModal(false)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
