import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const [payments, schedules, refunds] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          booking: {
            include: {
              property: true,
              roomType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.paymentSchedule.findMany({
        include: {
          booking: {
            include: {
              property: true,
              roomType: true,
            },
          },
        },
        orderBy: { dueDate: "asc" },
      }),
      prisma.refund.findMany({
        include: {
          booking: true,
        },
        orderBy: { requestedAt: "desc" },
      }),
    ]);

    const totalCollected = payments
      .filter((p) => p.status === "SUCCESS")
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingRent = schedules
      .filter((s) => s.status === "PENDING")
      .reduce((sum, s) => sum + s.amount, 0);

    return NextResponse.json({
      success: true,
      payments,
      schedules,
      refunds,
      totalCollected,
      pendingRent,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { bookingId, amount, provider = "MANUAL_OFFLINE", transactionRef, notes } = body;

    if (!bookingId || !amount || !transactionRef) {
      return NextResponse.json(
        { error: "Booking ID, amount, and transaction reference are required." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          bookingId,
          amount: Number(amount),
          currency: "INR",
          status: "SUCCESS",
          provider,
          transactionRef,
          isDemo: false,
          paidAt: new Date(),
        },
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: "PAID",
          balanceRemaining: Math.max(0, booking.balanceRemaining - Number(amount)),
        },
      });

      await tx.auditLog.create({
        data: {
          adminEmail: admin.email,
          action: "RECORD_OFFLINE_PAYMENT",
          entityType: "Payment",
          entityId: p.id,
          details: `Recorded offline payment of ₹${amount} for booking ${booking.bookingReference} via ${provider}. Notes: ${notes || "None"}`,
        },
      });

      return p;
    });

    return NextResponse.json({ success: true, payment, message: "Payment recorded successfully." });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
