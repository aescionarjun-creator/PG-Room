"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Building2,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function AdminCalendarPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date range anchor (today + 10 days)
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const numDays = 10;
  const days = Array.from({ length: numDays }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/calendar?propertyId=${selectedPropertyId}`);
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties || []);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [selectedPropertyId]);

  const handlePrev = () => {
    setStartDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNext = () => {
    setStartDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const handleToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setStartDate(d);
  };

  // Flatten all units from the loaded properties
  const unitRows: any[] = [];
  properties.forEach((prop) => {
    prop.roomTypes?.forEach((rt: any) => {
      rt.rooms?.forEach((room: any) => {
        room.inventoryUnits?.forEach((u: any) => {
          unitRows.push({
            ...u,
            roomNumber: room.roomNumber,
            roomTypeName: rt.name,
            propertyName: prop.name,
          });
        });
      });
    });
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E6DF] gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#123D2B] uppercase tracking-wider">
            Visual Occupancy Matrix
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D2B] mt-0.5">
            Room & Bed Calendar
          </h1>
          <p className="text-xs text-[#5E6E65] mt-1">
            Real-time timeline across physical rooms and beds showing confirmed stays, holds, and maintenance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-2 rounded-xl border border-[#D5D2C7] bg-white text-xs font-bold text-[#123D2B] hover:bg-[#FAF8F5]"
          >
            Today
          </button>
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] hover:bg-[#FAF8F5]"
            title="Previous 7 days"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] hover:bg-[#FAF8F5]"
            title="Next 7 days"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={fetchCalendar}
            className="p-2 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] hover:bg-[#FAF8F5]"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E6DF] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-[#5E6E65] mr-2">Legend:</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#123D2B] text-[#E8F1D5] font-bold text-[10px]">
            <CheckCircle2 className="w-3 h-3" /> Confirmed Stay
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-[10px]">
            <Clock className="w-3 h-3" /> Active Hold (15m)
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-100 text-red-800 font-bold text-[10px]">
            <Wrench className="w-3 h-3" /> Maintenance / Cleaning
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
            Available
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#5E6E65]">
          <Building2 className="w-4 h-4 text-[#123D2B]" />
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="h-9 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-semibold"
          >
            <option value="ALL">All Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#5E6E65] bg-white rounded-3xl border border-[#E8E6DF]">
          Rendering occupancy matrix...
        </div>
      ) : unitRows.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#5E6E65] bg-white rounded-3xl border border-[#E8E6DF]">
          No inventory units found for the selected property.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E8E6DF] overflow-x-auto shadow-card">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E6DF]">
                <th className="py-3 px-4 font-extrabold text-[#7B8B82] uppercase text-[10px] min-w-[200px] sticky left-0 bg-[#FAF8F5] z-10">
                  Unit / Bed
                </th>
                {days.map((day, i) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  return (
                    <th
                      key={i}
                      className={`py-3 px-3 text-center border-l border-[#E8E6DF] font-bold text-[11px] min-w-[90px] ${
                        isToday ? "bg-[#E8F1D5]/40 text-[#123D2B]" : "text-[#5E6E65]"
                      }`}
                    >
                      <div className="text-[10px] uppercase font-extrabold text-[#7B8B82]">
                        {day.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div className={`text-xs ${isToday ? "font-black text-[#123D2B]" : ""}`}>
                        {day.getDate()} {day.toLocaleDateString("en-US", { month: "short" })}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE4]">
              {unitRows.map((unit) => (
                <tr key={unit.id} className="hover:bg-[#FAF8F5]/60">
                  <td className="py-3.5 px-4 sticky left-0 bg-white hover:bg-[#FAF8F5] z-10 border-r border-[#E8E6DF]">
                    <span className="font-extrabold text-[#123D2B] block text-xs">
                      {unit.roomNumber} - {unit.identifier}
                    </span>
                    <span className="text-[10px] text-[#7B8B82] block truncate max-w-[180px]">
                      {unit.roomTypeName}
                    </span>
                  </td>

                  {days.map((day, i) => {
                    const dayStart = new Date(day);
                    dayStart.setHours(0, 0, 0, 0);
                    const dayEnd = new Date(day);
                    dayEnd.setHours(23, 59, 59, 999);

                    // Check if occupied by a booking
                    const matchingBooking = unit.bookings?.find((b: any) => {
                      const bStart = new Date(b.startTime);
                      const bEnd = new Date(b.endTime);
                      return bStart <= dayEnd && bEnd >= dayStart;
                    });

                    // Check if blocked
                    const matchingBlock = unit.availabilityBlocks?.find((blk: any) => {
                      const blkStart = new Date(blk.startTime);
                      const blkEnd = new Date(blk.endTime);
                      return blkStart <= dayEnd && blkEnd >= dayStart;
                    });

                    // Check hold
                    const matchingHold = unit.inventoryHolds?.find((h: any) => {
                      const hStart = new Date(h.startTime);
                      const hEnd = new Date(h.endTime);
                      return hStart <= dayEnd && hEnd >= dayStart;
                    });

                    let cellContent = (
                      <div className="h-9 rounded-lg bg-emerald-50/50 flex items-center justify-center text-[10px] text-emerald-700 font-semibold">
                        Free
                      </div>
                    );

                    if (matchingBlock) {
                      cellContent = (
                        <div
                          className="h-9 rounded-lg bg-red-100 text-red-800 p-1 flex flex-col items-center justify-center text-[9px] font-bold leading-tight"
                          title={`Blocked: ${matchingBlock.reason} - ${matchingBlock.notes || ""}`}
                        >
                          <Wrench className="w-3 h-3 mb-0.5" />
                          <span>{matchingBlock.reason}</span>
                        </div>
                      );
                    } else if (matchingBooking) {
                      cellContent = (
                        <Link
                          href={`/admin/bookings/${matchingBooking.id}`}
                          className="h-9 rounded-lg bg-[#123D2B] text-[#E8F1D5] p-1 flex flex-col items-center justify-center text-[9px] font-bold leading-tight hover:bg-[#0E2F21] transition-colors"
                          title={`Stay by ${matchingBooking.guestName || "Guest"} (${matchingBooking.bookingReference})`}
                        >
                          <span className="truncate max-w-[80px]">
                            {matchingBooking.guestName?.split(" ")[0]}
                          </span>
                          <span className="text-[8px] opacity-80">{matchingBooking.durationType}</span>
                        </Link>
                      );
                    } else if (matchingHold) {
                      cellContent = (
                        <div
                          className="h-9 rounded-lg bg-amber-100 text-amber-900 p-1 flex flex-col items-center justify-center text-[9px] font-bold leading-tight animate-pulse"
                          title="Checkout Hold in progress"
                        >
                          <Clock className="w-3 h-3 mb-0.5" />
                          <span>Hold</span>
                        </div>
                      );
                    }

                    return (
                      <td key={i} className="py-2 px-2 text-center border-l border-[#F0EDE4]">
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
