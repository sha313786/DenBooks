import { supabase } from "@/lib/supabase";

export type RequestStatus =
  | "Pending"
  | "Processing"
  | "Completed"
  | "Rejected";

export type CreateRequestInput = {
  fullName: string;
  phone: string;
  email?: string;
  service: string;
  contactMethod:
    | "WhatsApp"
    | "Phone"
    | "Email";
  description: string;
};

function normalizePhone(
  phone: string
): string {
  return phone
    .replace(/\D/g, "")
    .replace(/^91/, "")
    .slice(-10);
}

function validateInput(
  data: CreateRequestInput
): {
  phone: string;
  fullName: string;
  email: string | null;
  service: string;
  description: string;
} {
  const fullName =
    data.fullName.trim();

  const phone =
    normalizePhone(data.phone);

  const email =
    data.email?.trim() || null;

  const service =
    data.service.trim();

  const description =
    data.description.trim();

  if (!fullName) {
    throw new Error(
      "Full name is required."
    );
  }

  if (
    !/^[6-9]\d{9}$/.test(phone)
  ) {
    throw new Error(
      "Please enter a valid Indian mobile number."
    );
  }

  if (!service) {
    throw new Error(
      "Please select a service."
    );
  }

  if (!description) {
    throw new Error(
      "Please describe your requirement."
    );
  }

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    )
  ) {
    throw new Error(
      "Please enter a valid email address."
    );
  }

  return {
    phone,
    fullName,
    email,
    service,
    description,
  };
}

export async function createServiceRequest(
  data: CreateRequestInput
) {
  const validated =
    validateInput(data);

  try {
    const {
      data: result,
      error,
    } = await supabase.rpc(
      "create_service_request",
      {
        p_full_name:
          validated.fullName,
        p_phone:
          validated.phone,
        p_email:
          validated.email,
        p_service:
          validated.service,
        p_contact_method:
          data.contactMethod,
        p_description:
          validated.description,
      }
    );

    if (!error && result && Array.isArray(result) && result.length > 0) {
      const request = result[0];
      return {
        request_id: request.request_id,
        customer_id: request.customer_id,
        service: validated.service,
        contact_method: data.contactMethod,
        description: validated.description,
        status: (request.status || "Pending") as RequestStatus,
      };
    }

    if (error && error.code !== "PGRST202" && !error.message?.includes("Could not find the function")) {
      console.error("RPC error, attempting direct insert fallback:", error);
    }
  } catch (rpcErr) {
    console.warn("RPC failed, falling back to direct table inserts:", rpcErr);
  }

  // Direct table fallback
  // 1. Look up or create customer
  let customerId: string | null = null;

  const { data: existingCust } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", validated.phone)
    .maybeSingle();

  if (existingCust?.id) {
    customerId = existingCust.id;
    // Update name/email if provided
    await supabase
      .from("customers")
      .update({
        full_name: validated.fullName,
        ...(validated.email ? { email: validated.email } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId);
  } else {
    const { data: newCust, error: custErr } = await supabase
      .from("customers")
      .insert({
        full_name: validated.fullName,
        phone: validated.phone,
        email: validated.email,
      })
      .select("id")
      .single();

    if (custErr || !newCust) {
      console.error("Direct customer insert failed:", custErr);
      throw new Error(custErr?.message || "Failed to create customer record.");
    }
    customerId = newCust.id;
  }

  // 2. Generate unique Request ID (DD360-YYYYMMDD-XXXX)
  const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const requestId = `DD360-${datePrefix}-${randomSuffix}`;

  // 3. Insert service request
  const { data: newReq, error: reqErr } = await supabase
    .from("service_requests")
    .insert({
      request_id: requestId,
      customer_id: customerId,
      service: validated.service,
      contact_method: data.contactMethod,
      description: validated.description,
      status: "Pending",
    })
    .select()
    .single();

  if (reqErr) {
    console.error("Direct service request insert failed:", reqErr);
    throw new Error(reqErr.message || "Failed to submit service request.");
  }

  return {
    request_id: newReq?.request_id || requestId,
    customer_id: customerId,
    service: validated.service,
    contact_method: data.contactMethod,
    description: validated.description,
    status: "Pending" as RequestStatus,
  };
}