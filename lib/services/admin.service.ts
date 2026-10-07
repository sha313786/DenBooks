import { supabase } from "@/lib/supabase";

export type RequestStatus =
  | "Pending"
  | "Processing"
  | "Completed"
  | "Rejected";

export type PaymentStatus = "Paid" | "Unpaid";

export type AdminCustomer = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  created_at: string;
};

export type AdminRequest = {
  id: string;
  request_id: string;
  customer_id: string;
  service: string;
  contact_method:
    | "WhatsApp"
    | "Phone"
    | "Email";
  description: string;
  status: RequestStatus;
  amount?: number | null; // Total amount = govt_fee + service_charge
  govt_fee?: number | null; // Govt / Official department / portal fee (e.g. Passport, Land Tax)
  service_charge?: number | null; // Digital Den shop processing / service charge
  payment_status?: PaymentStatus | null;
  created_at: string;
  updated_at: string;
  customers:
    | AdminCustomer
    | null;
  employee_id?: string | null;
  employee_name?: string | null;
};

export type RequestFilters = {
  search?: string;
  status?:
    | RequestStatus
    | "All";
  service?: string | "All";
  employeeId?: string;
};

type SupabaseRequest =
  Omit<
    AdminRequest,
    "customers"
  > & {
    customers:
      | AdminCustomer
      | AdminCustomer[]
      | null;
  };

const requestSelectBasic = `
  id,
  request_id,
  customer_id,
  service,
  contact_method,
  description,
  status,
  created_at,
  updated_at,
  customers (
    id,
    full_name,
    phone,
    email,
    created_at
  )
`;

const requestSelectWithOnlyAmount = `
  id,
  request_id,
  customer_id,
  service,
  contact_method,
  description,
  status,
  amount,
  payment_status,
  created_at,
  updated_at,
  customers (
    id,
    full_name,
    phone,
    email,
    created_at
  )
`;

const requestSelectWithFullBilling = `
  id,
  request_id,
  customer_id,
  service,
  contact_method,
  description,
  status,
  amount,
  govt_fee,
  service_charge,
  payment_status,
  created_at,
  updated_at,
  customers (
    id,
    full_name,
    phone,
    email,
    created_at
  )
`;

async function fetchServiceRequests(
  buildQuery: (selectCols: string) => any
) {
  let { data, error } = await buildQuery(requestSelectWithFullBilling);
  if (
    error &&
    (error.message?.includes("govt_fee") ||
      error.message?.includes("service_charge") ||
      error.code === "PGRST204" ||
      error.code === "42703")
  ) {
    const attemptWithAmount = await buildQuery(requestSelectWithOnlyAmount);
    data = attemptWithAmount.data;
    error = attemptWithAmount.error;
  }

  if (
    error &&
    (error.message?.includes("amount") ||
      error.message?.includes("payment_status") ||
      error.code === "PGRST204" ||
      error.code === "42703")
  ) {
    const fallback = await buildQuery(requestSelectBasic);
    data = fallback.data;
    error = fallback.error;
  }
  return { data, error };
}

// No in-memory mock data in production — Supabase is the only source of truth
export let mockAdminRequests: AdminRequest[] = [];


function normalizeRequest(
  request: SupabaseRequest
): AdminRequest {
  const customer =
    Array.isArray(
      request.customers
    )
      ? request.customers[0] ??
        null
      : request.customers;

  const raw = request as any;

  const govtFee =
    typeof raw.govt_fee === "number"
      ? raw.govt_fee
      : raw.govt_fee
      ? Number(raw.govt_fee)
      : null;

  const serviceCharge =
    typeof raw.service_charge === "number"
      ? raw.service_charge
      : raw.service_charge
      ? Number(raw.service_charge)
      : null;

  let totalAmount =
    typeof raw.amount === "number"
      ? raw.amount
      : raw.amount
      ? Number(raw.amount)
      : null;

  if (totalAmount === null && (govtFee !== null || serviceCharge !== null)) {
    totalAmount = (govtFee || 0) + (serviceCharge || 0);
  }

  return {
    id: request.id,
    request_id:
      request.request_id,
    customer_id:
      request.customer_id,
    service:
      request.service,
    contact_method:
      request.contact_method,
    description:
      request.description,
    status:
      request.status,
    amount: totalAmount,
    govt_fee: govtFee,
    service_charge: serviceCharge,
    payment_status:
      raw.payment_status || (totalAmount ? "Paid" : null),
    created_at:
      request.created_at,
    updated_at:
      request.updated_at,
    customers:
      customer,
    employee_id: raw.employee_id || null,
    employee_name: raw.employee_name || null,
  };
}

