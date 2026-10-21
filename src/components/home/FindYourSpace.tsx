"use client";

import React from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { ArrowRight, BedDouble, Users, Sparkles, Tag } from "lucide-react";

interface CategoryTile {
  title: string;
  categoryFilter: string;
  badge: string;
  description: string;
  image: string;
  priceNote: string;
}

const CATEGORY_TILES: CategoryTile[] = [
  {
    title: "Private Rooms",
    categoryFilter: "PRIVATE",
    badge: "Solo Living • Dedicated Desk",
    description: "Quiet private suites and single rooms with attached en-suite bath, work desk, and high-speed Wi-Fi.",
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80",
    priceNote: "From ₹12,500 / month",
  },
  {
    title: "Shared Rooms",
    categoryFilter: "TWIN_SHARING",
    badge: "Twin & Triple PG • Community",
    description: "Spacious twin and triple sharing rooms with personal wardrobes, study setups, and daily housekeeping.",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80",
    priceNote: "From ₹7,500 / bed / month",
  },
  {
    title: "Studio Apartments",
    categoryFilter: "STUDIO",
    badge: "Independent Living • Kitchenette",
    description: "Self-contained studios with dedicated kitchenette, living zone, smart TV, and private washroom.",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
    priceNote: "From ₹19,000 / month",
  },
  {
    title: "Budget Stays",
    categoryFilter: "BUDGET",
    badge: "High Value • Essential Comfort",
    description: "Pocket-friendly non-AC beds with all core Stayzy amenities: 3 meals daily, Wi-Fi, and power backup.",
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80",
    priceNote: "From ₹6,000 / bed / month",
  },
];

export function FindYourSpace() {
  return (
    <section className="py-20 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#123D2B] bg-[#E8F1D5] px-3.5 py-1.5 rounded-full inline-block">
              Room Categories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123D2B] tracking-tight mt-3">
              Find your kind of space
            </h2>
            <p className="text-sm sm:text-base text-[#5E6E65] mt-2 max-w-xl">
              From private solo sanctuaries with study desks to affordable community-rich shared PG beds.
            </p>
          </div>

          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#123D2B] hover:text-[#0C2B1E] group"
          >
            <span>Browse Full Catalogue</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4 Photographic Category Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORY_TILES.map((cat, idx) => (
            <Link
              key={idx}
              href={`/rooms?category=${cat.categoryFilter}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] flex flex-col justify-end p-6 border border-[#E8E6DF] shadow-soft hover:shadow-card-hover transition-all duration-300"
            >
              {/* Image */}
              <ImageWithFallback
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient Scrim for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent z-10" />

              {/* Top Badge */}
              <div className="absolute top-4 left-4 z-20">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#123D2B]/85 backdrop-blur-md text-[#E8F1D5] border border-white/10 shadow-sm">
                  {cat.badge}
                </span>
              </div>

              {/* Bottom Content */}
              <div className="relative z-20 space-y-2 text-white">
                <h3 className="text-xl font-extrabold tracking-tight group-hover:text-[#E8F1D5] transition-colors flex items-center justify-between">
                  <span>{cat.title}</span>
                  <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[#E8F1D5] group-hover:text-[#123D2B] transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </h3>
                <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-white/20 text-xs">
                  <span className="text-[#E8F1D5] font-bold">{cat.priceNote}</span>
                  <span className="text-white/60 text-[11px] group-hover:text-white transition-colors">
                    View Stays &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
