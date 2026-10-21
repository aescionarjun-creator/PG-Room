import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateBookingPricing } from "@/lib/pricing";
import { PaymentAdapter } from "@/lib/payments/adapter";
import { getCurrentUser } from "@/lib/auth";
import { DurationType } from "@/lib/types";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      holdToken,
      roomTypeId,
      inventoryUnitId,
      durationType,
      startDate,
      startTime,
      durationCount,
      includeFood = false,
      guestName,
      guestEmail,
      guestPhone,
      guestCount = 1,
      specialRequests,
      termsAccepted,
    } = body;

    if (!termsAccepted) {
      return NextResponse.json(
        { error: "You must accept the Stayzy Booking & Cancellation terms to proceed." },
        { status: 400 }
      );
    }

    if (!guestName || !guestEmail || !guestPhone) {
      return NextResponse.json(
        { error: "Please provide your Full Name, Email Address, and Phone Number." },
        { status: 400 }
      );
    }

    // 1. Verify hold if token passed
    let unitId = inventoryUnitId;
    if (holdToken) {
      const hold = await prisma.inventoryHold.findUnique({
        where: { token: holdToken },
      });

      if (!hold || hold.expiresAt < new Date()) {
        return NextResponse.json(
          { error: "Your 15-minute checkout reservation hold has expired. Please reselect your dates." },
          { status: 410 }
        );
      }
      unitId = hold.inventoryUnitId || unitId;
    }

    // 2. Fetch roomType and property
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      include: {
        property: true,
        ratePlans: {
          where: { durationType: durationType as string },
        },
      },
    });

    if (!roomType || !roomType.ratePlans[0]) {
      return NextResponse.json(
        { error: "Selected room or rate plan could not be located." },
        { status: 404 }
      );
    }

    const ratePlan = roomType.ratePlans[0];

    // 3. Recalculate price strictly on the server
    const pricing = calculateBookingPricing({
      ratePlan,
      durationType: durationType as DurationType,
      durationCount: Number(durationCount),
      startDateStr: startDate,
      startTimeStr: startTime,
      includeFood: Boolean(includeFood),
    });

    if (!pricing.success) {
      return NextResponse.json({ error: pricing.error }, { status: 400 });
    }

    const { breakdown } = pricing;

    // Check guest count within capacity
    if (guestCount > roomType.maxCapacity) {
      return NextResponse.json(
        { error: `Maximum guest capacity for this room is ${roomType.maxCapacity}.` },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();

    // 4. Generate unique human-readable booking reference
    const refCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    const bookingReference = `STY-${new Date().getFullYear()}-${refCode}`;

    const startDateTime = new Date(breakdown.startDateTime);
    const endDateTime = new Date(breakdown.endDateTime);

    // 5. Create Booking in atomic transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          bookingReference,
          userId: currentUser?.id || null,
          propertyId: roomType.propertyId,
          roomTypeId: roomType.id,
          inventoryUnitId: unitId,
          durationType,
          startTime: startDateTime,
          endTime: endDateTime,
          durationCount: Number(durationCount),
          guestCount: Number(guestCount),
          guestName,
          guestEmail,
          guestPhone,
          specialRequests: specialRequests || null,
          basePrice: breakdown.baseAmount,
          foodCharges: breakdown.foodCharge,
          taxes: breakdown.taxes,
          depositAmount: breakdown.depositAmount,
          totalAmount: breakdown.totalAmount,
          payableNow: breakdown.payableNow,
          balanceRemaining: breakdown.balanceRemaining,
          status: "PENDING",
          paymentStatus: "UNPAID",
        },
      });

      // If yearly installment schedule exists, persist schedules
      if (breakdown.schedule && breakdown.schedule.length > 0) {
        for (const item of breakdown.schedule) {
          await tx.paymentSchedule.create({
            data: {
              bookingId: newBooking.id,
              dueDate: new Date(item.dueDate),
              amount: item.amount,
              description: item.description,
              status: "PENDING",
            },
          });
        }
      }

      return newBooking;
    });

    // 6. Initiate Payment
    const paymentInit = await PaymentAdapter.initiatePayment({
      bookingId: booking.id,
      amount: breakdown.payableNow,
      currency: "INR",
      customerEmail: guestEmail,
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      payableNow: breakdown.payableNow,
      currency: "INR",
      paymentDetails: paymentInit,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
