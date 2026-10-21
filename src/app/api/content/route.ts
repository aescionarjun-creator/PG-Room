import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const contents = await prisma.siteContent.findMany();
    const contentMap: Record<string, any> = {};

    for (const item of contents) {
      try {
        contentMap[item.key] = JSON.parse(item.value);
      } catch {
        contentMap[item.key] = item.value;
      }
    }

    return NextResponse.json({ success: true, content: contentMap });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
