import { supabase } from "@/lib/supabase";

export type SubscriptionPlan = "trial" | "monthly" | "yearly";
export type SubscriptionStatus = "trial" | "active" | "expired" | "suspended";

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
  monthly_price: number;
  yearly_price: number;
  whatsapp_number: string;
  master_pin: string;
}

const DEFAULT_SUPER_CONFIG: SuperAdminConfig = {
  upi_id: "denbooks@upi",
  payee_name: "DenBooks 360",
  monthly_price: 499,
  yearly_price: 3999,
  whatsapp_number: "+919876543210",
  master_pin: "9999",
};

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
  const target = new Date(isoDateString).getTime();
  const now = new Date().getTime();
  const diffMs = target - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
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

  const tenantId = tenantProfile.id || "tenant_default_csc";
  const shopName = tenantProfile.name || "Apex Digital Seva Center";
  const ownerName = tenantProfile.owner || "CSC Operator";
  const ownerPhone = tenantProfile.phone || "9876543210";
  const ownerEmail = tenantProfile.email || "csc@digitalindia.gov";
  const state = tenantProfile.state || "Kerala";

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
    // Sync any name/phone updates
    subState.shop_name = shopName;
    subState.owner_name = ownerName;
    subState.owner_phone = ownerPhone;
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
 * Super Admin: List all tenants
 */
function getAllTenantsLocal(): TenantSubscription[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ALL_TENANTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  // If empty, seed with current tenant + initial sample tenants for demo
  const current = getCurrentTenantSubscription();
  const initialList: TenantSubscription[] = [
    current,
    {
      id: "ten_kerala_01",
      shop_name: "Malabar Akshaya e-Kendra",
      owner_name: "Muhammed Rashid",
      owner_phone: "9447123456",
      owner_email: "rashid.akshaya@kerala.gov.in",
      state: "Kerala",
      plan: "monthly",
      status: "active",
      trial_ends_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      subscription_expires_at: new Date(Date.now() + 22 * 24 * 3600 * 1000).toISOString(),
      is_locked: false,
      last_payment_utr: "428919028391",
      last_payment_date: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
      created_at: new Date(Date.now() - 38 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "ten_up_02",
      shop_name: "Jan Seva Kendra Lucknow",
      owner_name: "Alok Kumar Verma",
      owner_phone: "9839012345",
      owner_email: "alok.janseva@gmail.com",
      state: "Uttar Pradesh",
      plan: "trial",
      status: "trial",
      trial_ends_at: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
      subscription_expires_at: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
      is_locked: false,
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "ten_tn_03",
      shop_name: "Madurai e-Sevai Maiyam",
      owner_name: "S. Murugan",
      owner_phone: "9842109876",
      owner_email: "murugan.esevai@tn.gov.in",
      state: "Tamil Nadu",
      plan: "yearly",
      status: "active",
      trial_ends_at: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
      subscription_expires_at: new Date(Date.now() + 275 * 24 * 3600 * 1000).toISOString(),
      is_locked: false,
      last_payment_utr: "510984920194",
      last_payment_date: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
      created_at: new Date(Date.now() - 95 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "ten_bihar_04",
      shop_name: "Vasudha Kendra Patna",
      owner_name: "Rajnish Pandey",
      owner_phone: "9431055443",
      owner_email: "rajnish.bihar@csc.gov.in",
      state: "Bihar",
      plan: "trial",
      status: "expired",
      trial_ends_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      subscription_expires_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      is_locked: true,
      lock_reason: "14-day trial expired. Center locked until renewal.",
      created_at: new Date(Date.now() - 16 * 24 * 3600 * 1000).toISOString(),
    },
  ];

  localStorage.setItem(LOCAL_STORAGE_ALL_TENANTS_KEY, JSON.stringify(initialList));
  return initialList;
}

export async function getAllTenantsSubscription(): Promise<TenantSubscription[]> {
  const localList = getAllTenantsLocal();

  try {
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) {
      const mergedMap = new Map<string, TenantSubscription>();
      localList.forEach((t) => mergedMap.set(t.id, t));
      data.forEach((t) => mergedMap.set(t.id, t as TenantSubscription));
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
