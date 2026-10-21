import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { isUnitAvailable } from "@/lib/inventory";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const durationType = searchParams.get("durationType");

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (durationType && durationType !== "ALL") where.durationType = durationType;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        property: true,
        roomType: true,
        inventoryUnit: {
          include: { room: true },
        },
        payments: true,
        refunds: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Offline/Manual booking entry by Admin
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const {
      propertyId,
      roomTypeId,
      inventoryUnitId,
      durationType,
      startDate,
      endDate,
      durationCount = 1,
      guestName,
      guestEmail,
      guestPhone,
      guestCount = 1,
      totalAmount,
      depositAmount = 0,
      notes,
    } = body;

    if (!propertyId || !roomTypeId || !inventoryUnitId || !startDate || !endDate || !guestName || !guestPhone) {
      return NextResponse.json(
        { error: "Missing required fields for manual booking." },
        { status: 400 }
      );
    }

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    // Verify unit availability
    const available = await isUnitAvailable(inventoryUnitId, startDateTime, endDateTime);
    if (!available) {
      return NextResponse.json(
        { error: "Selected inventory unit is already occupied or blocked in this date range." },
        { status: 409 }
      );
    }

    const refCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    const bookingReference = `STY-MANUAL-${refCode}`;

    const parsedTotal = Number(totalAmount) || 0;
    const parsedDeposit = Number(depositAmount) || 0;

    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          bookingReference,
          propertyId,
          roomTypeId,
          inventoryUnitId,
          durationType,
          startTime: startDateTime,
          endTime: endDateTime,
          durationCount: Number(durationCount),
          guestCount: Number(guestCount),
          guestName,
          guestEmail: guestEmail || "offline.guest@stayzy.in",
          guestPhone,
          basePrice: parsedTotal - parsedDeposit,
          depositAmount: parsedDeposit,
          totalAmount: parsedTotal,
          payableNow: parsedTotal,
          balanceRemaining: 0,
          status: "CONFIRMED",
          paymentStatus: "PAID",
          notes: notes ? `[Manual Offline Entry] ${notes}` : "[Manual Offline Entry]",
        },
      });

      await tx.bookingItem.create({
        data: {
          bookingId: b.id,
          inventoryUnitId,
          startTime: startDateTime,
          endTime: endDateTime,
        },
      });

      await tx.payment.create({
        data: {
          bookingId: b.id,
          amount: parsedTotal,
          currency: "INR",
          status: "SUCCESS",
          provider: "DEMO_ADAPTER",
          transactionRef: `OFFLINE_CASH_${Date.now()}`,
          isDemo: true,
          paidAt: new Date(),
        },
      });

      return b;
    });

    return NextResponse.json({
      success: true,
      booking,
      message: `Offline booking confirmed with reference ${booking.bookingReference}`,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
