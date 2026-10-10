import { supabase } from "@/lib/supabase";

export type SubscriptionPlan = "trial" | "single" | "pro" | "multi" | "monthly" | "yearly";
export type SubscriptionStatus = "trial" | "active" | "expired" | "suspended";

export interface PlanDefinition {
  id: "single" | "pro" | "multi";
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyMonthlyEquiv: number;
  savingsText: string;
  isPopular?: boolean;
  features: string[];
}

export const DENBOOKS_PLANS: PlanDefinition[] = [
  {
    id: "single",
    name: "Single Counter",
    tagline: "Essential daybook & thermal POS for single-operator CSCs & Cyber Cafes.",
    monthlyPrice: 199,
    yearlyPrice: 1499,
    yearlyMonthlyEquiv: 125,
    savingsText: "Save 37%",
    features: [
      "1 Active Staff Counter Operator (Single Terminal)",
      "Single Counter POS & Daybook",
      "4 Portal Advance Wallets (CSC, e-District)",
      "58mm & 80mm Thermal Printer Slips",
      "Customer Khata (Credit) Tracker",
      "Pass-Through Govt Fee Isolation",
    ],
  },
  {
    id: "pro",
    name: "Pro Center Hub",
    tagline: "Full multi-staff power for busy Akshaya, CSC & Xerox centers.",
    monthlyPrice: 349,
    yearlyPrice: 2499,
    yearlyMonthlyEquiv: 208,
    savingsText: "Save 40% / Best Value",
    isPopular: true,
    features: [
      "Unlimited Staff Counter Logins (PIN secured)",
      "Shift Cash Drawer Handover Tally (EOD)",
      "Operator-wise Revenue Attribution & Shift Logs",
      "Unlimited Portal Wallets & Bank Accounts",
      "FCFS Queue Token & Call Screen",
      "1-Click WhatsApp Khata Reminders",
      "Excel & CSV Daybook Data Export",
      "Priority WhatsApp Help & Support",
    ],
  },
  {
    id: "multi",
    name: "Multi-Branch Network",
    tagline: "For entrepreneurs running multiple center locations or kiosks.",
    monthlyPrice: 699,
    yearlyPrice: 4999,
    yearlyMonthlyEquiv: 416,
    savingsText: "Save 40%",
    features: [
      "Up to 5 Center Locations Included",
      "Unlimited Staff Across All Locations",
      "Consolidated Owner Financial Dashboard",
      "Custom Center Branding & Receipts",
      "Dedicated Account Manager",
      "Branch-to-Branch Cash Transfer Tracking",
    ],
  },
];

export interface PlanLimits {
  maxStaff: number; // 1 for single/starter, Infinity for pro/multi/trial
  canMultiStaff: boolean;
  canShiftHandover: boolean;
  canExportExcel: boolean;
  canQueueTokens: boolean;
  planName: string;
}

export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  if (plan === "single") {
    return {
      maxStaff: 1,
      canMultiStaff: false,
      canShiftHandover: false,
      canExportExcel: false,
      canQueueTokens: false,
      planName: "Single Counter (Starter)",
    };
  }
  return {
    maxStaff: Infinity,
    canMultiStaff: true,
    canShiftHandover: true,
    canExportExcel: true,
    canQueueTokens: true,
    planName: plan === "multi" ? "Multi-Branch Network" : plan === "trial" ? "14-Day Free Pro Trial" : "Pro Center Hub",
  };
}

export interface PaymentSubmission {
  id: string;
  tenant_id: string;
  shop_name: string;
  owner_name: string;
  owner_phone: string;
  plan: SubscriptionPlan;
  amount: number;
  utr_number: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  billing_cycle?: "monthly" | "annual";
  created_at: string;
  approved_at?: string;
}

export interface TenantSubscription {
  id: string;
  shop_name: string;
  owner_name: string;
  owner_phone: string;
  owner_email?: string;
  state: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trial_ends_at: string; // ISO string
  subscription_expires_at: string; // ISO string
  is_locked: boolean;
  lock_reason?: string;
  last_payment_utr?: string;
  last_payment_date?: string;
  created_at: string;
}

