import React from "react";
import { DemoBanner } from "@/components/common/DemoBanner";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AmenitiesStrip } from "@/components/home/AmenitiesStrip";
import { ShieldCheck, Wifi, Utensils, Laptop, Sparkles, KeyRound, Zap, Shirt, ShowerHead } from "lucide-react";
import Link from "next/link";

export default function AmenitiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
      <DemoBanner />
      <Navbar />

      <main className="flex-1 space-y-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#123D2B]">
              Standard In Every Stay
            </span>
            <h1 className="text-4xl font-extrabold text-[#123D2B]">
              Premium Living Facilities
            </h1>
            <p className="text-sm text-[#5E6E65] leading-relaxed">
              Every Stayzy room and PG bed includes all fundamental services: uncapped high-speed internet, regular professional housekeeping, security, and chef-curated home meals.
            </p>
          </div>
        </div>

        <AmenitiesStrip />

        {/* Detailed Facilities Breakdown */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-[#E8E6DF] space-y-4">
              <div className="flex items-center gap-2 text-[#123D2B]">
                <Wifi className="w-5 h-5" />
                <h2 className="text-lg font-bold">High-Speed Connectivity & Work</h2>
              </div>
              <p className="text-xs text-[#5E6E65] leading-relaxed">
                Stayzy properties feature commercial leased-line fiber internet with 300 Mbps bandwidth, dual-band Wi-Fi 6 access points on every corridor, ergonomic work desks in every room, and soundproof private phone call booths.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#E8E6DF] space-y-4">
              <div className="flex items-center gap-2 text-[#123D2B]">
                <Utensils className="w-5 h-5" />
                <h2 className="text-lg font-bold">Nutritious Home Dining</h2>
              </div>
              <p className="text-xs text-[#5E6E65] leading-relaxed">
                Enjoy 3 fresh daily meals (breakfast, lunch, and dinner) prepared by full-time cooks with balanced menus. 24/7 access to filtered RO water dispensers, microwaves, and refrigerators.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#E8E6DF] space-y-4">
              <div className="flex items-center gap-2 text-[#123D2B]">
                <KeyRound className="w-5 h-5" />
                <h2 className="text-lg font-bold">Keyless Biometric Access & Safety</h2>
              </div>
              <p className="text-xs text-[#5E6E65] leading-relaxed">
                Residents enter seamlessly using their phone or unique fingerprint PIN. Round-the-clock CCTV in communal areas, digital fire safety systems, and night security staff ensure peace of mind.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#E8E6DF] space-y-4">
              <div className="flex items-center gap-2 text-[#123D2B]">
                <Zap className="w-5 h-5" />
                <h2 className="text-lg font-bold">100% Uninterrupted Power Backup</h2>
              </div>
              <p className="text-xs text-[#5E6E65] leading-relaxed">
                Automatic diesel generators support all rooms, lighting, laptops, and air conditioning during municipal grid cuts so your work sprint or rest is never interrupted.
              </p>
            </div>
          </div>

          <div className="pt-12 text-center">
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#123D2B] text-white font-bold text-sm hover:bg-[#0E2F21] shadow-sm transition-all"
            >
              Explore Rooms with These Amenities
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
