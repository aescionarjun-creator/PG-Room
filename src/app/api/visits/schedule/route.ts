import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { propertyId, customerName, customerEmail, customerPhone, preferredDate, timeSlot, notes } = body;

    if (!propertyId || !customerName || !customerPhone || !preferredDate || !timeSlot) {
      return NextResponse.json(
        { error: "Please fill in all required fields (Name, Phone, Date, Time Slot)." },
        { status: 400 }
      );
    }

    const visit = await prisma.visitRequest.create({
      data: {
        propertyId,
        customerName,
        customerEmail: customerEmail || "",
        customerPhone,
        preferredDate: new Date(preferredDate),
        timeSlot,
        notes: notes || null,
        status: "SCHEDULED",
      },
    });

    return NextResponse.json({
      success: true,
      visit,
      message: "Visit successfully scheduled! Our property manager will call you shortly to confirm.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
