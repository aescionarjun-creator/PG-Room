"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Filter,
  X,
  SlidersHorizontal,
  MapPin,
  Users,
  Wind,
  ShowerHead,
  Utensils,
  ArrowRight,
  RotateCcw,
  Check,
  Heart,
  Share2,
  Sparkles,
  BedDouble,
  ShieldCheck,
  Calendar,
  Layers,
} from "lucide-react";
import { DurationType, RoomCategory, BathroomType } from "@/lib/types";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { isRoomSaved, toggleSaveRoom } from "@/lib/favorites";

export function RoomCatalog() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filters from URL or defaults
  const [durationType, setDurationType] = useState<DurationType>(
    (searchParams.get("durationType") as DurationType) || "MONTHLY"
  );
  const [stayMode, setStayMode] = useState<"ALL" | "MONTHLY" | "SHORT">(
    searchParams.get("durationType") === "MONTHLY" || searchParams.get("durationType") === "YEARLY"
      ? "MONTHLY"
      : searchParams.get("durationType")
      ? "SHORT"
      : "ALL"
  );
  const [locality, setLocality] = useState<string>(searchParams.get("locality") || "ALL");
  const [genderEligibility, setGenderEligibility] = useState<string>(
    searchParams.get("gender") || "ALL"
  );
  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState(searchParams.get("startTime") || "10:00");
  const [durationCount, setDurationCount] = useState(
    Number(searchParams.get("durationCount") || (searchParams.get("durationType") === "HOURLY" ? 3 : 1))
  );
  const [category, setCategory] = useState<RoomCategory | "ALL">(
    (searchParams.get("category") as any) || "ALL"
  );
  const [hasAc, setHasAc] = useState(searchParams.get("hasAc") === "true");
  const [bathroomType, setBathroomType] = useState<BathroomType | "ALL">(
    (searchParams.get("bathroomType") as any) || "ALL"
  );
  const [foodIncluded, setFoodIncluded] = useState(searchParams.get("foodIncluded") === "true");
  const [availableOnly, setAvailableOnly] = useState(searchParams.get("availableOnly") === "true");
  const [maxBudget, setMaxBudget] = useState<number>(
    searchParams.get("maxBudget") ? Number(searchParams.get("maxBudget")) : 40000
  );
  const [sortBy, setSortBy] = useState<"recommended" | "price_asc" | "price_desc" | "newest">(
    (searchParams.get("sortBy") as any) || "recommended"
  );

  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savedRoomIds, setSavedRoomIds] = useState<string[]>([]);

  // Refresh saved IDs
  const refreshSavedStatus = () => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("stayzy_saved_rooms");
        if (raw) {
          const list = JSON.parse(raw);
          setSavedRoomIds(list.map((r: any) => r.id));
        }
      } catch {}
    }
  };

  useEffect(() => {
    refreshSavedStatus();
    window.addEventListener("stayzy_favorites_updated", refreshSavedStatus);
    return () => window.removeEventListener("stayzy_favorites_updated", refreshSavedStatus);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch rooms on filter change
  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        query.set("durationType", durationType);
        query.set("startDate", startDate);
        query.set("startTime", startTime);
        query.set("durationCount", String(durationCount));
        if (locality !== "ALL") query.set("locality", locality);
        if (category !== "ALL") query.set("category", category);
        if (hasAc) query.set("hasAc", "true");
        if (bathroomType !== "ALL") query.set("bathroomType", bathroomType);
        if (foodIncluded) query.set("foodIncluded", "true");
        if (availableOnly) query.set("availableOnly", "true");
        query.set("maxBudget", String(maxBudget));
        query.set("sortBy", sortBy);

        const res = await fetch(`/api/rooms?${query.toString()}`);
        const data = await res.json();
        if (data.success) {
          let list = data.rooms;
          // Apply gender filter client-side if selected
          if (genderEligibility !== "ALL") {
            list = list.filter((r: any) => r.genderEligibility === genderEligibility);
          }
          setRooms(list);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
  }, [
    durationType,
    locality,
    genderEligibility,
    startDate,
    startTime,
    durationCount,
    category,
    hasAc,
    bathroomType,
    foodIncluded,
    availableOnly,
    maxBudget,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setDurationType("MONTHLY");
    setStayMode("ALL");
    setLocality("ALL");
    setGenderEligibility("ALL");
    setStartDate(new Date().toISOString().split("T")[0]);
    setStartTime("10:00");
    setDurationCount(1);
    setCategory("ALL");
    setHasAc(false);
    setBathroomType("ALL");
    setFoodIncluded(false);
    setAvailableOnly(false);
    setMaxBudget(40000);
    setSortBy("recommended");
  };

  const handleToggleFavorite = (room: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const cover = room.images[0] || room.property?.coverImage;
    const nowSaved = toggleSaveRoom({
      id: room.id,
      name: room.name,
      slug: room.slug,
      category: room.category,
      property: {
        name: room.property.name,
        city: room.property.city,
        address: room.property.address,
      },
      image: cover,
      price: room.currentRatePlan.price,
      durationType,
      hasAc: room.hasAc,
    });

    refreshSavedStatus();
    showToast(nowSaved ? `Saved "${room.name}" to your wishlist!` : `Removed from wishlist.`);
  };

  const handleShare = (room: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/rooms/${room.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast("Property link copied to clipboard!");
    } else {
      showToast("Link: " + url);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#123D2B] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-[#235841]">
          <Sparkles className="w-4 h-4 text-[#E8F1D5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E8E6DF] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#123D2B] bg-[#E8F1D5] px-2.5 py-1 rounded-full">
              Bengaluru Inventory
            </span>
            <span className="text-xs text-[#5E6E65]">Zero Brokerage • Direct PG Booking</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#123D2B] mt-2">
            Explore Rooms & Shared Beds
          </h1>
          <p className="text-sm text-[#5E6E65] mt-1 max-w-xl">
            Live prices, verifiable amenities, and real-time bed availability across Koramangala, HSR Layout, and Indiranagar.
          </p>
        </div>

        {/* Top Controls: Mobile Filter Button & Sorting */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D5D2C7] bg-white text-xs font-bold text-[#123D2B] shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5E6E65] hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-[#D5D2C7] bg-white text-xs font-bold text-[#123D2B] focus:ring-2 focus:ring-[#123D2B]/20 shadow-xs cursor-pointer"
            >
              <option value="recommended">Recommended (Best Match)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Listings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Room Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8E6DF] shadow-soft space-y-6 sticky top-28">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE4]">
              <span className="text-sm font-extrabold text-[#123D2B] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#123D2B]" />
                Filter Options
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-[#5E6E65] hover:text-[#123D2B] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* 1. Stay Mode Quick Switch (Short vs Monthly) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5E6E65]">
                Stay Schedule
              </label>
              <div className="grid grid-cols-2 gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8E6DF]">
                <button
                  type="button"
                  onClick={() => {
                    setStayMode("MONTHLY");
                    setDurationType("MONTHLY");
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    durationType === "MONTHLY" || durationType === "YEARLY"
                      ? "bg-[#123D2B] text-white shadow-xs"
                      : "text-[#5E6E65] hover:text-[#123D2B]"
                  }`}
                >
                  Monthly PG
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStayMode("SHORT");
                    setDurationType("DAILY");
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    durationType === "HOURLY" || durationType === "DAILY" || durationType === "WEEKLY"
                      ? "bg-[#123D2B] text-white shadow-xs"
                      : "text-[#5E6E65] hover:text-[#123D2B]"
                  }`}
                >
                  Short Stay
                </button>
              </div>

              {/* Specific Duration Pill Selector */}
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {(["HOURLY", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as DurationType[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDurationType(d);
                      if (d === "HOURLY") setDurationCount(3);
                      else setDurationCount(1);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors flex items-center justify-between cursor-pointer ${
                      durationType === d
                        ? "bg-[#123D2B] text-white"
                        : "bg-[#FAF8F5] text-[#192621] hover:bg-[#F0EDE4]"
                    }`}
                  >
                    <span>
                      {d === "HOURLY"
                        ? "Hourly (Day-work / Rest)"
                        : d === "DAILY"
                        ? "Daily (Overnight)"
                        : d === "WEEKLY"
                        ? "Weekly Package"
                        : d === "MONTHLY"
                        ? "Monthly Co-Living"
                        : "Yearly Lease"}
                    </span>
                    {durationType === d && <Check className="w-3.5 h-3.5 text-[#E8F1D5]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. City & Locality Filter */}
            <div className="space-y-2 pt-2 border-t border-[#F0EDE4]">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5E6E65]">
                Locality (Bengaluru)
              </label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-medium cursor-pointer"
              >
                <option value="ALL">All Localities</option>
                <option value="Koramangala">Koramangala (4th Block)</option>
                <option value="HSR Layout">HSR Layout (Sector 2)</option>
                <option value="Indiranagar">Indiranagar (100 Ft Rd)</option>
              </select>
            </div>

            {/* 3. Room Sharing Type */}
            <div className="space-y-2 pt-2 border-t border-[#F0EDE4]">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5E6E65]">
                Room Configuration
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-medium cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="PRIVATE">Private Room / Studio</option>
                <option value="TWIN_SHARING">Twin Sharing (2 Beds)</option>
                <option value="TRIPLE_SHARING">Triple Sharing (3 Beds)</option>
              </select>
            </div>

            {/* 4. Gender / Living Policy */}
            <div className="space-y-2 pt-2 border-t border-[#F0EDE4]">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5E6E65]">
                Resident Community
              </label>
              <select
                value={genderEligibility}
                onChange={(e) => setGenderEligibility(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-medium cursor-pointer"
              >
                <option value="ALL">All Resident Types</option>
                <option value="COLIVING">Co-Living (Unisex / Professional)</option>
                <option value="FEMALE">Women's Accommodation</option>
                <option value="MALE">Men's Accommodation</option>
              </select>
            </div>

            {/* 5. Comforts & Amenities Checkboxes */}
            <div className="space-y-2.5 pt-2 border-t border-[#F0EDE4]">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5E6E65]">
                Room Amenities
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-xs font-medium text-[#192621] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAc}
                    onChange={(e) => setHasAc(e.target.checked)}
                    className="w-4 h-4 rounded text-[#123D2B] focus:ring-[#123D2B]"
                  />
                  <span>Air Conditioned (AC)</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs font-medium text-[#192621] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bathroomType === "ATTACHED"}
                    onChange={(e) => setBathroomType(e.target.checked ? "ATTACHED" : "ALL")}
                    className="w-4 h-4 rounded text-[#123D2B] focus:ring-[#123D2B]"
                  />
                  <span>Attached Washroom</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs font-medium text-[#192621] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foodIncluded}
                    onChange={(e) => setFoodIncluded(e.target.checked)}
                    className="w-4 h-4 rounded text-[#123D2B] focus:ring-[#123D2B]"
                  />
                  <span>Home Cooked Meals Included</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs font-medium text-[#192621] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-[#123D2B] focus:ring-[#123D2B]"
                  />
                  <span className="text-[#123D2B] font-bold">Available to Move-In Now</span>
                </label>
              </div>
            </div>

            {/* 6. Budget Slider */}
            <div className="space-y-2 pt-2 border-t border-[#F0EDE4]">
              <div className="flex justify-between text-xs font-bold text-[#5E6E65]">
                <span>Max Budget</span>
                <span className="text-[#123D2B] font-extrabold">₹{maxBudget.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min={500}
                max={40000}
                step={500}
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-[#123D2B] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#7B8B82]">
                <span>₹500</span>
                <span>₹40,000+</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Room Listings (3 Columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Filter Chips Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#5E6E65]">Active Filters:</span>
            <span className="px-2.5 py-1 rounded-full bg-[#E8F1D5] text-[#123D2B] text-xs font-bold">
              {durationType} Rate
            </span>
            {locality !== "ALL" && (
              <span className="px-2.5 py-1 rounded-full bg-white border border-[#E8E6DF] text-[#192621] text-xs font-semibold">
                📍 {locality}
              </span>
            )}
            {category !== "ALL" && (
              <span className="px-2.5 py-1 rounded-full bg-white border border-[#E8E6DF] text-[#192621] text-xs font-semibold">
                {category === "PRIVATE" ? "Private" : category === "TWIN_SHARING" ? "Twin" : "Triple"}
              </span>
            )}
            {genderEligibility !== "ALL" && (
              <span className="px-2.5 py-1 rounded-full bg-white border border-[#E8E6DF] text-[#192621] text-xs font-semibold">
                {genderEligibility}
              </span>
            )}
            {hasAc && (
              <span className="px-2.5 py-1 rounded-full bg-white border border-[#E8E6DF] text-[#192621] text-xs font-semibold">
                AC
              </span>
            )}
            {foodIncluded && (
              <span className="px-2.5 py-1 rounded-full bg-white border border-[#E8E6DF] text-[#192621] text-xs font-semibold">
                Meals
              </span>
            )}
            {availableOnly && (
              <span className="px-2.5 py-1 rounded-full bg-[#123D2B] text-white text-xs font-bold">
                Available Now
              </span>
            )}
            <span className="text-xs text-[#5E6E65] ml-auto font-medium">
              {rooms.length} {rooms.length === 1 ? "stay" : "stays"} available
            </span>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-3xl border border-[#E8E6DF] p-6 animate-pulse space-y-4"
                >
                  <div className="aspect-[16/10] bg-gray-200 rounded-2xl" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            /* Clear Empty State */
            <div className="bg-white rounded-3xl border border-[#E8E6DF] p-12 text-center space-y-4 shadow-soft">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E8E6DF] text-[#123D2B] flex items-center justify-center mx-auto">
                <SlidersHorizontal className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#192621]">No Rooms Match These Filters</h3>
              <p className="text-xs text-[#5E6E65] max-w-md mx-auto leading-relaxed">
                We couldn’t find accommodations matching your exact combination. Try widening your budget, selecting another locality, or resetting your amenity criteria.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Room Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map((room) => {
                const cover =
                  (Array.isArray(room.images) && room.images.length > 0 ? room.images[0] : null) ||
                  room.coverImage ||
                  room.property?.coverImage ||
                  "/fallback-room.jpg";
                const ratePlan = room.currentRatePlan;
                const isSaved = savedRoomIds.includes(room.id);

                const isPrivate = room.category === "PRIVATE";
                const categoryBadge =
                  room.category === "PRIVATE"
                    ? "Private Room"
                    : room.category === "TWIN_SHARING"
                    ? "Twin Sharing"
                    : "Triple Sharing";

                return (
                  <div
                    key={room.id}
                    className="bg-white rounded-3xl border border-[#E8E6DF] overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-300 flex flex-col group"
                  >
                    {/* Room Image with Fallback */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                      <ImageWithFallback
                        src={cover}
                        alt={`${room.name} in ${room.displayLocality || "Bengaluru"}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8F1D5] text-[#123D2B] shadow-sm">
                          {categoryBadge}
                        </span>
                        {room.genderEligibility && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#123D2B]/85 backdrop-blur-md text-[#E8F1D5] border border-white/10 shadow-sm">
                            {room.genderEligibility === "COLIVING"
                              ? "Co-Living"
                              : room.genderEligibility === "FEMALE"
                              ? "Women's"
                              : "Men's"}
                          </span>
                        )}
                      </div>

                      {/* Save to Wishlist & Share buttons */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                        <button
                          type="button"
                          onClick={(e) => handleShare(room, e)}
                          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-[#192621] hover:bg-white flex items-center justify-center shadow-sm transition-transform hover:scale-105"
                          title="Share property link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleToggleFavorite(room, e)}
                          className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center shadow-sm transition-transform hover:scale-110 ${
                            isSaved
                              ? "bg-white text-red-500"
                              : "bg-white/90 text-[#192621] hover:bg-white"
                          }`}
                          title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
                        >
                          <Heart
                            className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`}
                          />
                        </button>
                      </div>

                      {/* Real availability indicator badge */}
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md text-white text-[11px] font-semibold z-20">
                        {room.availableCount > 0 ? (
                          <span className="text-[#E8F1D5]">
                            ● {room.availableCount}{" "}
                            {isPrivate ? "Room" : "Bed"}
                            {room.availableCount > 1 ? "s" : ""} Available
                          </span>
                        ) : (
                          <span className="text-amber-300">● Reserved • Check Waitlist</span>
                        )}
                      </div>
                    </div>

                    {/* Room Specs & Details */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs text-[#5E6E65]">
                          <MapPin className="w-3.5 h-3.5 text-[#123D2B] shrink-0" />
                          <span className="font-medium">
                            {room.property.name} • {room.displayLocality}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-[#192621] leading-snug group-hover:text-[#123D2B] transition-colors">
                          {room.name}
                        </h3>

                        <p className="text-xs text-[#5E6E65] line-clamp-2 leading-relaxed">
                          {room.description}
                        </p>

                        {/* Amenities Tags Bar */}
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#F0EDE4] text-[11px] text-[#4A5550]">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF]">
                            <Users className="w-3 h-3 text-[#123D2B]" />
                            {room.maxCapacity} {room.maxCapacity > 1 ? "Guests" : "Guest"}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF]">
                            <BedDouble className="w-3 h-3 text-[#123D2B]" />
                            {room.furnishingStatus || "Fully Furnished"}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF]">
                            <ShowerHead className="w-3 h-3 text-[#123D2B]" />
                            {room.bathroomType === "ATTACHED" ? "Attached Bath" : "Common Bath"}
                          </span>
                          {room.hasAc && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF]">
                              <Wind className="w-3 h-3 text-[#123D2B]" />
                              AC
                            </span>
                          )}
                          {room.foodIncluded && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF]">
                              <Utensils className="w-3 h-3 text-[#123D2B]" />
                              Food Incl.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pricing with Clear Unit & View Stay button */}
                      <div className="pt-4 border-t border-[#F0EDE4] flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-[#123D2B]">
                              ₹{ratePlan.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-[#5E6E65] font-medium">
                              {isPrivate
                                ? ` / room ${
                                    durationType === "HOURLY"
                                      ? "/ hr"
                                      : durationType === "DAILY"
                                      ? "/ night"
                                      : durationType === "WEEKLY"
                                      ? "/ week"
                                      : "/ month"
                                  }`
                                : ` / bed ${
                                    durationType === "HOURLY"
                                      ? "/ hr"
                                      : durationType === "DAILY"
                                      ? "/ night"
                                      : durationType === "WEEKLY"
                                      ? "/ week"
                                      : "/ month"
                                  }`}
                            </span>
                          </div>

                          {ratePlan.depositAmount > 0 ? (
                            <p className="text-[11px] text-[#7B8B82] mt-0.5">
                              Deposit: ₹{ratePlan.depositAmount.toLocaleString("en-IN")} (100% Refundable)
                            </p>
                          ) : (
                            <p className="text-[11px] text-green-700 font-semibold mt-0.5">
                              Zero Security Deposit
                            </p>
                          )}
                        </div>

                        <Link
                          href={`/rooms/${room.slug}?durationType=${durationType}&startDate=${startDate}&durationCount=${durationCount}&startTime=${startTime}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] transition-all shadow-xs hover:shadow cursor-pointer"
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
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-sm bg-white h-full p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE4]">
              <h3 className="text-base font-bold text-[#123D2B]">Filter Rooms</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5E6E65]">Duration</label>
              <select
                value={durationType}
                onChange={(e) => setDurationType(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-medium"
              >
                <option value="HOURLY">Hourly (1-10 Hours)</option>
                <option value="DAILY">Daily (1-14 Days)</option>
                <option value="WEEKLY">Weekly (1-4 Weeks)</option>
                <option value="MONTHLY">Monthly PG (1-11 Months)</option>
                <option value="YEARLY">Yearly Agreement</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5E6E65]">Locality</label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-medium"
              >
                <option value="ALL">All Localities</option>
                <option value="Koramangala">Koramangala</option>
                <option value="HSR Layout">HSR Layout</option>
                <option value="Indiranagar">Indiranagar</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5E6E65]">Room Type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-medium"
              >
                <option value="ALL">All Categories</option>
                <option value="PRIVATE">Private Room</option>
                <option value="TWIN_SHARING">Twin Sharing</option>
                <option value="TRIPLE_SHARING">Triple Sharing</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5E6E65]">Amenities</label>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasAc}
                    onChange={(e) => setHasAc(e.target.checked)}
                  />
                  <span>Air Conditioning (AC)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={foodIncluded}
                    onChange={(e) => setFoodIncluded(e.target.checked)}
                  />
                  <span>Daily Home Meals</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                  />
                  <span className="font-bold text-[#123D2B]">Available to Move-In Now</span>
                </label>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-xl border border-[#D5D2C7] text-xs font-bold"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
