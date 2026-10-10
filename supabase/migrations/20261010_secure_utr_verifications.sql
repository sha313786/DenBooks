-- ==============================================================================
-- DenBooks 360: Secure UTR Verification, Orders & Grace Pass Migration
-- Implements UTR Deduplication (UNIQUE), 24-Hour Grace Pass, and Row-Level Security
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Ensure `tenants` table has required subscription columns & grace period support
ALTER TABLE IF EXISTS public.tenants
    ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'single',
    ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(30) DEFAULT 'TRIAL_ACTIVE',
    ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days');

-- 2. Subscription Orders / Invoices Table
CREATE TABLE IF NOT EXISTS public.subscription_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    tier VARCHAR(50) NOT NULL, -- 'single', 'pro', 'multi'
    billing_cycle VARCHAR(20) NOT NULL, -- 'monthly', 'annual'
    amount_inr NUMERIC(10, 2) NOT NULL,
    order_status VARCHAR(30) DEFAULT 'PENDING' CHECK (order_status IN ('PENDING', 'PAID', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. UPI Verifications Table with Strict Deduplication (UNIQUE utr_number)
CREATE TABLE IF NOT EXISTS public.upi_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.subscription_orders(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    utr_number VARCHAR(12) NOT NULL,
    amount_claimed NUMERIC(10, 2) NOT NULL,
    payee_vpa VARCHAR(100) NOT NULL,
    screenshot_url TEXT,
    verification_status VARCHAR(30) DEFAULT 'PENDING_REVIEW' CHECK (verification_status IN ('PENDING_REVIEW', 'APPROVED', 'REJECTED')),
    admin_notes TEXT,
    verified_by VARCHAR(50),
    grace_access_granted BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    verified_at TIMESTAMPTZ,

    -- Hard constraint: Prevents duplicate submissions across the entire system
    CONSTRAINT unique_utr_submission UNIQUE (utr_number)
);

-- 4. High-Performance Query Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_status ON public.tenants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_utr_lookup ON public.upi_verifications(utr_number);
CREATE INDEX IF NOT EXISTS idx_verification_pending ON public.upi_verifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON public.subscription_orders(tenant_id);

-- 5. Enable Row-Level Security (RLS)
ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upi_verifications ENABLE ROW LEVEL SECURITY;

-- 6. Row-Level Security Policies (Multi-Tenant Isolation)
-- Tenants can view their own orders
CREATE POLICY "Tenants can view own subscription orders"
    ON public.subscription_orders FOR SELECT
    TO authenticated
    USING (tenant_id = public.get_auth_tenant_id());

-- Tenants can insert their own orders
CREATE POLICY "Tenants can create own subscription orders"
    ON public.subscription_orders FOR INSERT
    TO authenticated
    WITH CHECK (tenant_id = public.get_auth_tenant_id());

-- Tenants can view their own UTR verifications
CREATE POLICY "Tenants can view own upi verifications"
    ON public.upi_verifications FOR SELECT
    TO authenticated
    USING (tenant_id = public.get_auth_tenant_id());

-- Tenants can submit UTR verifications for their tenant
CREATE POLICY "Tenants can submit upi verifications"
    ON public.upi_verifications FOR INSERT
    TO authenticated
    WITH CHECK (tenant_id = public.get_auth_tenant_id());

-- Super Admin / Service Role has full access (managed via Supabase service role key)
