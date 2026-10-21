import React from "react";
import { DemoBanner } from "@/components/common/DemoBanner";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { MyBookingsClient } from "./MyBookingsClient";

export default function MyBookingsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
      <DemoBanner />
      <Navbar />
      <main className="flex-1">
        <MyBookingsClient />
      </main>
      <Footer />
    </div>
  );
}
