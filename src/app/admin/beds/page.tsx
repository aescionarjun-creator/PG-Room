"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Bed,
  DoorClosed,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  Wrench,
  Ban,
  Clock,
  X,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function AdminBedsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Filter
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Maintenance Block Modal
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({
    inventoryUnitId: "",
    reason: "MAINTENANCE",
    startTime: new Date().toISOString().split("T")[0],
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "",
  });

  // Add Unit Modal
  const [addUnitModalOpen, setAddUnitModalOpen] = useState(false);
  const [addUnitForm, setAddUnitForm] = useState({
    roomId: "",
    identifier: "Bed C",
    isBed: true,
  });

  const fetchBeds = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/beds");
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms || []);
        if (data.rooms?.[0]?.inventoryUnits?.[0] && !blockForm.inventoryUnitId) {
          setBlockForm((prev) => ({
            ...prev,
            inventoryUnitId: data.rooms[0].inventoryUnits[0].id,
          }));
        }
        if (data.rooms?.[0] && !addUnitForm.roomId) {
          setAddUnitForm((prev) => ({
            ...prev,
            roomId: data.rooms[0].id,
          }));
        }
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
    fetchBeds();
  }, []);

  const handleUpdateUnitStatus = async (unitId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/beds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_STATUS",
          unitId,
          status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchBeds();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blockForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to schedule block");
      }
      setBlockModalOpen(false);
      fetchBeds();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/beds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_UNIT",
          roomId: addUnitForm.roomId,
          identifier: addUnitForm.identifier,
          isBed: addUnitForm.isBed,
          status: "AVAILABLE",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add unit");
      }
      setAddUnitModalOpen(false);
      fetchBeds();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReleaseBlock = async (blockId: string) => {
    try {
      const res = await fetch(`/api/admin/inventory?id=${blockId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchBeds();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Flatten units for overall counts
  const allUnits: any[] = [];
  rooms.forEach((r) => {
    r.inventoryUnits?.forEach((u: any) => {
      allUnits.push({ ...u, room: r });
    });
  });

  const availableCount = allUnits.filter((u) => u.status === "AVAILABLE" && (!u.availabilityBlocks || u.availabilityBlocks.length === 0)).length;
  const maintenanceCount = allUnits.filter((u) => u.status === "MAINTENANCE" || (u.availabilityBlocks && u.availabilityBlocks.length > 0)).length;
  const occupiedCount = allUnits.filter((u) => u.bookings && u.bookings.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E6DF] gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#123D2B] uppercase tracking-wider">
            Inventory Units
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D2B] mt-0.5">
            Beds & Physical Units
          </h1>
          <p className="text-xs text-[#5E6E65] mt-1">
            Real-time status of individual PG beds and private suites with maintenance block control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setBlockModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#123D2B] bg-white text-[#123D2B] text-xs font-bold hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-[#123D2B]" />
            Schedule Block
          </button>
          <button
            onClick={() => setAddUnitModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] transition-colors cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Add Bed / Unit
          </button>
          <button
            onClick={fetchBeds}
            className="p-2.5 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] hover:bg-[#FAF8F5]"
            title="Refresh inventory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#E8E6DF] shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-[#7B8B82] block">Total Inventory</span>
          <span className="text-2xl font-black text-[#123D2B]">{allUnits.length}</span>
          <span className="text-[11px] text-[#5E6E65] block mt-0.5">Units / Beds</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-[#E8E6DF] shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-[#7B8B82] block">Available Now</span>
          <span className="text-2xl font-black text-emerald-700">{availableCount}</span>
          <span className="text-[11px] text-emerald-600 block mt-0.5">Ready for booking</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-[#E8E6DF] shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-[#7B8B82] block">Active Stays</span>
          <span className="text-2xl font-black text-blue-700">{occupiedCount}</span>
          <span className="text-[11px] text-blue-600 block mt-0.5">Resident occupied</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-[#E8E6DF] shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-[#7B8B82] block">Maintenance / Blocked</span>
          <span className="text-2xl font-black text-amber-700">{maintenanceCount}</span>
          <span className="text-[11px] text-amber-600 block mt-0.5">Cleaning or repairs</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Physical Rooms & Units Inventory */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#5E6E65] bg-white rounded-3xl border border-[#E8E6DF]">
          Loading bed inventory from database...
        </div>
      ) : rooms.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-[#E8E6DF]">
          <Layers className="w-12 h-12 text-[#7B8B82] mx-auto" />
          <h3 className="text-base font-bold text-[#123D2B]">No physical rooms or beds recorded</h3>
          <p className="text-xs text-[#5E6E65]">Click Add Bed / Unit above to begin inventory mapping.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-card space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0EDE4] gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E8E6DF] flex items-center justify-center text-[#123D2B]">
                    <DoorClosed className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-[#123D2B]">{room.roomNumber}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F1D5] text-[#123D2B]">
                        Floor {room.floor}
                      </span>
                    </div>
                    <span className="text-xs text-[#5E6E65]">
                      {room.roomType?.name} • {room.roomType?.property?.name}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#7B8B82]">
                  {room.inventoryUnits?.length || 0} Inventory {room.roomType?.category === "PRIVATE" ? "Unit" : "Beds"}
                </span>
              </div>

              {/* Units Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {room.inventoryUnits?.map((unit: any) => {
                  const hasBlock = unit.availabilityBlocks && unit.availabilityBlocks.length > 0;
                  const activeBooking = unit.bookings && unit.bookings[0];

                  let statusBadge = (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Available
                    </span>
                  );

                  if (hasBlock) {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                        <Wrench className="w-3 h-3" />
                        {unit.availabilityBlocks[0].reason}
                      </span>
                    );
                  } else if (activeBooking) {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                        Occupied
                      </span>
                    );
                  } else if (unit.status !== "AVAILABLE") {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                        {unit.status}
                      </span>
                    );
                  }

                  return (
                    <div
                      key={unit.id}
                      className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Bed className="w-4 h-4 text-[#123D2B]" />
                            <span className="text-xs font-black text-[#123D2B]">{unit.identifier}</span>
                          </div>
                          <span className="text-[10px] text-[#7B8B82] block mt-0.5">
                            ID: {unit.id.slice(-6)}
                          </span>
                        </div>
                        {statusBadge}
                      </div>

                      {activeBooking && (
                        <div className="text-[11px] bg-white p-2 rounded-xl border border-[#E8E6DF] space-y-0.5">
                          <span className="font-bold text-[#123D2B] block">
                            Resident: {activeBooking.guestName}
                          </span>
                          <span className="text-[10px] text-[#5E6E65] block">
                            Until: {new Date(activeBooking.endTime).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {hasBlock && (
                        <div className="text-[11px] bg-amber-50 p-2 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                          <span className="font-bold block">
                            Block: {unit.availabilityBlocks[0].notes || "Scheduled Maintenance"}
                          </span>
                          <button
                            onClick={() => handleReleaseBlock(unit.availabilityBlocks[0].id)}
                            className="text-[10px] font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer block"
                          >
                            Release Block Now
                          </button>
                        </div>
                      )}

                      {/* Quick Status Control */}
                      <div className="pt-2 border-t border-[#E8E6DF] flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#7B8B82]">Quick Set:</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateUnitStatus(unit.id, "AVAILABLE")}
                            className="px-2 py-0.5 rounded-md bg-white border border-[#D5D2C7] font-semibold hover:bg-emerald-50 text-emerald-800 text-[10px]"
                          >
                            Free
                          </button>
                          <button
                            onClick={() => handleUpdateUnitStatus(unit.id, "MAINTENANCE")}
                            className="px-2 py-0.5 rounded-md bg-white border border-[#D5D2C7] font-semibold hover:bg-amber-50 text-amber-800 text-[10px]"
                          >
                            Maint
                          </button>
                          <button
                            onClick={() => handleUpdateUnitStatus(unit.id, "BLOCKED")}
                            className="px-2 py-0.5 rounded-md bg-white border border-[#D5D2C7] font-semibold hover:bg-red-50 text-red-800 text-[10px]"
                          >
                            Block
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Maintenance Block Modal */}
      {blockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E8E6DF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF]">
              <h2 className="text-base font-bold text-[#123D2B]">Schedule Maintenance / Cleaning Block</h2>
              <button onClick={() => setBlockModalOpen(false)}>
                <X className="w-5 h-5 text-[#5E6E65]" />
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Select Inventory Unit / Bed</label>
                <select
                  value={blockForm.inventoryUnitId}
                  onChange={(e) => setBlockForm({ ...blockForm, inventoryUnitId: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                >
                  {allUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.room?.roomNumber} - {u.identifier} ({u.room?.roomType?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Reason</label>
                <select
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                >
                  <option value="MAINTENANCE">Facility Maintenance & Repairs</option>
                  <option value="CLEANING">Deep Cleaning Buffer</option>
                  <option value="OFFLINE_HOLD">Offline Property Hold</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Start Date</label>
                  <input
                    type="date"
                    required
                    value={blockForm.startTime}
                    onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">End Date</label>
                  <input
                    type="date"
                    required
                    value={blockForm.endTime}
                    onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Notes</label>
                <textarea
                  rows={2}
                  value={blockForm.notes}
                  onChange={(e) => setBlockForm({ ...blockForm, notes: e.target.value })}
                  placeholder="e.g. Painting work and plumbing check"
                  className="w-full p-2.5 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E8E6DF]">
                <button
                  type="button"
                  onClick={() => setBlockModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5D2C7] font-bold text-[#4A5550]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#123D2B] text-white font-bold hover:bg-[#0E2F21]"
                >
                  Apply Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Unit Modal */}
      {addUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E8E6DF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF]">
              <h2 className="text-base font-bold text-[#123D2B]">Add Bed / Physical Unit</h2>
              <button onClick={() => setAddUnitModalOpen(false)}>
                <X className="w-5 h-5 text-[#5E6E65]" />
              </button>
            </div>

            <form onSubmit={handleAddUnit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Assign to Physical Room</label>
                <select
                  value={addUnitForm.roomId}
                  onChange={(e) => setAddUnitForm({ ...addUnitForm, roomId: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.roomNumber} ({r.roomType?.name} - {r.roomType?.property?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Unit Identifier</label>
                <input
                  type="text"
                  required
                  value={addUnitForm.identifier}
                  onChange={(e) => setAddUnitForm({ ...addUnitForm, identifier: e.target.value })}
                  placeholder="e.g. Bed C or Room 104"
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Is this an individual shared bed?</label>
                <select
                  value={addUnitForm.isBed ? "true" : "false"}
                  onChange={(e) => setAddUnitForm({ ...addUnitForm, isBed: e.target.value === "true" })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                >
                  <option value="true">Yes, individual bed in shared room</option>
                  <option value="false">No, entire private room unit</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E8E6DF]">
                <button
                  type="button"
                  onClick={() => setAddUnitModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5D2C7] font-bold text-[#4A5550]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#123D2B] text-white font-bold hover:bg-[#0E2F21]"
                >
                  Create Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
