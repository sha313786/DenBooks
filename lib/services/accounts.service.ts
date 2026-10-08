import { supabase } from "@/lib/supabase";

export type TransactionType = "income" | "expense" | "portal_topup";
export type PaymentMethod = "Cash" | "UPI" | "Bank Transfer";

export type AccountCategory =
  | "Counter Sale"
  | "Service Request"
  | "Govt Fee Pass-through"
  | "Paper & Stationery"
  | "Ink & Toner"
  | "Shop Electricity"
  | "Internet & WiFi"
  | "Shop Rent"
  | "Refreshments & Tea"
  | "Portal Wallet Topup"
  | "Hardware & Maintenance"
  | "Staff & Wages"
  | "Other Income"
  | "Other Expense";

export type AccountTransaction = {
  id: string;
  transaction_date: string; // YYYY-MM-DD
  created_at: string;
  type: TransactionType;
  category: AccountCategory;
  title: string;
  description?: string;
  amount: number; // Total amount in rupees
  govt_fee?: number; // Official fee passed through
  service_charge?: number; // Shop processing revenue
  payment_method: PaymentMethod;
  reference_id?: string; // REQ-ID or Bill #
  customer_name?: string;
  customer_phone?: string;
  is_settled: boolean; // true = paid, false = credit/due
  wallet_name?: string;
  employee_id?: string;
  employee_name?: string;
};

export type PortalWallet = {
  id: string;
  name: string;
  category: "Govt Portal" | "Utility" | "Banking / AEPS" | "Banking" | "Other";
  balance: number;
  min_alert_balance: number;
  last_topup_date?: string;
  last_topup_amount?: number;
};

export type CounterProduct = {
  id: string;
  name: string;
  rate: number;
  unit: string;
  category: "print" | "photo" | "card" | "service";
};

export const DEFAULT_COUNTER_PRODUCTS: CounterProduct[] = [
  { id: "p1", name: "B&W Xerox / Print (Single)", rate: 3, unit: "page", category: "print" },
  { id: "p2", name: "B&W Xerox / Print (Back-to-Back)", rate: 5, unit: "sheet", category: "print" },
  { id: "p3", name: "Color Printout (A4)", rate: 10, unit: "page", category: "print" },
  { id: "p4", name: "Passport Photos (8 copies sheet)", rate: 60, unit: "set", category: "photo" },
  { id: "p5", name: "PVC Smart ID Card (Aadhaar/Voter)", rate: 70, unit: "card", category: "card" },
  { id: "p6", name: "A4 Certificate Lamination", rate: 25, unit: "sheet", category: "service" },
  { id: "p7", name: "ID Card Lamination (Small)", rate: 15, unit: "card", category: "service" },
  { id: "p8", name: "Spiral Document Binding", rate: 45, unit: "book", category: "service" },
  { id: "p9", name: "Document Scan & Email/WhatsApp", rate: 20, unit: "doc", category: "service" },
  { id: "p10", name: "Biodata / Job Resume Typing", rate: 50, unit: "page", category: "service" },
];

export type ServiceChargeItem = {
  id: string;
  serviceName: string;
  defaultCharge: number;
  category: string;
};

export const DEFAULT_SERVICE_CHARGES: ServiceChargeItem[] = [
  { id: "sc-1", serviceName: "Passport Application Online", defaultCharge: 250, category: "Govt Portals" },
  { id: "sc-2", serviceName: "PAN Card New / Correction", defaultCharge: 150, category: "Govt Portals" },
  { id: "sc-3", serviceName: "Village Land Tax Online Payment", defaultCharge: 50, category: "Govt Portals" },
  { id: "sc-4", serviceName: "KSEB / Water Bill Payment", defaultCharge: 40, category: "Utility Bills" },
  { id: "sc-5", serviceName: "Caste / Income / Nativity Certificate", defaultCharge: 80, category: "e-District" },
  { id: "sc-6", serviceName: "Driving License / Learner Slot Booking", defaultCharge: 200, category: "Transport RTO" },
  { id: "sc-7", serviceName: "Voter ID Card Online Registration", defaultCharge: 70, category: "Election Commission" },
  { id: "sc-8", serviceName: "Employment Exchange Registration", defaultCharge: 100, category: "Govt Portals" },
  { id: "sc-9", serviceName: "PSC / SSC / Govt Exam Application", defaultCharge: 120, category: "Exam Portals" },
  { id: "sc-10", serviceName: "Scanning & Documents", defaultCharge: 50, category: "Office Services" },
  { id: "sc-11", serviceName: "Printing Services", defaultCharge: 50, category: "Office Services" },
  { id: "sc-12", serviceName: "Application Support", defaultCharge: 100, category: "Citizen Services" },
  { id: "sc-13", serviceName: "Aadhaar / PVC Card Printing", defaultCharge: 70, category: "Citizen Services" },
];

