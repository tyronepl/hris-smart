"use client";

import DashboardLayout from "@/components/DashboardLayout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-black">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          HRIS Smart dashboard is working.
        </p>
      </div>
    </DashboardLayout>
  );
}
