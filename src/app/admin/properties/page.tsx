"use client";

import React, { useState, useEffect } from "react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  PlusCircle,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit / Add Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    address: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560034",
    contactPhone: "+91 98765 43210",
    contactEmail: "stay@stayzy.in",
    checkInTime: "12:00 PM",
    checkOutTime: "11:00 AM",
    timezone: "Asia/Kolkata",
    rules: "Quiet hours after 10 PM. Non-resident visitors allowed until 8 PM.",
    coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
  });
  const [saving, setSaving] = useState(false);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/properties");
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties || []);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const openAddModal = () => {
    setEditingProperty(null);
    setForm({
      name: "",
      tagline: "",
      description: "",
      address: "",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560034",
      contactPhone: "+91 98765 43210",
      contactEmail: "stay@stayzy.in",
      checkInTime: "12:00 PM",
      checkOutTime: "11:00 AM",
      timezone: "Asia/Kolkata",
      rules: "Quiet hours after 10 PM. Non-resident visitors allowed until 8 PM.",
      coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    });
    setModalOpen(true);
  };

  const openEditModal = (prop: any) => {
    setEditingProperty(prop);
    setForm({
      name: prop.name,
      tagline: prop.tagline || "",
      description: prop.description || "",
      address: prop.address || "",
      city: prop.city || "Bengaluru",
      state: prop.state || "Karnataka",
      pincode: prop.pincode || "560034",
      contactPhone: prop.contactPhone || "+91 98765 43210",
      contactEmail: prop.contactEmail || "stay@stayzy.in",
      checkInTime: prop.checkInTime || "12:00 PM",
      checkOutTime: prop.checkOutTime || "11:00 AM",
      timezone: prop.timezone || "Asia/Kolkata",
      rules: prop.rules || "",
      coverImage: prop.coverImage || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProperty?.id,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save property");
      }
      setModalOpen(false);
      fetchProperties();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E6DF] gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#123D2B] uppercase tracking-wider">
            Locations & Real Estate
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D2B] mt-0.5">
            Property Management
          </h1>
          <p className="text-xs text-[#5E6E65] mt-1">
            Configure Stayzy buildings, operating policies, check-in windows, and contact info.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] transition-colors cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Property
          </button>
          <button
            onClick={fetchProperties}
            className="p-2.5 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] hover:bg-[#FAF8F5]"
            title="Refresh properties list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-[#5E6E65] bg-white rounded-3xl border border-[#E8E6DF]">
          Loading properties from database...
        </div>
      ) : properties.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-[#E8E6DF]">
          <Building2 className="w-12 h-12 text-[#7B8B82] mx-auto" />
          <h3 className="text-base font-bold text-[#123D2B]">No properties configured yet</h3>
          <p className="text-xs text-[#5E6E65]">Click Add New Property above to register your first location.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map((prop) => {
            const roomTypesCount = prop.roomTypes?.length || 0;
            const totalUnits = prop.roomTypes?.reduce((acc: number, rt: any) => {
              return (
                acc +
                (rt.rooms?.reduce((uCount: number, r: any) => uCount + (r.inventoryUnits?.length || 0), 0) || 0)
              );
            }, 0) || 0;

            return (
              <div
                key={prop.id}
                className="bg-white rounded-3xl border border-[#E8E6DF] overflow-hidden shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-[#EAE7DC]">
                    <ImageWithFallback
                      src={prop.coverImage || "/fallback-room.jpg"}
                      alt={prop.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#123D2B]/80 text-[#E8F1D5] backdrop-blur-sm uppercase">
                        {prop.city}
                      </span>
                      <h3 className="text-lg font-extrabold mt-1 leading-snug">{prop.name}</h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="space-y-1.5 text-xs text-[#5E6E65]">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#123D2B] shrink-0 mt-0.5" />
                        <span>{prop.address}, {prop.city} - {prop.pincode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#123D2B] shrink-0" />
                        <span>{prop.contactPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#123D2B] shrink-0" />
                        <span>{prop.contactEmail}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E6DF] text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#7B8B82] block">Check-in / Out</span>
                        <span className="font-bold text-[#123D2B]">{prop.checkInTime} / {prop.checkOutTime}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#7B8B82] block">Inventory Scale</span>
                        <span className="font-bold text-[#123D2B]">{roomTypesCount} Room Types • {totalUnits} Units</span>
                      </div>
                    </div>

                    {prop.rules && (
                      <div className="text-[11px] text-[#5E6E65] bg-[#FDFCF9] p-2.5 rounded-xl border border-[#F0EDE4]">
                        <span className="font-bold text-[#123D2B] block mb-0.5">House Rules:</span>
                        {prop.rules}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-[#FAF8F5] border-t border-[#E8E6DF] flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#5E6E65]">
                    Timezone: <strong>{prop.timezone}</strong>
                  </span>
                  <button
                    onClick={() => openEditModal(prop)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D5D2C7] bg-white text-[#123D2B] text-xs font-bold hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Property
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Property Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-[#E8E6DF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF]">
              <h2 className="text-lg font-bold text-[#123D2B]">
                {editingProperty ? "Edit Property Details" : "Register New Property"}
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
                <label className="font-bold text-[#4A5550]">Property Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Stayzy Haven (Koramangala)"
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Street Address</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. 42, 80 Feet Road, 4th Block"
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">City</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">State</label>
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Standard Check-In Time</label>
                  <input
                    type="text"
                    value={form.checkInTime}
                    onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
                    placeholder="12:00 PM"
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Standard Check-Out Time</label>
                  <input
                    type="text"
                    value={form.checkOutTime}
                    onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
                    placeholder="11:00 AM"
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Cover Image URL</label>
                <input
                  type="url"
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">House Rules & Resident Guidelines</label>
                <textarea
                  rows={2}
                  value={form.rules}
                  onChange={(e) => setForm({ ...form, rules: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
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
                  {saving ? "Saving..." : editingProperty ? "Save Changes" : "Create Property"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
