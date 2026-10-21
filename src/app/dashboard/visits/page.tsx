"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, CheckCircle2, PlusCircle, X, Sparkles } from "lucide-react";

export function DashboardVisitsContent() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    propertyId: "stayzy-haven-koramangala",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    preferredDate: new Date().toISOString().split("T")[0],
    timeSlot: "11:00 AM - 01:00 PM",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/visits/my");
      const json = await res.json();
      if (json.success) {
        setVisits(json.visits || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/visits/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to schedule visit.");
      }
      alert(data.message);
      setModalOpen(false);
      loadVisits();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#123D2B]">Property Walkthroughs</h1>
          <p className="text-xs text-[#5E6E65] mt-0.5">
            View scheduled visits or book a guided in-person tour of our spaces.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] transition-colors self-start"
        >
          <PlusCircle className="w-4 h-4" />
          Schedule New Visit
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 sm:p-8 shadow-soft space-y-6">
        <h2 className="text-base font-bold text-[#123D2B]">My Tour Requests</h2>

        {loading ? (
          <p className="text-xs text-[#5E6E65]">Loading visits...</p>
        ) : visits.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#5E6E65] space-y-3">
            <p>You haven’t scheduled any property walkthroughs yet.</p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#123D2B] text-white text-xs font-bold"
            >
              Book a Free Walkthrough
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visits.map((v) => (
              <div
                key={v.id}
                className="p-5 rounded-2xl border border-[#E8E6DF] bg-[#FAF8F5] space-y-3 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#192621]">
                      {v.property.name}
                    </h3>
                    <p className="text-[#5E6E65] text-[11px] mt-0.5">{v.property.address}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      v.status === "CONFIRMED"
                        ? "bg-[#E8F1D5] text-[#123D2B]"
                        : v.status === "COMPLETED"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>

                <div className="space-y-1 text-[#4A5550]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#123D2B]" />
                    <span>
                      {new Date(v.preferredDate).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#123D2B]" />
                    <span>{v.timeSlot}</span>
                  </div>
                </div>

                {v.notes && (
                  <p className="p-2.5 rounded-xl bg-white border border-[#E8E6DF] text-[11px] text-[#5E6E65]">
                    Note: {v.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-[#123D2B]">Schedule Property Visit</h3>

            <form onSubmit={handleScheduleVisit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5E6E65] block mb-1">Location</label>
                <select
                  value={form.propertyId}
                  onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                >
                  <option value="stayzy-haven-koramangala">Stayzy Haven (Koramangala)</option>
                  <option value="stayzy-heights-hsr-layout">Stayzy Heights (HSR Layout)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#5E6E65] block mb-1">Full Name</label>
                  <input
                    required
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5E6E65] block mb-1">Mobile Phone</label>
                  <input
                    required
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#5E6E65] block mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={form.preferredDate}
                    onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5E6E65] block mb-1">Time Slot</label>
                  <select
                    value={form.timeSlot}
                    onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  >
                    <option>10:00 AM - 12:00 PM</option>
                    <option>12:00 PM - 03:00 PM</option>
                    <option>03:00 PM - 06:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5E6E65] block mb-1">Questions / Notes</label>
                <input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Would like to see twin sharing rooms"
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-[#123D2B] text-white font-bold text-xs hover:bg-[#0E2F21] mt-2 cursor-pointer"
              >
                {submitting ? "Booking Slot..." : "Confirm Free Tour Slot"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardVisitsPage() {
  return <DashboardVisitsContent />;
}
