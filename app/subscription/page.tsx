"use client";

import React from "react";
import AdminHeaderLayout from "@/components/AdminHeaderLayout";
import SubscriptionManagementModule from "@/components/SubscriptionManagementModule";

export default function StandaloneSubscriptionPage() {
  return (
    <AdminHeaderLayout>
      <div className="w-full">
        <SubscriptionManagementModule />
      </div>
    </AdminHeaderLayout>
  );
}
