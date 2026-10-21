import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const roomType = await prisma.roomType.findUnique({
      where: { slug },
      include: {
        property: true,
        ratePlans: {
          where: { isEnabled: true },
        },
        rooms: {
          where: { status: "ACTIVE" },
          include: {
            inventoryUnits: true,
          },
        },
      },
    });

    if (!roomType) {
      return NextResponse.json({ error: "Room not found." }, { status: 404 });
    }

    let parsedImages: string[] = [];
    try {
      parsedImages = JSON.parse(roomType.images);
    } catch {
      parsedImages = [];
    }

    let parsedAmenities: string[] = [];
    try {
      parsedAmenities = JSON.parse(roomType.keyAmenities);
    } catch {
      parsedAmenities = [];
    }

    // Count available units
    const totalUnits = roomType.rooms.reduce(
      (acc, r) => acc + r.inventoryUnits.length,
      0
    );

    return NextResponse.json({
      success: true,
      room: {
        ...roomType,
        images: parsedImages,
        keyAmenities: parsedAmenities,
        totalUnits,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
