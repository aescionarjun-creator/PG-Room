"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  MapPin,
  Clock,
  Printer,
  Calendar,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  XCircle,
  PlusCircle,
  X,
  CreditCard,
  FileText,
  Wifi,
  Phone,
  Mail,
} from "lucide-react";

export function BookingDetailsView({ booking }: { booking: any }) {
  const router = useRouter();
  const [extensionModalOpen, setExtensionModalOpen] = useState(false);
  const [extensionCount, setExtensionCount] = useState(1);
  const [extensionLoading, setExtensionLoading] = useState(false);
  const [extensionError, setExtensionError] = useState<string | null>(null);

  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const [cancellationError, setCancellationError] = useState<string | null>(null);

  const isCancelled = booking.status === "CANCELLED";
  const isPast = new Date(booking.endTime) < new Date() || booking.status === "CHECKED_OUT";

  const handleExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    setExtensionLoading(true);
    setExtensionError(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ additionalCount: Number(extensionCount) }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Extension failed.");
      }
      alert(data.message);
      setExtensionModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setExtensionError(err.message);
    } finally {
      setExtensionLoading(false);
    }
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setCancellationLoading(true);
    setCancellationError(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancellationReason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Cancellation failed.");
      }
      alert(data.message);
      setCancellationModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setCancellationError(err.message);
    } finally {
      setCancellationLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E6DF]">
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#123D2B] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Bookings
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D5D2C7] bg-white text-xs font-bold text-[#123D2B] hover:bg-[#FAF8F5]"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Receipt
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 sm:p-8 shadow-card-hover space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EDE4]">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-[#123D2B] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E8E6DF]">
              Ref: {booking.bookingReference}
            </span>
            <h1 className="text-2xl font-extrabold text-[#192621] mt-1">
              {booking.roomType.name}
            </h1>
            <p className="text-xs text-[#5E6E65] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#123D2B]" />
              {booking.property.name} ({booking.property.city})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isCancelled
                  ? "bg-red-50 text-red-700"
                  : isPast
                  ? "bg-gray-100 text-gray-700"
                  : "bg-[#E8F1D5] text-[#123D2B]"
              }`}
            >
              {booking.status}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#FAF8F5] text-xs font-bold text-[#123D2B] border border-[#E8E6DF]">
              Payment: {booking.paymentStatus}
            </span>
          </div>
        </div>

        {/* Space & Digital Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-3">
            <h3 className="font-bold text-sm text-[#123D2B] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#123D2B]" />
              Digital Keyless Access & Instructions
            </h3>
            <div className="space-y-2 text-[#4A5550]">
              <p>
                <strong>Assigned Unit: </strong>
                <span className="text-[#123D2B] font-bold">
                  {booking.inventoryUnit?.identifier || "Room Assigned by Host"}
                </span>
              </p>
              <p>
                <strong>Biometric Front Door PIN: </strong>
                <code className="bg-white px-2 py-0.5 rounded border border-[#E8E6DF] font-mono font-bold text-[#123D2B]">
                  8921#
                </code>
              </p>
              <p>
                <strong>Wi-Fi SSID: </strong>
                <code className="bg-white px-2 py-0.5 rounded border border-[#E8E6DF] font-mono">
                  Stayzy_{booking.property.slug.replace("stayzy-", "").toUpperCase()}_300M
                </code>{" "}
                (Password: <code>welcome2stayzy</code>)
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-3">
            <h3 className="font-bold text-sm text-[#123D2B] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#123D2B]" />
              Stay Dates & Timings
            </h3>
            <div className="space-y-1.5 text-[#4A5550]">
              <div className="flex justify-between">
                <span>Check-in:</span>
                <span className="font-bold text-[#192621]">
                  {new Date(booking.startTime).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  at {new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Check-out:</span>
                <span className="font-bold text-[#192621]">
                  {new Date(booking.endTime).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  at {new Date(booking.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#E8E6DF]">
                <span>Duration Term:</span>
                <span className="font-semibold text-[#123D2B]">
                  {booking.durationCount} {booking.durationType.toLowerCase()}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Price Breakdown */}
        <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-3 text-xs">
          <h3 className="font-bold text-sm text-[#123D2B]">Agreed Price Breakdown</h3>
          <div className="space-y-2 text-[#5E6E65]">
            <div className="flex justify-between">
              <span>Base Accommodation Tariff:</span>
              <span className="font-semibold text-[#192621]">
                ₹{booking.basePrice.toLocaleString("en-IN")}
              </span>
            </div>
            {booking.foodCharges > 0 && (
              <div className="flex justify-between">
                <span>Home Meals:</span>
                <span className="font-semibold text-[#192621]">
                  ₹{booking.foodCharges.toLocaleString("en-IN")}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST Taxes (12%):</span>
              <span className="font-semibold text-[#192621]">
                ₹{booking.taxes.toLocaleString("en-IN")}
              </span>
            </div>
            {booking.depositAmount > 0 && (
              <div className="flex justify-between text-[#123D2B] font-semibold bg-[#E8F1D5]/40 p-2 rounded-lg">
                <span>Security Deposit (Refundable upon Move-Out):</span>
                <span>₹{booking.depositAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="pt-2 border-t border-[#E8E6DF] flex justify-between text-sm font-extrabold text-[#123D2B]">
              <span>Total Amount:</span>
              <span>₹{booking.totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Extend / Cancel */}
        {!isCancelled && !isPast && (
          <div className="flex flex-wrap gap-4 pt-4 border-t border-[#F0EDE4]">
            <button
              onClick={() => {
                setExtensionCount(1);
                setExtensionError(null);
                setExtensionModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Request Stay Extension
            </button>

            <button
              onClick={() => {
                setCancellationReason("");
                setCancellationError(null);
                setCancellationModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Cancel Reservation
            </button>
          </div>
        )}
      </div>

      {/* Extension Modal */}
      {extensionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-4">
            <button
              onClick={() => setExtensionModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-[#123D2B]">Request Extension</h3>
            <p className="text-xs text-[#5E6E65]">
              Extend your reservation without moving out of your room.
            </p>

            {extensionError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {extensionError}
              </div>
            )}

            <form onSubmit={handleExtend} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#5E6E65] block mb-1">
                  Additional {booking.durationType.toLowerCase()}s
                </label>
                <select
                  value={extensionCount}
                  onChange={(e) => setExtensionCount(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                >
                  {[1, 2, 3, 4, 6].map((n) => (
                    <option key={n} value={n}>
                      +{n} {booking.durationType.toLowerCase()}{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={extensionLoading}
                className="w-full h-11 rounded-xl bg-[#123D2B] text-white font-bold text-xs"
              >
                {extensionLoading ? "Checking Availability..." : "Confirm Extension"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-4">
            <button
              onClick={() => setCancellationModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-red-600">Cancel Booking</h3>

            {cancellationError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {cancellationError}
              </div>
            )}

            <form onSubmit={handleCancel} className="space-y-3 text-xs">
              <p className="text-[11px] text-[#5E6E65]">
                Your unit will be released and refund calculated according to the 48-hour cancellation scale.
              </p>
              <div>
                <label className="font-bold text-[#5E6E65] block mb-1">Reason</label>
                <textarea
                  required
                  rows={3}
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <button
                type="submit"
                disabled={cancellationLoading}
                className="w-full h-11 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                {cancellationLoading ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
