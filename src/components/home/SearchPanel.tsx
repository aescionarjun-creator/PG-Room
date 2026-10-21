"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Calendar,
  CalendarDays,
  CalendarRange,
  Sparkles,
  MapPin,
  Users,
  Search,
  ArrowRight,
  Info,
} from "lucide-react";
import { DurationType } from "@/lib/types";

const DURATION_TABS: { id: DurationType; label: string; icon: any; tagline: string }[] = [
  { id: "HOURLY", label: "Hourly", icon: Clock, tagline: "1 to 10 hrs day-work or rest" },
  { id: "DAILY", label: "Daily", icon: Calendar, tagline: "Overnight stays & short trips" },
  { id: "WEEKLY", label: "Weekly", icon: CalendarDays, tagline: "Discounted 7+ days packages" },
  { id: "MONTHLY", label: "Monthly", icon: CalendarRange, tagline: "Flexible PG co-living (1+ mo)" },
  { id: "YEARLY", label: "Yearly", icon: Sparkles, tagline: "Guaranteed lowest annual rate" },
];

export function SearchPanel() {
  const router = useRouter();
  const [selectedDuration, setSelectedDuration] = useState<DurationType>("MONTHLY");

  // Form states
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState("10:00");
  const [durationCount, setDurationCount] = useState(1);
  const [propertyId, setPropertyId] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [guests, setGuests] = useState(1);

  // Derived checkout calculation preview
  const getCalculatedCheckout = () => {
    if (!startDate) return "";
    const [y, m, d] = startDate.split("-").map(Number);
    if (!y || !m || !d) return "";

    if (selectedDuration === "HOURLY") {
      const [h, min] = startTime.split(":").map(Number);
      const startD = new Date(y, m - 1, d, h || 10, min || 0);
      const endD = new Date(startD.getTime() + durationCount * 60 * 60 * 1000);
      return `Check out at ${endD.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (same day)`;
    } else if (selectedDuration === "DAILY") {
      const endD = new Date(y, m - 1, d + Number(durationCount));
      return `Check out ${endD.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} at 11:00 AM (${durationCount} night${durationCount > 1 ? "s" : ""})`;
    } else if (selectedDuration === "WEEKLY") {
      const endD = new Date(y, m - 1, d + Number(durationCount) * 7);
      return `Check out ${endD.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} at 11:00 AM (${durationCount * 7} days)`;
    } else if (selectedDuration === "MONTHLY") {
      const targetMonthIndex = (m - 1) + Number(durationCount);
      const targetYear = y + Math.floor(targetMonthIndex / 12);
      const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
      const daysInTarget = new Date(targetYear, normalizedMonth + 1, 0).getDate();
      const targetDay = Math.min(d, daysInTarget);
      const endD = new Date(targetYear, normalizedMonth, targetDay);
      return `Check out ${endD.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} at 11:00 AM (${durationCount} calendar mo)`;
    } else if (selectedDuration === "YEARLY") {
      const endD = new Date(y + durationCount, m - 1, d);
      return `${durationCount}-Year term ending ${endD.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
    }
    return "";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("durationType", selectedDuration);
    params.set("startDate", startDate);
    params.set("startTime", startTime);
    params.set("durationCount", String(durationCount));
    if (propertyId !== "ALL") params.set("propertyId", propertyId);
    if (category !== "ALL") params.set("category", category);
    params.set("guests", String(guests));

    router.push(`/rooms?${params.toString()}`);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-[#E8E6DF] shadow-2xl overflow-hidden transition-all">
      {/* Duration Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 border-b border-[#E8E6DF] bg-[#FAF8F5]">
        {DURATION_TABS.map((tab) => {
          const isSelected = selectedDuration === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedDuration(tab.id);
                if (tab.id === "HOURLY") {
                  setDurationCount(3);
                } else {
                  setDurationCount(1);
                }
              }}
              className={`flex flex-col items-center justify-center py-4 px-3 text-center transition-all cursor-pointer border-r border-[#E8E6DF] last:border-r-0 ${
                isSelected
                  ? "bg-white text-[#123D2B] font-extrabold shadow-sm border-b-2 border-b-[#123D2B]"
                  : "text-[#5E6E65] hover:text-[#123D2B] hover:bg-[#F2EFE8]"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`w-4 h-4 ${isSelected ? "text-[#123D2B]" : "text-[#7B8B82]"}`} />
                <span className="text-sm tracking-tight">{tab.label}</span>
              </div>
              <span className="text-[11px] font-medium text-[#7B8B82] hidden lg:block mt-0.5">
                {tab.tagline}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Search Form */}
      <form onSubmit={handleSearch} className="p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Location / Property Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#5E6E65] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#123D2B]" />
              Location
            </label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full h-12 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-semibold text-[#192621] focus:outline-none focus:ring-2 focus:ring-[#123D2B]/20 focus:border-[#123D2B] transition-all"
            >
              <option value="ALL">All Bengaluru (3 Hubs)</option>
              <option value="stayzy-haven-koramangala">Koramangala (80ft Rd)</option>
              <option value="stayzy-heights-hsr-layout">HSR Layout (Sector 2)</option>
              <option value="stayzy-urban-indiranagar">Indiranagar (100ft Rd)</option>
            </select>
          </div>

          {/* 2. Check-In Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#5E6E65] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#123D2B]" />
              {selectedDuration === "HOURLY"
                ? "Date"
                : selectedDuration === "DAILY"
                ? "Check-In"
                : selectedDuration === "WEEKLY"
                ? "Start Date"
                : "Move-In Date"}
            </label>
            <input
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-12 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-semibold text-[#192621] focus:outline-none focus:ring-2 focus:ring-[#123D2B]/20 focus:border-[#123D2B] transition-all"
            />
          </div>

          {/* 3. Duration-specific parameter */}
          {selectedDuration === "HOURLY" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5E6E65] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#123D2B]" />
                Start & Duration
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="time"
                  value={startTime}
                  min="08:00"
                  max="20:00"
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full h-12 px-2 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs text-[#192621] font-semibold"
                />
                <select
                  value={durationCount}
                  onChange={(e) => setDurationCount(Number(e.target.value))}
                  className="w-full h-12 px-2 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs text-[#192621] font-semibold"
                >
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours</option>
                  <option value={4}>4 Hours</option>
                  <option value={6}>6 Hours</option>
                  <option value={8}>8 Hours</option>
                  <option value={10}>10 Hours</option>
                </select>
              </div>
            </div>
          ) : selectedDuration === "DAILY" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5E6E65] flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-[#123D2B]" />
                Nights
              </label>
              <select
                value={durationCount}
                onChange={(e) => setDurationCount(Number(e.target.value))}
                className="w-full h-12 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-semibold text-[#192621]"
              >
                <option value={1}>1 Night</option>
                <option value={2}>2 Nights</option>
                <option value={3}>3 Nights</option>
                <option value={4}>4 Nights</option>
                <option value={5}>5 Nights</option>
                <option value={7}>7 Nights</option>
                <option value={14}>14 Nights</option>
              </select>
            </div>
          ) : selectedDuration === "WEEKLY" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5E6E65] flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-[#123D2B]" />
                Number of Weeks
              </label>
              <select
                value={durationCount}
                onChange={(e) => setDurationCount(Number(e.target.value))}
                className="w-full h-12 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-semibold text-[#192621]"
              >
                <option value={1}>1 Week (7 Days)</option>
                <option value={2}>2 Weeks (14 Days)</option>
                <option value={3}>3 Weeks (21 Days)</option>
                <option value={4}>4 Weeks (28 Days)</option>
              </select>
            </div>
          ) : selectedDuration === "MONTHLY" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5E6E65] flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-[#123D2B]" />
                Months
              </label>
              <select
                value={durationCount}
                onChange={(e) => setDurationCount(Number(e.target.value))}
                className="w-full h-12 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-semibold text-[#192621]"
              >
                <option value={1}>1 Calendar Month</option>
                <option value={2}>2 Calendar Months</option>
                <option value={3}>3 Calendar Months</option>
                <option value={6}>6 Calendar Months</option>
                <option value={9}>9 Calendar Months</option>
                <option value={11}>11 Calendar Months</option>
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5E6E65] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#123D2B]" />
                Annual Term
              </label>
              <select
                value={durationCount}
                onChange={(e) => setDurationCount(Number(e.target.value))}
                className="w-full h-12 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-semibold text-[#192621]"
              >
                <option value={1}>1 Year (12 Months)</option>
                <option value={2}>2 Years (24 Months)</option>
                <option value={3}>3 Years (36 Months)</option>
              </select>
            </div>
          )}

          {/* 4. Room Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#5E6E65] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#123D2B]" />
              Room Type
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-12 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-semibold text-[#192621]"
            >
              <option value="ALL">All Categories</option>
              <option value="PRIVATE">Single Private Suite / Pod</option>
              <option value="TWIN_SHARING">Twin Sharing (2 Beds)</option>
              <option value="TRIPLE_SHARING">Triple Sharing (3 Beds)</option>
            </select>
          </div>

          {/* 5. Guests */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#5E6E65] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#123D2B]" />
              Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full h-12 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-semibold text-[#192621]"
            >
              <option value={1}>1 Resident Guest</option>
              <option value={2}>2 Guests</option>
              <option value={3}>3 Guests</option>
            </select>
          </div>
        </div>

        {/* Calculated Info Strip & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#F0EDE4]">
          <div className="flex items-center gap-2 text-xs font-medium text-[#5E6E65]">
            <Info className="w-4 h-4 text-[#123D2B] shrink-0" />
            <span>
              <strong className="text-[#192621]">Calculation: </strong>
              {getCalculatedCheckout()}
            </span>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#123D2B] text-white font-bold text-sm hover:bg-[#0E2F21] shadow-sm transition-all hover:shadow cursor-pointer"
          >
            <Search className="w-4 h-4" />
            Find My Stay
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </form>
    </div>
  );
}
