"use client";

import React, { useState, useEffect } from "react";
import { LifeBuoy, PlusCircle, CheckCircle2, Clock, AlertCircle, MessageSquare, X } from "lucide-react";

export function DashboardSupportContent() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    bookingId: "",
    category: "MAINTENANCE",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const [tRes, bRes] = await Promise.all([
        fetch("/api/support"),
        fetch("/api/bookings/my"),
      ]);
      const tJson = await tRes.json();
      const bJson = await bRes.json();
      if (tJson.success) setTickets(tJson.tickets || []);
      if (bJson.success) setBookings(bJson.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit request.");
      }
      alert(data.message);
      setModalOpen(false);
      setForm({ bookingId: "", category: "MAINTENANCE", subject: "", message: "" });
      loadTickets();
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
          <h1 className="text-2xl font-extrabold text-[#123D2B]">Help & Resident Support</h1>
          <p className="text-xs text-[#5E6E65] mt-0.5">
            Submit maintenance, housekeeping, or billing tickets directly to our property operations team.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] transition-colors self-start cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Create Support Request
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 sm:p-8 shadow-soft space-y-6">
        <h2 className="text-base font-bold text-[#123D2B]">My Tickets</h2>

        {loading ? (
          <p className="text-xs text-[#5E6E65]">Loading support tickets...</p>
        ) : tickets.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#5E6E65] space-y-3">
            <p>You don't have any open support requests.</p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#123D2B] text-white text-xs font-bold"
            >
              Raise a Request
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl border border-[#E8E6DF] bg-[#FAF8F5] space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#192621]">{t.subject}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8E6DF] text-[10px] font-bold text-[#5E6E65]">
                      {t.category}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold self-start sm:self-auto ${
                      t.status === "RESOLVED"
                        ? "bg-[#E8F1D5] text-[#123D2B]"
                        : t.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <p className="text-[#4A5550] leading-relaxed">{t.message}</p>

                {t.booking && (
                  <p className="text-[11px] text-[#7B8B82]">
                    Linked Stay: {t.booking.roomType.name} (Ref: {t.booking.bookingReference})
                  </p>
                )}

                {/* Admin Reply */}
                {t.adminReply && (
                  <div className="p-3 rounded-xl bg-[#E8F1D5]/40 border border-[#DBE8C3] space-y-1">
                    <span className="font-bold text-[#123D2B] block text-[11px]">
                      Stayzy Host Reply:
                    </span>
                    <p className="text-[#192621]">{t.adminReply}</p>
                    {t.repliedAt && (
                      <span className="text-[10px] text-[#7B8B82] block">
                        Replied on {new Date(t.repliedAt).toLocaleDateString("en-IN")}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-[#123D2B]">New Support Request</h3>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5E6E65] block mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                >
                  <option value="MAINTENANCE">Room Maintenance & Electrical</option>
                  <option value="HOUSEKEEPING">Housekeeping & Cleaning</option>
                  <option value="PAYMENT">Billing & Rent Inquiries</option>
                  <option value="GENERAL">General Stay Assistance</option>
                </select>
              </div>

              {bookings.length > 0 && (
                <div>
                  <label className="font-bold text-[#5E6E65] block mb-1">
                    Associate with Stay (Optional)
                  </label>
                  <select
                    value={form.bookingId}
                    onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  >
                    <option value="">None / General Inquiry</option>
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.roomType.name} ({b.bookingReference})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-[#5E6E65] block mb-1">Subject</label>
                <input
                  required
                  placeholder="e.g. Geyser switch not heating"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5E6E65] block mb-1">Description / Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please describe the issue or timing preference..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-[#123D2B] text-white font-bold text-xs hover:bg-[#0E2F21] mt-2 cursor-pointer"
              >
                {submitting ? "Submitting..." : "Submit Support Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardSupportPage() {
  return <DashboardSupportContent />;
}
