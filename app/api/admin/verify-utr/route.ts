import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { verificationId, action, adminPin, notes } = body; // action: 'APPROVE' or 'REJECT'

    // 1. Authenticate Master Admin
    const masterAdminPin = process.env.MASTER_ADMIN_PIN || "9999";
    if (String(adminPin).trim() !== masterAdminPin.trim()) {
      return NextResponse.json(
        { success: false, message: "Unauthorized master passcode." },
        { status: 403 }
      );
    }

    if (!verificationId || !action) {
      return NextResponse.json(
        { success: false, message: "Verification ID and action ('APPROVE' or 'REJECT') are required." },
        { status: 400 }
      );
    }

    // 2. Fetch submission & order details
    const { data: verification, error: fetchErr } = await supabase
      .from("upi_verifications")
      .select(`
        id,
        tenant_id,
        order_id,
        utr_number,
        amount_claimed,
        verification_status,
        subscription_orders (
          id,
          tier,
          billing_cycle
        )
      `)
      .eq("id", verificationId)
      .maybeSingle();

    if (fetchErr || !verification) {
      return NextResponse.json(
        { success: false, message: "Submission not found in verification registry." },
        { status: 404 }
      );
    }

    const tenantId = verification.tenant_id;
    const orderData: any = Array.isArray(verification.subscription_orders)
      ? verification.subscription_orders[0]
      : verification.subscription_orders;

    const billingCycle = orderData?.billing_cycle || "monthly";
    const tier = orderData?.tier || "pro";

    if (action === "APPROVE") {
      const now = new Date();
      const addDays = billingCycle.toLowerCase() === "annual" ? 365 : 30;

      // Fetch current tenant to calculate expiration extension
      const { data: tenant } = await supabase
        .from("tenants")
        .select("subscription_expires_at")
        .eq("id", tenantId)
        .maybeSingle();

      const currentExpiry = tenant?.subscription_expires_at
        ? new Date(tenant.subscription_expires_at)
        : now;
      const baseDate = currentExpiry > now ? currentExpiry : now;
      const newExpiry = new Date(baseDate.getTime() + addDays * 24 * 60 * 60 * 1000).toISOString();

      // Mark verification record approved
      await supabase
        .from("upi_verifications")
        .update({
          verification_status: "APPROVED",
          verified_at: now.toISOString(),
          verified_by: "ADMIN",
          admin_notes: notes || "Verified with bank statement credit",
        })
        .eq("id", verificationId);

      // Mark order as paid if order_id exists
      if (verification.order_id) {
        await supabase
          .from("subscription_orders")
          .update({ order_status: "PAID" })
          .eq("id", verification.order_id);
      }

      // Activate full subscription for tenant
      await supabase
        .from("tenants")
        .update({
          subscription_tier: tier,
          subscription_status: "ACTIVE",
          subscription_expires_at: newExpiry,
          updated_at: now.toISOString(),
        })
        .eq("id", tenantId);

      return NextResponse.json({
        success: true,
        message: `Subscription successfully activated! Added ${addDays} days until ${new Date(
          newExpiry
        ).toLocaleDateString()}.`,
      });
    } else if (action === "REJECT") {
      const now = new Date().toISOString();

      // Mark verification rejected and revoke grace period
      await supabase
        .from("upi_verifications")
        .update({
          verification_status: "REJECTED",
          verified_at: now,
          verified_by: "ADMIN",
          admin_notes: notes || "Invalid / Unmatched UTR reference in bank statement",
        })
        .eq("id", verificationId);

      await supabase
        .from("tenants")
        .update({
          subscription_status: "EXPIRED",
          subscription_expires_at: now,
          updated_at: now,
        })
        .eq("id", tenantId);

      return NextResponse.json({
        success: true,
        message: "UTR marked rejected and temporary grace access revoked.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action. Must be 'APPROVE' or 'REJECT'." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Admin Verify UTR API Error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Server error processing verification." },
      { status: 500 }
    );
  }
}
