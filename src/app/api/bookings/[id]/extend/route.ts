import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isUnitAvailable } from "@/lib/inventory";
import { addCalendarMonths, addCalendarYears } from "@/lib/pricing";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { additionalCount = 1 } = body;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        roomType: {
          include: {
            ratePlans: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "Cannot extend a cancelled booking." }, { status: 400 });
    }

    const currentEnd = new Date(booking.endTime);
    let newEnd: Date;
    let extensionRate = 0;

    const ratePlan = booking.roomType.ratePlans.find(
      (r) => r.durationType === booking.durationType
    );

    if (!ratePlan) {
      return NextResponse.json({ error: "Rate plan for extension not found." }, { status: 400 });
    }

    if (booking.durationType === "HOURLY") {
      newEnd = new Date(currentEnd.getTime() + additionalCount * 60 * 60 * 1000);
      extensionRate = ratePlan.price * additionalCount;
    } else if (booking.durationType === "DAILY") {
      newEnd = new Date(currentEnd.getTime() + additionalCount * 24 * 60 * 60 * 1000);
      extensionRate = ratePlan.price * additionalCount;
    } else if (booking.durationType === "WEEKLY") {
      newEnd = new Date(currentEnd.getTime() + additionalCount * 7 * 24 * 60 * 60 * 1000);
      extensionRate = ratePlan.price * additionalCount;
    } else if (booking.durationType === "MONTHLY") {
      const { resultDate } = addCalendarMonths(currentEnd, additionalCount);
      newEnd = resultDate;
      newEnd.setHours(11, 0, 0);
      extensionRate = (ratePlan.price + (ratePlan.foodMonthlyCharge || 0)) * additionalCount;
    } else if (booking.durationType === "YEARLY") {
      const { resultDate } = addCalendarYears(currentEnd, 1);
      newEnd = resultDate;
      newEnd.setHours(11, 0, 0);
      extensionRate = (ratePlan.price + (ratePlan.foodMonthlyCharge || 0)) * 12;
    } else {
      return NextResponse.json({ error: "Unsupported duration for extension." }, { status: 400 });
    }

    // Recheck availability for the extended window [currentEnd, newEnd]
    if (booking.inventoryUnitId) {
      const available = await isUnitAvailable(
        booking.inventoryUnitId,
        currentEnd,
        newEnd
      );

      if (!available) {
        return NextResponse.json(
          {
            error:
              "The room or bed is booked or blocked for the requested extension period.",
          },
          { status: 409 }
        );
      }
    }

    const additionalTax = Math.round(extensionRate * 0.12);
    const additionalTotal = extensionRate + additionalTax;

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: {
          endTime: newEnd,
          durationCount: booking.durationCount + additionalCount,
          basePrice: booking.basePrice + extensionRate,
          taxes: booking.taxes + additionalTax,
          totalAmount: booking.totalAmount + additionalTotal,
          payableNow: booking.payableNow + additionalTotal,
        },
      });

      // Update booking item
      if (booking.inventoryUnitId) {
        await tx.bookingItem.updateMany({
          where: { bookingId: b.id },
          data: { endTime: newEnd },
        });
      }

      // Record extension payment
      await tx.payment.create({
        data: {
          bookingId: b.id,
          amount: additionalTotal,
          currency: "INR",
          status: "SUCCESS",
          provider: "DEMO_ADAPTER",
          transactionRef: `TXN_EXT_${Date.now()}`,
          isDemo: true,
        },
      });

      return b;
    });

    return NextResponse.json({
      success: true,
      booking: updated,
      additionalTotal,
      newEndTime: newEnd.toISOString(),
      message: `Booking successfully extended! New checkout: ${newEnd.toLocaleDateString("en-IN")}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
