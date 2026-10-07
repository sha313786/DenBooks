"use client";

import React from "react";
import AdminHeaderLayout from "@/components/AdminHeaderLayout";
import { AccountsModule } from "@/components/AccountsModule";

export default function CounterPosPage() {
  return (
    <AdminHeaderLayout>
      <AccountsModule initialTab="counter_pos" hideHeaderWidgets={true} />
    </AdminHeaderLayout>
  );
}
