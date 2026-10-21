"use client";

import React, { useState } from "react";
import { Calendar, Clock, MapPin, CheckCircle2, User, Phone, Mail, Sparkles } from "lucide-react";

export function ScheduleVisitSection() {
  const [propertyId, setPropertyId] = useState("stayzy-haven-koramangala");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("11:00 AM - 01:00 PM");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Find property ID
      const res = await fetch("/api/visits/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          customerName,
          customerPhone,
          customerEmail,
          preferredDate: preferredDate || new Date().toISOString().split("T")[0],
          timeSlot,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to schedule visit.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="schedule-visit" className="py-20 bg-[#F8F7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#123D2B] rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-card-hover overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left pitch */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F1D5] text-[#123D2B] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Complimentary Property Walkthrough</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Schedule a Visit Before You Decide.
              </h2>
              <p className="text-[#C1D2C5] text-sm leading-relaxed">
                Experience the rooms, test the 300 Mbps Wi-Fi, try the chef’s food sample, and meet your potential roommates. Free and zero obligation.
              </p>

              <div className="space-y-3 pt-2 text-xs text-[#E8F1D5]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E8F1D5]" />
                  <span>Available 7 days a week (10 AM to 7 PM)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E8F1D5]" />
                  <span>Assisted by a dedicated Community Host</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E8F1D5]" />
                  <span>Both in-person and guided live video tours available</span>
                </div>
              </div>
            </div>

            {/* Right form */}
            <div className="lg:col-span-7 bg-white text-[#192621] p-6 sm:p-8 rounded-2xl shadow-sm">
              {success ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#E8F1D5] text-[#123D2B] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#123D2B]">Visit Scheduled!</h3>
                  <p className="text-sm text-[#5E6E65] max-w-md mx-auto">
                    Thank you, <strong>{customerName}</strong>. Our Stayzy property manager will call you at <strong>{customerPhone}</strong> to confirm your slot.
                  </p>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setCustomerName("");
                      setCustomerPhone("");
                    }}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold"
                  >
                    Schedule Another Visit
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold text-[#123D2B]">Book Your Walkthrough Slot</h3>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5E6E65]">Select Location</label>
                      <select
                        value={propertyId}
                        onChange={(e) => setPropertyId(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-medium focus:ring-2 focus:ring-[#123D2B]/20"
                      >
                        <option value="stayzy-haven-koramangala">Stayzy Haven (Koramangala)</option>
                        <option value="stayzy-heights-hsr-layout">Stayzy Heights (HSR Layout)</option>
                        <option value="stayzy-urban-indiranagar">Stayzy Urban (Indiranagar)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5E6E65]">Preferred Date</label>
                      <input
                        type="date"
                        required
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-medium focus:ring-2 focus:ring-[#123D2B]/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5E6E65]">Time Slot</label>
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-medium focus:ring-2 focus:ring-[#123D2B]/20"
                      >
                        <option value="10:00 AM - 12:00 PM">Morning (10:00 AM - 12:00 PM)</option>
                        <option value="12:00 PM - 03:00 PM">Afternoon (12:00 PM - 03:00 PM)</option>
                        <option value="03:00 PM - 06:00 PM">Evening (03:00 PM - 06:00 PM)</option>
                        <option value="06:00 PM - 08:00 PM">Late Evening (06:00 PM - 08:00 PM)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5E6E65]">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Priya Nair"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-medium focus:ring-2 focus:ring-[#123D2B]/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5E6E65]">Mobile Phone</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-medium focus:ring-2 focus:ring-[#123D2B]/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5E6E65]">Email Address (Optional)</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-medium focus:ring-2 focus:ring-[#123D2B]/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5E6E65]">Special Notes or Questions (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Need quiet corner room, starting from 1st of next month"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-medium focus:ring-2 focus:ring-[#123D2B]/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-xl bg-[#123D2B] text-white font-bold text-sm hover:bg-[#0E2F21] transition-colors cursor-pointer mt-2"
                  >
                    {submitting ? "Booking Your Slot..." : "Confirm Free Visit"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
