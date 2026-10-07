-- ==============================================================================
-- DenBooks Multi-Tenant SaaS Database Schema
-- Multi-shop architecture with Row Level Security (RLS) & Subscription Tracking
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. BUSINESSES / SHOPS (TENANTS) TABLE
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    state TEXT DEFAULT 'Kerala',
    currency TEXT NOT NULL DEFAULT 'INR',
    currency_symbol TEXT NOT NULL DEFAULT '₹',
    logo_url TEXT,
    subscription_plan TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_plan IN ('trial', 'starter', 'pro', 'enterprise')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'expired')),
    trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '14 days'),
    subscription_renews_at TIMESTAMPTZ,
    razorpay_customer_id TEXT,
    razorpay_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. TENANT USERS / MEMBERSHIP (Links auth.users to tenants)
CREATE TABLE IF NOT EXISTS public.tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'cashier', 'operator')),
    full_name TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (tenant_id, user_id)
);

-- 3. PORTAL WALLETS TABLE (Per-Tenant)
CREATE TABLE IF NOT EXISTS public.portal_wallets (
    id TEXT NOT NULL,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Govt Portal', 'Utility', 'Banking / AEPS', 'Banking', 'Other')),
    balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    min_alert_balance NUMERIC(12,2) NOT NULL DEFAULT 500,
    last_topup_date TIMESTAMPTZ,
    last_topup_amount NUMERIC(12,2),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (id, tenant_id)
);

-- 4. ACCOUNT TRANSACTIONS / DAYBOOK (Per-Tenant)
CREATE TABLE IF NOT EXISTS public.account_transactions (
    id TEXT NOT NULL,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'portal_topup')),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(12,2) NOT NULL,
    govt_fee NUMERIC(12,2) DEFAULT 0,
    service_charge NUMERIC(12,2) DEFAULT 0,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'UPI', 'Bank Transfer')),
    reference_id TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    is_settled BOOLEAN NOT NULL DEFAULT true,
    wallet_name TEXT,
    employee_id TEXT,
    employee_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (id, tenant_id)
);

-- 5. COUNTER PRODUCTS CATALOG (Per-Tenant)
CREATE TABLE IF NOT EXISTS public.counter_products (
    id TEXT NOT NULL,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rate NUMERIC(10,2) NOT NULL,
    unit TEXT NOT NULL DEFAULT 'unit',
    category TEXT NOT NULL CHECK (category IN ('print', 'photo', 'card', 'service')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (id, tenant_id)
);

-- 6. SERVICE CHARGES MASTER (Per-Tenant)
CREATE TABLE IF NOT EXISTS public.service_charges (
    id TEXT NOT NULL,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    default_charge NUMERIC(10,2) NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (id, tenant_id)
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON public.tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON public.tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_date ON public.account_transactions(tenant_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_wallets_tenant ON public.portal_wallets(tenant_id);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counter_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_charges ENABLE ROW LEVEL SECURITY;

-- Helper function: Get tenant_id for the current authenticated user
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id FROM public.tenant_users
    WHERE user_id = auth.uid() AND is_active = true
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- TENANTS POLICIES
CREATE POLICY "Users can view their own tenant"
    ON public.tenants FOR SELECT
    TO authenticated
    USING (id = public.get_auth_tenant_id());

CREATE POLICY "Owners can update their tenant"
    ON public.tenants FOR UPDATE
    TO authenticated
    USING (id = public.get_auth_tenant_id())
    WITH CHECK (id = public.get_auth_tenant_id());

-- TRANSACTIONS POLICIES
CREATE POLICY "Users can view tenant transactions"
    ON public.account_transactions FOR SELECT
    TO authenticated
    USING (tenant_id = public.get_auth_tenant_id());

CREATE POLICY "Users can insert tenant transactions"
    ON public.account_transactions FOR INSERT
    TO authenticated
    WITH CHECK (tenant_id = public.get_auth_tenant_id());

CREATE POLICY "Users can update tenant transactions"
    ON public.account_transactions FOR UPDATE
    TO authenticated
    USING (tenant_id = public.get_auth_tenant_id())
    WITH CHECK (tenant_id = public.get_auth_tenant_id());

CREATE POLICY "Users can delete tenant transactions"
    ON public.account_transactions FOR DELETE
    TO authenticated
    USING (tenant_id = public.get_auth_tenant_id());

-- WALLETS POLICIES
CREATE POLICY "Users can view tenant wallets"
    ON public.portal_wallets FOR SELECT
    TO authenticated
    USING (tenant_id = public.get_auth_tenant_id());

CREATE POLICY "Users can manage tenant wallets"
    ON public.portal_wallets FOR ALL
    TO authenticated
    USING (tenant_id = public.get_auth_tenant_id())
    WITH CHECK (tenant_id = public.get_auth_tenant_id());

-- PRODUCTS POLICIES
CREATE POLICY "Users can view tenant products"
    ON public.counter_products FOR ALL
    TO authenticated
    USING (tenant_id = public.get_auth_tenant_id())
    WITH CHECK (tenant_id = public.get_auth_tenant_id());

-- SERVICE CHARGES POLICIES
CREATE POLICY "Users can view tenant service charges"
    ON public.service_charges FOR ALL
    TO authenticated
    USING (tenant_id = public.get_auth_tenant_id())
    WITH CHECK (tenant_id = public.get_auth_tenant_id());
