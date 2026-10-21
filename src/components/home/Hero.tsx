"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { ArrowRight, CalendarDays, ShieldCheck, Sparkles } from "lucide-react";

export function Hero() {
  const [content, setContent] = useState({
    smallLabel: "FLEXIBLE STAYS. EVERYDAY COMFORT.",
    headlineLine1: "Find your space.",
    headlineLine2: "Stay your way.",
    supportingText:
      "From a few hours to a whole year, discover comfortable rooms and shared spaces that fit your life.",
    primaryCtaText: "Find a Stay",
    primaryCtaHref: "/rooms",
    secondaryCtaText: "Schedule a Visit",
    secondaryCtaHref: "#schedule-visit",
  });

  useEffect(() => {
    async function loadCMS() {
      try {
        const res = await fetch("/api/content");
        const data = await res.json();
        if (data.success && data.content?.hero_content) {
          setContent((prev) => ({ ...prev, ...data.content.hero_content }));
        }
      } catch (e) {
        // Fallback to static defaults
      }
    }
    loadCMS();
  }, []);

  return (
    <section className="relative w-full min-h-[85vh] lg:min-h-[88vh] flex flex-col justify-center overflow-hidden">
      {/* Edge-to-edge Background Image */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2400&q=85"
          alt="Stayzy Premium Bright Bedroom with White Linen, Teak Wooden Furniture, Plants, and Study Desk"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_35%]"
        />

        {/* Responsive Dual Gradient Overlays:
            1. Strong left-to-right dark gradient for maximum text contrast and legibility
            2. Subtle vertical vignette to smoothly blend into the header and bottom search panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30 lg:from-black/85 lg:via-black/55 lg:to-black/20" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {/* Hero Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-24 sm:pt-40 sm:pb-32 lg:pt-44 lg:pb-36">
        <div className="max-w-2xl space-y-6">
          {/* Small Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F1D5] text-[#123D2B] text-xs font-extrabold tracking-wider uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{content.smallLabel}</span>
          </div>

          {/* Left-aligned Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-md">
            {content.headlineLine1} <br />
            <span className="text-[#E8F1D5]">{content.headlineLine2}</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-xl leading-relaxed drop-shadow-sm font-medium">
            {content.supportingText}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={content.primaryCtaHref}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#E8F1D5] text-[#123D2B] font-extrabold text-base hover:bg-white shadow-md transition-all hover:shadow-lg cursor-pointer"
            >
              <span>{content.primaryCtaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={content.secondaryCtaHref}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/30 bg-black/35 backdrop-blur-md text-white font-bold text-base hover:bg-white/20 transition-all cursor-pointer"
            >
              <CalendarDays className="w-4 h-4 text-[#E8F1D5]" />
              <span>{content.secondaryCtaText}</span>
            </Link>
          </div>

          {/* Realistic Property Guarantees */}
          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-white/80 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#E8F1D5]" />
              <span>Zero Hidden Brokerage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#E8F1D5]" />
              <span>100% Refundable Security Deposit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#E8F1D5]" />
              <span>Daily Housekeeping Included</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
