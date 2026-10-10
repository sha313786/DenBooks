"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Receipt,
  FileText,
  BadgeCheck,
  Lock,
  ArrowRight,
} from "lucide-react";
import {
  Employee,
  EmployeeRole,
  DEFAULT_EMPLOYEES,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/lib/services/employee.service";
import {
  getCurrentTenantSubscription,
  getPlanLimits,
  TenantSubscription,
  PlanLimits,
} from "@/lib/services/subscription.service";

export default function EmployeeManagementModule() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Subscription plan limits state
  const [subState, setSubState] = useState<TenantSubscription | null>(null);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Show PIN visibility toggle by employee id
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<EmployeeRole>("Counter Staff");
  const [formPin, setFormPin] = useState("1234");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formNotes, setFormNotes] = useState("");
  const [formCanInvoice, setFormCanInvoice] = useState(true);
  const [formCanRequests, setFormCanRequests] = useState(true);
  const [formCanSettle, setFormCanSettle] = useState(true);
  const [formCanIssueTokens, setFormCanIssueTokens] = useState(true);
  const [formCanRecordExpense, setFormCanRecordExpense] = useState(true);

  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const list = await getEmployees();
      setEmployees(list);
      const sub = getCurrentTenantSubscription();
      setSubState(sub);
      setPlanLimits(getPlanLimits(sub.plan));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function togglePinVisibility(id: string) {
    setVisiblePins((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function openAddModal() {
    if (planLimits && !planLimits.canMultiStaff && employees.length >= planLimits.maxStaff) {
      setShowUpgradeModal(true);
      return;
    }
    setEditingEmployee(null);
    setFormName("");
    setFormPhone("");
    setFormEmail("");
    setFormRole("Counter Staff");
    setFormPin(Math.floor(1000 + Math.random() * 9000).toString());
    setFormIsActive(true);
    setFormNotes("");
    setFormCanInvoice(true);
    setFormCanRequests(true);
    setFormCanSettle(true);
    setFormCanIssueTokens(true);
    setFormCanRecordExpense(true);
    setShowModal(true);
  }

  function openEditModal(emp: Employee) {
    setEditingEmployee(emp);
    setFormName(emp.name);
    setFormPhone(emp.phone);
    setFormEmail(emp.email || "");
    setFormRole(emp.role);
    setFormPin(emp.pin);
    setFormIsActive(emp.isActive);
    setFormNotes(emp.notes || "");
    setFormCanInvoice(emp.permissions.canCreateInvoice);
    setFormCanRequests(emp.permissions.canManageRequests);
    setFormCanSettle(emp.permissions.canSettleCredit);
    setFormCanIssueTokens(emp.permissions.canIssueTokens ?? true);
    setFormCanRecordExpense(emp.permissions.canRecordExpense ?? true);
    setShowModal(true);
  }

  async function handleSaveEmployee(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      alert("Please provide at least a full name and mobile phone number.");
      return;
    }
    if (!/^\d{4,6}$/.test(formPin.trim())) {
      alert("Login PIN must be 4 to 6 numeric digits (e.g. 1234).");
      return;
    }

    setSaving(true);
    try {
      if (editingEmployee) {
        const updated = await updateEmployee(editingEmployee.id, {
          name: formName.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim() || undefined,
          role: formRole,
          pin: formPin.trim(),
          isActive: formIsActive,
          notes: formNotes.trim() || undefined,
          permissions: {
            canCreateInvoice: formCanInvoice,
            canManageRequests: formCanRequests,
            canSettleCredit: formCanSettle,
            canViewDaybookSummary: true,
            canIssueTokens: formCanIssueTokens,
            canRecordExpense: formCanRecordExpense,
          },
        });
        setEmployees((prev) =>
          prev.map((e) => (e.id === updated.id ? updated : e))
        );
        setStatusMsg(`Updated ${updated.name} successfully.`);
      } else {
        if (planLimits && !planLimits.canMultiStaff && employees.length >= planLimits.maxStaff) {
          setShowModal(false);
          setShowUpgradeModal(true);
          setSaving(false);
          return;
        }
        const created = await createEmployee({
          name: formName.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim() || undefined,
          role: formRole,
          pin: formPin.trim(),
          isActive: formIsActive,
          notes: formNotes.trim() || undefined,
          permissions: {
            canCreateInvoice: formCanInvoice,
            canManageRequests: formCanRequests,
            canSettleCredit: formCanSettle,
            canViewDaybookSummary: true,
            canIssueTokens: formCanIssueTokens,
            canRecordExpense: formCanRecordExpense,
          },
        });
        setEmployees((prev) => [created, ...prev]);
        setStatusMsg(`Staff member ${created.name} added successfully.`);
      }
      setShowModal(false);
      setTimeout(() => setStatusMsg(""), 3500);
    } catch (err: any) {
      if (err.message?.includes("upgrade to Pro")) {
        setShowModal(false);
        setShowUpgradeModal(true);
      } else {
        alert(err.message || "Failed to save employee.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(emp: Employee) {
    try {
      const updated = await updateEmployee(emp.id, { isActive: !emp.isActive });
      setEmployees((prev) =>
        prev.map((e) => (e.id === emp.id ? updated : e))
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteEmployee(emp: Employee) {
    if (
      confirm(
        `Are you sure you want to remove staff member "${emp.name}"? They will no longer be able to log into the counter desk.`
      )
    ) {
      try {
        await deleteEmployee(emp.id);
        setEmployees((prev) => prev.filter((e) => e.id !== emp.id));
      } catch (err) {
        console.error(err);
      }
    }
  }

  function handleCopyStaffUrl() {
    const url = `${window.location.origin}/staff/login`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (roleFilter !== "all" && emp.role !== roleFilter) return false;
      if (statusFilter === "active" && !emp.isActive) return false;
      if (statusFilter === "inactive" && emp.isActive) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = emp.name.toLowerCase().includes(q);
        const matchesPhone = emp.phone.includes(q);
        const matchesRole = emp.role.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesRole) return false;
      }
      return true;
    });
  }, [employees, searchQuery, roleFilter, statusFilter]);

  const activeCount = employees.filter((e) => e.isActive).length;
  const operatorCount = employees.filter(
    (e) => e.role === "CSC Operator" || e.role === "Counter Staff"
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Portal Launcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Staff & Counter Employee Management
            </h2>
            <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300 border border-cyan-400/30">
              Role-Based Access
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Give employees their own login PIN for Counter Billing & Service Requests without giving full shop admin access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyStaffUrl}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
            title="Copy Staff Login Portal URL to share with employees"
          >
            {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copiedLink ? "Link Copied!" : "Copy Staff Login Link"}</span>
          </button>

          <a
            href="/staff"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition shadow-sm"
          >
            <ExternalLink size={14} />
            <span>Open Counter Desk</span>
          </a>

          <button
            type="button"
            onClick={openAddModal}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-md ${
              planLimits && !planLimits.canMultiStaff && employees.length >= planLimits.maxStaff
                ? "border border-amber-300 dark:border-amber-400/50 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-500/30"
                : "bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-cyan-500/20"
            }`}
          >
            {planLimits && !planLimits.canMultiStaff && employees.length >= planLimits.maxStaff ? (
              <>
                <Lock size={14} className="text-amber-700 dark:text-amber-400" />
                <span>Add Staff (Pro Feature)</span>
              </>
            ) : (
              <>
                <UserPlus size={15} />
                <span>Add New Staff</span>
              </>
            )}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-300 animate-fadeIn">
          <BadgeCheck size={16} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Plan Multi-Staff Enforcer Banner */}
      {planLimits && !planLimits.canMultiStaff ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-amber-300 dark:border-amber-500/40 bg-amber-50/90 dark:bg-[#1a140d] p-4 text-xs shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
              <Users size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-amber-900 dark:text-amber-300">
                  Starter Plan (Single Counter) Limit: 1 Staff Terminal Included
                </span>
                <span className="rounded-full bg-amber-200/80 dark:bg-amber-900/50 px-2.5 py-0.5 text-[10.5px] font-bold text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/50">
                  {employees.length} / 1 Staff Used
                </span>
              </div>
              <p className="mt-1 text-[11px] text-amber-800/90 dark:text-amber-300/70">
                Want 3+ employees with separate 4-digit PINs, individual shift handover tally slips, and operator tracking? Upgrade to <strong>Pro Center Hub</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:brightness-110 active:scale-95 transition shadow-sm"
          >
            <Sparkles size={13} />
            <span>Upgrade to Pro (₹349/mo)</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/20 px-4 py-2.5 text-xs text-emerald-800 dark:text-emerald-300 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-bold">
              {subState?.plan === "trial" ? "14-Day Free Pro Trial Active" : "Pro Center Hub Active"}: Unlimited Staff Counter Logins & Separate PIN Shifts
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400/80">
            {employees.length} staff registered • Individual shift handover slips enabled
          </span>
        </div>
      )}

      {/* 2. Metrics Cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-800/80 bg-[#0c1322] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Staff</span>
            <Users size={16} className="text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">{employees.length}</div>
          <div className="mt-1 text-[11px] text-slate-400">Registered employees</div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-300">Active On Duty</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-300">{activeCount}</div>
          <div className="mt-1 text-[11px] text-emerald-400/80">Can login right now</div>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-[#0c1322] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Counter & Operators</span>
            <Receipt size={16} className="text-teal-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-teal-300">{operatorCount}</div>
          <div className="mt-1 text-[11px] text-slate-400">POS & Citizen Desk</div>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-[#0c1322] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Staff Portal Security</span>
            <Shield size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 text-xs font-bold text-amber-300">PIN Authentication</div>
          <div className="mt-1 text-[10.5px] text-slate-400">Admin profits & settings restricted</div>
        </div>
      </div>

      {/* 3. Search and Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-[#0c1322] p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name, mobile number, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-400"
          >
            <option value="all">All Roles</option>
            <option value="Counter Staff">Counter Staff</option>
            <option value="CSC Operator">CSC Operator</option>
            <option value="Receptionist">Receptionist</option>
            <option value="Xerox & DTP Desk">Xerox & DTP Desk</option>
            <option value="Branch Supervisor">Branch Supervisor</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* 4. Staff Members Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0c1322] shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Role / Designation</th>
                <th className="px-4 py-3">Login Mobile</th>
                <th className="px-4 py-3">Login PIN</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw size={18} className="animate-spin inline-block mr-2 text-cyan-400" />
                    Loading staff records...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No employees found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const isPinVisible = !!visiblePins[emp.id];
                  return (
                    <tr key={emp.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 font-bold text-cyan-300 border border-cyan-400/30 text-sm">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{emp.name}</div>
                            {emp.email && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Mail size={10} />
                                <span>{emp.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block rounded-lg px-2.5 py-1 text-[10.5px] font-bold border ${
                            emp.role === "CSC Operator"
                              ? "bg-purple-500/15 text-purple-300 border-purple-400/30"
                              : emp.role === "Receptionist"
                              ? "bg-pink-500/15 text-pink-300 border-pink-400/30"
                              : emp.role === "Counter Staff"
                              ? "bg-cyan-500/15 text-cyan-300 border-cyan-400/30"
                              : emp.role === "Branch Supervisor"
                              ? "bg-amber-500/15 text-amber-300 border-amber-400/30"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          {emp.role}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-slate-400" />
                          <span>{emp.phone}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-2.5 py-1 font-mono text-xs border border-slate-800">
                          <span className="font-bold text-cyan-300">
                            {isPinVisible ? emp.pin : "••••"}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePinVisibility(emp.id)}
                            className="text-slate-400 hover:text-white transition"
                            title={isPinVisible ? "Hide PIN" : "Show PIN"}
                          >
                            {isPinVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {emp.permissions.canIssueTokens && (
                            <span className="rounded bg-indigo-950/60 px-1.5 py-0.5 text-[9.5px] font-semibold text-indigo-300 border border-indigo-500/30">
                              🎟️ Tokens (FCFS)
                            </span>
                          )}
                          {emp.permissions.canCreateInvoice && (
                            <span className="rounded bg-cyan-950/60 px-1.5 py-0.5 text-[9.5px] font-semibold text-cyan-300 border border-cyan-500/20">
                              Billing / POS
                            </span>
                          )}
                          {emp.permissions.canManageRequests && (
                            <span className="rounded bg-teal-950/60 px-1.5 py-0.5 text-[9.5px] font-semibold text-teal-300 border border-teal-500/20">
                              Requests
                            </span>
                          )}
                          {emp.permissions.canSettleCredit && (
                            <span className="rounded bg-emerald-950/60 px-1.5 py-0.5 text-[9.5px] font-semibold text-emerald-300 border border-emerald-500/20">
                              Khata
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(emp)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold border transition ${
                            emp.isActive
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                          }`}
                          title="Click to toggle Active / Inactive"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              emp.isActive ? "bg-emerald-400" : "bg-slate-500"
                            }`}
                          />
                          <span>{emp.isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(emp)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-cyan-300 transition"
                            title="Edit Employee details or change PIN"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEmployee(emp)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition"
                            title="Delete Employee"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ADD / EDIT EMPLOYEE MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#0c1322] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {editingEmployee ? "Edit Employee Profile" : "Register New Counter Staff"}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Staff can login with their mobile number and 4-digit PIN
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Login Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Role / Designation
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => {
                      const newRole = e.target.value as EmployeeRole;
                      setFormRole(newRole);
                      if (newRole === "Receptionist") {
                        setFormCanInvoice(true);
                        setFormCanRequests(true);
                        setFormCanIssueTokens(true);
                        setFormCanSettle(false);
                      } else if (newRole === "Branch Supervisor") {
                        // Supervisor has all permissions
                        setFormCanInvoice(true);
                        setFormCanRequests(true);
                        setFormCanIssueTokens(true);
                        setFormCanSettle(true);
                      } else {
                        setFormCanInvoice(true);
                        setFormCanRequests(false);
                        setFormCanIssueTokens(false);
                        setFormCanSettle(true);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                  >
                    <option value="Counter Staff">Counter Staff</option>
                    <option value="CSC Operator">CSC Operator</option>
                    <option value="Receptionist">Receptionist (Front Desk)</option>
                    <option value="Xerox & DTP Desk">Xerox & DTP Desk</option>
                    <option value="Branch Supervisor">Branch Supervisor</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Login PIN (4-6 digits) *
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormPin(Math.floor(1000 + Math.random() * 9000).toString())
                      }
                      className="text-[10px] text-cyan-400 hover:underline"
                    >
                      Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 1234"
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono font-bold tracking-widest text-emerald-400 outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Email Address (optional)
                  </label>
                  <input
                    type="email"
                    placeholder="staff@digitalden.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Permissions Checkboxes */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300">
                    Counter Permissions
                  </span>
                  {formRole === "Receptionist" && (
                    <span className="text-[10px] font-semibold text-pink-400 bg-pink-950/40 px-2 py-0.5 rounded border border-pink-500/30">
                      Receptionist Preset Active
                    </span>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCanRequests}
                      onChange={(e) => setFormCanRequests(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    <span className="text-[11px]">Add Service Request</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCanIssueTokens}
                      onChange={(e) => setFormCanIssueTokens(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    <span className="text-[11px]">Create Token (FCFS Queue)</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCanInvoice}
                      onChange={(e) => setFormCanInvoice(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    <span className="text-[11px]">Counter POS & Xerox</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCanSettle}
                      onChange={(e) => setFormCanSettle(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    <span className="text-[11px]">Settle Customer Khata</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCanRecordExpense}
                      onChange={(e) => setFormCanRecordExpense(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    <span className="text-[11px]">Record Shop Expense</span>
                  </label>
                </div>
                {formRole === "Receptionist" && (
                  <p className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 mt-1">
                    ✨ Receptionists issue queue tokens, register walk-in service applications, and handle Xerox/printing bills.
                  </p>
                )}
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs font-semibold text-white">Account Status</span>
                  <p className="text-[10px] text-slate-400">Can this staff member log in?</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`rounded-full px-3 py-1 text-xs font-bold border transition ${
                    formIsActive
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {formIsActive ? "✅ Active" : "⏸️ Suspended / Inactive"}
                </button>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 transition shadow-md shadow-cyan-500/20"
                >
                  {saving ? "Saving..." : editingEmployee ? "Update Employee" : "Save Staff Member"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade to Pro Modal (Multi-Staff Limit Enforcer) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-cyan-400/40 bg-white dark:bg-[#0c1322] p-6 shadow-2xl space-y-5 text-slate-800 dark:text-slate-100">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-teal-400/10 border border-cyan-400/30 text-cyan-600 dark:text-cyan-400">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Upgrade to Pro Center Hub for Multi-Staff
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Your current Single Counter (Starter) Plan includes 1 staff operator.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <XCircle size={18} />
              </button>
            </div>

            {/* Plan Comparison Box */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 space-y-2">
                <div className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                  Single Counter (Current)
                </div>
                <div className="font-black text-sm text-slate-800 dark:text-slate-300">₹ 199 / mo</div>
                <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-cyan-600 dark:text-cyan-400" />
                    <span>1 Staff Login Included</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-cyan-600 dark:text-cyan-400" />
                    <span>Single Drawer Tally</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <span className="line-through">Individual Staff Handover</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <span className="line-through">Operator Revenue Attribution</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-cyan-300 dark:border-cyan-500/50 bg-cyan-50/70 dark:bg-gradient-to-b dark:from-cyan-950/30 dark:to-[#0e1c33] p-3.5 space-y-2 relative shadow-lg shadow-cyan-950/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-700 dark:text-cyan-400 uppercase text-[10px] tracking-wider">
                    Pro Center Hub
                  </span>
                  <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-black text-cyan-700 dark:text-cyan-300 border border-cyan-400/30">
                    RECOMMENDED
                  </span>
                </div>
                <div className="font-black text-sm text-cyan-950 dark:text-white">
                  ₹ 349 / mo <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">or ₹1999/yr</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-200 pt-1 border-t border-cyan-200 dark:border-cyan-500/20">
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-slate-900 dark:text-white">Unlimited Staff PIN Logins</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Shift Drawer Handover Slips</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Operator Revenue Attribution</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Token Queue Call Screen</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Explanatory text */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 p-3 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-slate-200">
                How multi-staff works in Pro Center Hub:
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Each of your 3+ staff members gets their own mobile number + 4-digit PIN. When their shift ends, DenBooks tallies their physical cash drawer separately and prints a verified Handover Slip before the next staff member logs in.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <Link
                href="/dashboard/subscription"
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 py-3 text-xs font-black text-slate-950 hover:brightness-110 active:scale-95 transition shadow-lg shadow-cyan-400/20"
              >
                <span>Upgrade to Pro Center Hub</span>
                <ArrowRight size={14} />
              </Link>
              {employees.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowUpgradeModal(false);
                    openEditModal(employees[0]);
                  }}
                  className="w-full sm:w-auto rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Edit Current Staff ({employees[0].name})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
