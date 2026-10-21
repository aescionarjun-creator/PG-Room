"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Search,
  Filter,
  PlusCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  LogOut,
  RefreshCw,
  AlertCircle,
  Download,
  Building2,
  X,
} from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [durationFilter, setDurationFilter] = useState("ALL");

  // Offline Booking Modal
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [offlineForm, setOfflineForm] = useState({
    propertyId: "",
    roomTypeId: "",
    inventoryUnitId: "",
    durationType: "DAILY",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    totalAmount: 1800,
    depositAmount: 500,
    notes: "",
  });
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bookingsRes, ratesRes, propsRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/admin/rates"),
        fetch("/api/admin/properties"),
      ]);

      const bData = await bookingsRes.json();
      const rData = await ratesRes.json();
      const pData = await propsRes.json();

      if (bData.success) {
        setBookings(bData.bookings || []);
      } else {
        setError(bData.error);
      }

      if (rData.success) {
        setRoomTypes(rData.roomTypes || []);
        if (rData.roomTypes?.length > 0 && !offlineForm.roomTypeId) {
          setOfflineForm((prev) => ({
            ...prev,
            roomTypeId: rData.roomTypes[0].id,
          }));
        }
      }

      if (pData.success) {
        setProperties(pData.properties || []);
        if (pData.properties?.length > 0 && !offlineForm.propertyId) {
          setOfflineForm((prev) => ({
            ...prev,
            propertyId: pData.properties[0].id,
          }));
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Update units when roomType changes
  useEffect(() => {
    if (!offlineForm.roomTypeId) return;
    const selected = roomTypes.find((rt) => rt.id === offlineForm.roomTypeId);
    if (selected?.rooms) {
      const units: any[] = [];
      selected.rooms.forEach((r: any) => {
        r.inventoryUnits?.forEach((u: any) => {
          units.push({ ...u, roomNumber: r.roomNumber });
        });
      });
      setAvailableUnits(units);
      if (units[0]) {
        setOfflineForm((prev) => ({ ...prev, inventoryUnitId: units[0].id }));
      }
    }
  }, [offlineForm.roomTypeId, roomTypes]);

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateOffline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offlineForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create offline booking");
      }
      alert(data.message);
      setOfflineModalOpen(false);
      fetchBookings();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const filtered = bookings.filter((b) => {
    if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
    if (durationFilter !== "ALL" && b.durationType !== durationFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRef = b.bookingReference?.toLowerCase().includes(q);
      const matchName = b.guestName?.toLowerCase().includes(q);
      const matchPhone = b.guestPhone?.toLowerCase().includes(q);
      const matchEmail = b.guestEmail?.toLowerCase().includes(q);
      if (!matchRef && !matchName && !matchPhone && !matchEmail) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E6DF] gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#123D2B] uppercase tracking-wider">
            Reservations Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D2B] mt-0.5">
            Bookings & Resident Stays
          </h1>
          <p className="text-xs text-[#5E6E65] mt-1">
            Search, manage check-in/out transitions, record offline bookings, and process cancellations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOfflineModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] transition-colors cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            New Offline Booking
          </button>
          <button
            onClick={fetchBookings}
            className="p-2.5 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] hover:bg-[#FAF8F5]"
            title="Refresh bookings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E6DF] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#7B8B82] absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, guest name, phone..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#5E6E65]">
            <Filter className="w-4 h-4 text-[#123D2B]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="CHECKED_OUT">Checked Out</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#5E6E65]">
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-semibold"
            >
              <option value="ALL">All Durations</option>
              <option value="HOURLY">Hourly</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-bold text-[#123D2B]">
          {filtered.length} Bookings Found
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Bookings Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#5E6E65] bg-white rounded-3xl border border-[#E8E6DF]">
          Loading reservations from database...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-[#E8E6DF]">
          <CalendarCheck className="w-12 h-12 text-[#7B8B82] mx-auto" />
          <h3 className="text-base font-bold text-[#123D2B]">No bookings matched filter</h3>
          <p className="text-xs text-[#5E6E65]">Try clearing search or change status filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E8E6DF] overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E8E6DF] text-[#7B8B82] uppercase text-[10px] font-extrabold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Guest Details</th>
                  <th className="py-3.5 px-4">Room & Unit</th>
                  <th className="py-3.5 px-4">Stay Window</th>
                  <th className="py-3.5 px-4">Duration & Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE4]">
                {filtered.map((b) => {
                  let statusBadge = (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {b.status}
                    </span>
                  );
                  if (b.status === "CHECKED_IN") {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                        Checked In
                      </span>
                    );
                  } else if (b.status === "CHECKED_OUT") {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 font-bold text-[10px]">
                        Checked Out
                      </span>
                    );
                  } else if (b.status === "CANCELLED") {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                        Cancelled
                      </span>
                    );
                  }

                  return (
                    <tr key={b.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-[#123D2B]">
                        <Link href={`/admin/bookings/${b.id}`} className="hover:underline">
                          {b.bookingReference}
                        </Link>
                        <span className="block text-[10px] font-sans text-[#7B8B82]">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-[#123D2B] block">{b.guestName}</span>
                        <span className="text-[#5E6E65] block">{b.guestPhone}</span>
                        <span className="text-[10px] text-[#7B8B82] block">{b.guestEmail}</span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-[#123D2B] block">{b.roomType?.name}</span>
                        <span className="text-[#5E6E65] block">
                          Unit: {b.inventoryUnit?.identifier || "Unassigned"} ({b.property?.city})
                        </span>
                      </td>

                      <td className="py-4 px-4 text-[#5E6E65]">
                        <div>
                          In: <strong>{new Date(b.startTime).toLocaleDateString()}</strong>
                        </div>
                        <div>
                          Out: <strong>{new Date(b.endTime).toLocaleDateString()}</strong>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E8E6DF] text-[10px] font-bold text-[#123D2B]">
                          {b.durationType} ({b.durationCount})
                        </span>
                        <span className="font-bold text-[#123D2B] block mt-1">
                          ₹{b.totalAmount.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-emerald-700 block">
                          Paid: ₹{b.payableNow.toLocaleString("en-IN")}
                        </span>
                      </td>

                      <td className="py-4 px-4">{statusBadge}</td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === "CONFIRMED" && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, "CHECKED_IN")}
                              className="px-2.5 py-1 rounded-lg bg-[#123D2B] text-white text-[11px] font-bold hover:bg-[#0E2F21] cursor-pointer"
                              title="Mark guest as Checked In"
                            >
                              Check-In
                            </button>
                          )}

                          {b.status === "CHECKED_IN" && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, "CHECKED_OUT")}
                              className="px-2.5 py-1 rounded-lg bg-[#5E6E65] text-white text-[11px] font-bold hover:bg-[#4A5550] cursor-pointer"
                              title="Mark guest as Checked Out"
                            >
                              Check-Out
                            </button>
                          )}

                          <Link
                            href={`/admin/bookings/${b.id}`}
                            className="p-1.5 rounded-lg border border-[#D5D2C7] bg-white text-[#123D2B] hover:bg-[#FAF8F5]"
                            title="View Full Booking Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Offline Booking Modal */}
      {offlineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-[#E8E6DF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF]">
              <h2 className="text-base font-bold text-[#123D2B]">Create Offline / Walk-in Booking</h2>
              <button onClick={() => setOfflineModalOpen(false)}>
                <X className="w-5 h-5 text-[#5E6E65]" />
              </button>
            </div>

            <form onSubmit={handleCreateOffline} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Property</label>
                  <select
                    value={offlineForm.propertyId}
                    onChange={(e) => setOfflineForm({ ...offlineForm, propertyId: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Room Category</label>
                  <select
                    value={offlineForm.roomTypeId}
                    onChange={(e) => setOfflineForm({ ...offlineForm, roomTypeId: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  >
                    {roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Specific Bed / Unit</label>
                  <select
                    value={offlineForm.inventoryUnitId}
                    onChange={(e) => setOfflineForm({ ...offlineForm, inventoryUnitId: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  >
                    {availableUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        Room {u.roomNumber} - {u.identifier}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Duration Mode</label>
                  <select
                    value={offlineForm.durationType}
                    onChange={(e) => setOfflineForm({ ...offlineForm, durationType: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  >
                    <option value="HOURLY">Hourly Day-Stay</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Start Date / Time</label>
                  <input
                    type="date"
                    required
                    value={offlineForm.startDate}
                    onChange={(e) => setOfflineForm({ ...offlineForm, startDate: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">End Date / Time</label>
                  <input
                    type="date"
                    required
                    value={offlineForm.endDate}
                    onChange={(e) => setOfflineForm({ ...offlineForm, endDate: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    value={offlineForm.guestName}
                    onChange={(e) => setOfflineForm({ ...offlineForm, guestName: e.target.value })}
                    placeholder="e.g. Rahul Verma"
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Guest Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={offlineForm.guestPhone}
                    onChange={(e) => setOfflineForm({ ...offlineForm, guestPhone: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Total Collected (₹)</label>
                  <input
                    type="number"
                    required
                    value={offlineForm.totalAmount}
                    onChange={(e) => setOfflineForm({ ...offlineForm, totalAmount: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Deposit Included (₹)</label>
                  <input
                    type="number"
                    value={offlineForm.depositAmount}
                    onChange={(e) => setOfflineForm({ ...offlineForm, depositAmount: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Offline Notes / Receipt Ref</label>
                <input
                  type="text"
                  value={offlineForm.notes}
                  onChange={(e) => setOfflineForm({ ...offlineForm, notes: e.target.value })}
                  placeholder="e.g. Paid in Cash / Counter receipt #491"
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E8E6DF]">
                <button
                  type="button"
                  onClick={() => setOfflineModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5D2C7] font-bold text-[#4A5550]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-[#123D2B] text-white font-bold hover:bg-[#0E2F21] disabled:opacity-50"
                >
                  {creating ? "Confirming..." : "Book & Lock Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
