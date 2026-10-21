import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to view your bookings." }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ userId: user.id }, { guestEmail: user.email }],
      },
      include: {
        property: true,
        roomType: true,
        inventoryUnit: true,
        payments: true,
        paymentSchedules: {
          orderBy: { dueDate: "asc" },
        },
        refunds: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
