"use client";

import React from "react";
import AdminHeaderLayout from "@/components/AdminHeaderLayout";
import { AccountsModule } from "@/components/AccountsModule";

export default function DaybookPage() {
  return (
    <AdminHeaderLayout>
      <AccountsModule initialTab="daybook" />
    </AdminHeaderLayout>
  );
}