const STORAGE_KEY_PRODUCTS = "dd_accounts_products_v1";
const STORAGE_KEY_SERVICE_CHARGES = "dd_accounts_service_charges_v1";

let memoryProducts: CounterProduct[] = [...DEFAULT_COUNTER_PRODUCTS];
let memoryServiceCharges: ServiceChargeItem[] = [...DEFAULT_SERVICE_CHARGES];

export function getCounterProducts(): CounterProduct[] {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryProducts = parsed;
        }
      }
    } catch {}
  }
  return memoryProducts;
}

export function saveCounterProducts(products: CounterProduct[]): void {
  memoryProducts = products;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch {}
  }
}

export function updateCounterProductRate(id: string, newRate: number): CounterProduct[] {
  const updated = getCounterProducts().map((p) =>
    p.id === id ? { ...p, rate: Math.max(0, newRate) } : p
  );
  saveCounterProducts(updated);
  return updated;
}

export function addCounterProduct(product: Omit<CounterProduct, "id">): CounterProduct[] {
  const newProd: CounterProduct = {
    ...product,
    id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };
  const list = [...getCounterProducts(), newProd];
  saveCounterProducts(list);
  return list;
}

export function deleteCounterProduct(id: string): CounterProduct[] {
  const list = getCounterProducts().filter((p) => p.id !== id);
  saveCounterProducts(list);
  return list;
}

export function getServiceChargesMaster(): ServiceChargeItem[] {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SERVICE_CHARGES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const existingNames = new Set(parsed.map((p: any) => (p.serviceName || "").toLowerCase().trim()));
          const missing = DEFAULT_SERVICE_CHARGES.filter(
            (d) => !existingIds.has(d.id) && !existingNames.has(d.serviceName.toLowerCase().trim())
          );
          memoryServiceCharges = [...parsed, ...missing];
        }
      }
    } catch {}
  }
  return memoryServiceCharges;
}

export function saveServiceChargesMaster(items: ServiceChargeItem[]): void {
  memoryServiceCharges = items;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_SERVICE_CHARGES, JSON.stringify(items));
    } catch {}
  }
}

export function updateServiceCharge(id: string, newCharge: number): ServiceChargeItem[] {
  const updated = getServiceChargesMaster().map((sc) =>
    sc.id === id ? { ...sc, defaultCharge: Math.max(0, newCharge) } : sc
  );
  saveServiceChargesMaster(updated);
  return updated;
}

