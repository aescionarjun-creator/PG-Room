import React from "react";
import { MyBookingsClient } from "@/app/my-bookings/MyBookingsClient";

export default function DashboardBookingsPage() {
  return (
    <div className="space-y-6">
      <MyBookingsClient />
    </div>
  );
}
