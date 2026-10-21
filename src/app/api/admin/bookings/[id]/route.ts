import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        property: true,
        roomType: true,
        inventoryUnit: {
          include: { room: true },
        },
        payments: true,
        paymentSchedules: {
          orderBy: { dueDate: "asc" },
        },
        refunds: true,
        supportTickets: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const { status, paymentStatus, notes, cancellationReason, processRefund, refundAmount } = body;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const data: any = {};
    if (status) data.status = status;
    if (paymentStatus) data.paymentStatus = paymentStatus;
    if (notes !== undefined) data.notes = notes;
    if (cancellationReason !== undefined) data.cancellationReason = cancellationReason;

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data,
      });

      if (processRefund && refundAmount) {
        await tx.refund.create({
          data: {
            bookingId: id,
            amount: Number(refundAmount),
            reason: cancellationReason || "Admin processed refund",
            status: "PROCESSED",
            processedAt: new Date(),
          },
        });
        await tx.booking.update({
          where: { id },
          data: { paymentStatus: "REFUNDED" },
        });
      }

      await tx.auditLog.create({
        data: {
          adminEmail: admin.email,
          action: "UPDATE_BOOKING",
          entityType: "Booking",
          entityId: id,
          details: `Updated booking ${booking.bookingReference}: status=${status || booking.status}, payment=${paymentStatus || booking.paymentStatus}`,
        },
      });

      return b;
    });

    return NextResponse.json({
      success: true,
      booking: updated,
      message: "Booking updated successfully.",
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
