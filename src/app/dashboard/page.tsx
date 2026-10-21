"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import {
  CalendarCheck,
  MapPin,
  Clock,
  CreditCard,
  LifeBuoy,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  KeyRound,
  Shield,
  Sparkles,
  Calendar,
  Phone,
  Bed,
} from "lucide-react";

export default function DashboardOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [bookingsRes, paymentsRes, authRes] = await Promise.all([
          fetch("/api/bookings/my"),
          fetch("/api/payments/my"),
          fetch("/api/auth/me"),
        ]);
        const bData = await bookingsRes.json();
        const pData = await paymentsRes.json();
        const aData = await authRes.json();

        if (aData.user) {
          setUser(aData.user);
        }

        if (bData.success) {
          setData({
            bookings: bData.bookings || [],
            payments: pData.payments || [],
            schedules: pData.schedules || [],
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center text-xs text-[#5E6E65] border border-[#E8E6DF] shadow-soft">
        Loading your resident dashboard...
      </div>
    );
  }

  const now = new Date();
  const bookings = data?.bookings || [];
  const payments = data?.payments || [];
  const schedules = data?.schedules || [];

  // Current active stay (startTime <= now <= endTime, not cancelled)
  const currentStay = bookings.find(
    (b: any) =>
      new Date(b.startTime) <= now &&
      new Date(b.endTime) >= now &&
      b.status !== "CANCELLED"
  );

  // Upcoming stay (startTime > now, not cancelled)
  const upcomingStay = bookings.find(
    (b: any) => new Date(b.startTime) > now && b.status !== "CANCELLED"
  );

  // Next payment due
  const nextPayment = schedules.find(
    (s: any) => s.status === "PENDING" && new Date(s.dueDate) >= now
  );

  // Payment summary calculations from real database records
  const totalPaid = payments
    .filter((p: any) => p.status === "COMPLETED")
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  const pendingDues = schedules
    .filter((s: any) => s.status === "PENDING")
    .reduce((sum: number, s: any) => sum + s.amount, 0);

  const depositHeld = bookings
    .filter((b: any) => b.status === "CONFIRMED")
    .reduce((sum: number, b: any) => sum + (b.securityDeposit || 0), 0);

  // Extract room photo for current stay
  let currentStayImage = "";
  if (currentStay) {
    try {
      const imgs = JSON.parse(currentStay.roomType?.images || "[]");
      currentStayImage = imgs[0] || currentStay.property?.coverImage || "/fallback-room.jpg";
    } catch {
      currentStayImage = currentStay.property?.coverImage || "/fallback-room.jpg";
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Greeting with Actual Customer Name & Quick Pitch */}
      <div className="bg-[#123D2B] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-card-hover">
        <div className="relative z-10 space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F1D5] text-[#123D2B] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Stayzy Resident Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || "Resident"}!
          </h1>
          <p className="text-xs sm:text-sm text-[#C1D2C5] leading-relaxed">
            Manage your active reservation, keyless entry PINs, review payments, or book an extension anytime.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/rooms"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E8F1D5] text-[#123D2B] text-xs font-extrabold hover:bg-white transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              Book Another Stay
            </Link>
            <Link
              href="/dashboard/support"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors cursor-pointer"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              Help & Support Desk
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top Highlights: Current-Stay Card (with room photograph) OR Upcoming Stay */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Current Stay or Upcoming Booking (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8E6DF] overflow-hidden shadow-soft flex flex-col justify-between">
          <div className="p-6 border-b border-[#F0EDE4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E8F1D5] text-[#123D2B] flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#123D2B] block">
                  {currentStay ? "Current Active Stay" : upcomingStay ? "Upcoming Booking" : "Stay Status"}
                </span>
                <span className="text-[11px] text-[#7B8B82]">
                  {currentStay ? "In-House Resident" : upcomingStay ? "Confirmed Reservation" : "No active stays"}
                </span>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-[#E8F1D5] text-[#123D2B] text-xs font-bold">
              {currentStay ? "ACTIVE" : upcomingStay ? "CONFIRMED" : "CLEAR"}
            </span>
          </div>

          {currentStay ? (
            <div className="p-6 space-y-5">
              {/* Room Photograph and details */}
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {currentStayImage && (
                  <div className="relative w-full sm:w-44 aspect-[4/3] rounded-2xl overflow-hidden shrink-0 border border-[#E8E6DF]">
                    <ImageWithFallback
                      src={currentStayImage}
                      alt={currentStay.roomType?.name || "Room"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-xl font-bold text-[#192621]">
                    {currentStay.roomType?.name}
                  </h3>
                  <p className="text-xs text-[#5E6E65] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#123D2B]" />
                    <span>{currentStay.property?.name}</span>
                  </p>
                  {currentStay.inventoryUnit && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF8F5] border border-[#E8E6DF] text-xs font-bold text-[#123D2B] mt-2">
                      <Bed className="w-3.5 h-3.5" />
                      <span>Assigned: {currentStay.inventoryUnit.identifier}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stay Dates & Keyless PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-1">
                  <span className="text-[10px] text-[#7B8B82] uppercase font-bold block">
                    Check-Out Date
                  </span>
                  <span className="text-sm font-extrabold text-[#192621]">
                    {new Date(currentStay.endTime).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-[11px] text-[#5E6E65] block">Standard 11:00 AM check-out</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#E8F1D5]/40 border border-[#E8F1D5] space-y-1">
                  <span className="text-[10px] text-[#123D2B] uppercase font-extrabold block">
                    Digital Keyless PIN
                  </span>
                  <span className="text-lg font-mono font-extrabold text-[#123D2B] tracking-wider">
                    {currentStay.keylessCode || "PIN • 4829"}
                  </span>
                  <span className="text-[11px] text-[#123D2B]/80 block">Active on door keypad</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Link
                  href={`/dashboard/bookings/${currentStay.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#123D2B] hover:underline"
                >
                  <span>View Details & Request Extension</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] font-mono text-[#7B8B82]">
                  Ref: {currentStay.bookingReference}
                </span>
              </div>
            </div>
          ) : upcomingStay ? (
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#192621]">
                  {upcomingStay.roomType?.name}
                </h3>
                <p className="text-xs text-[#5E6E65] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#123D2B]" />
                  <span>{upcomingStay.property?.name}</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#7B8B82] block text-[11px]">Move-In Date</span>
                  <strong className="text-[#192621] text-sm">
                    {new Date(upcomingStay.startTime).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                </div>
                <div>
                  <span className="text-[#7B8B82] block text-[11px]">Duration</span>
                  <span className="font-bold text-[#123D2B]">{upcomingStay.durationType}</span>
                </div>
                <div>
                  <span className="text-[#7B8B82] block text-[11px]">Total Paid</span>
                  <strong className="text-[#123D2B]">₹{upcomingStay.totalAmount.toLocaleString("en-IN")}</strong>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/dashboard/bookings/${upcomingStay.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#123D2B] hover:underline"
                >
                  <span>View Arrival Instructions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] flex items-center justify-center mx-auto text-[#7B8B82]">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#192621]">No active or upcoming bookings</h3>
                <p className="text-xs text-[#5E6E65] max-w-sm mx-auto">
                  Looking for a comfortable PG or flexible stay? Browse available rooms across Bengaluru with instant bed holds.
                </p>
              </div>
              <Link
                href="/rooms"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#123D2B] text-white font-bold text-xs hover:bg-[#0E2F21] shadow-xs"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore Stays</span>
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Next Payment Due & Rent Status (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-soft flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#E8E6DF] text-[#123D2B] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#123D2B]">
                  Next Payment Due
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  nextPayment ? "bg-amber-100 text-amber-800" : "bg-[#E8F1D5] text-[#123D2B]"
                }`}
              >
                {nextPayment ? "DUE SOON" : "UP TO DATE"}
              </span>
            </div>

            {nextPayment ? (
              <div className="space-y-4 pt-4">
                <div>
                  <span className="text-[11px] text-[#7B8B82] block">Amount Outstanding</span>
                  <span className="text-3xl font-extrabold text-[#123D2B]">
                    ₹{nextPayment.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-xs text-[#5E6E65]">{nextPayment.description}</p>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E6DF] flex justify-between text-xs">
                  <span className="text-[#7B8B82]">Due Date:</span>
                  <span className="font-extrabold text-[#192621]">
                    {new Date(nextPayment.dueDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-4 text-xs">
                <div className="flex items-center gap-2 text-green-700 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All rent and fees are settled</span>
                </div>
                <p className="text-[#5E6E65] leading-relaxed">
                  Your monthly tariff, GST, and security deposits are fully settled. You can download invoices anytime.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#F0EDE4]">
            <Link
              href="/dashboard/payments"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] transition-colors"
            >
              <span>Manage Rent & Payment History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Payment Summary Strip (Real metrics from database) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-soft space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7B8B82] block">
            Total Paid To Date
          </span>
          <span className="text-2xl font-extrabold text-[#123D2B] block">
            ₹{totalPaid.toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] text-[#5E6E65]">Verified via Stayzy payment receipts</span>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-soft space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7B8B82] block">
            Upcoming Dues
          </span>
          <span className="text-2xl font-extrabold text-[#192621] block">
            ₹{pendingDues.toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] text-[#5E6E65]">Scheduled monthly co-living tariffs</span>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-soft space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7B8B82] block">
            Security Deposit Held
          </span>
          <span className="text-2xl font-extrabold text-[#123D2B] block">
            ₹{depositHeld.toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] text-[#5E6E65]">100% refundable upon move-out</span>
        </div>
      </div>

      {/* 4. Recent Bookings Table */}
      <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 sm:p-8 shadow-soft space-y-5">
        <div className="flex justify-between items-center pb-3 border-b border-[#F0EDE4]">
          <h2 className="text-base font-bold text-[#123D2B]">Recent Bookings</h2>
          <Link
            href="/dashboard/bookings"
            className="text-xs font-bold text-[#123D2B] hover:underline"
          >
            View All ({bookings.length})
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#5E6E65] space-y-2">
            <p>You have not made any bookings yet.</p>
            <Link
              href="/rooms"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#123D2B] underline"
            >
              Browse rooms & book your first stay
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EDE4]">
            {bookings.slice(0, 4).map((b: any) => (
              <div
                key={b.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#192621] text-sm">
                      {b.roomType?.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E8E6DF] text-[10px] font-mono text-[#5E6E65]">
                      {b.bookingReference}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === "CONFIRMED"
                          ? "bg-[#E8F1D5] text-[#123D2B]"
                          : b.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-800"
                          : b.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="text-[#5E6E65] text-xs">
                    {b.durationType} stay • {new Date(b.startTime).toLocaleDateString("en-IN")} to{" "}
                    {new Date(b.endTime).toLocaleDateString("en-IN")} • {b.property?.name}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-sm text-[#123D2B]">
                    ₹{b.totalAmount.toLocaleString("en-IN")}
                  </span>
                  <Link
                    href={`/dashboard/bookings/${b.id}`}
                    className="px-3.5 py-1.5 rounded-xl border border-[#D5D2C7] font-bold text-xs text-[#123D2B] hover:bg-[#FAF8F5] transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Support Section Quick Help Card */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E6DF] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F1D5] text-[#123D2B] flex items-center justify-center shrink-0">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#192621]">
              Need help with your stay, housekeeping, or keys?
            </h3>
            <p className="text-xs text-[#5E6E65] mt-0.5">
              Our 24/7 on-site community desk and maintenance engineers are on standby for any resident request.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/support"
          className="px-5 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] transition-colors shrink-0 cursor-pointer shadow-xs"
        >
          Open Support Ticket
        </Link>
      </div>
    </div>
  );
}
