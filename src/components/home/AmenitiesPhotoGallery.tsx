"use client";

import React from "react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { Sparkles, Bed, ShowerHead, Utensils, Coffee, Laptop, Building2 } from "lucide-react";

interface GalleryItem {
  title: string;
  category: string;
  description: string;
  image: string;
  icon: any;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    title: "Serviced Bedroom",
    category: "Bedroom",
    description: "Orthopedic spring mattress, fresh white linen, personal study desk, and natural ventilation.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80",
    icon: Bed,
  },
  {
    title: "Attached Bathroom",
    category: "Bathroom",
    description: "Sparkling clean en-suite washrooms with 24/7 hot water geysers and modern sanitary fittings.",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
    icon: ShowerHead,
  },
  {
    title: "Hygienic Dining Area",
    category: "Dining Area",
    description: "Clean cafeteria serving fresh, nutritious 3-meal home-style food (Breakfast, Lunch, Dinner).",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
    icon: Utensils,
  },
  {
    title: "Community Lounge",
    category: "Common Lounge",
    description: "Vibrant breakout zone with 55-inch smart TV, board games, comfy couches, and resident events.",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
    icon: Coffee,
  },
  {
    title: "Quiet Study & Coworking",
    category: "Study Area",
    description: "Sound-dampened focus zone with 300 Mbps dual fiber lines, power sockets, and ergonomic seating.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
    icon: Laptop,
  },
  {
    title: "Gated Property Exterior",
    category: "Building Exterior",
    description: "Modern multi-storey building with biometric turnstiles, 24/7 CCTV surveillance, and security guards.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
    icon: Building2,
  },
];

export function AmenitiesPhotoGallery() {
  return (
    <section id="amenities-gallery" className="py-20 bg-[#F8F7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F1D5] text-[#123D2B] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Property Spaces & Facilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123D2B] tracking-tight">
            Designed for living, studying, and resting well
          </h2>
          <p className="text-sm sm:text-base text-[#5E6E65] mt-3 leading-relaxed">
            Every corner of our Bengaluru properties is maintained daily by professional housekeeping and facility teams.
          </p>
        </div>

        {/* 6-Photo Grid (3 columns on desktop, 2 on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-[#E8E6DF] overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-300 group flex flex-col"
              >
                {/* Photo with category badge */}
                <div className="relative aspect-[16/11] overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={item.image}
                    alt={`Stayzy ${item.title} - ${item.category}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#123D2B]/90 backdrop-blur-md text-[#E8F1D5] border border-white/10 shadow-sm">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.category}</span>
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-[#192621] group-hover:text-[#123D2B] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#5E6E65] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note on imagery & replacement */}
        <div className="mt-10 text-center">
          <span className="text-[11px] text-[#7B8B82] bg-white px-4 py-2 rounded-full border border-[#E8E6DF] shadow-xs inline-block">
            Verified Stayzy property imagery • Properties customizable in Admin CMS
          </span>
        </div>
      </div>
    </section>
  );
}
