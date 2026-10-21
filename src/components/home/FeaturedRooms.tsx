import React from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import {
  MapPin,
  Users,
  Wind,
  ShowerHead,
  Utensils,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import prisma from "@/lib/prisma";

export async function FeaturedRooms() {
  const roomTypes = await prisma.roomType.findMany({
    take: 9,
    orderBy: { createdAt: "asc" },
    include: {
      property: true,
      ratePlans: {
        where: { isEnabled: true },
      },
      rooms: {
        where: { status: "ACTIVE" },
        include: {
          inventoryUnits: {
            where: { status: "AVAILABLE" },
          },
        },
      },
    },
  });

  return (
    <section className="py-24 bg-[#F8F7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#123D2B] bg-[#E8F1D5] px-3.5 py-1.5 rounded-full inline-block">
              Curated Selection
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123D2B] tracking-tight mt-3">
              Explore our stays
            </h2>
            <p className="text-sm sm:text-base text-[#5E6E65] mt-2 max-w-xl">
              Verified private rooms and shared PG beds across Bengaluru. All stays include furniture, high-speed Wi-Fi, and housekeeping.
            </p>
          </div>

          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#D5D2C7] text-sm font-bold text-[#123D2B] hover:bg-[#FAF8F5] transition-all group shadow-xs hover:shadow"
          >
            <span>View All Stays ({roomTypes.length}+ Listings)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3-Column Grid on Desktop, 2 on Tablet, 1 on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roomTypes.map((room) => {
            let images: string[] = [];
            try {
              images = JSON.parse(room.images);
            } catch {
              images = [];
            }
            const cover = images[0] || room.property?.coverImage || "/fallback-room.jpg";

            // Get available pricing tiers
            const monthlyPlan = room.ratePlans.find((r) => r.durationType === "MONTHLY");
            const dailyPlan = room.ratePlans.find((r) => r.durationType === "DAILY");
            const hourlyPlan = room.ratePlans.find((r) => r.durationType === "HOURLY");

            const availableUnits = room.rooms.reduce(
              (acc, r) => acc + r.inventoryUnits.length,
              0
            );

            const isPrivate = room.category === "PRIVATE";
            const categoryLabel =
              room.category === "PRIVATE"
                ? "Private Room"
                : room.category === "TWIN_SHARING"
                ? "Twin Sharing"
                : room.category === "TRIPLE_SHARING"
                ? "Triple Sharing"
                : "Shared Bed";

            return (
              <div
                key={room.id}
                className="bg-white rounded-3xl border border-[#E8E6DF] overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-300 flex flex-col group"
              >
                {/* Large Room Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={cover}
                    alt={`${room.name} - ${room.property.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Private / Shared indicator */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8F1D5] text-[#123D2B] shadow-sm">
                      {categoryLabel}
                    </span>
                  </div>

                  {/* Real Availability Indicator */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium">
                    {availableUnits > 0
                      ? `${availableUnits} ${isPrivate ? "Room" : "Bed"}${availableUnits > 1 ? "s" : ""} Available`
                      : "Check Availability"}
                  </div>
                </div>

                {/* Stay Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#5E6E65]">
                      <MapPin className="w-3.5 h-3.5 text-[#123D2B]" />
                      <span>{room.property.name}</span>
                    </div>

                    <h3 className="text-xl font-bold text-[#192621] leading-snug group-hover:text-[#123D2B] transition-colors">
                      {room.name}
                    </h3>

                    <p className="text-xs text-[#5E6E65] line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>

                    {/* 3-4 Useful Amenity Icons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[#F0EDE4] text-xs text-[#4A5550]">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF]">
                        <Users className="w-3 h-3 text-[#123D2B]" />
                        {room.maxCapacity} {room.maxCapacity > 1 ? "Guests" : "Guest"}
                      </span>
                      {room.hasAc && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF]">
                          <Wind className="w-3 h-3 text-[#123D2B]" />
                          AC Room
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF]">
                        <ShowerHead className="w-3 h-3 text-[#123D2B]" />
                        {room.bathroomType === "ATTACHED" ? "Attached Bath" : "Common Bath"}
                      </span>
                      {room.foodIncluded && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF]">
                          <Utensils className="w-3 h-3 text-[#123D2B]" />
                          Meals Incl.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & View Stay Button */}
                  <div className="pt-6 mt-6 border-t border-[#F0EDE4] flex items-center justify-between">
                    <div>
                      {monthlyPlan ? (
                        <div>
                          <span className="text-xl font-extrabold text-[#123D2B]">
                            ₹{monthlyPlan.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-[#5E6E65]">
                            {isPrivate ? " / room / mo" : " / bed / mo"}
                          </span>
                        </div>
                      ) : hourlyPlan ? (
                        <div>
                          <span className="text-xl font-extrabold text-[#123D2B]">
                            ₹{hourlyPlan.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-[#5E6E65]">
                            {isPrivate ? " / room / hr" : " / bed / hr"}
                          </span>
                        </div>
                      ) : dailyPlan ? (
                        <div>
                          <span className="text-xl font-extrabold text-[#123D2B]">
                            ₹{dailyPlan.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-[#5E6E65]">
                            {isPrivate ? " / room / night" : " / bed / night"}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <Link
                      href={`/rooms/${room.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] shadow-xs hover:shadow transition-all cursor-pointer"
                    >
                      <span>View Stay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom catalogue CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#123D2B] text-white font-bold text-sm hover:bg-[#0E2F21] shadow-sm hover:shadow transition-all"
          >
            <span>Explore All Stays Across Bengaluru</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
