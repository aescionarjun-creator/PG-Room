import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const roomTypes = await prisma.roomType.findMany({
      include: {
        property: true,
        ratePlans: {
          orderBy: { durationType: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, roomTypes });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { ratePlanId, price, isEnabled, depositAmount, foodMonthlyCharge, allowedHoursStart, allowedHoursEnd } = body;

    if (!ratePlanId) {
      return NextResponse.json({ error: "Rate plan ID is required." }, { status: 400 });
    }

    const updated = await prisma.ratePlan.update({
      where: { id: ratePlanId },
      data: {
        price: price !== undefined ? Number(price) : undefined,
        isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : undefined,
        depositAmount: depositAmount !== undefined ? Number(depositAmount) : undefined,
        foodMonthlyCharge: foodMonthlyCharge !== undefined ? Number(foodMonthlyCharge) : undefined,
        allowedHoursStart: allowedHoursStart !== undefined ? allowedHoursStart : undefined,
        allowedHoursEnd: allowedHoursEnd !== undefined ? allowedHoursEnd : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      ratePlan: updated,
      message: "Rate plan updated successfully.",
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
