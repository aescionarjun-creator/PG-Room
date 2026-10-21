"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  DollarSign,
  Users,
  Bed,
  CalendarCheck,
  Clock,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  X,
  Filter,
  RefreshCw,
  Sparkles,
  MapPin,
  Calendar,
  Lock,
} from "lucide-react";

export function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "inventory" | "rates" | "visits">("overview");

  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Offline booking modal
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [offlineForm, setOfflineForm] = useState({
    propertyId: "stayzy-haven-koramangala",
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

  // Maintenance block modal
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({
    inventoryUnitId: "",
    reason: "MAINTENANCE",
    startTime: new Date().toISOString().split("T")[0],
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "",
  });

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      setUnauthorized(false);

      const res = await fetch("/api/admin/stats");
      if (res.status === 403) {
        setUnauthorized(true);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentBookings(data.recentBookings || []);
        setRecentVisits(data.recentVisits || []);
        setProperties(data.properties || []);
      } else {
        setError(data.error);
      }

      // Also load rates
      const ratesRes = await fetch("/api/admin/rates");
      const ratesData = await ratesRes.json();
      if (ratesData.success) {
        setRoomTypes(ratesData.roomTypes || []);
        if (ratesData.roomTypes?.[0]) {
          setOfflineForm((prev) => ({
            ...prev,
            roomTypeId: ratesData.roomTypes[0].id,
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
    loadDashboard();
  }, []);

  const handleSwitchToAdmin = async () => {
    await fetch("/api/auth/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "ADMIN" }),
    });
    window.location.reload();
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        loadDashboard();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateOfflineBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offlineForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create offline booking.");
      }
      alert(data.message);
      setOfflineModalOpen(false);
      loadDashboard();
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
        throw new Error(data.error || "Failed to create block.");
      }
      alert(data.message);
      setBlockModalOpen(false);
      loadDashboard();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleRatePlan = async (ratePlanId: string, isEnabled: boolean) => {
    try {
      const res = await fetch("/api/admin/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratePlanId, isEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        loadDashboard();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (unauthorized) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-[#123D2B] text-[#E8F1D5] flex items-center justify-center mx-auto shadow-md">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#123D2B]">Admin Authorization Required</h1>
        <p className="text-xs text-[#5E6E65] max-w-md mx-auto">
          You are currently in standard Customer role. Click below to switch into the Stayzy Property Manager profile.
        </p>
        <button
          onClick={handleSwitchToAdmin}
          className="px-6 py-3 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] transition-colors cursor-pointer"
        >
          Switch to Stayzy Admin Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E6DF] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E8F1D5] text-[#123D2B] text-[11px] font-bold">
              Property Manager Console
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#123D2B] mt-1">
            Stayzy Operations Dashboard
          </h1>
          <p className="text-xs text-[#5E6E65] mt-0.5">
            Real database aggregates, inventory control, and rate plan management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOfflineModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            New Offline Booking
          </button>
          <button
            onClick={loadDashboard}
            className="p-2.5 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] hover:bg-[#FAF8F5]"
            title="Refresh database totals"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Actual Database KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E8E6DF] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#5E6E65] uppercase">Total Revenue</span>
            <div className="text-xl font-black text-[#123D2B]">
              ₹{stats.totalRevenue.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-[#7B8B82]">Paid bookings</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E6DF] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#5E6E65] uppercase">Total Bookings</span>
            <div className="text-xl font-black text-[#192621]">
              {stats.totalBookingsCount}
            </div>
            <span className="text-[10px] text-[#7B8B82]">In database</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E6DF] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#5E6E65] uppercase">Active Residents</span>
            <div className="text-xl font-black text-[#123D2B]">
              {stats.checkedInCount + stats.confirmedCount}
            </div>
            <span className="text-[10px] text-[#7B8B82]">Confirmed/In house</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E6DF] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#5E6E65] uppercase">Total Units</span>
            <div className="text-xl font-black text-[#192621]">
              {stats.totalUnitsCount}
            </div>
            <span className="text-[10px] text-[#7B8B82]">Beds & private rooms</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E6DF] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#5E6E65] uppercase">Pending Visits</span>
            <div className="text-xl font-black text-amber-600">
              {stats.pendingVisitsCount}
            </div>
            <span className="text-[10px] text-[#7B8B82]">Tour inquiries</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E6DF] shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-[#5E6E65] uppercase">Checkout Holds</span>
            <div className="text-xl font-black text-blue-600">
              {stats.activeHoldsCount}
            </div>
            <span className="text-[10px] text-[#7B8B82]">Active 15m locks</span>
          </div>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex border-b border-[#E8E6DF] gap-6 text-sm font-bold">
        {[
          { id: "overview", label: "Overview & Bookings" },
          { id: "inventory", label: "Room & Bed Units" },
          { id: "rates", label: "Rates & Duration Toggles" },
          { id: "visits", label: "Scheduled Tours" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "border-b-2 border-[#123D2B] text-[#123D2B]"
                : "text-[#5E6E65] hover:text-[#192621]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Bookings Management */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#123D2B]">All Guest Bookings</h3>
          <div className="bg-white rounded-3xl border border-[#E8E6DF] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#5E6E65] border-b border-[#E8E6DF]">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Guest</th>
                    <th className="p-4">Room / Unit</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Check-in / Out</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDE4]">
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#FAF8F5]">
                      <td className="p-4 font-mono font-bold text-[#123D2B]">
                        {b.bookingReference}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-[#192621]">{b.guestName}</div>
                        <div className="text-[11px] text-[#7B8B82]">{b.guestPhone}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">{b.roomType?.name}</div>
                        <div className="text-[11px] text-[#123D2B]">
                          {b.inventoryUnit?.identifier || "Auto-assigned"}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-[#FAF8F5] font-semibold">
                          {b.durationType} ({b.durationCount})
                        </span>
                      </td>
                      <td className="p-4 text-[11px]">
                        <div>In: {new Date(b.startTime).toLocaleDateString("en-IN")}</div>
                        <div>Out: {new Date(b.endTime).toLocaleDateString("en-IN")}</div>
                      </td>
                      <td className="p-4 font-bold text-[#123D2B]">
                        ₹{b.totalAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            b.status === "CHECKED_IN"
                              ? "bg-green-100 text-green-800"
                              : b.status === "CONFIRMED"
                              ? "bg-[#E8F1D5] text-[#123D2B]"
                              : b.status === "CHECKED_OUT"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1.5">
                          {b.status === "CONFIRMED" && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, "CHECKED_IN")}
                              className="px-2.5 py-1 rounded-lg bg-[#123D2B] text-white text-[11px] font-semibold cursor-pointer"
                            >
                              Check-In
                            </button>
                          )}
                          {b.status === "CHECKED_IN" && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, "CHECKED_OUT")}
                              className="px-2.5 py-1 rounded-lg bg-gray-700 text-white text-[11px] font-semibold cursor-pointer"
                            >
                              Check-Out
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Inventory & Maintenance */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-[#123D2B]">Rooms & Beds Status</h3>
            <button
              onClick={() => setBlockModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#123D2B] text-white text-xs font-bold"
            >
              Block Unit for Maintenance
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-3xl border border-[#E8E6DF] p-6 space-y-4"
              >
                <div className="flex items-center gap-2 pb-3 border-b border-[#F0EDE4]">
                  <MapPin className="w-4 h-4 text-[#123D2B]" />
                  <h4 className="font-extrabold text-sm text-[#123D2B]">{prop.name}</h4>
                </div>

                <div className="space-y-3">
                  {prop.roomTypes.map((rt: any) => (
                    <div key={rt.id} className="p-4 rounded-2xl bg-[#FAF8F5] space-y-2">
                      <div className="flex justify-between text-xs font-bold text-[#192621]">
                        <span>{rt.name}</span>
                        <span className="text-[#5E6E65]">{rt.category}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                        {rt.rooms.map((r: any) =>
                          r.inventoryUnits.map((u: any) => (
                            <div
                              key={u.id}
                              className={`p-2 rounded-xl border text-[11px] font-medium flex items-center justify-between ${
                                u.status === "AVAILABLE"
                                  ? "bg-white border-[#E8E6DF] text-[#192621]"
                                  : "bg-red-50 border-red-200 text-red-700"
                              }`}
                            >
                              <span>{u.identifier}</span>
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  u.status === "AVAILABLE" ? "bg-green-500" : "bg-red-500"
                                }`}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Rate Plans & Durations */}
      {activeTab === "rates" && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-[#123D2B]">
            Configure Allowed Durations & Base Tariffs
          </h3>

          <div className="space-y-6">
            {roomTypes.map((rt) => (
              <div
                key={rt.id}
                className="bg-white rounded-3xl border border-[#E8E6DF] p-6 space-y-4 shadow-sm"
              >
                <div className="flex justify-between items-center pb-3 border-b border-[#F0EDE4]">
                  <div>
                    <h4 className="font-extrabold text-base text-[#123D2B]">{rt.name}</h4>
                    <p className="text-xs text-[#5E6E65]">{rt.property.name}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E8F1D5] text-[#123D2B]">
                    {rt.category}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {rt.ratePlans.map((rp: any) => (
                    <div
                      key={rp.id}
                      className="p-4 rounded-2xl border border-[#E8E6DF] bg-[#FAF8F5] space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-[#123D2B]">
                          {rp.durationType}
                        </span>
                        <input
                          type="checkbox"
                          checked={rp.isEnabled}
                          onChange={(e) => handleToggleRatePlan(rp.id, e.target.checked)}
                          className="w-4 h-4 rounded text-[#123D2B] cursor-pointer"
                        />
                      </div>
                      <div className="text-lg font-black text-[#192621]">
                        ₹{rp.price.toLocaleString("en-IN")}
                      </div>
                      <p className="text-[10px] text-[#7B8B82]">
                        Deposit: ₹{rp.depositAmount.toLocaleString("en-IN")}
                      </p>
                      <span
                        className={`text-[10px] font-bold block ${
                          rp.isEnabled ? "text-green-700" : "text-gray-400"
                        }`}
                      >
                        {rp.isEnabled ? "Duration Active" : "Disabled"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Scheduled Tour Visits */}
      {activeTab === "visits" && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#123D2B]">Property Tour Requests</h3>
          <div className="bg-white rounded-3xl border border-[#E8E6DF] overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#5E6E65] border-b border-[#E8E6DF]">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Preferred Date & Slot</th>
                  <th className="p-4">Property</th>
                  <th className="p-4">Notes</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE4]">
                {recentVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-[#FAF8F5]">
                    <td className="p-4 font-bold text-[#192621]">{v.customerName}</td>
                    <td className="p-4">{v.customerPhone}</td>
                    <td className="p-4">
                      {new Date(v.preferredDate).toLocaleDateString("en-IN")} • {v.timeSlot}
                    </td>
                    <td className="p-4">{v.property?.name || "Stayzy Haven"}</td>
                    <td className="p-4 text-[#5E6E65]">{v.notes || "—"}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E8F1D5] text-[#123D2B]">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Offline Booking Entry */}
      {offlineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl space-y-4">
            <button
              onClick={() => setOfflineModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-[#123D2B]">Manual / Offline Booking Entry</h3>

            <form onSubmit={handleCreateOfflineBooking} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5E6E65] block mb-1">Room Type</label>
                <select
                  value={offlineForm.roomTypeId}
                  onChange={(e) => {
                    const selected = roomTypes.find((r) => r.id === e.target.value);
                    const firstUnit = selected?.rooms?.[0]?.inventoryUnits?.[0]?.id || "";
                    setOfflineForm({
                      ...offlineForm,
                      roomTypeId: e.target.value,
                      inventoryUnitId: firstUnit,
                    });
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                >
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#5E6E65] block mb-1">Target Bed / Unit</label>
                <select
                  value={offlineForm.inventoryUnitId}
                  onChange={(e) => setOfflineForm({ ...offlineForm, inventoryUnitId: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                >
                  {properties.flatMap((p) =>
                    p.roomTypes.flatMap((rt: any) =>
                      rt.rooms.flatMap((r: any) =>
                        r.inventoryUnits.map((u: any) => (
                          <option key={u.id} value={u.id}>
                            {p.name} — {rt.name} — {u.identifier}
                          </option>
                        ))
                      )
                    )
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#5E6E65] block mb-1">Guest Name</label>
                  <input
                    required
                    value={offlineForm.guestName}
                    onChange={(e) => setOfflineForm({ ...offlineForm, guestName: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5E6E65] block mb-1">Guest Phone</label>
                  <input
                    required
                    value={offlineForm.guestPhone}
                    onChange={(e) => setOfflineForm({ ...offlineForm, guestPhone: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#5E6E65] block mb-1">Check-in</label>
                  <input
                    type="date"
                    required
                    value={offlineForm.startDate}
                    onChange={(e) => setOfflineForm({ ...offlineForm, startDate: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5E6E65] block mb-1">Check-out</label>
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
                <div>
                  <label className="font-bold text-[#5E6E65] block mb-1">Total Tariff (₹)</label>
                  <input
                    type="number"
                    required
                    value={offlineForm.totalAmount}
                    onChange={(e) => setOfflineForm({ ...offlineForm, totalAmount: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5E6E65] block mb-1">Deposit (₹)</label>
                  <input
                    type="number"
                    value={offlineForm.depositAmount}
                    onChange={(e) => setOfflineForm({ ...offlineForm, depositAmount: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#123D2B] text-white font-bold text-xs hover:bg-[#0E2F21] mt-2 cursor-pointer"
              >
                Confirm Offline Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Maintenance Block */}
      {blockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-4">
            <button
              onClick={() => setBlockModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-[#123D2B]">Block Unit (Maintenance/Cleaning)</h3>

            <form onSubmit={handleCreateBlock} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5E6E65] block mb-1">Select Unit</label>
                <select
                  value={blockForm.inventoryUnitId}
                  onChange={(e) => setBlockForm({ ...blockForm, inventoryUnitId: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                >
                  <option value="">-- Choose Unit --</option>
                  {properties.flatMap((p) =>
                    p.roomTypes.flatMap((rt: any) =>
                      rt.rooms.flatMap((r: any) =>
                        r.inventoryUnits.map((u: any) => (
                          <option key={u.id} value={u.id}>
                            {p.name} — {u.identifier}
                          </option>
                        ))
                      )
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#5E6E65] block mb-1">Reason</label>
                <select
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                >
                  <option value="MAINTENANCE">Maintenance / Repairs</option>
                  <option value="CLEANING">Deep Sanitization & Cleaning</option>
                  <option value="OFFLINE_HOLD">Internal Management Hold</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#5E6E65] block mb-1">From</label>
                  <input
                    type="date"
                    required
                    value={blockForm.startTime}
                    onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5E6E65] block mb-1">To</label>
                  <input
                    type="date"
                    required
                    value={blockForm.endTime}
                    onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#123D2B] text-white font-bold text-xs hover:bg-[#0E2F21] mt-2 cursor-pointer"
              >
                Apply Availability Block
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