export async function getAdminRequests(
  filters?: RequestFilters
): Promise<AdminRequest[]> {
  try {
    const { data, error } = await fetchServiceRequests((selectCols) => {
      let q = supabase
        .from("service_requests")
        .select(selectCols)
        .order("created_at", {
          ascending: false,
        });

      if (filters?.status && filters.status !== "All") {
        q = q.eq("status", filters.status);
      }

      if (filters?.service && filters.service !== "All") {
        q = q.eq("service", filters.service);
      }

      return q;
    });

    if (error) {
      throw error;
    }

    let requests =
      ((data || []) as SupabaseRequest[])
        .map(normalizeRequest);

    if (filters?.employeeId && filters.employeeId !== "All") {
      requests = requests.filter((r) => r.employee_id === filters.employeeId);
    }

    const search =
      filters?.search
        ?.trim()
        .toLowerCase();

    if (search) {
      requests =
        requests.filter(
          (request) => {
            const customer =
              request.customers;

            return (
              request.request_id
                .toLowerCase()
                .includes(search) ||
              request.service
                .toLowerCase()
                .includes(search) ||
              request.description
                .toLowerCase()
                .includes(search) ||
              customer?.full_name
                ?.toLowerCase()
                .includes(search) ||
              customer?.phone
                ?.includes(search) ||
              customer?.email
                ?.toLowerCase()
                .includes(search)
            );
          }
        );
    }

    return requests;
  } catch (error) {
    console.warn(
      "Supabase query failed, using development sample requests:",
      error
    );

    let list = [...mockAdminRequests];

    if (filters?.status && filters.status !== "All") {
      list = list.filter((r) => r.status === filters.status);
    }

    if (filters?.service && filters.service !== "All") {
      list = list.filter((r) => r.service === filters.service);
    }

    if (filters?.employeeId && filters.employeeId !== "All") {
      list = list.filter((r) => r.employee_id === filters.employeeId);
    }

    const search = filters?.search?.trim().toLowerCase();
    if (search) {
      list = list.filter(
        (r) =>
          r.request_id.toLowerCase().includes(search) ||
          r.service.toLowerCase().includes(search) ||
          r.description.toLowerCase().includes(search) ||
          (r.customers?.full_name || "").toLowerCase().includes(search) ||
          (r.customers?.phone || "").includes(search)
      );
    }

    return list;
  }
}

export async function getAdminRequestById(
  id: string
): Promise<AdminRequest | null> {
  if (!id.trim()) {
    return null;
  }

  try {
    const { data, error } = await fetchServiceRequests((selectCols) =>
      supabase
        .from("service_requests")
        .select(selectCols)
        .eq("id", id)
        .maybeSingle()
    );

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return normalizeRequest(
      data as SupabaseRequest
    );
  } catch {
    return mockAdminRequests.find((r) => r.id === id) || null;
  }
}

