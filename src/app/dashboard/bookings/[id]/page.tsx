import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { BookingDetailsView } from "./BookingDetailsView";

export default async function SingleBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=/dashboard/bookings/${id}`);
  }

  const booking = await prisma.booking.findFirst({
    where: {
      OR: [{ id }, { bookingReference: id }],
    },
    include: {
      property: true,
      roomType: {
        include: {
          ratePlans: true,
        },
      },
      inventoryUnit: {
        include: { room: true },
      },
      payments: true,
      paymentSchedules: {
        orderBy: { dueDate: "asc" },
      },
      refunds: true,
    },
  });

  if (!booking) {
    notFound();
  }

  // Security check: Only owner or admin can view this booking
  if (
    user.role !== "ADMIN" &&
    booking.userId !== user.id &&
    booking.guestEmail !== user.email
  ) {
    return (
      <div className="bg-white p-12 rounded-3xl text-center text-xs text-red-600 font-semibold">
        Access Denied: You do not have permission to view this reservation.
      </div>
    );
  }

  let images: string[] = [];
  try {
    images = JSON.parse(booking.roomType.images);
  } catch {
    images = [];
  }

  return (
    <BookingDetailsView
      booking={{
        ...booking,
        roomType: {
          ...booking.roomType,
          images,
        },
      }}
    />
  );
}
