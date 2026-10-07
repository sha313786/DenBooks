"use client";

import React from "react";
import AdminHeaderLayout from "@/components/AdminHeaderLayout";
import { AccountsModule } from "@/components/AccountsModule";

export default function CustomerKhataPage() {
  return (
    <AdminHeaderLayout>
      <AccountsModule initialTab="khata" hideHeaderWidgets={true} />
    </AdminHeaderLayout>
  );
}
