"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, MapPin, Compass, ArrowRight, Trash2, Wind, Sparkles } from "lucide-react";
import { getSavedRooms, toggleSaveRoom, SavedRoom } from "@/lib/favorites";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";

export default function SavedPropertiesPage() {
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = () => {
    setSavedRooms(getSavedRooms());
    setLoading(false);
  };

  useEffect(() => {
    loadSaved();
    window.addEventListener("stayzy_favorites_updated", loadSaved);
    return () => window.removeEventListener("stayzy_favorites_updated", loadSaved);
  }, []);

  const handleRemove = (room: SavedRoom) => {
    toggleSaveRoom(room);
    setSavedRooms(getSavedRooms());
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center text-xs text-[#5E6E65] border border-[#E8E6DF] shadow-soft">
        Loading saved wishlist...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E6DF] gap-3">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-[#123D2B]">
            Resident Wishlist
          </span>
          <h1 className="text-2xl font-extrabold text-[#123D2B] mt-0.5">
            Saved Properties ({savedRooms.length})
          </h1>
          <p className="text-xs text-[#5E6E65]">
            Quickly compare your shortlisted rooms and reserve whenever you’re ready.
          </p>
        </div>

        <Link
          href="/rooms"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] transition-colors self-start sm:self-auto shadow-xs"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Explore More Stays</span>
        </Link>
      </div>

      {savedRooms.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E8E6DF] p-12 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E8E6DF] text-[#7B8B82] flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#192621]">No Saved Properties Yet</h3>
            <p className="text-xs text-[#5E6E65] max-w-sm mx-auto">
              When exploring rooms, click the heart icon on any card to save it here for quick access later.
            </p>
          </div>
          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21]"
          >
            Browse Bengaluru Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-3xl border border-[#E8E6DF] overflow-hidden shadow-soft hover:shadow-card-hover transition-all flex flex-col group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src={room.image}
                  alt={room.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => handleRemove(room)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-red-500 hover:bg-white flex items-center justify-center shadow-sm transition-transform hover:scale-110"
                  title="Remove from saved"
                >
                  <Heart className="w-4 h-4 fill-red-500" />
                </button>
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8F1D5] text-[#123D2B]">
                    {room.category === "PRIVATE" ? "Private Room" : "Shared PG"}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-[#5E6E65]">
                    <MapPin className="w-3.5 h-3.5 text-[#123D2B]" />
                    <span>{room.property?.name}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#192621] group-hover:text-[#123D2B] transition-colors">
                    {room.name}
                  </h3>
                  {room.hasAc && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E8E6DF] text-[11px] text-[#5E6E65]">
                      <Wind className="w-3 h-3 text-[#123D2B]" />
                      Air Conditioned
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-[#F0EDE4] flex items-center justify-between">
                  <div>
                    <span className="text-xl font-extrabold text-[#123D2B]">
                      ₹{room.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[#5E6E65]"> / month</span>
                  </div>

                  <Link
                    href={`/rooms/${room.slug}`}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] transition-colors"
                  >
                    <span>View Stay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
