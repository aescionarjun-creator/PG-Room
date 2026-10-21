import React from "react";
import { DemoBanner } from "@/components/common/DemoBanner";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { MapPin, Phone, Mail, Clock, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
      <DemoBanner />
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#123D2B]">
            Get In Touch
          </span>
          <h1 className="text-4xl font-extrabold text-[#123D2B]">
            Contact Stayzy
          </h1>
          <p className="text-sm text-[#5E6E65] max-w-xl">
            Have questions about room availability, group bookings, or long-term corporate coliving? Reach our team directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Property 1: Koramangala */}
          <div className="bg-white p-7 rounded-3xl border border-[#E8E6DF] space-y-4 shadow-sm">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E8F1D5] text-[#123D2B]">
              Koramangala Property
            </span>
            <h3 className="text-lg font-bold text-[#192621]">Stayzy Haven</h3>

            <div className="space-y-2.5 text-xs text-[#5E6E65]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#123D2B] shrink-0 mt-0.5" />
                <span>Plot 42, 4th Block, 80 Feet Road, Near Sony Signal, Koramangala 560034</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#123D2B] shrink-0" />
                <span>+91 80 4567 8900</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#123D2B] shrink-0" />
                <span>koramangala@stayzy.in</span>
              </div>
            </div>
          </div>

          {/* Property 2: HSR Layout */}
          <div className="bg-white p-7 rounded-3xl border border-[#E8E6DF] space-y-4 shadow-sm">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E8F1D5] text-[#123D2B]">
              HSR Layout Property
            </span>
            <h3 className="text-lg font-bold text-[#192621]">Stayzy Heights</h3>

            <div className="space-y-2.5 text-xs text-[#5E6E65]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#123D2B] shrink-0 mt-0.5" />
                <span>189, 17th Cross, Sector 2, Near 27th Main, HSR Layout 560102</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#123D2B] shrink-0" />
                <span>+91 80 4567 8901</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#123D2B] shrink-0" />
                <span>hsr@stayzy.in</span>
              </div>
            </div>
          </div>

          {/* Property 3: Indiranagar */}
          <div className="bg-white p-7 rounded-3xl border border-[#E8E6DF] space-y-4 shadow-sm">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E8F1D5] text-[#123D2B]">
              Indiranagar Property
            </span>
            <h3 className="text-lg font-bold text-[#192621]">Stayzy Urban</h3>

            <div className="space-y-2.5 text-xs text-[#5E6E65]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#123D2B] shrink-0 mt-0.5" />
                <span>712, 12th Main Road, HAL 2nd Stage, Off 100ft Rd, Indiranagar 560038</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#123D2B] shrink-0" />
                <span>+91 80 4567 8902</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#123D2B] shrink-0" />
                <span>indiranagar@stayzy.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours Note */}
        <div className="p-6 rounded-2xl bg-[#F3EFE6] border border-[#E8E6DF] text-xs text-[#5E6E65] flex items-center gap-3">
          <Clock className="w-5 h-5 text-[#123D2B] shrink-0" />
          <span>
            <strong>Front Desk & Visit Hours: </strong>10:00 AM to 7:30 PM (Monday through Sunday). Residents enjoy 24/7 keyless biometric access.
          </span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
