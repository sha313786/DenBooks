import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, orderId, utrNumber, amountClaimed, payeeVpa, screenshotUrl } = body;

    if (!tenantId || !utrNumber) {
      return NextResponse.json(
        { success: false, message: "Tenant ID and 12-digit UTR number are required." },
        { status: 400 }
      );
    }

    // 1. Strict UTR format check (Standard Indian Bank 12-digit numeric reference)
    const utrClean = String(utrNumber).trim();
    const utrRegex = /^\d{12}$/;
    if (!utrRegex.test(utrClean)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid UTR format. A standard bank UPI reference number must be exactly 12 numeric digits.",
        },
        { status: 400 }
      );
    }

    // 2. Check if UTR was already submitted by ANY user (Deduplication Check)
    const { data: existingUtr, error: checkError } = await supabase
      .from("upi_verifications")
      .select("id, verification_status, submitted_at")
      .eq("utr_number", utrClean)
      .maybeSingle();

    if (existingUtr) {
      return NextResponse.json(
        {
          success: false,
          message: `This UTR (${utrClean}) has already been submitted on ${new Date(
            existingUtr.submitted_at
          ).toLocaleDateString()}. Duplicate submissions are flagged.`,
        },
        { status: 409 }
      );
    }

    // 3. Insert into upi_verifications table with grace_access_granted = true
    const { data: insertedRecord, error: insertError } = await supabase
      .from("upi_verifications")
      .insert({
        order_id: orderId || null,
        tenant_id: tenantId,
        utr_number: utrClean,
        amount_claimed: Number(amountClaimed) || 0,
        payee_vpa: payeeVpa || "srbtrollersyt@ybl",
        screenshot_url: screenshotUrl || null,
        grace_access_granted: true,
        verification_status: "PENDING_REVIEW",
      })
      .select("id, submitted_at")
      .single();

    if (insertError) {
      if (insertError.code === "23505" || insertError.message?.includes("unique_utr_submission")) {
        return NextResponse.json(
          {
            success: false,
            message: "This UTR number has already been submitted. Duplicate submissions are not permitted.",
          },
          { status: 409 }
        );
      }
      throw insertError;
    }

    // 4. Grant temporary 24-Hour Grace Access so legitimate users aren't blocked
    const graceExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("tenants")
      .update({
        subscription_status: "GRACE_PERIOD",
        subscription_expires_at: graceExpiry,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tenantId);

    return NextResponse.json({
      success: true,
      message: "UTR submitted successfully. Temporary 24-hour access granted while payment is verified.",
      verificationId: insertedRecord?.id,
    });
  } catch (err: any) {
    console.error("UTR Submission API Error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Internal server error processing payment proof." },
      { status: 500 }
    );
  }
}
