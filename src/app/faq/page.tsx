import React from "react";
import { DemoBanner } from "@/components/common/DemoBanner";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { FaqAccordion } from "@/components/home/FaqAccordion";

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
      <DemoBanner />
      <Navbar />
      <main className="flex-1 py-10">
        <FaqAccordion />
      </main>
      <Footer />
    </div>
  );
}
