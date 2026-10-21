import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const DEFAULT_SETTINGS = {
  propertyName: "Stayzy Living",
  timezone: "Asia/Kolkata",
  currency: "INR",
  currencySymbol: "₹",
  gstRatePercent: 12,
  cleaningBufferMinutes: 60,
  holdExpiryMinutes: 15,
  defaultCheckInTime: "12:00 PM",
  defaultCheckOutTime: "11:00 AM",
  supportEmail: "support@stayzy.in",
  supportPhone: "+91 80 4567 8900",
  demoModeActive: true,
  enableSignedWebhooks: true,
};

export async function GET() {
  try {
    await requireAdmin();
    const settingRecord = await prisma.siteContent.findUnique({
      where: { key: "system_settings" },
    });

    let settings = DEFAULT_SETTINGS;
    if (settingRecord?.value) {
      try {
        settings = { ...DEFAULT_SETTINGS, ...JSON.parse(settingRecord.value) };
      } catch {
        // fallback
      }
    }

    return NextResponse.json({ success: true, settings });
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

    const currentRecord = await prisma.siteContent.findUnique({
      where: { key: "system_settings" },
    });

    let current = DEFAULT_SETTINGS;
    if (currentRecord?.value) {
      try {
        current = { ...DEFAULT_SETTINGS, ...JSON.parse(currentRecord.value) };
      } catch {}
    }

    const merged = { ...current, ...body };

    await prisma.siteContent.upsert({
      where: { key: "system_settings" },
      create: {
        key: "system_settings",
        value: JSON.stringify(merged),
      },
      update: {
        value: JSON.stringify(merged),
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: admin.email,
        action: "UPDATE_SYSTEM_SETTINGS",
        entityType: "Settings",
        entityId: "system_settings",
        details: "Updated operational system settings",
      },
    });

    return NextResponse.json({ success: true, settings: merged, message: "Settings saved successfully." });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
