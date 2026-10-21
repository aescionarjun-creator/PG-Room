import { NextResponse } from "next/server";
import { createInventoryHold, releaseInventoryHold } from "@/lib/inventory";
import { prisma } from "@/lib/prisma";
import { calculateBookingPricing } from "@/lib/pricing";
import { DurationType } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      roomTypeId,
      inventoryUnitId,
      durationType,
      startDate,
      startTime,
      durationCount = 1,
      guestEmail,
    } = body;

    const ratePlan = await prisma.ratePlan.findUnique({
      where: {
        roomTypeId_durationType: {
          roomTypeId,
          durationType: durationType as string,
        },
      },
    });

    if (!ratePlan || !ratePlan.isEnabled) {
      return NextResponse.json(
        { error: "Selected duration is not available for this room." },
        { status: 400 }
      );
    }

    const calcResult = calculateBookingPricing({
      ratePlan,
      durationType: durationType as DurationType,
      durationCount: Number(durationCount),
      startDateStr: startDate,
      startTimeStr: startTime,
    });

    if (!calcResult.success) {
      return NextResponse.json({ error: calcResult.error }, { status: 400 });
    }

    const start = new Date(calcResult.breakdown.startDateTime);
    const end = new Date(calcResult.breakdown.endDateTime);

    const holdResult = await createInventoryHold({
      roomTypeId,
      inventoryUnitId,
      durationType,
      startTime: start,
      endTime: end,
      guestEmail,
    });

    if (!holdResult.success) {
      return NextResponse.json({ error: holdResult.error }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      token: holdResult.token,
      expiresAt: holdResult.expiresAt,
      unit: holdResult.unit,
      pricing: calcResult.breakdown,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Hold token is required." }, { status: 400 });
    }

    await releaseInventoryHold(token);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
