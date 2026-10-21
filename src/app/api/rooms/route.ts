import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findAvailableUnits } from "@/lib/inventory";
import { calculateBookingPricing } from "@/lib/pricing";
import { DurationType } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const durationType = (searchParams.get("durationType") || "MONTHLY") as DurationType;
    const propertyId = searchParams.get("propertyId");
    const locality = searchParams.get("locality"); // "Koramangala" | "HSR Layout" | "Indiranagar"
    const category = searchParams.get("category");
    const hasAc = searchParams.get("hasAc");
    const bathroomType = searchParams.get("bathroomType");
    const foodIncluded = searchParams.get("foodIncluded");
    const minBudget = searchParams.get("minBudget") ? Number(searchParams.get("minBudget")) : undefined;
    const maxBudget = searchParams.get("maxBudget") ? Number(searchParams.get("maxBudget")) : undefined;
    const availableOnly = searchParams.get("availableOnly") === "true";
    const sortBy = searchParams.get("sortBy") || "recommended";
    const startDate = searchParams.get("startDate") || new Date().toISOString().split("T")[0];
    const startTime = searchParams.get("startTime") || "10:00";
    const durationCount = Number(searchParams.get("durationCount") || 1);

    const whereClause: any = {};
    if (propertyId && propertyId !== "ALL") whereClause.propertyId = propertyId;
    if (category && category !== "ALL") {
      if (category === "STUDIO") {
        whereClause.category = "PRIVATE";
      } else {
        whereClause.category = category;
      }
    }
    if (hasAc === "true") whereClause.hasAc = true;
    if (bathroomType && bathroomType !== "ALL") whereClause.bathroomType = bathroomType;
    if (foodIncluded === "true") whereClause.foodIncluded = true;

    // Room types matching criteria and having rate plan for this duration
    const roomTypes = await prisma.roomType.findMany({
      where: {
        ...whereClause,
        ratePlans: {
          some: {
            durationType,
            isEnabled: true,
          },
        },
      },
      include: {
        property: true,
        ratePlans: {
          where: { isEnabled: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enrichedRooms = await Promise.all(
      roomTypes.map(async (rt) => {
        // Locality filter if passed
        if (locality && locality !== "ALL") {
          const propNameAndAddr = `${rt.property.name} ${rt.property.address}`.toLowerCase();
          if (!propNameAndAddr.includes(locality.toLowerCase())) {
            return null;
          }
        }

        const activeRatePlan = rt.ratePlans.find((rp) => rp.durationType === durationType);
        if (!activeRatePlan) return null;

        // Calculate pricing
        const pricing = calculateBookingPricing({
          ratePlan: activeRatePlan,
          durationType,
          durationCount,
          startDateStr: startDate,
          startTimeStr: startTime,
        });

        let availableCount = 0;
        let startDateTime: Date | null = null;
        let endDateTime: Date | null = null;

        if (pricing.success) {
          startDateTime = new Date(pricing.breakdown.startDateTime);
          endDateTime = new Date(pricing.breakdown.endDateTime);
          const availableUnits = await findAvailableUnits(rt.id, startDateTime, endDateTime);
          availableCount = availableUnits.length;
        }

        // If filtering for only available units
        if (availableOnly && availableCount === 0) {
          return null;
        }

        let parsedImages: string[] = [];
        try {
          parsedImages = JSON.parse(rt.images);
        } catch {
          parsedImages = [];
        }

        let parsedAmenities: string[] = [];
        try {
          parsedAmenities = JSON.parse(rt.keyAmenities);
        } catch {
          parsedAmenities = [];
        }

        // Determine locality tag
        let displayLocality = "Bengaluru";
        if (rt.property.address.toLowerCase().includes("koramangala") || rt.property.name.toLowerCase().includes("koramangala")) {
          displayLocality = "Koramangala";
        } else if (rt.property.address.toLowerCase().includes("hsr") || rt.property.name.toLowerCase().includes("hsr")) {
          displayLocality = "HSR Layout";
        } else if (rt.property.address.toLowerCase().includes("indiranagar") || rt.property.name.toLowerCase().includes("indiranagar")) {
          displayLocality = "Indiranagar";
        }

        // Gender suitability
        const genderEligibility = rt.name.toLowerCase().includes("women") || rt.description.toLowerCase().includes("female")
          ? "FEMALE"
          : rt.name.toLowerCase().includes("men")
          ? "MALE"
          : "COLIVING";

        return {
          id: rt.id,
          name: rt.name,
          slug: rt.slug,
          category: rt.category,
          description: rt.description,
          sizeSqFt: rt.sizeSqFt,
          baseCapacity: rt.baseCapacity,
          maxCapacity: rt.maxCapacity,
          hasAc: rt.hasAc,
          bathroomType: rt.bathroomType,
          foodIncluded: rt.foodIncluded,
          foodDetails: rt.foodDetails,
          furnishingStatus: "Fully Furnished",
          genderEligibility,
          displayLocality,
          images: parsedImages,
          keyAmenities: parsedAmenities,
          property: {
            id: rt.property.id,
            name: rt.property.name,
            city: rt.property.city,
            address: rt.property.address,
            coverImage: rt.property.coverImage,
            rules: rt.property.rules,
            checkInTime: rt.property.checkInTime,
            checkOutTime: rt.property.checkOutTime,
            contactPhone: rt.property.contactPhone,
            contactEmail: rt.property.contactEmail,
          },
          currentRatePlan: activeRatePlan,
          allRatePlans: rt.ratePlans,
          pricing: pricing.success ? pricing.breakdown : null,
          availableCount,
          isAvailable: availableCount > 0,
          createdAt: rt.createdAt,
        };
      })
    );

    let filtered = enrichedRooms.filter((r): r is NonNullable<typeof r> => r !== null);

    if (minBudget !== undefined) {
      filtered = filtered.filter((r) => (r.pricing?.baseAmount || r.currentRatePlan.price) >= minBudget);
    }
    if (maxBudget !== undefined) {
      filtered = filtered.filter((r) => (r.pricing?.baseAmount || r.currentRatePlan.price) <= maxBudget);
    }

    if (sortBy === "price_asc") {
      filtered.sort((a, b) => a.currentRatePlan.price - b.currentRatePlan.price);
    } else if (sortBy === "price_desc") {
      filtered.sort((a, b) => b.currentRatePlan.price - a.currentRatePlan.price);
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // Recommended: prioritize available units, then lower price
      filtered.sort((a, b) => {
        if (a.availableCount > 0 && b.availableCount === 0) return -1;
        if (a.availableCount === 0 && b.availableCount > 0) return 1;
        return a.currentRatePlan.price - b.currentRatePlan.price;
      });
    }

    return NextResponse.json({
      success: true,
      rooms: filtered,
      total: filtered.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
