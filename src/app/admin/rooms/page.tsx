"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import {
  BedDouble,
  Building2,
  Users,
  Wind,
  Bath,
  Utensils,
  PlusCircle,
  Edit2,
  X,
  Sparkles,
  Layers,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function AdminRoomsPage() {
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [selectedProperty, setSelectedProperty] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [form, setForm] = useState({
    propertyId: "",
    name: "",
    category: "PRIVATE",
    description: "",
    sizeSqFt: 200,
    baseCapacity: 1,
    maxCapacity: 1,
    hasAc: true,
    bathroomType: "ATTACHED",
    foodIncluded: false,
    foodDetails: "",
    keyAmenities: "Attached Washroom, Workstation Desk, High-Speed Wi-Fi, Daily Housekeeping",
    images: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
  });
  const [saving, setSaving] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const [roomsRes, propsRes] = await Promise.all([
        fetch("/api/admin/rooms"),
        fetch("/api/admin/properties"),
      ]);

      const roomsData = await roomsRes.json();
      const propsData = await propsRes.json();

      if (roomsData.success) {
        setRoomTypes(roomsData.roomTypes || []);
      } else {
        setError(roomsData.error);
      }

      if (propsData.success) {
        setProperties(propsData.properties || []);
        if (propsData.properties?.length > 0 && !form.propertyId) {
          setForm((prev) => ({ ...prev, propertyId: propsData.properties[0].id }));
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openAddModal = () => {
    setEditingRoom(null);
    setForm({
      propertyId: properties[0]?.id || "",
      name: "",
      category: "PRIVATE",
      description: "",
      sizeSqFt: 200,
      baseCapacity: 1,
      maxCapacity: 1,
      hasAc: true,
      bathroomType: "ATTACHED",
      foodIncluded: false,
      foodDetails: "",
      keyAmenities: "Attached Washroom, Workstation Desk, High-Speed Wi-Fi, Daily Housekeeping",
      images: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
    });
    setModalOpen(true);
  };

  const openEditModal = (rt: any) => {
    setEditingRoom(rt);
    let amenitiesStr = "";
    try {
      const parsed = JSON.parse(rt.keyAmenities);
      amenitiesStr = Array.isArray(parsed) ? parsed.join(", ") : rt.keyAmenities;
    } catch {
      amenitiesStr = rt.keyAmenities;
    }

    let imagesStr = "";
    try {
      const parsed = JSON.parse(rt.images);
      imagesStr = Array.isArray(parsed) ? parsed[0] : rt.images;
    } catch {
      imagesStr = rt.images;
    }

    setForm({
      propertyId: rt.propertyId,
      name: rt.name,
      category: rt.category,
      description: rt.description,
      sizeSqFt: rt.sizeSqFt,
      baseCapacity: rt.baseCapacity,
      maxCapacity: rt.maxCapacity,
      hasAc: rt.hasAc,
      bathroomType: rt.bathroomType,
      foodIncluded: rt.foodIncluded,
      foodDetails: rt.foodDetails || "",
      keyAmenities: amenitiesStr,
      images: imagesStr,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const amenitiesArray = form.keyAmenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const imagesArray = form.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/admin/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingRoom?.id,
          propertyId: form.propertyId,
          name: form.name,
          category: form.category,
          description: form.description,
          sizeSqFt: Number(form.sizeSqFt),
          baseCapacity: Number(form.baseCapacity),
          maxCapacity: Number(form.maxCapacity),
          hasAc: form.hasAc,
          bathroomType: form.bathroomType,
          foodIncluded: form.foodIncluded,
          foodDetails: form.foodDetails,
          keyAmenities: amenitiesArray,
          images: imagesArray,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save room type");
      }

      setModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = roomTypes.filter((rt) => {
    if (selectedProperty !== "ALL" && rt.propertyId !== selectedProperty) return false;
    if (selectedCategory !== "ALL" && rt.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E6DF] gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#123D2B] uppercase tracking-wider">
            Accommodation Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D2B] mt-0.5">
            Rooms & Suites Management
          </h1>
          <p className="text-xs text-[#5E6E65] mt-1">
            Configure room types, sharing categories, specifications, and publish live to public website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] transition-colors cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Add Room Type
          </button>
          <button
            onClick={fetchRooms}
            className="p-2.5 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] hover:bg-[#FAF8F5]"
            title="Refresh room list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E6DF] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#5E6E65]">
            <Building2 className="w-4 h-4 text-[#123D2B]" />
            <span>Property:</span>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-semibold"
            >
              <option value="ALL">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#5E6E65]">
            <Layers className="w-4 h-4 text-[#123D2B]" />
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-semibold"
            >
              <option value="ALL">All Categories</option>
              <option value="PRIVATE">Private Suite</option>
              <option value="TWIN_SHARING">Twin Sharing (2-Bed)</option>
              <option value="TRIPLE_SHARING">Triple Sharing (3-Bed)</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-bold text-[#123D2B]">
          Showing {filtered.length} of {roomTypes.length} Room Types
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-[#5E6E65] bg-white rounded-3xl border border-[#E8E6DF]">
          Loading room inventory from database...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-[#E8E6DF]">
          <BedDouble className="w-12 h-12 text-[#7B8B82] mx-auto" />
          <h3 className="text-base font-bold text-[#123D2B]">No room types match criteria</h3>
          <p className="text-xs text-[#5E6E65]">Try adjusting your filter or add a new room type.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((rt) => {
            let images = [];
            try {
              images = JSON.parse(rt.images);
            } catch {
              images = [rt.images];
            }
            const coverImage = images[0] || "/fallback-room.jpg";

            let amenities: string[] = [];
            try {
              amenities = JSON.parse(rt.keyAmenities);
            } catch {
              amenities = [rt.keyAmenities];
            }

            const totalUnits = rt.rooms?.reduce((acc: number, r: any) => acc + (r.inventoryUnits?.length || 0), 0) || 0;

            return (
              <div
                key={rt.id}
                className="bg-white rounded-3xl border border-[#E8E6DF] overflow-hidden shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-[#EAE7DC]">
                    <ImageWithFallback src={coverImage} alt={rt.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#123D2B] text-[#E8F1D5] text-[10px] font-bold">
                        {rt.category.replace("_", " ")}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <span className="text-[10px] font-bold text-[#E8F1D5] uppercase block">
                        {rt.property?.name}
                      </span>
                      <h3 className="text-lg font-extrabold mt-0.5 leading-snug">{rt.name}</h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <p className="text-xs text-[#5E6E65] line-clamp-2 leading-relaxed">
                      {rt.description}
                    </p>

                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E6DF] text-center text-xs">
                      <div>
                        <span className="text-[10px] text-[#7B8B82] uppercase font-bold block">Size</span>
                        <span className="font-bold text-[#123D2B]">{rt.sizeSqFt} sq ft</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7B8B82] uppercase font-bold block">Cooling</span>
                        <span className="font-bold text-[#123D2B]">{rt.hasAc ? "AC Room" : "Non-AC"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7B8B82] uppercase font-bold block">Units</span>
                        <span className="font-bold text-[#123D2B]">{totalUnits} {rt.category === "PRIVATE" ? "Rooms" : "Beds"}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {amenities.slice(0, 4).map((a, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-[#FAF8F5] text-[#4A5550] text-[10px] font-semibold border border-[#E8E6DF]"
                        >
                          {a}
                        </span>
                      ))}
                      {amenities.length > 4 && (
                        <span className="text-[10px] font-bold text-[#7B8B82] self-center">
                          +{amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF8F5] border-t border-[#E8E6DF] flex items-center justify-between">
                  <Link
                    href={`/rooms/${rt.slug}`}
                    target="_blank"
                    className="text-xs font-bold text-[#123D2B] hover:underline"
                  >
                    View Public Page →
                  </Link>
                  <button
                    onClick={() => openEditModal(rt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D5D2C7] bg-white text-[#123D2B] text-xs font-bold hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-[#E8E6DF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF]">
              <h2 className="text-lg font-bold text-[#123D2B]">
                {editingRoom ? "Edit Room Type" : "Add New Room Type"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#FAF8F5] text-[#5E6E65]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Assigned Property</label>
                <select
                  value={form.propertyId}
                  onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Room Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Deluxe Private Studio Suite"
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Sharing Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
                  >
                    <option value="PRIVATE">Private Room (Full Unit)</option>
                    <option value="TWIN_SHARING">Twin Sharing (By Bed)</option>
                    <option value="TRIPLE_SHARING">Triple Sharing (By Bed)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Size (Sq Ft)</label>
                  <input
                    type="number"
                    value={form.sizeSqFt}
                    onChange={(e) => setForm({ ...form, sizeSqFt: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Bathroom Setup</label>
                  <select
                    value={form.bathroomType}
                    onChange={(e) => setForm({ ...form, bathroomType: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  >
                    <option value="ATTACHED">Attached Private En-suite</option>
                    <option value="COMMON">Dedicated Common Modern Washroom</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Air Conditioning</label>
                  <select
                    value={form.hasAc ? "true" : "false"}
                    onChange={(e) => setForm({ ...form, hasAc: e.target.value === "true" })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  >
                    <option value="true">Equipped with AC</option>
                    <option value="false">Non-AC (Ventilated Ceiling Fan)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Room Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe comfort, bedding, ventilation, and features..."
                  className="w-full p-2.5 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Key Amenities (comma separated)</label>
                <input
                  type="text"
                  value={form.keyAmenities}
                  onChange={(e) => setForm({ ...form, keyAmenities: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Image URL</label>
                <input
                  type="url"
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E8E6DF]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5D2C7] text-xs font-bold text-[#4A5550] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {saving ? "Saving..." : editingRoom ? "Save Room Details" : "Create Room Type"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
