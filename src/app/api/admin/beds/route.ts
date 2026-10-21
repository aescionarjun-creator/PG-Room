import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const rooms = await prisma.room.findMany({
      include: {
        roomType: {
          include: { property: true },
        },
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
              orderBy: { startTime: "asc" },
              take: 2,
            },
          },
        },
      },
      orderBy: [{ floor: "asc" }, { roomNumber: "asc" }],
    });

    return NextResponse.json({ success: true, rooms });
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
    const { action, unitId, roomId, identifier, isBed, status } = body;

    if (action === "ADD_UNIT") {
      if (!roomId || !identifier) {
        return NextResponse.json({ error: "Room ID and identifier are required." }, { status: 400 });
      }

      const unit = await prisma.inventoryUnit.create({
        data: {
          roomId,
          identifier,
          isBed: Boolean(isBed),
          status: status || "AVAILABLE",
        },
      });

      await prisma.auditLog.create({
        data: {
          adminEmail: admin.email,
          action: "CREATE_UNIT",
          entityType: "InventoryUnit",
          entityId: unit.id,
          details: `Added new unit ${identifier}`,
        },
      });

      return NextResponse.json({ success: true, unit, message: "Unit added successfully." });
    }

    if (action === "UPDATE_STATUS") {
      if (!unitId || !status) {
        return NextResponse.json({ error: "Unit ID and status are required." }, { status: 400 });
      }

      const updated = await prisma.inventoryUnit.update({
        where: { id: unitId },
        data: { status },
      });

      await prisma.auditLog.create({
        data: {
          adminEmail: admin.email,
          action: "UPDATE_UNIT_STATUS",
          entityType: "InventoryUnit",
          entityId: unitId,
          details: `Changed unit status to ${status}`,
        },
      });

      return NextResponse.json({ success: true, unit: updated, message: `Status updated to ${status}.` });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
