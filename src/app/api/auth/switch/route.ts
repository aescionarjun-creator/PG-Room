import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { role } = await request.json(); // "CUSTOMER" | "ADMIN"

    const targetUser = await prisma.user.findFirst({
      where: { role: role === "ADMIN" ? "ADMIN" : "CUSTOMER" },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User role profile not found." }, { status: 404 });
    }

    const token = createSessionToken(targetUser);
    const response = NextResponse.json({
      success: true,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
    });

    response.cookies.set("stayzy_session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
