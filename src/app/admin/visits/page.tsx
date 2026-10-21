"use client";

import React, { useState, useEffect } from "react";
import {
  DoorOpen,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Building2,
  Sparkles,
} from "lucide-react";

export default function AdminVisitsPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchVisits = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/visits");
      const data = await res.json();
      if (data.success) {
        setVisits(data.visits || []);
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
    fetchVisits();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/visits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchVisits();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = visits.filter((v) => {
    if (filterStatus !== "ALL" && v.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E6DF] gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#123D2B] uppercase tracking-wider">
            Property Walkthrough Tours
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D2B] mt-0.5">
            Visit Requests & Scheduling
          </h1>
          <p className="text-xs text-[#5E6E65] mt-1">
            Manage scheduled customer property tours, confirm appointments, and track visit completions.
          </p>
        </div>

        <button
          onClick={fetchVisits}
          className="p-2.5 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] hover:bg-[#FAF8F5] self-start sm:self-auto"
          title="Refresh visits"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E6DF] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {["ALL", "SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === s
                  ? "bg-[#123D2B] text-[#E8F1D5]"
                  : "text-[#5E6E65] hover:bg-[#FAF8F5]"
              }`}
            >
              {s === "ALL" ? "All Requests" : s}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-[#123D2B]">
          {filtered.length} Visits Listed
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-[#5E6E65] bg-white rounded-3xl border border-[#E8E6DF]">
          Loading tour requests from database...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-[#E8E6DF]">
          <DoorOpen className="w-12 h-12 text-[#7B8B82] mx-auto" />
          <h3 className="text-base font-bold text-[#123D2B]">No visit requests match criteria</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((v) => {
            let statusBadge = (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                Requested
              </span>
            );

            if (v.status === "CONFIRMED") {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  Confirmed
                </span>
              );
            } else if (v.status === "COMPLETED") {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Completed
                </span>
              );
            } else if (v.status === "CANCELLED") {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                  Cancelled
                </span>
              );
            }

            return (
              <div
                key={v.id}
                className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-card flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#7B8B82] uppercase block">
                        {v.property?.name}
                      </span>
                      <h3 className="text-base font-extrabold text-[#123D2B] mt-0.5">
                        {v.customerName}
                      </h3>
                    </div>
                    {statusBadge}
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-[#5E6E65]">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#123D2B]" />
                      <span>{v.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#123D2B]" />
                      <span>{v.customerEmail}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#123D2B]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#123D2B]" />
                        <span>{new Date(v.preferredDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#5E6E65]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{v.timeSlot}</span>
                      </div>
                    </div>

                    {v.notes && (
                      <div className="text-[11px] text-[#5E6E65] pt-1 border-t border-[#E8E6DF]">
                        <span className="font-bold text-[#123D2B] mr-1">Resident Note:</span>
                        {v.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#F0EDE4] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] text-[#7B8B82]">
                    Requested on {new Date(v.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {v.status === "SCHEDULED" && (
                      <button
                        onClick={() => handleUpdateStatus(v.id, "CONFIRMED")}
                        className="px-3 py-1.5 rounded-xl bg-[#123D2B] text-white text-[11px] font-bold hover:bg-[#0E2F21]"
                      >
                        Confirm Slot
                      </button>
                    )}

                    {v.status === "CONFIRMED" && (
                      <button
                        onClick={() => handleUpdateStatus(v.id, "COMPLETED")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-[11px] font-bold hover:bg-emerald-800"
                      >
                        Mark Completed
                      </button>
                    )}

                    {v.status !== "CANCELLED" && v.status !== "COMPLETED" && (
                      <button
                        onClick={() => handleUpdateStatus(v.id, "CANCELLED")}
                        className="px-3 py-1.5 rounded-xl border border-red-200 text-red-700 text-[11px] font-bold hover:bg-red-50"
                      >
                        Decline
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
