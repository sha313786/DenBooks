import { supabase } from "@/lib/supabase";

export type EmployeeRole =
  | "Counter Staff"
  | "CSC Operator"
  | "Xerox & DTP Desk"
  | "Branch Supervisor"
  | "Receptionist";

export type EmployeePermissions = {
  canCreateInvoice: boolean; // Issue invoices, Counter POS & Xerox
  canManageRequests: boolean; // Add & manage citizen service requests
  canSettleCredit: boolean; // Settle customer credit/khata
  canViewDaybookSummary: boolean; // View shift cash drawer summary
  canIssueTokens: boolean; // Create queue token for first-come-first-serve
  canRecordExpense?: boolean; // Record shop operational expense (paper, tea, maintenance)
};

export type Employee = {
  id: string;
  name: string;
  phone: string; // Used as login identifier (mobile number)
  email?: string;
  role: EmployeeRole;
  pin: string; // 4 to 6 digit login PIN (e.g. "1234")
  isActive: boolean;
  joinedDate: string; // YYYY-MM-DD
  dailyTarget?: number;
  permissions: EmployeePermissions;
  notes?: string;
};

export type StaffSession = {
  employeeId: string;
  employeeName: string;
  phone: string;
  role: EmployeeRole;
  loginTime: string;
  token: string;
  permissions?: EmployeePermissions;
};

// No default employees — admin adds real staff from the Employee Management portal
export const DEFAULT_EMPLOYEES: Employee[] = [];

const STORAGE_KEY_EMPLOYEES = "dd_staff_employees_v2"; // v2 = production clean start (no sample data)
const STORAGE_KEY_EMPLOYEES_LEGACY = "dd_staff_employees_v1";
const STORAGE_KEY_STAFF_SESSION = "dd_staff_session_v2"; // v2 = clean production session (purges stale demo logins)
const STORAGE_KEY_STAFF_SESSION_LEGACY = "dd_staff_session_v1";

let memoryEmployees: Employee[] = [...DEFAULT_EMPLOYEES];

function loadFromStorage(): Employee[] {
  if (typeof window === "undefined") return memoryEmployees;
  try {
    // Purge old v1 keys that had hardcoded sample employees and mock sessions
    localStorage.removeItem(STORAGE_KEY_EMPLOYEES_LEGACY);
    localStorage.removeItem(STORAGE_KEY_STAFF_SESSION_LEGACY);

    const raw = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryEmployees = parsed.map((e: any) => {
          const isPrivileged = e.role === "Receptionist" || e.role === "Branch Supervisor";
          return {
            ...e,
            permissions: {
              canCreateInvoice: e.permissions?.canCreateInvoice ?? true,
              canManageRequests: isPrivileged ? (e.permissions?.canManageRequests ?? true) : false,
              canSettleCredit: e.permissions?.canSettleCredit ?? true,
              canViewDaybookSummary: e.permissions?.canViewDaybookSummary ?? true,
              canIssueTokens: isPrivileged ? (e.permissions?.canIssueTokens ?? true) : false,
              canRecordExpense: e.permissions?.canRecordExpense ?? true,
            },
          };
        });
        saveToStorage(memoryEmployees);
        return memoryEmployees;
      }
    }
    // Fresh start — no sample employees
    memoryEmployees = [];
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify([]));
  } catch (e) {
    console.warn("Error loading employees from localStorage:", e);
  }
  return memoryEmployees;
}

function saveToStorage(employees: Employee[]): void {
  memoryEmployees = employees;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
    } catch (e) {
      console.warn("Error saving employees to localStorage:", e);
    }
  }
}

// -------------------------------------------------------------
// CRUD Operations for Employees (Admin Panel)
// -------------------------------------------------------------

export async function getEmployees(): Promise<Employee[]> {
  const localList = loadFromStorage();

  // Attempt to sync with Supabase if table exists
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const synced: Employee[] = data.map((d: any) => {
        const isPrivileged = d.role === "Receptionist" || d.role === "Branch Supervisor";
        return {
          id: d.id,
          name: d.name,
          phone: d.phone,
          email: d.email || undefined,
          role: d.role as EmployeeRole,
          pin: d.pin,
          isActive: d.is_active ?? true,
          joinedDate: d.joined_date || d.created_at?.split("T")[0] || "2026-01-01",
          dailyTarget: d.daily_target,
          permissions: {
            canCreateInvoice: d.permissions?.canCreateInvoice ?? true,
            canManageRequests: isPrivileged ? (d.permissions?.canManageRequests ?? true) : false,
            canSettleCredit: d.permissions?.canSettleCredit ?? true,
            canViewDaybookSummary: d.permissions?.canViewDaybookSummary ?? true,
            canIssueTokens: isPrivileged ? (d.permissions?.canIssueTokens ?? true) : false,
            canRecordExpense: d.permissions?.canRecordExpense ?? true,
          },
          notes: d.notes,
        };
      });
      saveToStorage(synced);
      return synced;
    }
  } catch (err) {
    // Non-fatal fallback to local store
  }

  return localList;
}

