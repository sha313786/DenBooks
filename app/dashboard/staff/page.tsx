"use client";

import React from "react";
import AdminHeaderLayout from "@/components/AdminHeaderLayout";
import EmployeeManagementModule from "@/components/EmployeeManagementModule";

export default function StaffManagementPage() {
  return (
    <AdminHeaderLayout>
      <div className="rounded-2xl border border-slate-800/80 bg-[#0c1322] p-6 shadow-xl">
        <EmployeeManagementModule />
      </div>
    </AdminHeaderLayout>
  );
}
