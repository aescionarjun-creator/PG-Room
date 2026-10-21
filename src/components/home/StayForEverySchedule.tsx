"use client";

import React from "react";
import Link from "next/link";
import { Clock, Calendar, CalendarDays, CalendarRange, Sparkles, ArrowRight } from "lucide-react";
import { DurationType } from "@/lib/types";

interface ScheduleOption {
  id: DurationType;
  title: string;
  tagline: string;
  badge: string;
  description: string;
  startingPrice: string;
  icon: any;
  highlight?: boolean;
}

const SCHEDULE_OPTIONS: ScheduleOption[] = [
  {
    id: "HOURLY",
    title: "A Few Hours",
    tagline: "Day-Work & Layover",
    badge: "2 to 10 Hours",
    description: "High-speed Wi-Fi, quiet work desk, and full shower/rest facilities between flights or meetings.",
    startingPrice: "₹180 / hr",
    icon: Clock,
  },
  {
    id: "DAILY",
    title: "A Day or Two",
    tagline: "Short City Stays",
    badge: "1 to 14 Nights",
    description: "Comfortable overnight private room with fresh breakfast, clean linens, and daily housekeeping.",
    startingPrice: "₹750 / night",
    icon: Calendar,
  },
  {
    id: "WEEKLY",
    title: "A Week Away",
    tagline: "Project Sprints",
    badge: "7+ Days Package",
    description: "Discounted weekly packages for remote sprints, city transitions, or exploring a new neighbourhood.",
    startingPrice: "₹4,200 / week",
    icon: CalendarDays,
  },
  {
    id: "MONTHLY",
    title: "A Monthly Home",
    tagline: "Serviced PG Living",
    badge: "1 to 11 Months",
    description: "The complete Stayzy experience: furnished room, 3 meals daily, laundry, Wi-Fi, and community events.",
    startingPrice: "₹8,500 / mo",
    icon: CalendarRange,
    highlight: true,
  },
  {
    id: "YEARLY",
    title: "A Longer Stay",
    tagline: "Annual Lease",
    badge: "12-Month Contract",
    description: "Guaranteed lowest annual tariff, zero rent hikes, priority room selection, and maximum savings.",
    startingPrice: "₹95,000 / yr",
    icon: Sparkles,
  },
];

export function StayForEverySchedule() {
  return (
    <section className="py-20 bg-white border-y border-[#E8E6DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#123D2B] bg-[#E8F1D5] px-3.5 py-1.5 rounded-full inline-block">
            Flexible Living
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123D2B] tracking-tight mt-3">
            A stay for every schedule
          </h2>
          <p className="text-sm sm:text-base text-[#5E6E65] mt-3 leading-relaxed">
            From quick midday layovers to year-long resident living, choose the schedule that matches your life.
          </p>
        </div>

        {/* 5-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {SCHEDULE_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <Link
                key={option.id}
                href={`/rooms?durationType=${option.id}`}
                className={`relative flex flex-col justify-between rounded-3xl p-6 border transition-all duration-300 group hover:-translate-y-1 hover:shadow-card-hover ${
                  option.highlight
                    ? "bg-[#123D2B] text-white border-[#123D2B] shadow-soft"
                    : "bg-[#FAF8F5] text-[#192621] border-[#E8E6DF] hover:border-[#123D2B]/40 hover:bg-white"
                }`}
              >
                {/* Popular Pill */}
                {option.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#E8F1D5] text-[#123D2B] text-[10px] font-extrabold tracking-wider uppercase shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  {/* Icon & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        option.highlight
                          ? "bg-[#E8F1D5] text-[#123D2B]"
                          : "bg-white text-[#123D2B] shadow-xs border border-[#E8E6DF]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        option.highlight
                          ? "bg-white/15 text-[#E8F1D5]"
                          : "bg-[#E8E6DF] text-[#5E6E65]"
                      }`}
                    >
                      {option.badge}
                    </span>
                  </div>

                  <h3
                    className={`text-lg font-extrabold tracking-tight mb-1 ${
                      option.highlight ? "text-white" : "text-[#123D2B]"
                    }`}
                  >
                    {option.title}
                  </h3>
                  <p
                    className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                      option.highlight ? "text-[#E8F1D5]" : "text-[#7B8B82]"
                    }`}
                  >
                    {option.tagline}
                  </p>
                  <p
                    className={`text-xs leading-relaxed ${
                      option.highlight ? "text-white/80" : "text-[#5E6E65]"
                    }`}
                  >
                    {option.description}
                  </p>
                </div>

                {/* Footer price & arrow */}
                <div
                  className={`mt-6 pt-4 border-t flex items-center justify-between ${
                    option.highlight ? "border-white/15" : "border-[#E8E6DF]"
                  }`}
                >
                  <div>
                    <span
                      className={`text-[10px] uppercase font-bold block ${
                        option.highlight ? "text-[#C1D2C5]" : "text-[#7B8B82]"
                      }`}
                    >
                      From
                    </span>
                    <span
                      className={`text-sm font-extrabold ${
                        option.highlight ? "text-[#E8F1D5]" : "text-[#123D2B]"
                      }`}
                    >
                      {option.startingPrice}
                    </span>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 ${
                      option.highlight
                        ? "bg-[#E8F1D5] text-[#123D2B]"
                        : "bg-[#123D2B] text-white"
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
