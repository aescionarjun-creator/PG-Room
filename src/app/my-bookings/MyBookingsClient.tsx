"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarCheck,
  Calendar,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  X,
  CreditCard,
  RefreshCw,
  Printer,
  Sparkles,
} from "lucide-react";

export function MyBookingsClient() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [receiptBooking, setReceiptBooking] = useState<any | null>(null);
  const [extensionBooking, setExtensionBooking] = useState<any | null>(null);
  const [extensionCount, setExtensionCount] = useState(1);
  const [extensionLoading, setExtensionLoading] = useState(false);
  const [extensionError, setExtensionError] = useState<string | null>(null);

  const [cancellationBooking, setCancellationBooking] = useState<any | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const [cancellationError, setCancellationError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/bookings/my");
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      } else {
        setError(data.error || "Failed to load bookings.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Handle Extension Request
  const handleExtendBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extensionBooking) return;
    setExtensionLoading(true);
    setExtensionError(null);

    try {
      const res = await fetch(`/api/bookings/${extensionBooking.id}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ additionalCount: Number(extensionCount) }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Extension could not be processed.");
      }

      alert(data.message);
      setExtensionBooking(null);
      fetchBookings();
    } catch (err: any) {
      setExtensionError(err.message);
    } finally {
      setExtensionLoading(false);
    }
  };

  // Handle Cancellation Request
  const handleCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellationBooking) return;
    setCancellationLoading(true);
    setCancellationError(null);

    try {
      const res = await fetch(`/api/bookings/${cancellationBooking.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancellationReason }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Cancellation request failed.");
      }

      alert(data.message);
      setCancellationBooking(null);
      fetchBookings();
    } catch (err: any) {
      setCancellationError(err.message);
    } finally {
      setCancellationLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E6DF] gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#123D2B]">
            Resident Dashboard
          </span>
          <h1 className="text-3xl font-extrabold text-[#123D2B] mt-1">
            My Stays & Bookings
          </h1>
          <p className="text-xs text-[#5E6E65] mt-1">
            Manage your active bookings, view tax receipts, or request stay extensions.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#D5D2C7] bg-white text-xs font-bold text-[#123D2B] hover:bg-[#FAF8F5] transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#5E6E65] space-y-3">
          <Sparkles className="w-6 h-6 text-[#123D2B] animate-spin mx-auto" />
          <p className="text-xs font-semibold">Loading your bookings...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E8E6DF] p-12 text-center space-y-4">
          <Calendar className="w-12 h-12 text-[#123D2B]/30 mx-auto" />
          <h3 className="text-lg font-bold text-[#192621]">No Active Bookings Found</h3>
          <p className="text-xs text-[#5E6E65] max-w-sm mx-auto">
            You don’t have any stays booked yet. Discover flexible rooms for an hour, a day, or months.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold"
          >
            Find a Stay
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const isCancelled = booking.status === "CANCELLED";
            const isPast = new Date(booking.endTime) < new Date() || booking.status === "CHECKED_OUT";
            const isConfirmed = booking.status === "CONFIRMED";

            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl border border-[#E8E6DF] p-6 sm:p-8 shadow-soft flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left Info */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF] text-[#123D2B]">
                      {booking.bookingReference}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        isCancelled
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : isPast
                          ? "bg-gray-100 text-gray-700"
                          : "bg-[#E8F1D5] text-[#123D2B]"
                      }`}
                    >
                      {booking.status}
                    </span>

                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FAF8F5] text-[#5E6E65]">
                      {booking.durationType} Stay ({booking.durationCount}{" "}
                      {booking.durationType.toLowerCase()}s)
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#192621]">
                      {booking.roomType.name}
                    </h3>
                    <p className="text-xs text-[#5E6E65] flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#123D2B]" />
                      {booking.property.name} • {booking.property.address}
                    </p>
                  </div>

                  {booking.inventoryUnit && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F3EFE6] text-xs font-semibold text-[#123D2B]">
                      <span>Assigned Unit: {booking.inventoryUnit.identifier}</span>
                    </div>
                  )}

                  {/* Stay Dates */}
                  <div className="flex flex-wrap gap-4 text-xs text-[#4A5550] pt-1">
                    <div>
                      <span className="font-bold text-[#192621]">From: </span>
                      <span>
                        {new Date(booking.startTime).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        ({new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-[#192621]">To: </span>
                      <span>
                        {new Date(booking.endTime).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        ({new Date(booking.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Actions & Amount */}
                <div className="flex flex-col sm:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0">
                  <div className="sm:text-right">
                    <span className="text-[11px] text-[#7B8B82] uppercase font-bold block">
                      Total Paid
                    </span>
                    <span className="text-2xl font-black text-[#123D2B]">
                      ₹{booking.totalAmount.toLocaleString("en-IN")}
                    </span>
                    {booking.depositAmount > 0 && (
                      <span className="text-[11px] text-[#5E6E65] block">
                        Includes ₹{booking.depositAmount.toLocaleString("en-IN")} deposit
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setReceiptBooking(booking)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D5D2C7] bg-white text-xs font-bold text-[#123D2B] hover:bg-[#FAF8F5] transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Receipt
                    </button>

                    {!isCancelled && !isPast && (
                      <>
                        <button
                          onClick={() => {
                            setExtensionBooking(booking);
                            setExtensionCount(1);
                            setExtensionError(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E8F1D5] text-[#123D2B] text-xs font-bold hover:bg-[#DBE8C3] transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Extend Stay
                        </button>

                        <button
                          onClick={() => {
                            setCancellationBooking(booking);
                            setCancellationReason("");
                            setCancellationError(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable Receipt Modal */}
      {receiptBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 relative shadow-2xl space-y-6 animate-in zoom-in-95">
            <button
              onClick={() => setReceiptBooking(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-between items-center border-b border-[#F0EDE4] pb-4">
              <div>
                <span className="text-xl font-extrabold text-[#123D2B]">Stayzy Tax Invoice</span>
                <p className="text-xs text-[#5E6E65]">Ref: {receiptBooking.bookingReference}</p>
              </div>
              <button
                onClick={() => window.print()}
                className="p-2 rounded-xl bg-[#FAF8F5] border border-[#E8E6DF] text-[#123D2B]"
                title="Print Receipt"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-[#192621] block">Resident Details</span>
                <p>{receiptBooking.guestName} ({receiptBooking.guestPhone})</p>
                <p className="text-[#5E6E65]">{receiptBooking.guestEmail}</p>
              </div>

              <div>
                <span className="font-bold text-[#192621] block">Property & Unit</span>
                <p>{receiptBooking.property.name}</p>
                <p className="text-[#5E6E65]">{receiptBooking.roomType.name}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-2">
                <div className="flex justify-between">
                  <span>Base Tariff:</span>
                  <span className="font-semibold">₹{receiptBooking.basePrice.toLocaleString("en-IN")}</span>
                </div>
                {receiptBooking.foodCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Food Package:</span>
                    <span className="font-semibold">₹{receiptBooking.foodCharges.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST Taxes (12%):</span>
                  <span className="font-semibold">₹{receiptBooking.taxes.toLocaleString("en-IN")}</span>
                </div>
                {receiptBooking.depositAmount > 0 && (
                  <div className="flex justify-between text-[#123D2B] font-semibold">
                    <span>Refundable Deposit:</span>
                    <span>₹{receiptBooking.depositAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#E8E6DF] flex justify-between font-extrabold text-sm text-[#123D2B]">
                  <span>Total Paid:</span>
                  <span>₹{receiptBooking.totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#7B8B82] text-center">
                Payment verified through server webhook • Demo adapter reference:{" "}
                <code>{receiptBooking.payments[0]?.transactionRef || "TXN_MOCK"}</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Extension Modal */}
      {extensionBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-5 animate-in zoom-in-95">
            <button
              onClick={() => setExtensionBooking(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-[#123D2B]">Extend Your Stay</h3>
              <p className="text-xs text-[#5E6E65] mt-1">
                Extend {extensionBooking.roomType.name} without needing to change beds.
              </p>
            </div>

            {extensionError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {extensionError}
              </div>
            )}

            <form onSubmit={handleExtendBooking} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#5E6E65] block mb-1">
                  Additional {extensionBooking.durationType.toLowerCase()}s
                </label>
                <select
                  value={extensionCount}
                  onChange={(e) => setExtensionCount(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
                >
                  {[1, 2, 3, 4, 6].map((n) => (
                    <option key={n} value={n}>
                      +{n} {extensionBooking.durationType.toLowerCase()}{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-[#7B8B82]">
                Our server will verify that no incoming resident has reserved this specific inventory unit for the extended period.
              </p>

              <button
                type="submit"
                disabled={extensionLoading}
                className="w-full h-12 rounded-xl bg-[#123D2B] text-white font-bold text-xs hover:bg-[#0E2F21] transition-colors cursor-pointer"
              >
                {extensionLoading ? "Checking Availability..." : "Check Availability & Extend"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellationBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-5 animate-in zoom-in-95">
            <button
              onClick={() => setCancellationBooking(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-red-600">Cancel Reservation</h3>
              <p className="text-xs text-[#5E6E65] mt-1">
                Ref: {cancellationBooking.bookingReference}
              </p>
            </div>

            {cancellationError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {cancellationError}
              </div>
            )}

            <form onSubmit={handleCancelBooking} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-800 leading-relaxed text-[11px]">
                Upon cancellation, your room unit will be immediately released for other residents. Security deposits and eligible refunds are returned to your source account.
              </div>

              <div>
                <label className="font-bold text-[#5E6E65] block mb-1">Reason for Cancellation</label>
                <textarea
                  required
                  rows={3}
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="e.g. Change in travel plans, job relocation"
                  className="w-full p-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <button
                type="submit"
                disabled={cancellationLoading}
                className="w-full h-11 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors cursor-pointer"
              >
                {cancellationLoading ? "Processing..." : "Confirm Cancellation & Request Refund"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