export function addServiceCharge(item: Omit<ServiceChargeItem, "id">): ServiceChargeItem[] {
  const newItem: ServiceChargeItem = {
    ...item,
    id: `sc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };
  const list = [...getServiceChargesMaster(), newItem];
  saveServiceChargesMaster(list);
  return list;
}

export function deleteServiceCharge(id: string): ServiceChargeItem[] {
  const list = getServiceChargesMaster().filter((sc) => sc.id !== id);
  saveServiceChargesMaster(list);
  return list;
}

export const INITIAL_PORTAL_WALLETS: PortalWallet[] = [
  {
    id: "w-edistrict",
    name: "e-District Citizen Portal",
    category: "Govt Portal",
    balance: 0,
    min_alert_balance: 1000,
  },
  {
    id: "w-csc",
    name: "CSC Digital Seva Wallet",
    category: "Govt Portal",
    balance: 0,
    min_alert_balance: 1500,
  },
  {
    id: "w-bank",
    name: "Bank",
    category: "Banking",
    balance: 0,
    min_alert_balance: 1000,
  },
  {
    id: "w-other",
    name: "Other",
    category: "Other",
    balance: 0,
    min_alert_balance: 500,
  },
];

// Helper to get local date in YYYY-MM-DD (immune to UTC midnight off-by-one errors)
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Clean start: all transactions initialize to empty
let memoryTransactions: AccountTransaction[] = [];
let memoryWallets: PortalWallet[] = INITIAL_PORTAL_WALLETS.map((w) => ({ ...w, balance: 0 }));

// LocalStorage persistence for browser sessions (v2 starts with 0 balances)
const STORAGE_KEY_TX = "dd_accounts_transactions_v2";
const STORAGE_KEY_WALLETS = "dd_accounts_wallets_v2";

// 1. Reset ONLY Portal & Bank Wallets to ₹0 (preserves daybook services & invoices!)
export async function resetPortalWalletsToZero(): Promise<PortalWallet[]> {
  loadFromStorage();
  memoryWallets = memoryWallets.map((w) => ({
    ...w,
    balance: 0,
    last_topup_amount: 0,
    last_topup_date: undefined,
  }));
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_WALLETS, JSON.stringify(memoryWallets));
    } catch {}
  }

  // Persist directly to Supabase with await (both bulk and per-id)
  try {
    await supabase
      .from("portal_wallets")
      .update({ balance: 0, last_topup_amount: 0, last_topup_date: null })
      .neq("id", "non-existent");
    for (const w of memoryWallets) {
      await supabase
        .from("portal_wallets")
        .update({ balance: 0, last_topup_amount: 0, last_topup_date: null })
        .eq("id", w.id);
    }
  } catch (err) {
    console.error("Supabase resetPortalWallets error:", err);
  }

  return [...memoryWallets];
}

// 2. Reset ONLY Daybook Transactions (preserves portal wallets!)
export async function resetDaybookTransactions(dateFilter?: string): Promise<AccountTransaction[]> {
  loadFromStorage();
  if (dateFilter) {
    memoryTransactions = memoryTransactions.filter((tx) => tx.transaction_date !== dateFilter);
  } else {
    memoryTransactions = [];
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(memoryTransactions));
    } catch {}
  }

  // Delete directly from Supabase
  try {
    if (dateFilter) {
      await supabase.from("account_transactions").delete().eq("transaction_date", dateFilter);
    } else {
      await supabase.from("account_transactions").delete().neq("id", "non-existent");
    }
  } catch (err) {
    console.error("Supabase resetDaybook error:", err);
  }

  return [...memoryTransactions];
}

// 3. Complete Reset: Reset both Wallets to ₹0 AND clear Daybook Transactions
export async function resetAllBalancesToZero(): Promise<{
  transactions: AccountTransaction[];
  wallets: PortalWallet[];
}> {
  const [clearedWallets, clearedTx] = await Promise.all([
    resetPortalWalletsToZero(),
    resetDaybookTransactions(),
  ]);
  return { transactions: clearedTx, wallets: clearedWallets };
}

function loadFromStorage() {
  if (typeof window === "undefined") return;
  try {
    // Purge old v1 test seed data
    localStorage.removeItem("dd_accounts_transactions_v1");
    localStorage.removeItem("dd_accounts_wallets_v1");

    const rawTx = localStorage.getItem(STORAGE_KEY_TX);
    if (rawTx) {
      const parsed = JSON.parse(rawTx);
      if (Array.isArray(parsed)) {
        memoryTransactions = parsed;
      }
    } else {
      memoryTransactions = [];
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify([]));
    }
    const rawWallets = localStorage.getItem(STORAGE_KEY_WALLETS);
    if (rawWallets) {
      const parsed = JSON.parse(rawWallets);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Automatically migrate any legacy kseb or sarathi to Bank and Other
        const mapped = parsed.map((w: any) => {
          if (w.id === "w-kseb" || w.name?.includes("KSEB")) {
            return {
              ...w,
              id: "w-bank",
              name: "Bank",
              category: "Banking",
              min_alert_balance: 1000,
            };
          }
          if (w.id === "w-sarathi" || w.name?.includes("Sarathi")) {
            return {
              ...w,
              id: "w-other",
              name: "Other",
              category: "Other",
              min_alert_balance: 500,
            };
          }
          return w;
        });

        memoryWallets = mapped;
        localStorage.setItem(STORAGE_KEY_WALLETS, JSON.stringify(memoryWallets));
      } else {
        memoryWallets = INITIAL_PORTAL_WALLETS;
        localStorage.setItem(STORAGE_KEY_WALLETS, JSON.stringify(memoryWallets));
      }
    } else {
      memoryWallets = INITIAL_PORTAL_WALLETS;
      localStorage.setItem(STORAGE_KEY_WALLETS, JSON.stringify(memoryWallets));
    }
  } catch (e) {
    console.warn("Storage load warning:", e);
  }
}

function saveToStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(memoryTransactions));
    localStorage.setItem(STORAGE_KEY_WALLETS, JSON.stringify(memoryWallets));
  } catch (e) {
    console.warn("Storage save warning:", e);
  }
}

export type TransactionFilters = {
  date?: string;
  type?: TransactionType | "all";
  paymentMethod?: PaymentMethod | "all";
  isSettled?: boolean;
  employeeId?: string;
};

// Fetch all transactions with optional date and employee filter
export async function getAccountTransactions(filters?: TransactionFilters): Promise<AccountTransaction[]> {
  loadFromStorage();

  try {
    let query = supabase.from("account_transactions").select("*").order("created_at", { ascending: false });

    if (filters?.date) {
      query = query.eq("transaction_date", filters.date);
    }
    if (filters?.type && filters.type !== "all") {
      query = query.eq("type", filters.type);
    }
    if (filters?.paymentMethod && filters.paymentMethod !== "all") {
      query = query.eq("payment_method", filters.paymentMethod);
    }
    if (filters?.isSettled !== undefined) {
      query = query.eq("is_settled", filters.isSettled);
    }
    if (filters?.employeeId && filters.employeeId !== "all") {
      query = query.eq("employee_id", filters.employeeId);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    if (data) {
      // Deduplicate by ID — prevents double-entry from localStorage + Supabase having same record
      const seen = new Set<string>();
      const deduped = (data as AccountTransaction[]).filter((tx) => {
        if (seen.has(tx.id)) return false;
        seen.add(tx.id);
        return true;
      });
      if (!filters || (!filters.date && !filters.type && !filters.paymentMethod && filters.isSettled === undefined && !filters.employeeId)) {
        memoryTransactions = deduped;
        saveToStorage();
      }
      return deduped;
    }
  } catch (err) {
    // Graceful fallback to memory/localStorage
  }

  // Filter memory
  let results = [...memoryTransactions];
  if (filters?.date) {
    results = results.filter((tx) => tx.transaction_date === filters.date);
  }
  if (filters?.type && filters.type !== "all") {
    results = results.filter((tx) => tx.type === filters.type);
  }
  if (filters?.paymentMethod && filters.paymentMethod !== "all") {
    results = results.filter((tx) => tx.payment_method === filters.paymentMethod);
  }
  if (filters?.isSettled !== undefined) {
    results = results.filter((tx) => tx.is_settled === filters.isSettled);
  }
  if (filters?.employeeId && filters.employeeId !== "all") {
    results = results.filter((tx) => tx.employee_id === filters.employeeId);
  }

  return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// Create a new transaction (Counter POS, Expense, or Manual Income)
export async function createAccountTransaction(
  payload: Omit<AccountTransaction, "id" | "created_at">
): Promise<AccountTransaction> {
  const numericAmount = Number(payload.amount);
  if (isNaN(numericAmount) || Math.abs(numericAmount) === 0) {
    throw new Error("Transaction amount cannot be zero (₹0). Transaction was not saved.");
  }

  const newTx: AccountTransaction = {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    created_at: new Date().toISOString(),
    transaction_date: payload.transaction_date || getTodayDateString(),
    type: payload.type,
    category: payload.category,
    title: payload.title,
    description: payload.description || "",
    amount: Number(payload.amount),
    govt_fee: payload.govt_fee ? Number(payload.govt_fee) : 0,
    service_charge: payload.service_charge ? Number(payload.service_charge) : 0,
    payment_method: payload.payment_method,
    reference_id: payload.reference_id || "",
    customer_name: payload.customer_name || "",
    customer_phone: payload.customer_phone || "",
    is_settled: payload.is_settled ?? true,
    wallet_name: payload.wallet_name || "",
    employee_id: payload.employee_id || "",
    employee_name: payload.employee_name || "",
  };

  let finalTx = newTx;

  try {
    const { data, error } = await supabase.from("account_transactions").insert(newTx).select().maybeSingle();
    if (!error && data) {
      // Use the DB record as the source of truth
      finalTx = data as AccountTransaction;
    }
  } catch (err) {
    // Memory fallback
  }

  // Only add to memory if not already there (prevents double-entry on Supabase success)
  const alreadyExists = memoryTransactions.some((t) => t.id === finalTx.id);
  if (!alreadyExists) {
    memoryTransactions.unshift(finalTx);
  }
  saveToStorage();
  return finalTx;
}

// Mark a customer credit / udhar transaction as settled (Paid)
export async function settleTransaction(
  id: string,
  paymentMethod: PaymentMethod = "Cash"
): Promise<AccountTransaction> {
  const index = memoryTransactions.findIndex((t) => t.id === id);
  if (index >= 0) {
    memoryTransactions[index].is_settled = true;
    memoryTransactions[index].payment_method = paymentMethod;
    saveToStorage();
  }

  try {
    await supabase.from("account_transactions").update({ is_settled: true, payment_method: paymentMethod }).eq("id", id);
  } catch {}

  return memoryTransactions[index];
}

// Delete a transaction
export async function deleteAccountTransaction(id: string): Promise<void> {
  memoryTransactions = memoryTransactions.filter((t) => t.id !== id);
  saveToStorage();

  try {
    await supabase.from("account_transactions").delete().eq("id", id);
  } catch {}
}

// Fetch all portal wallets
export async function getPortalWallets(): Promise<PortalWallet[]> {
  loadFromStorage();
  try {
    const { data, error } = await supabase.from("portal_wallets").select("*").order("name", { ascending: true });
    if (!error && data) {
      if (data.length > 0) {
        // Map any legacy kseb or sarathi rows to Bank and Other
        const mapped = data.map((w: any) => {
          if (w.id === "w-kseb" || w.name?.includes("KSEB")) {
            return {
              ...w,
              id: "w-bank",
              name: "Bank",
              category: "Banking" as const,
              min_alert_balance: 1000,
            };
          }
          if (w.id === "w-sarathi" || w.name?.includes("Sarathi")) {
            return {
              ...w,
              id: "w-other",
              name: "Other",
              category: "Other" as const,
              min_alert_balance: 500,
            };
          }
          return w;
        });

        // Sync Supabase in the background if old rows were present
        if (data.some((w: any) => w.id === "w-kseb" || w.id === "w-sarathi")) {
          supabase.from("portal_wallets").delete().in("id", ["w-kseb", "w-sarathi"]).then(() => {
            supabase.from("portal_wallets").upsert([
              { id: "w-bank", name: "Bank", category: "Banking", balance: mapped.find((m: any) => m.id === "w-bank")?.balance || 0, min_alert_balance: 1000 },
              { id: "w-other", name: "Other", category: "Other", balance: mapped.find((m: any) => m.id === "w-other")?.balance || 0, min_alert_balance: 500 },
            ]).then();
          });
        }

        memoryWallets = mapped as PortalWallet[];
        saveToStorage();
        return memoryWallets;
      } else {
        // Table exists in Supabase but has 0 rows - auto-seed so user can see & edit rows in Supabase Table Editor
        try {
          await supabase.from("portal_wallets").insert(INITIAL_PORTAL_WALLETS);
          const { data: seeded } = await supabase.from("portal_wallets").select("*").order("name", { ascending: true });
          if (seeded && seeded.length > 0) {
            memoryWallets = seeded as PortalWallet[];
            saveToStorage();
            return memoryWallets;
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn("Supabase portal_wallets fetch warning:", err);
  }

  return memoryWallets;
}

// Top-up a portal wallet
export async function topupPortalWallet(
  walletId: string,
  amount: number,
  paymentMethod: PaymentMethod = "UPI"
): Promise<PortalWallet> {
  const wallet = memoryWallets.find((w) => w.id === walletId);
  if (!wallet) throw new Error("Wallet not found");

  wallet.balance += amount;
  wallet.last_topup_date = new Date().toISOString();
  wallet.last_topup_amount = amount;

  // Record an expense / portal top-up transaction in the daybook
  await createAccountTransaction({
    transaction_date: getTodayDateString(),
    type: "portal_topup",
    category: "Portal Wallet Topup",
    title: `${wallet.name} Top-up`,
    description: `Added ₹${amount} advance balance to ${wallet.name}`,
    amount: amount,
    govt_fee: amount,
    service_charge: 0,
    payment_method: paymentMethod,
    wallet_name: wallet.name,
    is_settled: true,
  });

  saveToStorage();

  try {
    await supabase.from("portal_wallets").update({
      balance: wallet.balance,
      last_topup_date: wallet.last_topup_date,
      last_topup_amount: wallet.last_topup_amount,
    }).eq("id", walletId);
  } catch {}

  return wallet;
}

// Deduct balance from a portal wallet (when a govt application is completed)
export async function deductPortalWallet(
  walletNameOrId: string,
  amount: number
): Promise<void> {
  const wallet = memoryWallets.find((w) => w.id === walletNameOrId || w.name === walletNameOrId);
  if (wallet) {
    wallet.balance = Math.max(0, wallet.balance - amount);
    saveToStorage();
    try {
      await supabase.from("portal_wallets").update({ balance: wallet.balance }).eq("id", wallet.id);
    } catch {}
  }
}

// Create a new bank/portal wallet account
export async function createPortalWallet(
  wallet: Omit<PortalWallet, "id">
): Promise<PortalWallet> {
  loadFromStorage();
  const newWallet: PortalWallet = {
    ...wallet,
    id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };
  memoryWallets.push(newWallet);
  saveToStorage();

  try {
    await supabase.from("portal_wallets").insert([newWallet]);
  } catch (err) {
    console.warn("Supabase insert portal_wallets warning:", err);
  }

  return newWallet;
}

// Update a bank/portal wallet account
export async function updatePortalWallet(
  id: string,
  updates: Partial<Omit<PortalWallet, "id">>
): Promise<PortalWallet> {
  loadFromStorage();
  const index = memoryWallets.findIndex((w) => w.id === id);
  if (index === -1) throw new Error("Wallet not found");

  memoryWallets[index] = {
    ...memoryWallets[index],
    ...updates,
  };
  saveToStorage();

  try {
    await supabase.from("portal_wallets").update(updates).eq("id", id);
  } catch (err) {
    console.warn("Supabase update portal_wallets warning:", err);
  }

  return memoryWallets[index];
}

// Delete a bank/portal wallet account
export async function deletePortalWallet(id: string): Promise<void> {
  loadFromStorage();
  memoryWallets = memoryWallets.filter((w) => w.id !== id);
  saveToStorage();

  try {
    await supabase.from("portal_wallets").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete portal_wallets warning:", err);
  }
}

// Daybook Summary Statistics
export type DaybookSummary = {
  date: string;
  totalIncome: number; // Total collected (Govt fees + Shop fees + Counter)
  totalExpense: number; // Total shop expenses
  totalGovtFees: number; // Money passed through to Govt
  realShopRevenue: number; // Shop processing + Counter Xerox (real gross income)
  netShopProfit: number; // Real Shop Revenue - Expenses
  cashInHand: number; // Cash received in drawer minus Cash expenses
  upiReceived: number; // Bank / UPI receipts
  creditDue: number; // Unsettled customer credit
  transactionCount: number;
};

export function calculateDaybookSummary(
  transactions: AccountTransaction[],
  targetDate: string = getTodayDateString()
): DaybookSummary {
  const dateTx = transactions.filter((t) => t.transaction_date === targetDate);

  let totalIncome = 0;
  let totalExpense = 0;
  let totalGovtFees = 0;
  let realShopRevenue = 0;
  let cashIn = 0;
  let cashOut = 0;
  let upiReceived = 0;
  let creditDue = 0;

  for (const tx of dateTx) {
    if (tx.type === "income") {
      if (tx.is_settled) {
        totalIncome += tx.amount;
        totalGovtFees += tx.govt_fee || 0;
        const shopCharge = tx.service_charge !== undefined && tx.service_charge !== null ? tx.service_charge : (tx.amount - (tx.govt_fee || 0));
        realShopRevenue += shopCharge;

        if (tx.payment_method === "Cash") {
          cashIn += tx.amount;
        } else if (tx.payment_method === "UPI" || tx.payment_method === "Bank Transfer") {
          upiReceived += tx.amount;
        }
      } else {
        // Customer Udhar / Credit
        creditDue += tx.amount;
      }
    } else if (tx.type === "expense") {
      totalExpense += tx.amount;
      if (tx.payment_method === "Cash") {
        cashOut += tx.amount;
      }
    }
  }

  const netShopProfit = realShopRevenue - totalExpense;
  const cashInHand = Math.max(0, cashIn - cashOut);

  return {
    date: targetDate,
    totalIncome,
    totalExpense,
    totalGovtFees,
    realShopRevenue,
    netShopProfit,
    cashInHand,
    upiReceived,
    creditDue,
    transactionCount: dateTx.length,
  };
}
