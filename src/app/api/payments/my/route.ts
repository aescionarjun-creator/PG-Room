import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ userId: user.id }, { guestEmail: user.email }],
      },
      select: { id: true },
    });

    const bookingIds = bookings.map((b) => b.id);

    const [payments, schedules, refunds] = await Promise.all([
      prisma.payment.findMany({
        where: { bookingId: { in: bookingIds } },
        include: {
          booking: {
            include: {
              roomType: true,
              property: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.paymentSchedule.findMany({
        where: { bookingId: { in: bookingIds } },
        include: {
          booking: {
            include: {
              roomType: true,
              property: true,
            },
          },
        },
        orderBy: { dueDate: "asc" },
      }),
      prisma.refund.findMany({
        where: { bookingId: { in: bookingIds } },
        include: {
          booking: true,
        },
        orderBy: { requestedAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      payments,
      schedules,
      refunds,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