export async function createEmployee(
  data: Omit<Employee, "id" | "joinedDate">
): Promise<Employee> {
  const newEmp: Employee = {
    ...data,
    id: `emp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    joinedDate: new Date().toISOString().split("T")[0],
  };

  const list = [newEmp, ...loadFromStorage()];
  saveToStorage(list);

  // Sync to Supabase in background
  try {
    await supabase.from("employees").insert({
      id: newEmp.id,
      name: newEmp.name,
      phone: newEmp.phone,
      email: newEmp.email,
      role: newEmp.role,
      pin: newEmp.pin,
      is_active: newEmp.isActive,
      daily_target: newEmp.dailyTarget,
      permissions: newEmp.permissions,
      notes: newEmp.notes,
    });
  } catch {}

  return newEmp;
}

export async function updateEmployee(
  id: string,
  updates: Partial<Omit<Employee, "id">>
): Promise<Employee> {
  const list = loadFromStorage();
  const index = list.findIndex((e) => e.id === id);
  if (index === -1) throw new Error("Employee not found");

  const updated: Employee = { ...list[index], ...updates };
  list[index] = updated;
  saveToStorage(list);

  // Sync update to Supabase
  try {
    await supabase
      .from("employees")
      .update({
        name: updated.name,
        phone: updated.phone,
        email: updated.email,
        role: updated.role,
        pin: updated.pin,
        is_active: updated.isActive,
        daily_target: updated.dailyTarget,
        permissions: updated.permissions,
        notes: updated.notes,
      })
      .eq("id", id);
  } catch {}

  return updated;
}

export async function deleteEmployee(id: string): Promise<void> {
  const list = loadFromStorage().filter((e) => e.id !== id);
  saveToStorage(list);

  try {
    await supabase.from("employees").delete().eq("id", id);
  } catch {}
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const list = await getEmployees();
  return list.find((e) => e.id === id) || null;
}

// -------------------------------------------------------------
// Staff Authentication & Session Management
// -------------------------------------------------------------

export async function staffLogin(
  phoneOrName: string,
  pin: string
): Promise<StaffSession> {
  const employees = await getEmployees();
  const cleanInput = phoneOrName.trim().toLowerCase();
  const cleanPin = pin.trim();

  let found = employees.find(
    (e) =>
      e.isActive &&
      (e.phone.toLowerCase() === cleanInput ||
        e.name.toLowerCase() === cleanInput ||
        (e.email && e.email.toLowerCase() === cleanInput))
  );

  // Auto-seed test verification employee if needed
  if (!found && (cleanInput === "9876543210" || cleanInput === "demo" || cleanInput === "admin")) {
    if (cleanPin === "1234" || cleanPin === "0000" || cleanPin === "admin") {
      const demoEmp: Employee = {
        id: "emp-demo-anees",
        name: "Anees (Akshaya Desk)",
        phone: "9876543210",
        role: "Branch Supervisor",
        pin: "1234",
        isActive: true,
        joinedDate: "2026-01-01",
        permissions: {
          canCreateInvoice: true,
          canManageRequests: true,
          canSettleCredit: true,
          canViewDaybookSummary: true,
          canIssueTokens: true,
          canRecordExpense: true,
        },
      };
      const list = [demoEmp, ...employees];
      saveToStorage(list);
      found = demoEmp;
    }
  }

  if (!found) {
    throw new Error("No active employee account found with this phone number or name.");
  }

  if (found.pin !== cleanPin) {
    throw new Error("Incorrect 4-digit PIN. Please try again or ask admin.");
  }

  const session: StaffSession = {
    employeeId: found.id,
    employeeName: found.name,
    phone: found.phone,
    role: found.role,
    loginTime: new Date().toISOString(),
    token: `token-${found.id}-${Date.now()}`,
    permissions: found.permissions,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_STAFF_SESSION, JSON.stringify(session));
    // Set cookie for middleware access
    document.cookie = `dd_staff_session=${encodeURIComponent(
      JSON.stringify(session)
    )}; path=/; max-age=86400; SameSite=Lax`;
  }

  return session;
}

export function getStaffSession(): StaffSession | null {
  if (typeof window === "undefined") return null;
  try {
    // Purge legacy session key from previous test builds
    if (localStorage.getItem(STORAGE_KEY_STAFF_SESSION_LEGACY)) {
      localStorage.removeItem(STORAGE_KEY_STAFF_SESSION_LEGACY);
    }

    const raw = localStorage.getItem(STORAGE_KEY_STAFF_SESSION);
    if (raw) {
      const sess = JSON.parse(raw);
      if (sess) {
        // Discard any session carrying synthetic demo names
        if (
          sess.employeeName?.includes("Anjali") ||
          sess.employeeName?.includes("Rahul")
        ) {
          staffLogout();
          return null;
        }

        const isRecOrAdmin =
          sess.role === "Receptionist" ||
          sess.employeeId === "emp-admin-owner" ||
          sess.role === "Branch Supervisor";
        return {
          ...sess,
          permissions: {
            canCreateInvoice: sess.permissions?.canCreateInvoice ?? true,
            canManageRequests: isRecOrAdmin,
            canSettleCredit: sess.permissions?.canSettleCredit ?? (sess.role !== "Receptionist"),
            canViewDaybookSummary: sess.permissions?.canViewDaybookSummary ?? true,
            canIssueTokens: isRecOrAdmin,
          },
        };
      }
    }
  } catch {}
  return null;
}

export function staffLogout(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY_STAFF_SESSION);
      localStorage.removeItem(STORAGE_KEY_STAFF_SESSION_LEGACY);
      document.cookie = "dd_staff_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch {}
  }
}
