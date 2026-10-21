import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DemoBanner } from "@/components/common/DemoBanner";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import {
  CheckCircle2,
  CalendarCheck,
  MapPin,
  Clock,
  Printer,
  Calendar,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  User,
  Phone,
  Mail,
  Home,
} from "lucide-react";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const booking = await prisma.booking.findFirst({
    where: {
      OR: [{ id }, { bookingReference: id }],
    },
    include: {
      property: true,
      roomType: true,
      inventoryUnit: {
        include: { room: true },
      },
      payments: true,
      paymentSchedules: {
        orderBy: { dueDate: "asc" },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
      <DemoBanner />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full space-y-8">
        <div className="bg-white rounded-3xl border border-[#E8E6DF] p-8 sm:p-12 shadow-card-hover space-y-8">
          {/* Header Banner */}
          <div className="text-center space-y-3 pb-8 border-b border-[#F0EDE4]">
            <div className="w-16 h-16 rounded-full bg-[#E8F1D5] text-[#123D2B] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs uppercase font-extrabold tracking-widest text-[#123D2B]">
              Booking Confirmed
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123D2B]">
              You’re all set for Stayzy!
            </h1>
            <p className="text-sm text-[#5E6E65] max-w-md mx-auto">
              A confirmation receipt and keyless check-in instructions have been sent to{" "}
              <strong>{booking.guestEmail}</strong>.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E6DF] text-xs font-mono font-bold text-[#192621]">
              <span>Reference:</span>
              <span className="text-[#123D2B] text-sm">{booking.bookingReference}</span>
            </div>
          </div>

          {/* Key Stay Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-3">
              <h3 className="font-bold text-sm text-[#123D2B] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#123D2B]" />
                Assigned Room & Location
              </h3>
              <div className="space-y-1 text-[#4A5550]">
                <p className="font-extrabold text-sm text-[#192621]">{booking.roomType.name}</p>
                {booking.inventoryUnit && (
                  <p className="text-[#123D2B] font-semibold">
                    Unit: {booking.inventoryUnit.identifier}
                  </p>
                )}
                <p>{booking.property.name}</p>
                <p className="text-[11px] text-[#7B8B82]">{booking.property.address}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-3">
              <h3 className="font-bold text-sm text-[#123D2B] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#123D2B]" />
                Dates & Timings
              </h3>
              <div className="space-y-1.5 text-[#4A5550]">
                <div>
                  <span className="font-bold text-[#192621] block">Check-in:</span>
                  <span>
                    {booking.startTime.toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    at {booking.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-[#192621] block">Check-out:</span>
                  <span>
                    {booking.endTime.toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    at {booking.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Receipt Summary */}
          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[#E8E6DF]">
              <span className="font-bold text-sm text-[#123D2B]">Payment Receipt</span>
              <span className="px-2.5 py-1 rounded-full bg-[#E8F1D5] text-[#123D2B] font-bold text-[11px]">
                Payment Status: {booking.paymentStatus}
              </span>
            </div>

            <div className="space-y-2 text-[#5E6E65]">
              <div className="flex justify-between">
                <span>Base Rent ({booking.durationCount} {booking.durationType.toLowerCase()}s):</span>
                <span className="font-semibold text-[#192621]">₹{booking.basePrice.toLocaleString("en-IN")}</span>
              </div>
              {booking.foodCharges > 0 && (
                <div className="flex justify-between">
                  <span>Home Meals:</span>
                  <span className="font-semibold text-[#192621]">₹{booking.foodCharges.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST & Taxes (12%):</span>
                <span className="font-semibold text-[#192621]">₹{booking.taxes.toLocaleString("en-IN")}</span>
              </div>
              {booking.depositAmount > 0 && (
                <div className="flex justify-between text-[#123D2B] font-semibold">
                  <span>Security Deposit (100% Refundable):</span>
                  <span>₹{booking.depositAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#E8E6DF] flex justify-between text-sm font-extrabold text-[#123D2B]">
                <span>Total Amount Paid:</span>
                <span>₹{booking.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#F0EDE4]">
            <Link
              href={`/dashboard/bookings/${booking.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#123D2B] text-white font-bold text-xs hover:bg-[#0E2F21] transition-colors"
            >
              <CalendarCheck className="w-4 h-4" />
              Manage Booking in Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/rooms"
              className="text-xs font-bold text-[#5E6E65] hover:text-[#123D2B]"
            >
              Explore More Rooms
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