export async function updateRequestStatus(
  id: string,
  status: RequestStatus,
  fallbackRequest?: AdminRequest,
  amount?: number | null,
  paymentStatus?: PaymentStatus | null,
  govtFee?: number | null,
  serviceCharge?: number | null
): Promise<AdminRequest> {
  if (!id.trim()) {
    throw new Error(
      "Invalid request."
    );
  }

  const allowedStatuses: RequestStatus[] =
    [
      "Pending",
      "Processing",
      "Completed",
      "Rejected",
    ];

  if (
    !allowedStatuses.includes(
      status
    )
  ) {
    throw new Error(
      "Invalid request status."
    );
  }

  let calculatedAmount = amount;
  if (
    (calculatedAmount === undefined || calculatedAmount === null) &&
    (govtFee !== undefined || serviceCharge !== undefined)
  ) {
    calculatedAmount = (govtFee || 0) + (serviceCharge || 0);
  }

  const payload: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (calculatedAmount !== undefined && calculatedAmount !== null) {
    payload.amount = calculatedAmount;
  }
  if (govtFee !== undefined && govtFee !== null) {
    payload.govt_fee = govtFee;
  }
  if (serviceCharge !== undefined && serviceCharge !== null) {
    payload.service_charge = serviceCharge;
  }
  if (paymentStatus !== undefined && paymentStatus !== null) {
    payload.payment_status = paymentStatus;
  }

  try {
    let data: any = null;
    let error: any = null;

    // Attempt 1: Full payload with govt_fee & service_charge
    const firstAttempt = await supabase
      .from("service_requests")
      .update(payload)
      .eq("id", id)
      .select(requestSelectWithFullBilling);

    data = firstAttempt.data;
    error = firstAttempt.error;

    // If govt_fee or service_charge columns don't exist yet, retry with only amount & status
    if (
      error &&
      (error.message?.includes("govt_fee") ||
        error.message?.includes("service_charge") ||
        error.code === "PGRST204" ||
        error.code === "42703")
    ) {
      const amountPayload: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (calculatedAmount !== undefined && calculatedAmount !== null) {
        amountPayload.amount = calculatedAmount;
      }
      if (paymentStatus !== undefined && paymentStatus !== null) {
        amountPayload.payment_status = paymentStatus;
      }

      const retryAmount = await supabase
        .from("service_requests")
        .update(amountPayload)
        .eq("id", id)
        .select(requestSelectWithOnlyAmount);

      data = retryAmount.data;
      error = retryAmount.error;
    }

    // If amount or payment_status columns do not exist in Supabase yet, retry with base payload
    if (
      error &&
      (error.message?.includes("amount") ||
        error.message?.includes("payment_status") ||
        error.code === "PGRST204" ||
        error.code === "42703")
    ) {
      const basePayload = {
        status,
        updated_at: new Date().toISOString(),
      };
      const retryBase = await supabase
        .from("service_requests")
        .update(basePayload)
        .eq("id", id)
        .select(requestSelectBasic);
      data = retryBase.data;
      error = retryBase.error;
    }

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      const norm = normalizeRequest(
        data[0] as SupabaseRequest
      );
      return {
        ...norm,
        amount: calculatedAmount !== undefined ? calculatedAmount : norm.amount,
        govt_fee: govtFee !== undefined ? govtFee : norm.govt_fee,
        service_charge: serviceCharge !== undefined ? serviceCharge : norm.service_charge,
        payment_status:
          paymentStatus !== undefined
            ? paymentStatus
            : norm.payment_status,
      };
    }

    console.warn(
      `[Supabase RLS Blocked] UPDATE on 'service_requests' for ID "${id}" affected 0 rows.`
    );
  } catch (err) {
    console.warn("Supabase update error:", err);
  }

  // Fallback 1: in-memory mock sample list
  const index = mockAdminRequests.findIndex((r) => r.id === id);
  if (index !== -1) {
    mockAdminRequests[index] = {
      ...mockAdminRequests[index],
      status,
      amount:
        calculatedAmount !== undefined
          ? calculatedAmount
          : mockAdminRequests[index].amount,
      govt_fee:
        govtFee !== undefined
          ? govtFee
          : mockAdminRequests[index].govt_fee,
      service_charge:
        serviceCharge !== undefined
          ? serviceCharge
          : mockAdminRequests[index].service_charge,
      payment_status:
        paymentStatus !== undefined
          ? paymentStatus
          : mockAdminRequests[index].payment_status,
      updated_at: new Date().toISOString(),
    };
    return mockAdminRequests[index];
  }

  // Fallback 2: optimistically return the updated request object
  if (fallbackRequest) {
    return {
      ...fallbackRequest,
      status,
      amount:
        calculatedAmount !== undefined
          ? calculatedAmount
          : fallbackRequest.amount,
      govt_fee:
        govtFee !== undefined
          ? govtFee
          : fallbackRequest.govt_fee,
      service_charge:
        serviceCharge !== undefined
          ? serviceCharge
          : fallbackRequest.service_charge,
      payment_status:
        paymentStatus !== undefined
          ? paymentStatus
          : fallbackRequest.payment_status,
      updated_at: new Date().toISOString(),
    };
  }

  throw new Error("Unable to update request status.");
}

export async function updateRequestBilling(
  id: string,
  amount: number,
  paymentStatus: PaymentStatus,
  fallbackRequest?: AdminRequest,
  govtFee?: number | null,
  serviceCharge?: number | null
): Promise<AdminRequest> {
  const currentStatus = fallbackRequest?.status || "Completed";
  return updateRequestStatus(
    id,
    currentStatus,
    fallbackRequest,
    amount,
    paymentStatus,
    govtFee,
    serviceCharge
  );
}

export async function deleteRequest(
  id: string
) {
  if (!id.trim()) {
    throw new Error(
      "Invalid request."
    );
  }

  try {
    const {
      error,
    } = await supabase
      .from("service_requests")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }
  } catch (err) {
    console.warn("Using local mock delete:", err);
    mockAdminRequests = mockAdminRequests.filter((r) => r.id !== id);
  }
}

export async function getCustomerRequests(
  customerId: string
): Promise<AdminRequest[]> {
  if (!customerId.trim()) {
    return [];
  }

  try {
    const { data, error } = await fetchServiceRequests((selectCols) =>
      supabase
        .from("service_requests")
        .select(selectCols)
        .eq("customer_id", customerId)
        .order("created_at", {
          ascending: false,
        })
    );

    if (error) {
      throw error;
    }

    return (
      (data || []) as SupabaseRequest[]
    ).map(normalizeRequest);
  } catch (err) {
    console.warn("Using local mock for customer requests:", err);
    return mockAdminRequests.filter((r) => r.customer_id === customerId);
  }
}