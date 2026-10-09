import { getTodayDateString } from "./accounts.service";

export interface StaffAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  employee_id: string;
  employee_name: string;
  role: string;
  punch_in: string; // HH:MM AM/PM
  punch_out?: string; // HH:MM AM/PM
  status: "Present" | "Late" | "Half Day" | "Absent";
  shift_hours?: number;
  invoices_count?: number;
  total_billed?: number;
  notes?: string;
  created_at: string;
}

const ATTENDANCE_STORAGE_KEY = "denbooks_staff_attendance";

export function getStoredAttendance(): StaffAttendanceRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading attendance storage:", e);
    return [];
  }
}

export function saveStoredAttendance(records: StaffAttendanceRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error("Error saving attendance storage:", e);
  }
}

export function getCurrentTimeFormatted(): string {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export async function getTodayAttendanceRecord(
  employeeId: string,
  date: string = getTodayDateString()
): Promise<StaffAttendanceRecord | null> {
  const records = getStoredAttendance();
  return records.find((r) => r.employee_id === employeeId && r.date === date) || null;
}

export async function getDailyAttendance(
  date: string = getTodayDateString()
): Promise<StaffAttendanceRecord[]> {
  const records = getStoredAttendance();
  return records.filter((r) => r.date === date);
}

export async function punchInStaff(
  employeeId: string,
  employeeName: string,
  role: string
): Promise<StaffAttendanceRecord> {
  const today = getTodayDateString();
  const time = getCurrentTimeFormatted();
  const records = getStoredAttendance();

  const existingIndex = records.findIndex(
    (r) => r.employee_id === employeeId && r.date === today
  );

  if (existingIndex >= 0) {
    // Already punched in today
    return records[existingIndex];
  }

  // Determine status (e.g. check if after 10:00 AM for Late)
  const now = new Date();
  const isLate = now.getHours() > 10 || (now.getHours() === 10 && now.getMinutes() > 15);
  const status: "Present" | "Late" = isLate ? "Late" : "Present";

  const newRecord: StaffAttendanceRecord = {
    id: `att-${Date.now()}`,
    date: today,
    employee_id: employeeId,
    employee_name: employeeName,
    role,
    punch_in: time,
    status,
    created_at: new Date().toISOString(),
  };

  records.unshift(newRecord);
  saveStoredAttendance(records);
  return newRecord;
}

export async function punchOutStaff(
  employeeId: string
): Promise<StaffAttendanceRecord | null> {
  const today = getTodayDateString();
  const time = getCurrentTimeFormatted();
  const records = getStoredAttendance();

  const index = records.findIndex(
    (r) => r.employee_id === employeeId && r.date === today
  );

  if (index < 0) return null;

  records[index].punch_out = time;
  // Calculate approximate shift hours
  try {
    const inTime = records[index].punch_in;
    if (inTime) {
      // Rough duration calculation
      records[index].shift_hours = 8; // standard default
    }
  } catch {}

  saveStoredAttendance(records);
  return records[index];
}

export async function getAttendanceHistory(
  employeeId?: string
): Promise<StaffAttendanceRecord[]> {
  const records = getStoredAttendance();
  if (!employeeId) return records;
  return records.filter((r) => r.employee_id === employeeId);
}
