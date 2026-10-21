import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, verifyPassword, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, demoType, requiredRole } = body;

    let user: any = null;

    // 1. Quick demo login bypass if demoType is provided
    if (demoType === "customer") {
      user = await prisma.user.findFirst({
        where: { role: "CUSTOMER" },
      });
    } else if (demoType === "admin") {
      user = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });
    } else {
      // 2. Standard credential verification
      if (!email || !password) {
        return NextResponse.json(
          { error: "Please enter your email and password." },
          { status: 400 }
        );
      }

      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user || !verifyPassword(password, user.passwordHash)) {
        return NextResponse.json(
          { error: "Invalid email address or password." },
          { status: 401 }
        );
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    // Role check if admin login route specifically requested admin only
    if (requiredRole === "ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. This account does not possess administrator credentials." },
        { status: 403 }
      );
    }

    const token = createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
