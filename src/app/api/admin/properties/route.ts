import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const properties = await prisma.property.findMany({
      include: {
        roomTypes: {
          include: {
            rooms: {
              include: {
                inventoryUnits: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
            visitRequests: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, properties });
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
    const {
      id,
      name,
      slug,
      tagline,
      description,
      address,
      city,
      state,
      pincode,
      contactPhone,
      contactEmail,
      rules,
      checkInTime,
      checkOutTime,
      timezone,
      coverImage,
    } = body;

    if (!name || !address || !contactPhone || !contactEmail) {
      return NextResponse.json(
        { error: "Name, address, contact phone, and contact email are required." },
        { status: 400 }
      );
    }

    let property;
    if (id) {
      // Update
      property = await prisma.property.update({
        where: { id },
        data: {
          name,
          tagline,
          description: description || "",
          address,
          city: city || "Bengaluru",
          state: state || "Karnataka",
          pincode: pincode || "560034",
          contactPhone,
          contactEmail,
          rules,
          checkInTime: checkInTime || "12:00 PM",
          checkOutTime: checkOutTime || "11:00 AM",
          timezone: timezone || "Asia/Kolkata",
          coverImage: coverImage || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
        },
      });

      await prisma.auditLog.create({
        data: {
          adminEmail: admin.email,
          action: "UPDATE_PROPERTY",
          entityType: "Property",
          entityId: id,
          details: `Updated property settings for ${name}`,
        },
      });
    } else {
      // Create
      const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      property = await prisma.property.create({
        data: {
          name,
          slug: generatedSlug,
          tagline,
          description: description || "Modern coliving property with fully furnished rooms.",
          address,
          city: city || "Bengaluru",
          state: state || "Karnataka",
          pincode: pincode || "560034",
          contactPhone,
          contactEmail,
          rules: rules || "Quiet hours after 10 PM. Visitors allowed in lounge until 8 PM.",
          checkInTime: checkInTime || "12:00 PM",
          checkOutTime: checkOutTime || "11:00 AM",
          timezone: timezone || "Asia/Kolkata",
          coverImage: coverImage || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
          images: JSON.stringify([
            coverImage || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
          ]),
        },
      });

      await prisma.auditLog.create({
        data: {
          adminEmail: admin.email,
          action: "CREATE_PROPERTY",
          entityType: "Property",
          entityId: property.id,
          details: `Created new property: ${name}`,
        },
      });
    }

    return NextResponse.json({ success: true, property, message: "Property saved successfully." });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
