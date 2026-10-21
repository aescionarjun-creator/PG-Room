import React from "react";
import { Compass, CalendarCheck, CheckCircle2, ShieldCheck } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Choose your stay",
    desc: "Browse curated private suites or shared PG beds with genuine photographs, amenities, and room configurations.",
    icon: Compass,
  },
  {
    step: "02",
    title: "Select your dates",
    desc: "Pick hourly, daily, weekly, monthly, or yearly schedules with transparent rates and live bed-level availability.",
    icon: CalendarCheck,
  },
  {
    step: "03",
    title: "Review and book",
    desc: "Lock your space with an instant 15-minute hold, zero brokerage, and receive your digital keyless access instructions.",
    icon: CheckCircle2,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white border-y border-[#E8E6DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#123D2B] bg-[#E8F1D5] px-3.5 py-1.5 rounded-full inline-block">
            Straightforward Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123D2B] mt-3">
            How booking works
          </h2>
          <p className="text-sm sm:text-base text-[#5E6E65] mt-2">
            No broker negotiations, no confusing hidden charges, and no rigid traditional lease agreements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-[#FAF8F5] p-8 rounded-3xl border border-[#E8E6DF] relative overflow-hidden group hover:border-[#123D2B]/40 hover:bg-white hover:shadow-card-hover transition-all duration-300"
              >
                <div className="text-4xl font-black text-[#123D2B]/15 mb-4 group-hover:text-[#123D2B]/25 transition-colors">
                  {step.step}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#E8F1D5] flex items-center justify-center text-[#123D2B] mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#192621] mb-2">{step.title}</h3>
                <p className="text-sm text-[#5E6E65] leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
