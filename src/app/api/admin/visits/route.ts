import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const visits = await prisma.visitRequest.findMany({
      include: {
        property: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, visits });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Visit ID and status are required." }, { status: 400 });
    }

    const visit = await prisma.visitRequest.update({
      where: { id },
      data: {
        status,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: admin.email,
        action: "UPDATE_VISIT",
        entityType: "VisitRequest",
        entityId: id,
        details: `Updated visit request status to ${status}`,
      },
    });

    return NextResponse.json({ success: true, visit, message: `Visit request marked as ${status}.` });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
