import React, { Suspense } from "react";
import { DemoBanner } from "@/components/common/DemoBanner";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { RoomCatalog } from "@/components/rooms/RoomCatalog";

export default function RoomsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
      <DemoBanner />
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="py-20 text-center text-xs text-[#5E6E65]">Loading Stayzy rooms...</div>}>
          <RoomCatalog />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
