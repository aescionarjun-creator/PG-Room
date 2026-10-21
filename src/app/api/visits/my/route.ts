import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const visits = await prisma.visitRequest.findMany({
      where: {
        OR: [{ userId: user.id }, { customerEmail: user.email }],
      },
      include: {
        property: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, visits });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
