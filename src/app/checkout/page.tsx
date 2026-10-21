"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { DemoBanner } from "@/components/common/DemoBanner";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import {
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ArrowRight,
  Sparkles,
  Lock,
  User,
  Phone,
  Mail,
  FileCheck,
} from "lucide-react";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const holdToken = searchParams.get("holdToken") || "";
  const roomTypeId = searchParams.get("roomTypeId") || "";
  const durationType = searchParams.get("durationType") || "MONTHLY";
  const startDate = searchParams.get("startDate") || "";
  const startTime = searchParams.get("startTime") || "10:00";
  const durationCount = Number(searchParams.get("durationCount") || 1);
  const includeFood = searchParams.get("includeFood") === "true";

  // Guest details form state
  const [guestName, setGuestName] = useState("Aarav Sharma");
  const [guestEmail, setGuestEmail] = useState("aarav.sharma@example.com");
  const [guestPhone, setGuestPhone] = useState("+91 98765 12345");
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Pricing & room info state
  const [roomData, setRoomData] = useState<any>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment process state
  const [submitting, setSubmitting] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentSession, setPaymentSession] = useState<any>(null);
  const [processingWebhook, setProcessingWebhook] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch server pricing
        const priceRes = await fetch("/api/pricing/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomTypeId,
            durationType,
            startDate,
            startTime,
            durationCount,
            includeFood,
          }),
        });
        const priceData = await priceRes.json();
        if (!priceData.success) {
          throw new Error(priceData.error || "Failed to calculate booking pricing.");
        }
        setPricing(priceData.breakdown);

        // 2. Fetch room details
        const roomRes = await fetch(`/api/rooms`);
        const roomList = await roomRes.json();
        if (roomList.success) {
          const currentRoom = roomList.rooms.find((r: any) => r.id === roomTypeId);
          setRoomData(currentRoom);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (roomTypeId && startDate) {
      loadData();
    }
  }, [roomTypeId, durationType, startDate, startTime, durationCount, includeFood]);

  // Handle Form Submission -> Create Booking & Initiate Payment
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError("Please review and accept the Stayzy Booking & Cancellation terms.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/checkout/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holdToken,
          roomTypeId,
          durationType,
          startDate,
          startTime,
          durationCount,
          includeFood,
          guestName,
          guestEmail,
          guestPhone,
          guestCount,
          specialRequests,
          termsAccepted,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create booking.");
      }

      // Open demo payment modal
      setPaymentSession(data);
      setPaymentModalOpen(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Simulate payment completion via signed webhook
  const handleSimulatePaymentWebhook = async (status: "SUCCESS" | "FAILED") => {
    if (!paymentSession) return;
    setProcessingWebhook(true);

    try {
      const payload = JSON.stringify({
        paymentId: paymentSession.paymentDetails.transactionRef,
        transactionRef: paymentSession.paymentDetails.transactionRef,
        bookingId: paymentSession.bookingId,
        amount: paymentSession.payableNow,
        status,
      });

      // Submit to signed webhook endpoint
      const res = await fetch("/api/payments/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-stayzy-signature": paymentSession.paymentDetails.signature,
        },
        body: payload,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Payment verification failed.");
      }

      if (status === "SUCCESS") {
        router.push(`/booking-confirmation/${paymentSession.bookingId}`);
      } else {
        alert("Payment was marked as FAILED as simulated. The booking remains in unpaid status.");
        setPaymentModalOpen(false);
      }
    } catch (err: any) {
      alert(`Webhook error: ${err.message}`);
    } finally {
      setProcessingWebhook(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-[#5E6E65]">
        <Sparkles className="w-8 h-8 text-[#123D2B] animate-spin mx-auto mb-3" />
        <p className="font-semibold text-sm">Preparing your secure checkout...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Checkout Title */}
      <div className="pb-6 border-b border-[#E8E6DF] mb-8">
        <span className="text-xs uppercase font-extrabold tracking-widest text-[#123D2B]">
          Instant Reservation
        </span>
        <h1 className="text-3xl font-extrabold text-[#123D2B] mt-1">
          Review & Complete Your Booking
        </h1>
        <p className="text-xs text-[#5E6E65] mt-1 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#123D2B]" />
          <span>Bed temporarily held for 15 minutes • Encrypted server checkout</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Guest Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Guest Information Card */}
          <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 text-[#123D2B]">
              <User className="w-5 h-5" />
              <h2 className="text-lg font-bold">1. Resident & Contact Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-[#5E6E65]">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#5E6E65]">Email Address (for Receipt & PIN)</label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#5E6E65]">Mobile Phone (for Keyless Access)</label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#5E6E65]">Number of Guests</label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
                >
                  <option value={1}>1 Guest</option>
                  {roomData?.maxCapacity > 1 && <option value={2}>2 Guests</option>}
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-[#5E6E65]">Special Requests (Optional)</label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. High floor, vegetarian meal preference, late check-in"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
                />
              </div>
            </div>
          </div>

          {/* Cancellation & Policies Agreement */}
          <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 sm:p-8 space-y-4 shadow-sm text-xs text-[#5E6E65]">
            <div className="flex items-center gap-2 text-[#123D2B]">
              <FileCheck className="w-5 h-5" />
              <h2 className="text-lg font-bold">2. Terms & House Rules</h2>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-2 leading-relaxed">
              <p>
                • <strong>Security Deposit: </strong>100% refundable upon move-out inspection. No deductions for normal wear & tear.
              </p>
              <p>
                • <strong>Free Cancellation: </strong>Full refund up to 48 hours prior to start date.
              </p>
              <p>
                • <strong>Quiet Hours: </strong>10:30 PM to 6:30 AM to ensure resident comfort and undisturbed sleep.
              </p>
            </div>

            <label className="flex items-start gap-3 pt-2 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 rounded text-[#123D2B] mt-0.5"
              />
              <span className="font-semibold text-[#192621]">
                I acknowledge the Stayzy Booking Guidelines, Cancellation Terms, and confirm that the guest details provided are accurate.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-14 rounded-2xl bg-[#123D2B] text-white font-extrabold text-base hover:bg-[#0E2F21] shadow-soft transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <span>Preparing Payment Gateway...</span>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Pay ₹{pricing?.payableNow.toLocaleString("en-IN")} & Confirm Stay</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>

        {/* Right Summary Card (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 sm:p-8 shadow-card-hover space-y-6 sticky top-28">
            <h3 className="text-base font-bold text-[#123D2B] pb-3 border-b border-[#F0EDE4]">
              Stay Summary
            </h3>

            {/* Room Info */}
            {roomData && (
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gray-100">
                  <ImageWithFallback
                    src={roomData.images[0] || roomData.property?.coverImage || "/fallback-room.jpg"}
                    alt={roomData.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#123D2B] bg-[#E8F1D5] px-2 py-0.5 rounded-md">
                    {roomData.category}
                  </span>
                  <h4 className="text-sm font-bold text-[#192621] leading-snug">
                    {roomData.name}
                  </h4>
                  <p className="text-xs text-[#5E6E65]">{roomData.property.name}</p>
                </div>
              </div>
            )}

            {/* Timings & Duration */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5E6E65]">Duration Type:</span>
                <span className="font-bold text-[#192621]">{durationType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5E6E65]">Check-in:</span>
                <span className="font-bold text-[#192621]">
                  {new Date(pricing.startDateTime).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  at {new Date(pricing.startDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5E6E65]">Check-out:</span>
                <span className="font-bold text-[#192621]">
                  {new Date(pricing.endDateTime).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  at {new Date(pricing.endDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>

            {/* Itemized Charges */}
            <div className="space-y-3 text-xs border-t border-[#F0EDE4] pt-4">
              <div className="flex justify-between text-[#5E6E65]">
                <span>Base Rent ({pricing.durationCount} {pricing.unitLabel})</span>
                <span className="font-semibold text-[#192621]">
                  ₹{pricing.baseAmount.toLocaleString("en-IN")}
                </span>
              </div>

              {pricing.foodCharge > 0 && (
                <div className="flex justify-between text-[#5E6E65]">
                  <span>Home Meals Package</span>
                  <span className="font-semibold text-[#192621]">
                    ₹{pricing.foodCharge.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-[#5E6E65]">
                <span>Taxes & GST (12%)</span>
                <span className="font-semibold text-[#192621]">
                  ₹{pricing.taxes.toLocaleString("en-IN")}
                </span>
              </div>

              {pricing.depositAmount > 0 && (
                <div className="flex justify-between text-[#123D2B] font-semibold bg-[#E8F1D5]/40 p-2 rounded-lg">
                  <span>Refundable Security Deposit</span>
                  <span>₹{pricing.depositAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#F0EDE4] flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-extrabold text-[#123D2B]">Due Today</span>
                  {pricing.balanceRemaining > 0 && (
                    <span className="text-[11px] text-[#7B8B82] block">
                      Scheduled balance: ₹{pricing.balanceRemaining.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <span className="text-2xl font-black text-[#123D2B]">
                  ₹{pricing.payableNow.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Demo Payment Gateway Modal */}
      {paymentModalOpen && paymentSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F1D5] text-[#123D2B] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Demo Payment Adapter
              </div>
              <h3 className="text-xl font-extrabold text-[#123D2B]">
                Stayzy Secure Mock Gateway
              </h3>
              <p className="text-xs text-[#5E6E65]">
                Ref: <code>{paymentSession.paymentDetails.transactionRef}</code>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5E6E65]">Booking Ref:</span>
                <span className="font-bold text-[#192621]">{paymentSession.bookingReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5E6E65]">Total Amount:</span>
                <span className="font-black text-[#123D2B] text-base">
                  ₹{paymentSession.payableNow.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5E6E65]">HMAC Signature:</span>
                <span className="font-mono text-[10px] text-gray-400 truncate max-w-[200px]">
                  {paymentSession.paymentDetails.signature}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#7B8B82] text-center leading-relaxed">
              This triggers a cryptographically signed HMAC-SHA256 server webhook. No actual bank card will be charged.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                disabled={processingWebhook}
                onClick={() => handleSimulatePaymentWebhook("SUCCESS")}
                className="w-full h-12 rounded-xl bg-[#123D2B] text-white font-bold text-xs hover:bg-[#0E2F21] transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#E8F1D5]" />
                {processingWebhook ? "Verifying Webhook..." : "Simulate Successful Payment"}
              </button>

              <button
                type="button"
                disabled={processingWebhook}
                onClick={() => handleSimulatePaymentWebhook("FAILED")}
                className="w-full h-10 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 transition-colors cursor-pointer"
              >
                Simulate Payment Failure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
      <DemoBanner />
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-4xl mx-auto px-4 py-20 text-center text-[#5E6E65]">
              Loading checkout...
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
