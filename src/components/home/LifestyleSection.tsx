"use client";

import React from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { BedDouble, Laptop, Clock, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export function LifestyleSection() {
  const points = [
    {
      title: "Comfortable living",
      desc: "Ergonomic beds with orthopedic mattresses, crisp white linens, attached bathrooms with instant geysers, and regular housekeeping.",
      icon: BedDouble,
    },
    {
      title: "Study & work spaces",
      desc: "Dedicated personal workstations in private suites, high-speed 300 Mbps dual fiber Wi-Fi, and 100% generator power backup.",
      icon: Laptop,
    },
    {
      title: "Flexible stay durations",
      desc: "Stay for 3 hours between meetings, 10 days on a work sprint, or a full year with predictable monthly rent and no lock-in traps.",
      icon: Clock,
    },
    {
      title: "Transparent pricing",
      desc: "Zero broker commission, clear GST breakdowns, utility fees accounted for, and 100% refundable deposits returned within 3-5 days.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-24 bg-white border-y border-[#E8E6DF] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Room & Workspace Photographic Display */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-card-hover border border-[#E8E6DF] aspect-[4/3] sm:aspect-[16/11]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80"
                alt="Stayzy Room & Ergonomic Workspace with Natural Daylight"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

              {/* Floating Lifestyle Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8E6DF] shadow-soft flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold tracking-widest text-[#123D2B] uppercase">
                    Modern Coliving
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-[#192621]">
                    Built for focused professionals & university students
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#E8F1D5] flex items-center justify-center text-[#123D2B] shrink-0 ml-3">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Decorative background accent */}
            <div className="absolute -top-6 -left-6 w-36 h-36 bg-[#E8F1D5]/40 rounded-full blur-2xl -z-10" />
            <div className="absolute -bottom-6 -right-6 w-44 h-44 bg-[#123D2B]/10 rounded-full blur-2xl -z-10" />
          </div>

          {/* Right: Headline and 4 Helpful Points */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#123D2B] bg-[#E8F1D5] px-3.5 py-1.5 rounded-full inline-block">
                Stayzy Philosophy
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#123D2B] tracking-tight leading-[1.15]">
                Room to rest. <br />
                <span className="text-[#192621]">Space to grow.</span>
              </h2>
              <p className="text-sm sm:text-base text-[#5E6E65] leading-relaxed pt-1">
                We believe your living space should bring clarity, not stress. That is why every Stayzy property is designed to balance deep quiet rest with productive study and work.
              </p>
            </div>

            {/* 4 Feature Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {points.map((pt, idx) => {
                const Icon = pt.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-2 hover:border-[#123D2B]/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#E8F1D5] text-[#123D2B] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[#192621]">{pt.title}</h3>
                    <p className="text-xs text-[#5E6E65] leading-relaxed">{pt.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/rooms"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#123D2B] text-white font-bold text-sm hover:bg-[#0E2F21] shadow-sm transition-all hover:shadow cursor-pointer"
              >
                <span>Explore Stays</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#schedule-visit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] font-bold text-sm hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <span>Schedule a Walkthrough</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
