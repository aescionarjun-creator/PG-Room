import React from "react";
import { DemoBanner } from "@/components/common/DemoBanner";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AlertCircle, CheckCircle2, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
      <DemoBanner />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div className="space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#123D2B]">
            Fair & Transparent Living
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123D2B]">
            Stayzy Cancellation & Refund Policy
          </h1>
          <p className="text-sm text-[#5E6E65] leading-relaxed">
            We believe in honest, predictable policies without hidden lock-in penalties or surprise forfeiture clauses.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#E8F1D5] text-[#123D2B] text-xs font-semibold flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>
            Security deposits for all monthly and yearly stays are 100% refundable upon move-out inspection.
          </span>
        </div>

        {/* Breakdown Card */}
        <div className="bg-white rounded-3xl border border-[#E8E6DF] p-8 shadow-sm space-y-8 text-xs text-[#4A5550] leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#192621] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#123D2B]" />
              Cancellation Refund Schedule
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-2">
                <span className="text-sm font-extrabold text-[#123D2B] block">48+ Hours Notice</span>
                <span className="font-bold text-xs text-green-700 block">100% Full Refund</span>
                <p className="text-[11px] text-[#5E6E65]">
                  Full refund of both base tariff and security deposit, returned to your original payment method.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-2">
                <span className="text-sm font-extrabold text-[#123D2B] block">24 to 48 Hours Notice</span>
                <span className="font-bold text-xs text-amber-700 block">50% Rent + 100% Deposit</span>
                <p className="text-[11px] text-[#5E6E65]">
                  50% of the initial period base rent is refunded, and 100% of the security deposit is returned.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-2">
                <span className="text-sm font-extrabold text-[#123D2B] block">Under 24 Hours Notice</span>
                <span className="font-bold text-xs text-[#123D2B] block">100% Deposit Refund</span>
                <p className="text-[11px] text-[#5E6E65]">
                  100% of the security deposit is returned; the initial period rent is retained to cover pre-allocated housekeeping buffers.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#F0EDE4]">
            <h2 className="text-base font-bold text-[#192621]">Monthly Stay Move-Out Notice</h2>
            <p>
              For monthly co-living residents, a simple 15-day notice prior to your calendar month end date is required. No long-term lock-in or brokerage fees apply.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#F0EDE4]">
            <h2 className="text-base font-bold text-[#192621]">How Refunds Are Processed</h2>
            <p>
              Cancellation and refund requests can be triggered directly with one click from your{" "}
              <Link href="/dashboard/bookings" className="text-[#123D2B] font-bold underline">
                Resident Dashboard
              </Link>
              . Approved refunds are credited back to the source bank card or UPI account within 3 to 5 business days.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
