import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalBookingsCount,
      confirmedBookings,
      totalUnitsCount,
      visitRequests,
      activeHoldsCount,
      recentBookings,
      properties,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.findMany({
        where: { paymentStatus: "PAID" },
        select: { totalAmount: true, status: true },
      }),
      prisma.inventoryUnit.count(),
      prisma.visitRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { property: true },
      }),
      prisma.inventoryHold.count({
        where: { expiresAt: { gt: new Date() } },
      }),
      prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          property: true,
          roomType: true,
          inventoryUnit: true,
        },
      }),
      prisma.property.findMany({
        include: {
          roomTypes: {
            include: {
              rooms: {
                include: {
                  inventoryUnits: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const totalRevenue = confirmedBookings.reduce((acc, b) => acc + b.totalAmount, 0);
    const checkedInCount = confirmedBookings.filter((b) => b.status === "CHECKED_IN").length;
    const confirmedCount = confirmedBookings.filter((b) => b.status === "CONFIRMED").length;
    const pendingVisitsCount = visitRequests.filter((v) => v.status === "SCHEDULED").length;

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalBookingsCount,
        checkedInCount,
        confirmedCount,
        totalUnitsCount,
        activeHoldsCount,
        pendingVisitsCount,
      },
      recentBookings,
      recentVisits: visitRequests,
      properties,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json(
        { error: "Admin access required. Please toggle to Admin profile." },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
