import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: {
        bookings: {
          include: {
            property: true,
            roomType: true,
            payments: true,
          },
          orderBy: { createdAt: "desc" },
        },
        visitRequests: true,
        supportTickets: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = customers.map((c) => {
      const totalBookings = c.bookings.length;
      const activeStays = c.bookings.filter((b) => b.status === "CHECKED_IN" || b.status === "CONFIRMED").length;
      const totalSpend = c.bookings
        .filter((b) => b.paymentStatus === "PAID")
        .reduce((sum, b) => sum + b.totalAmount, 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || "Not provided",
        createdAt: c.createdAt,
        totalBookings,
        activeStays,
        totalSpend,
        recentBooking: c.bookings[0] || null,
        ticketsCount: c.supportTickets.length,
      };
    });

    return NextResponse.json({ success: true, customers: formatted });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
