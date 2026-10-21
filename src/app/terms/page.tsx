import React from "react";
import { DemoBanner } from "@/components/common/DemoBanner";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AlertTriangle } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
      <DemoBanner />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>
            <strong>Draft Policy Document: </strong>This is template text intended for the property owner and legal counsel to review and adapt prior to commercial operations.
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-[#123D2B]">
          Stayzy Booking & Cancellation Terms
        </h1>

        <div className="bg-white p-8 rounded-3xl border border-[#E8E6DF] space-y-6 text-xs text-[#4A5550] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#192621]">1. Reservation & Payment Policy</h2>
            <p>
              Rooms and individual beds are confirmed upon payment of the payable amount (base tariff, applicable GST, and refundable security deposit). A 15-minute temporary hold is maintained during checkout to guarantee inventory availability.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#192621]">2. Calendar Month & Year Calculation</h2>
            <p>
              Monthly stays run on true calendar months (e.g. from the 15th of month A to the 15th of month B). In cases where the check-in day exceeds the days in the following month (e.g. January 31), checkout automatically aligns to the final day of the target month (e.g. February 28).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#192621]">3. Cancellation & Refund Scale</h2>
            <p>
              • <strong>48+ Hours Notice: </strong>Full refund (100% of tariff and security deposit).
              <br />
              • <strong>24 to 48 Hours Notice: </strong>50% base rent refund + 100% deposit refund.
              <br />
              • <strong>Under 24 Hours: </strong>100% deposit refund; base period tariff retained to cover cleaning buffers and blocked reservations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#192621]">4. Security Deposit Refund</h2>
            <p>
              Refundable deposits are processed back to the source bank account within 3 to 5 business days after physical move-out inspection and settlement of any metered electricity dues.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#192621]">5. House Rules & Conduct</h2>
            <p>
              Quiet hours are observed between 10:30 PM and 6:30 AM. Non-residents are permitted in common areas until 8:00 PM. Residents agree to respect communal peace, maintain cleanliness, and comply with safety and fire regulations.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
