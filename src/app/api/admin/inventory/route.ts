import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const properties = await prisma.property.findMany({
      include: {
        roomTypes: {
          include: {
            rooms: {
              include: {
                inventoryUnits: {
                  include: {
                    availabilityBlocks: {
                      where: { endTime: { gt: new Date() } },
                    },
                    bookings: {
                      where: {
                        status: { in: ["CONFIRMED", "CHECKED_IN"] },
                        endTime: { gt: new Date() },
                      },
                      include: {
                        roomType: true,
                      },
                    },
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

// Create or release availability block
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { inventoryUnitId, reason = "MAINTENANCE", startTime, endTime, notes } = body;

    if (!inventoryUnitId || !startTime || !endTime) {
      return NextResponse.json({ error: "Unit ID, start time, and end time are required." }, { status: 400 });
    }

    const block = await prisma.availabilityBlock.create({
      data: {
        inventoryUnitId,
        reason,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notes,
      },
    });

    return NextResponse.json({ success: true, block, message: "Block applied successfully." });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const blockId = searchParams.get("id");

    if (!blockId) {
      return NextResponse.json({ error: "Block ID is required." }, { status: 400 });
    }

    await prisma.availabilityBlock.delete({
      where: { id: blockId },
    });

    return NextResponse.json({ success: true, message: "Block removed successfully." });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
