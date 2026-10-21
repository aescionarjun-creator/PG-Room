import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    const propertyFilter = propertyId && propertyId !== "ALL" ? { id: propertyId } : {};

    const properties = await prisma.property.findMany({
      where: propertyFilter,
      include: {
        roomTypes: {
          include: {
            rooms: {
              include: {
                inventoryUnits: {
                  include: {
                    bookings: {
                      where: {
                        status: { in: ["CONFIRMED", "CHECKED_IN"] },
                      },
                      include: {
                        user: { select: { name: true, phone: true } },
                      },
                    },
                    inventoryHolds: {
                      where: {
                        expiresAt: { gt: new Date() },
                      },
                    },
                    availabilityBlocks: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, properties });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
