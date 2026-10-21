import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { reason = "Customer requested cancellation" } = body;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (user.role !== "ADMIN" && booking.userId !== user.id && booking.guestEmail !== user.email) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "Booking is already cancelled." }, { status: 400 });
    }

    // Cancellation & Refund policy:
    // Full refund if cancelled > 48h before start; 50% if > 24h; else deposit only
    const now = new Date();
    const hoursToStart = (booking.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let eligibleRefund = 0;
    if (booking.paymentStatus === "PAID") {
      if (hoursToStart > 48) {
        eligibleRefund = booking.totalAmount;
      } else if (hoursToStart > 24) {
        eligibleRefund = Math.round(booking.basePrice * 0.5 + booking.depositAmount);
      } else {
        eligibleRefund = booking.depositAmount;
      }
    }

    // Update booking and create refund request
    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancellationReason: reason,
          cancellationRequestedAt: now,
          paymentStatus: eligibleRefund > 0 ? "PARTIALLY_REFUNDED" : booking.paymentStatus,
        },
      });

      if (eligibleRefund > 0) {
        await tx.refund.create({
          data: {
            bookingId: b.id,
            amount: eligibleRefund,
            reason: `Cancellation request: ${reason} (${hoursToStart > 48 ? "Standard full window" : "Short notice policy"})`,
            status: "REQUESTED",
          },
        });
      }

      // Remove from booking items
      await tx.bookingItem.deleteMany({
        where: { bookingId: b.id },
      });

      return b;
    });

    return NextResponse.json({
      success: true,
      booking: updated,
      eligibleRefund,
      message: `Booking has been cancelled. Refund of ₹${eligibleRefund.toLocaleString("en-IN")} requested.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
