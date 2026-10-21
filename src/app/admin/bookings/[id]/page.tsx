"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarCheck,
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Receipt,
  Printer,
  Sparkles,
  Bed,
  FileText,
} from "lucide-react";

export default function AdminBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation / Refund Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelForm, setCancelForm] = useState({
    reason: "Resident requested cancellation",
    refundAmount: 0,
    processRefund: true,
  });
  const [updating, setUpdating] = useState(false);

  // Notes
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/bookings/${id}`);
      const data = await res.json();
      if (data.success && data.booking) {
        setBooking(data.booking);
        setNotes(data.booking.notes || "");
        setCancelForm((prev) => ({
          ...prev,
          refundAmount: data.booking.depositAmount || 0,
        }));
      } else {
        setError(data.error || "Booking not found");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBooking();
  }, [id]);

  const handleUpdateStatus = async (status: string) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchBooking();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleProcessCancelAndRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELLED",
          cancellationReason: cancelForm.reason,
          processRefund: cancelForm.processRefund,
          refundAmount: Number(cancelForm.refundAmount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCancelModalOpen(false);
        fetchBooking();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Operations notes saved.");
        fetchBooking();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#5E6E65] bg-white rounded-3xl border border-[#E8E6DF]">
        Loading booking details...
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-[#E8E6DF] space-y-4">
        <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
        <h2 className="text-lg font-bold text-[#123D2B]">{error || "Reservation Record Not Found"}</h2>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#123D2B] underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E6DF] gap-4">
        <div>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5E6E65] hover:text-[#123D2B] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Bookings
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D2B]">
              {booking.bookingReference}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                booking.status === "CHECKED_IN"
                  ? "bg-blue-100 text-blue-800"
                  : booking.status === "CONFIRMED"
                  ? "bg-emerald-100 text-emerald-800"
                  : booking.status === "CANCELLED"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {booking.status}
            </span>
          </div>
          <span className="text-xs text-[#5E6E65] block mt-0.5">
            Created on {new Date(booking.createdAt).toLocaleString()} • Duration: {booking.durationType}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {booking.status === "CONFIRMED" && (
            <button
              onClick={() => handleUpdateStatus("CHECKED_IN")}
              disabled={updating}
              className="px-4 py-2 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] cursor-pointer shadow-sm"
            >
              Confirm Check-In
            </button>
          )}

          {booking.status === "CHECKED_IN" && (
            <button
              onClick={() => handleUpdateStatus("CHECKED_OUT")}
              disabled={updating}
              className="px-4 py-2 rounded-xl bg-[#5E6E65] text-white text-xs font-bold hover:bg-[#4A5550] cursor-pointer"
            >
              Process Check-Out
            </button>
          )}

          {booking.status !== "CANCELLED" && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-3 py-2 rounded-xl border border-red-300 text-red-700 bg-red-50 text-xs font-bold hover:bg-red-100 cursor-pointer"
            >
              Cancel & Refund
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] hover:bg-[#FAF8F5]"
            title="Print Folio / Invoice"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest and Stay Details Card */}
          <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-card space-y-5">
            <h2 className="text-base font-extrabold text-[#123D2B] flex items-center gap-2">
              <User className="w-4 h-4 text-[#123D2B]" />
              Guest & Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-[#7B8B82] block">Guest Name</span>
                <span className="font-bold text-[#123D2B] text-sm">{booking.guestName}</span>
                <span className="text-[#5E6E65] block">{booking.guestCount} Guest(s)</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-[#7B8B82] block">Contact Channels</span>
                <div className="flex items-center gap-1.5 font-bold text-[#123D2B]">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{booking.guestPhone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#5E6E65]">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{booking.guestEmail}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-3">
              <span className="text-[10px] font-extrabold uppercase text-[#7B8B82] block">
                Stay Schedule & Unit Assignment
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[#7B8B82] block">Check-In:</span>
                  <span className="font-bold text-[#123D2B]">
                    {new Date(booking.startTime).toLocaleDateString()} ({booking.property?.checkInTime})
                  </span>
                </div>
                <div>
                  <span className="text-[#7B8B82] block">Check-Out:</span>
                  <span className="font-bold text-[#123D2B]">
                    {new Date(booking.endTime).toLocaleDateString()} ({booking.property?.checkOutTime})
                  </span>
                </div>
                <div>
                  <span className="text-[#7B8B82] block">Unit Identifier:</span>
                  <span className="font-bold text-[#123D2B]">
                    {booking.inventoryUnit?.identifier || "Standard Room Unit"}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E6DF] text-xs text-[#5E6E65] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#123D2B]" />
                <span>
                  {booking.property?.name} • {booking.property?.address}, {booking.property?.city}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Snapshot Card */}
          <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-card space-y-4">
            <h2 className="text-base font-extrabold text-[#123D2B] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#123D2B]" />
              Agreed Pricing Snapshot
            </h2>

            <div className="divide-y divide-[#F0EDE4] text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#5E6E65]">
                  Base Accommodation ({booking.durationCount} {booking.durationType.toLowerCase()})
                </span>
                <span className="font-bold text-[#123D2B]">₹{booking.basePrice.toLocaleString("en-IN")}</span>
              </div>

              {booking.foodCharges > 0 && (
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#5E6E65]">Food & Dining Plan</span>
                  <span className="font-bold text-[#123D2B]">₹{booking.foodCharges.toLocaleString("en-IN")}</span>
                </div>
              )}

              {booking.taxes > 0 && (
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#5E6E65]">GST & Services (12%)</span>
                  <span className="font-bold text-[#123D2B]">₹{booking.taxes.toLocaleString("en-IN")}</span>
                </div>
              )}

              {booking.depositAmount > 0 && (
                <div className="py-2.5 flex justify-between text-emerald-800">
                  <span>Refundable Security Deposit</span>
                  <span className="font-bold">₹{booking.depositAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="py-3 flex justify-between text-sm font-extrabold text-[#123D2B]">
                <span>Total Contract Value</span>
                <span>₹{booking.totalAmount.toLocaleString("en-IN")}</span>
              </div>

              <div className="py-2.5 flex justify-between text-xs text-[#5E6E65]">
                <span>Amount Paid</span>
                <span className="font-bold text-emerald-700">₹{booking.payableNow.toLocaleString("en-IN")}</span>
              </div>

              {booking.balanceRemaining > 0 && (
                <div className="py-2.5 flex justify-between text-xs text-amber-700">
                  <span>Balance Due</span>
                  <span className="font-bold">₹{booking.balanceRemaining.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payments & Refunds Log */}
          <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-card space-y-4">
            <h2 className="text-base font-extrabold text-[#123D2B] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#123D2B]" />
              Transaction Ledger
            </h2>

            {booking.payments?.length === 0 ? (
              <span className="text-xs text-[#5E6E65]">No payments recorded.</span>
            ) : (
              <div className="space-y-2">
                {booking.payments?.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E6DF] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#123D2B] block">₹{p.amount.toLocaleString("en-IN")}</span>
                      <span className="text-[10px] text-[#7B8B82]">
                        Ref: {p.transactionRef} • {p.provider} • {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {booking.refunds && booking.refunds.length > 0 && (
              <div className="pt-3 border-t border-[#F0EDE4] space-y-2">
                <span className="text-[10px] font-bold text-[#7B8B82] uppercase block">Refunds Tracked</span>
                {booking.refunds.map((r: any) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-red-800 block">Refund of ₹{r.amount}</span>
                      <span className="text-[10px] text-red-600">{r.reason}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-red-200 text-red-900 text-[10px] font-bold">
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Operations Notes & Actions */}
        <div className="space-y-6">
          {/* Operations Notes */}
          <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-card space-y-4">
            <h3 className="text-sm font-extrabold text-[#123D2B]">Internal Staff Notes</h3>
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Guest requested upper floor bed, arrives by 2 PM..."
              className="w-full p-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-medium"
            />
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="w-full py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] cursor-pointer"
            >
              {savingNotes ? "Saving..." : "Save Notes"}
            </button>
          </div>

          {/* Keyless Access PIN */}
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E6DF] p-6 space-y-3">
            <span className="text-[10px] font-extrabold uppercase text-[#7B8B82] block">
              Digital Check-In Credentials
            </span>
            <div className="p-3 rounded-xl bg-white border border-[#E8E6DF] space-y-1 text-xs">
              <span className="text-[#5E6E65] block">Smart Lock Door PIN:</span>
              <span className="text-lg font-mono font-black text-[#123D2B]">8921#</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#E8E6DF] space-y-1 text-xs">
              <span className="text-[#5E6E65] block">High-Speed Wi-Fi:</span>
              <span className="font-bold text-[#123D2B] block">Stayzy-Resident-5G</span>
              <span className="font-mono text-[#5E6E65]">colive@stayzy2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E8E6DF]">
            <h2 className="text-base font-bold text-red-700">Process Cancellation & Refund</h2>
            <form onSubmit={handleProcessCancelAndRefund} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Cancellation Reason</label>
                <textarea
                  rows={2}
                  required
                  value={cancelForm.reason}
                  onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Refund Amount (₹)</label>
                <input
                  type="number"
                  value={cancelForm.refundAmount}
                  onChange={(e) => setCancelForm({ ...cancelForm, refundAmount: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-bold"
                />
                <span className="text-[10px] text-[#7B8B82] block">
                  Agreed deposit was ₹{booking.depositAmount}. Adjust as per cancellation policy.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E8E6DF]">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5D2C7] font-bold text-[#4A5550]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 rounded-xl bg-red-700 text-white font-bold hover:bg-red-800 disabled:opacity-50"
                >
                  {updating ? "Processing..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
