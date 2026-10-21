import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const roomTypes = await prisma.roomType.findMany({
      include: {
        property: true,
        ratePlans: true,
        rooms: {
          include: {
            inventoryUnits: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, roomTypes });
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
      propertyId,
      name,
      slug,
      category,
      description,
      sizeSqFt,
      baseCapacity,
      maxCapacity,
      hasAc,
      bathroomType,
      foodIncluded,
      foodDetails,
      keyAmenities,
      images,
    } = body;

    if (!propertyId || !name || !category) {
      return NextResponse.json(
        { error: "Property ID, room name, and category are required." },
        { status: 400 }
      );
    }

    const amenitiesJson = Array.isArray(keyAmenities)
      ? JSON.stringify(keyAmenities)
      : typeof keyAmenities === "string"
      ? keyAmenities
      : JSON.stringify(["High-Speed Wi-Fi", "Daily Housekeeping"]);

    const imagesJson = Array.isArray(images)
      ? JSON.stringify(images)
      : typeof images === "string"
      ? images
      : JSON.stringify([
          "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        ]);

    let roomType;
    if (id) {
      roomType = await prisma.roomType.update({
        where: { id },
        data: {
          propertyId,
          name,
          category,
          description: description || "",
          sizeSqFt: Number(sizeSqFt) || 200,
          baseCapacity: Number(baseCapacity) || 1,
          maxCapacity: Number(maxCapacity) || 1,
          hasAc: Boolean(hasAc),
          bathroomType: bathroomType || "ATTACHED",
          foodIncluded: Boolean(foodIncluded),
          foodDetails: foodDetails || null,
          keyAmenities: amenitiesJson,
          images: imagesJson,
        },
      });

      await prisma.auditLog.create({
        data: {
          adminEmail: admin.email,
          action: "UPDATE_ROOM_TYPE",
          entityType: "RoomType",
          entityId: id,
          details: `Updated room configuration: ${name}`,
        },
      });
    } else {
      const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + `-${Date.now().toString().slice(-4)}`;
      roomType = await prisma.roomType.create({
        data: {
          propertyId,
          name,
          slug: generatedSlug,
          category,
          description: description || "Comfortable and fully-serviced Stayzy accommodation.",
          sizeSqFt: Number(sizeSqFt) || 200,
          baseCapacity: Number(baseCapacity) || 1,
          maxCapacity: Number(maxCapacity) || 1,
          hasAc: hasAc !== undefined ? Boolean(hasAc) : true,
          bathroomType: bathroomType || "ATTACHED",
          foodIncluded: Boolean(foodIncluded),
          foodDetails: foodDetails || null,
          keyAmenities: amenitiesJson,
          images: imagesJson,
        },
      });

      // Automatically create a default physical room and unit so it can be booked immediately
      const physicalRoom = await prisma.room.create({
        data: {
          roomTypeId: roomType.id,
          roomNumber: `Room-${Math.floor(100 + Math.random() * 900)}`,
          floor: 1,
          status: "ACTIVE",
        },
      });

      const isBed = category !== "PRIVATE";
      const unitCount = category === "TRIPLE_SHARING" ? 3 : category === "TWIN_SHARING" ? 2 : 1;

      for (let i = 0; i < unitCount; i++) {
        await prisma.inventoryUnit.create({
          data: {
            roomId: physicalRoom.id,
            identifier: isBed ? `Bed ${String.fromCharCode(65 + i)}` : physicalRoom.roomNumber,
            isBed,
            status: "AVAILABLE",
          },
        });
      }

      // Create default rate plans for all 5 durations so it's bookable
      await prisma.ratePlan.createMany({
        data: [
          { roomTypeId: roomType.id, durationType: "HOURLY", price: 150, depositAmount: 200, minDuration: 2, maxDuration: 10 },
          { roomTypeId: roomType.id, durationType: "DAILY", price: 900, depositAmount: 500, minDuration: 1, maxDuration: 28 },
          { roomTypeId: roomType.id, durationType: "WEEKLY", price: 5500, depositAmount: 1500, minDuration: 1, maxDuration: 8 },
          { roomTypeId: roomType.id, durationType: "MONTHLY", price: 18000, depositAmount: 5000, minDuration: 1, maxDuration: 11 },
          { roomTypeId: roomType.id, durationType: "YEARLY", price: 200000, depositAmount: 10000, minDuration: 1, maxDuration: 3 },
        ],
      });

      await prisma.auditLog.create({
        data: {
          adminEmail: admin.email,
          action: "CREATE_ROOM_TYPE",
          entityType: "RoomType",
          entityId: roomType.id,
          details: `Created new room category: ${name} with units and 5 duration rate plans`,
        },
      });
    }

    return NextResponse.json({ success: true, roomType, message: "Room type saved successfully." });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_ADMIN_REQUIRED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
