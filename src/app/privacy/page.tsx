import React from "react";
import { DemoBanner } from "@/components/common/DemoBanner";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
      <DemoBanner />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>
            <strong>Draft Privacy Document: </strong>Editable draft text for owner and legal compliance review.
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-[#123D2B]">
          Stayzy Privacy Policy
        </h1>

        <div className="bg-white p-8 rounded-3xl border border-[#E8E6DF] space-y-6 text-xs text-[#4A5550] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#192621]">1. Information We Collect</h2>
            <p>
              We collect only the information strictly necessary to process your booking and issue digital keyless access: Full Name, Contact Phone, Email Address, and resident special requests. We do not sell or monetize personal information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#192621]">2. Payment Data</h2>
            <p>
              Credit card and UPI credentials are processed securely through PCI-DSS compliant banking partners. Stayzy servers do not store complete bank card numbers or card CVVs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#192621]">3. Security & Biometrics</h2>
            <p>
              Biometric door sensors and entry logs are maintained exclusively for resident physical security and building access management.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#192621]">4. Contact</h2>
            <p>
              For privacy queries or data deletion requests, contact <code>support@stayzy.in</code>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
