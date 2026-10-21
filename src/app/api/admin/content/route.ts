import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const contents = await prisma.siteContent.findMany({
      orderBy: { key: "asc" },
    });

    const contentMap: Record<string, any> = {};
    for (const item of contents) {
      try {
        contentMap[item.key] = JSON.parse(item.value);
      } catch {
        contentMap[item.key] = item.value;
      }
    }

    return NextResponse.json({ success: true, contents: contentMap, raw: contents });
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
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required." }, { status: 400 });
    }

    const stringValue = typeof value === "string" ? value : JSON.stringify(value);

    const updated = await prisma.siteContent.upsert({
      where: { key },
      create: { key, value: stringValue },
      update: { value: stringValue },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: admin.email,
        action: "UPDATE_SITE_CONTENT",
        entityType: "SiteContent",
        entityId: key,
        details: `Updated CMS content for ${key}`,
      },
    });

    return NextResponse.json({
      success: true,
      content: updated,
      message: `Content for ${key} updated successfully.`,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
