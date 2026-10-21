import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        booking: {
          select: {
            id: true,
            bookingReference: true,
            roomType: { select: { name: true } },
            inventoryUnit: { select: { identifier: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, tickets });
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
    const { ticketId, reply, status = "IN_PROGRESS" } = body;

    if (!ticketId || !reply) {
      return NextResponse.json({ error: "Ticket ID and reply message are required." }, { status: 400 });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        adminReply: reply,
        repliedAt: new Date(),
        status,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: admin.email,
        action: "REPLY_SUPPORT_TICKET",
        entityType: "SupportTicket",
        entityId: ticketId,
        details: `Sent reply and marked ticket as ${status}`,
      },
    });

    return NextResponse.json({
      success: true,
      ticket: updated,
      message: "Reply sent to customer successfully.",
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
