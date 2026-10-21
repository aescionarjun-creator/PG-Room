import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateBookingPricing } from "@/lib/pricing";
import { DurationType } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      roomTypeId,
      durationType,
      startDate,
      startTime,
      durationCount = 1,
      includeFood = false,
    } = body;

    if (!roomTypeId || !durationType || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields (roomTypeId, durationType, startDate)." },
        { status: 400 }
      );
    }

    const ratePlan = await prisma.ratePlan.findUnique({
      where: {
        roomTypeId_durationType: {
          roomTypeId,
          durationType: durationType as string,
        },
      },
    });

    if (!ratePlan) {
      return NextResponse.json(
        { error: `Duration "${durationType}" is not offered for this room.` },
        { status: 404 }
      );
    }

    const calcResult = calculateBookingPricing({
      ratePlan,
      durationType: durationType as DurationType,
      durationCount: Number(durationCount),
      startDateStr: startDate,
      startTimeStr: startTime,
      includeFood: Boolean(includeFood),
    });

    if (!calcResult.success) {
      return NextResponse.json({ error: calcResult.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      breakdown: calcResult.breakdown,
      ratePlan: {
        minDuration: ratePlan.minDuration,
        maxDuration: ratePlan.maxDuration,
        allowedHoursStart: ratePlan.allowedHoursStart,
        allowedHoursEnd: ratePlan.allowedHoursEnd,
        depositAmount: ratePlan.depositAmount,
        electricityRule: ratePlan.electricityRule,
        notes: ratePlan.notes,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