export interface SuperAdminConfig {
  upi_id: string;
  payee_name: string;
  // Per-plan pricing rates
  starter_monthly_price: number;
  starter_yearly_price: number;
  pro_monthly_price: number;
  pro_yearly_price: number;
  multi_monthly_price: number;
  multi_yearly_price: number;
  // Legacy / fallback fields
  monthly_price: number;
  yearly_price: number;
  whatsapp_number: string;
  master_pin: string;
}

const DEFAULT_SUPER_CONFIG: SuperAdminConfig = {
  upi_id: "denbooks@upi",
  payee_name: "DenBooks 360",
  starter_monthly_price: 199,
  starter_yearly_price: 1499,
  pro_monthly_price: 349,
  pro_yearly_price: 2499,
  multi_monthly_price: 699,
  multi_yearly_price: 4999,
  monthly_price: 199,
  yearly_price: 1499,
  whatsapp_number: "",
  master_pin: "9999",
};

/**
 * Returns plan definitions with live prices merged from Super Admin config
 */
export function getPlanDefinitions(cfg?: SuperAdminConfig): PlanDefinition[] {
  const config = cfg || getSuperAdminConfig();
  const starterMo = config.starter_monthly_price || 199;
  const starterYr = config.starter_yearly_price || 1499;
  const proMo = config.pro_monthly_price || 349;
  const proYr = config.pro_yearly_price || 2499;
  const multiMo = config.multi_monthly_price || 699;
  const multiYr = config.multi_yearly_price || 4999;

  return [
    {
      ...DENBOOKS_PLANS[0],
      monthlyPrice: starterMo,
      yearlyPrice: starterYr,
      yearlyMonthlyEquiv: Math.round(starterYr / 12),
      savingsText: `Save ${Math.max(0, Math.round(((starterMo * 12 - starterYr) / (starterMo * 12)) * 100))}%`,
    },
    {
      ...DENBOOKS_PLANS[1],
      monthlyPrice: proMo,
      yearlyPrice: proYr,
      yearlyMonthlyEquiv: Math.round(proYr / 12),
      savingsText: `Save ${Math.max(0, Math.round(((proMo * 12 - proYr) / (proMo * 12)) * 100))}%`,
    },
    {
      ...DENBOOKS_PLANS[2],
      monthlyPrice: multiMo,
      yearlyPrice: multiYr,
      yearlyMonthlyEquiv: Math.round(multiYr / 12),
      savingsText: `Save ${Math.max(0, Math.round(((multiMo * 12 - multiYr) / (multiMo * 12)) * 100))}%`,
    },
  ];
}

const LOCAL_STORAGE_TENANT_KEY = "denbooks_current_tenant";
const LOCAL_STORAGE_SUB_KEY = "denbooks_subscription_state";
const LOCAL_STORAGE_SUBMISSIONS_KEY = "denbooks_payment_submissions";
const LOCAL_STORAGE_CONFIG_KEY = "denbooks_super_admin_config";
const LOCAL_STORAGE_ALL_TENANTS_KEY = "denbooks_all_tenants_registry";

/**
 * Get or initialize Super Admin config (UPI ID, rates, WhatsApp, PIN)
 */
export function getSuperAdminConfig(): SuperAdminConfig {
  if (typeof window === "undefined") return DEFAULT_SUPER_CONFIG;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
    if (raw) {
      return { ...DEFAULT_SUPER_CONFIG, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_SUPER_CONFIG;
}

export function saveSuperAdminConfig(cfg: Partial<SuperAdminConfig>): SuperAdminConfig {
  const current = getSuperAdminConfig();
  const updated = { ...current, ...cfg };
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(updated));
    try {
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("denbooks_config_updated", { detail: updated }));
    } catch {}
  }
  return updated;
}

/**
 * Calculates remaining days from now until given ISO date string.
 * Negative number indicates days past expired.
 */
