import React from "react";
import { DemoBanner } from "@/components/common/DemoBanner";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Sparkles, ShieldCheck, HeartHandshake, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
      <DemoBanner />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#123D2B]">
            Our Vision
          </span>
          <h1 className="text-4xl font-extrabold text-[#123D2B] tracking-tight">
            About Stayzy
          </h1>
          <p className="text-base text-[#4A5550] leading-relaxed">
            Stayzy was created with one simple conviction: modern people shouldn’t be forced into rigid 11-month leases when their lives and careers operate flexibly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8E6DF] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F1D5] text-[#123D2B] flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="text-base font-bold text-[#192621]">Radical Flexibility</h3>
            <p className="text-xs text-[#5E6E65] leading-relaxed">
              Book private spaces or shared beds for 2 hours, 3 days, 1 month, or a full year with calendar-accurate pricing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8E6DF] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F1D5] text-[#123D2B] flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="text-base font-bold text-[#192621]">Transparent Costs</h3>
            <p className="text-xs text-[#5E6E65] leading-relaxed">
              Zero broker fees. Clear GST calculations and 100% refundable deposits returned within days of departure.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8E6DF] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F1D5] text-[#123D2B] flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="text-base font-bold text-[#192621]">Work & Rest Ready</h3>
            <p className="text-xs text-[#5E6E65] leading-relaxed">
              300 Mbps fiber connectivity, ergonomic Herman-Miller inspired study desks, power backup, and chef-prepared daily meals.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#E8E6DF] space-y-4 text-xs text-[#5E6E65] leading-relaxed">
          <h2 className="text-lg font-bold text-[#123D2B]">Bengaluru Operations</h2>
          <p>
            Stayzy currently operates two flagship locations in Bengaluru:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#192621]">
            <li>
              <strong>Stayzy Haven (Koramangala):</strong> 80 Feet Road, 4th Block, Koramangala, Bengaluru 560034
            </li>
            <li>
              <strong>Stayzy Heights (HSR Layout):</strong> 17th Cross, Sector 2, HSR Layout, Bengaluru 560102
            </li>
            <li>
              <strong>Stayzy Urban (Indiranagar):</strong> 12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038
            </li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
