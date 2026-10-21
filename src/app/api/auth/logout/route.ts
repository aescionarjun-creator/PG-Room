import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, getCurrentUser } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully." });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({
      success: true,
      user: user || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