export function getDaysRemaining(isoDateString?: string): number {
  if (!isoDateString) return 0;
  const targetDate = new Date(isoDateString);
  const now = new Date();

  // Normalize both dates to midnight (00:00:00) to calculate true calendar days
  const targetMidnight = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  ).getTime();

  const todayMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  return Math.round((targetMidnight - todayMidnight) / (1000 * 60 * 60 * 24));
}

/**
 * Generate UPI QR String / Intent URI
 */
export function generateUpiUri(params: {
  upiId: string;
  payeeName: string;
  amount: number;
  note: string;
}): string {
  const noteClean = encodeURIComponent(params.note || "DenBooks Subscription");
  const nameClean = encodeURIComponent(params.payeeName || "DenBooks 360");
  return `upi://pay?pa=${params.upiId}&pn=${nameClean}&am=${params.amount}&cu=INR&tn=${noteClean}`;
}

export function generateQrCodeImageUrl(upiUri: string, size = 260): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(upiUri)}`;
}

/**
 * Load current tenant subscription status, calculating expiration & locks
 */
export function getCurrentTenantSubscription(): TenantSubscription {
  const now = new Date();
  const defaultTrialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

  let tenantProfile: any = {};
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_TENANT_KEY);
      if (stored) tenantProfile = JSON.parse(stored);
    } catch {}
  }

  const tenantId = tenantProfile.id || `tenant_${Date.now()}`;
  const shopName = tenantProfile.name || "";
  const ownerName = tenantProfile.owner || "";
  const ownerPhone = tenantProfile.phone || "";
  const ownerEmail = tenantProfile.email || "";
  const state = tenantProfile.state || "";

  // Check saved subscription state
  let subState: TenantSubscription | null = null;
  if (typeof window !== "undefined") {
    try {
      const rawSub = localStorage.getItem(LOCAL_STORAGE_SUB_KEY);
      if (rawSub) subState = JSON.parse(rawSub);
    } catch {}
  }

  if (!subState) {
    // Initial 14-day trial
    subState = {
      id: tenantId,
      shop_name: shopName,
      owner_name: ownerName,
      owner_phone: ownerPhone,
      owner_email: ownerEmail,
      state: state,
      plan: "trial",
      status: "trial",
      trial_ends_at: defaultTrialEnd,
      subscription_expires_at: defaultTrialEnd,
      is_locked: false,
      created_at: new Date().toISOString(),
    };
    saveTenantSubscription(subState);
  } else {
    // Purge any legacy dummy values from previous runs
    if (subState.owner_phone === "9876543210") subState.owner_phone = "";
    if (subState.shop_name === "Apex Digital Seva Center") subState.shop_name = "";
    if (subState.owner_name === "CSC Operator") subState.owner_name = "";
    // Sync any name/phone updates
    if (shopName) subState.shop_name = shopName;
    if (ownerName) subState.owner_name = ownerName;
    if (ownerPhone) subState.owner_phone = ownerPhone;
  }

  // Evaluate dynamic expiration status
  const daysLeft = getDaysRemaining(subState.subscription_expires_at);
  if (subState.status !== "suspended") {
    if (daysLeft <= 0) {
      subState.status = "expired";
      subState.is_locked = true;
      subState.lock_reason = "14-day trial or subscription has expired. Please renew via UPI to unlock.";
    } else if (subState.plan === "trial") {
      subState.status = "trial";
    } else {
      subState.status = "active";
    }
  }

  return subState;
}

export function saveTenantSubscription(sub: TenantSubscription): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_SUB_KEY, JSON.stringify(sub));
    
    // Also sync to master registry of all tenants so Super Admin sees it
    const all = getAllTenantsLocal();
    const existingIdx = all.findIndex((t) => t.id === sub.id || t.shop_name === sub.shop_name);
    if (existingIdx >= 0) {
      all[existingIdx] = sub;
    } else {
      all.unshift(sub);
    }
    localStorage.setItem(LOCAL_STORAGE_ALL_TENANTS_KEY, JSON.stringify(all));

    try {
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("denbooks_tenant_updated", { detail: sub }));
    } catch {}

    // Try background sync with Supabase tenants table if exists
    Promise.resolve(
      supabase
        .from("tenants")
        .upsert({
          id: sub.id,
          shop_name: sub.shop_name,
          owner_name: sub.owner_name,
          owner_phone: sub.owner_phone,
          owner_email: sub.owner_email,
          plan: sub.plan,
          status: sub.status,
          trial_ends_at: sub.trial_ends_at,
          subscription_expires_at: sub.subscription_expires_at,
          is_locked: sub.is_locked,
          lock_reason: sub.lock_reason,
          last_payment_utr: sub.last_payment_utr,
          updated_at: new Date().toISOString(),
        })
    ).catch(() => {});
  } catch {}
}

/**
 * Submit UTR Payment Reference for manual approval
 */
export async function submitPaymentUTR(params: {
  plan: SubscriptionPlan;
  amount: number;
  utrNumber: string;
  notes?: string;
  billingCycle?: "monthly" | "annual";
}): Promise<PaymentSubmission> {
  const currentSub = getCurrentTenantSubscription();
  const submission: PaymentSubmission = {
    id: "pay_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    tenant_id: currentSub.id,
    shop_name: currentSub.shop_name,
    owner_name: currentSub.owner_name,
    owner_phone: currentSub.owner_phone,
    plan: params.plan,
    amount: params.amount,
    utr_number: params.utrNumber.trim(),
    status: "pending",
    notes: params.notes,
    billing_cycle: params.billingCycle || "annual",
    created_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
      const list: PaymentSubmission[] = stored ? JSON.parse(stored) : [];
      list.unshift(submission);
      localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(list));

      // Update tenant state with submitted UTR
      currentSub.last_payment_utr = params.utrNumber.trim();
      currentSub.last_payment_date = new Date().toISOString();
      saveTenantSubscription(currentSub);
    } catch (e) {
      console.warn("Error saving payment submission:", e);
    }
  }

  // Try saving to Supabase payment_submissions table
  try {
    await supabase.from("payment_submissions").insert({
      id: submission.id,
      tenant_id: submission.tenant_id,
      shop_name: submission.shop_name,
      owner_name: submission.owner_name,
      owner_phone: submission.owner_phone,
      plan: submission.plan,
      amount: submission.amount,
      utr_number: submission.utr_number,
      status: submission.status,
      notes: submission.notes,
      created_at: submission.created_at,
    });
  } catch {}

  return submission;
}

/**
 * Get all payment submissions (Super Admin)
 */
export async function getAllPaymentSubmissions(): Promise<PaymentSubmission[]> {
  let localList: PaymentSubmission[] = [];
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
      if (stored) localList = JSON.parse(stored);
    } catch {}
  }

  // Also query Supabase if available
  try {
    const { data, error } = await supabase
      .from("payment_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) {
      // Merge unique
      const mergedMap = new Map<string, PaymentSubmission>();
      localList.forEach((item) => mergedMap.set(item.id, item));
      data.forEach((item) => mergedMap.set(item.id, item as PaymentSubmission));
      return Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  } catch {}

  return localList;
}

/**
 * Super Admin: Approve Payment Submission and extend tenant's subscription
 */
export async function approvePaymentSubmission(
  submissionId: string,
  daysToAdd?: number
): Promise<{ success: boolean; tenant?: TenantSubscription }> {
  const submissions = await getAllPaymentSubmissions();
  const subIndex = submissions.findIndex((s) => s.id === submissionId);
  if (subIndex === -1) return { success: false };

  const targetSub = submissions[subIndex];
  targetSub.status = "approved";
  targetSub.approved_at = new Date().toISOString();

  // Determine days to add: monthly = 30 days, yearly = 365 days
  const addDays = daysToAdd ?? (targetSub.plan === "yearly" ? 365 : 30);

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(submissions));
  }

  // Update Supabase
  try {
    await supabase
      .from("payment_submissions")
      .update({ status: "approved", approved_at: targetSub.approved_at })
      .eq("id", submissionId);
  } catch {}

  // Extend tenant
  const updatedTenant = await extendTenantSubscription(targetSub.tenant_id, addDays, targetSub.plan);
  return { success: true, tenant: updatedTenant };
}

/**
 * Super Admin: Reject Payment Submission
 */
export async function rejectPaymentSubmission(submissionId: string, reason?: string): Promise<boolean> {
  const submissions = await getAllPaymentSubmissions();
  const subIndex = submissions.findIndex((s) => s.id === submissionId);
  if (subIndex === -1) return false;

  submissions[subIndex].status = "rejected";
  if (reason) submissions[subIndex].notes = `Rejected: ${reason}`;

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(submissions));
  }

  try {
    await supabase
      .from("payment_submissions")
      .update({ status: "rejected", notes: submissions[subIndex].notes })
      .eq("id", submissionId);
  } catch {}

  return true;
}

/**
 * Super Admin: List all tenants without dummy sample data
 */
export function purgeAllSampleTenants(): TenantSubscription[] {
  if (typeof window === "undefined") return [];
  const SAMPLE_IDS = new Set(["ten_kerala_01", "ten_up_02", "ten_tn_03", "ten_bihar_04"]);
  const SAMPLE_NAMES = new Set([
    "Malabar Akshaya e-Kendra",
    "Jan Seva Kendra Lucknow",
    "Madurai e-Sevai Maiyam",
    "Vasudha Kendra Patna",
    "Apex Digital Seva Center",
    "Apex Digital Seva Kendra",
  ]);

  let cleanList: TenantSubscription[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ALL_TENANTS_KEY);
    if (raw) {
      const parsed: TenantSubscription[] = JSON.parse(raw);
      cleanList = parsed.filter(
        (t) =>
          !SAMPLE_IDS.has(t.id) &&
          !SAMPLE_NAMES.has(t.shop_name) &&
          t.shop_name &&
          t.shop_name.trim().length > 0 &&
          t.owner_phone !== "9876543210"
      );
    }
  } catch {}

  // Check if current session tenant is a real registered center
  const current = getCurrentTenantSubscription();
  if (
    current &&
    current.shop_name &&
    !SAMPLE_NAMES.has(current.shop_name) &&
    current.owner_phone !== "9876543210"
  ) {
    if (!cleanList.some((t) => t.id === current.id || t.shop_name === current.shop_name)) {
      cleanList.unshift(current);
    }
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_ALL_TENANTS_KEY, JSON.stringify(cleanList));
    window.dispatchEvent(new Event("storage"));
  } catch {}

  return cleanList;
}

export function getAllTenantsLocal(): TenantSubscription[] {
  return purgeAllSampleTenants();
}

export async function deleteTenantSubscription(tenantId: string): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_ALL_TENANTS_KEY);
      if (raw) {
        const all: TenantSubscription[] = JSON.parse(raw);
        const filtered = all.filter((t) => t.id !== tenantId);
        localStorage.setItem(LOCAL_STORAGE_ALL_TENANTS_KEY, JSON.stringify(filtered));
        window.dispatchEvent(new Event("storage"));
      }
    } catch {}
  }

  try {
    await supabase.from("tenants").delete().eq("id", tenantId);
  } catch {}

  return true;
}

export async function getAllTenantsSubscription(): Promise<TenantSubscription[]> {
  const localList = purgeAllSampleTenants();

  try {
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) {
      const SAMPLE_IDS = new Set(["ten_kerala_01", "ten_up_02", "ten_tn_03", "ten_bihar_04"]);
      const SAMPLE_NAMES = new Set([
        "Malabar Akshaya e-Kendra",
        "Jan Seva Kendra Lucknow",
        "Madurai e-Sevai Maiyam",
        "Vasudha Kendra Patna",
        "Apex Digital Seva Center",
        "Apex Digital Seva Kendra",
      ]);
      const validRemote = (data as TenantSubscription[]).filter(
        (t) =>
          !SAMPLE_IDS.has(t.id) &&
          !SAMPLE_NAMES.has(t.shop_name) &&
          t.shop_name &&
          t.shop_name.trim().length > 0 &&
          t.owner_phone !== "9876543210"
      );
      const mergedMap = new Map<string, TenantSubscription>();
      localList.forEach((t) => mergedMap.set(t.id, t));
      validRemote.forEach((t) => mergedMap.set(t.id, t));
      return Array.from(mergedMap.values());
    }
  } catch {}

  return localList;
}

/**
 * Super Admin: Extend Tenant Subscription by X days
 */
export async function extendTenantSubscription(
  tenantId: string,
  days: number,
  newPlan?: SubscriptionPlan
): Promise<TenantSubscription> {
  const tenants = await getAllTenantsSubscription();
  let target = tenants.find((t) => t.id === tenantId);
  const currentSub = getCurrentTenantSubscription();

  // If extending current local tenant
  if (!target && currentSub.id === tenantId) {
    target = currentSub;
  }

  if (!target) {
    target = tenants[0] || currentSub;
  }

  const currentExpiry = new Date(target.subscription_expires_at).getTime();
  const now = new Date().getTime();
  // If already expired, extend from today; otherwise extend from existing expiry date
  const baseTime = currentExpiry > now ? currentExpiry : now;
  const newExpiry = new Date(baseTime + days * 24 * 60 * 60 * 1000).toISOString();

  target.subscription_expires_at = newExpiry;
  target.status = "active";
  target.is_locked = false;
  target.lock_reason = undefined;
  if (newPlan) target.plan = newPlan;

  // Save in all lists
  if (typeof window !== "undefined") {
    const all = getAllTenantsLocal();
    const idx = all.findIndex((t) => t.id === target!.id);
    if (idx >= 0) all[idx] = target;
    else all.unshift(target);
    localStorage.setItem(LOCAL_STORAGE_ALL_TENANTS_KEY, JSON.stringify(all));

    // If current tenant was modified, also update active session
    if (currentSub.id === target.id || currentSub.shop_name === target.shop_name) {
      localStorage.setItem(LOCAL_STORAGE_SUB_KEY, JSON.stringify(target));
    }
  }

  try {
    await supabase.from("tenants").upsert({
      id: target.id,
      shop_name: target.shop_name,
      plan: target.plan,
      status: target.status,
      subscription_expires_at: target.subscription_expires_at,
      is_locked: false,
      lock_reason: null,
      updated_at: new Date().toISOString(),
    });
  } catch {}

  return target;
}

/**
 * Super Admin: Toggle Centre Lock / Suspend
 */
export async function toggleTenantLock(
  tenantId: string,
  lock: boolean,
  reason?: string
): Promise<TenantSubscription> {
  const tenants = await getAllTenantsSubscription();
  let target = tenants.find((t) => t.id === tenantId);
  const currentSub = getCurrentTenantSubscription();

  if (!target && currentSub.id === tenantId) {
    target = currentSub;
  }
  if (!target) {
    target = tenants[0] || currentSub;
  }

  target.is_locked = lock;
  target.status = lock ? "suspended" : getDaysRemaining(target.subscription_expires_at) > 0 ? "active" : "expired";
  target.lock_reason = lock ? reason || "Center temporarily suspended by Super Admin." : undefined;

  if (typeof window !== "undefined") {
    const all = getAllTenantsLocal();
    const idx = all.findIndex((t) => t.id === target!.id);
    if (idx >= 0) all[idx] = target;
    localStorage.setItem(LOCAL_STORAGE_ALL_TENANTS_KEY, JSON.stringify(all));

    if (currentSub.id === target.id || currentSub.shop_name === target.shop_name) {
      localStorage.setItem(LOCAL_STORAGE_SUB_KEY, JSON.stringify(target));
    }
  }

  try {
    await supabase.from("tenants").update({
      is_locked: target.is_locked,
      status: target.status,
      lock_reason: target.lock_reason,
    }).eq("id", target.id);
  } catch {}

  return target;
}
