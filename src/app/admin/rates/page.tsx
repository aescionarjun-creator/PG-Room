"use client";

import React, { useState, useEffect } from "react";
import {
  Tag,
  Clock,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Edit2,
  X,
  Building2,
} from "lucide-react";

export default function AdminRatesPage() {
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [roomTypeName, setRoomTypeName] = useState("");
  const [form, setForm] = useState({
    price: 0,
    depositAmount: 0,
    foodMonthlyCharge: 0,
    allowedHoursStart: "08:00",
    allowedHoursEnd: "22:00",
    isEnabled: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/rates");
      const data = await res.json();
      if (data.success) {
        setRoomTypes(data.roomTypes || []);
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
    fetchRates();
  }, []);

  const handleToggleEnabled = async (plan: any) => {
    try {
      const res = await fetch("/api/admin/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ratePlanId: plan.id,
          isEnabled: !plan.isEnabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchRates();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditModal = (rt: any, plan: any) => {
    setSelectedPlan(plan);
    setRoomTypeName(rt.name);
    setForm({
      price: plan.price,
      depositAmount: plan.depositAmount || 0,
      foodMonthlyCharge: plan.foodMonthlyCharge || 0,
      allowedHoursStart: plan.allowedHoursStart || "08:00",
      allowedHoursEnd: plan.allowedHoursEnd || "22:00",
      isEnabled: plan.isEnabled,
    });
    setEditModalOpen(true);
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ratePlanId: selectedPlan.id,
          price: Number(form.price),
          depositAmount: Number(form.depositAmount),
          foodMonthlyCharge: Number(form.foodMonthlyCharge),
          allowedHoursStart: form.allowedHoursStart,
          allowedHoursEnd: form.allowedHoursEnd,
          isEnabled: form.isEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update rate plan.");
      }
      setEditModalOpen(false);
      fetchRates();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const durationOrder = ["HOURLY", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E6DF] gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#123D2B] uppercase tracking-wider">
            Pricing Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D2B] mt-0.5">
            Rates & Duration Packages
          </h1>
          <p className="text-xs text-[#5E6E65] mt-1">
            Manage pricing across all 5 duration modes: Hourly, Daily, Weekly, Monthly, and Yearly.
          </p>
        </div>

        <button
          onClick={fetchRates}
          className="p-2.5 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] hover:bg-[#FAF8F5] self-start sm:self-auto"
          title="Refresh rates"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Snapshot Notice */}
      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] flex items-start gap-3 text-xs text-[#5E6E65]">
        <ShieldCheck className="w-5 h-5 text-[#123D2B] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#123D2B] block">Price Snapshot Integrity:</span>
          When rates are modified, future quotes and public room cards reflect the updated pricing immediately. All confirmed bookings retain their originally agreed price snapshot in the database.
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
          Loading rate plans from database...
        </div>
      ) : roomTypes.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-[#E8E6DF]">
          <Tag className="w-12 h-12 text-[#7B8B82] mx-auto" />
          <h3 className="text-base font-bold text-[#123D2B]">No room rate plans configured</h3>
        </div>
      ) : (
        <div className="space-y-6">
          {roomTypes.map((rt) => {
            // Sort rate plans according to durationOrder
            const sortedPlans = [...(rt.ratePlans || [])].sort((a, b) => {
              return durationOrder.indexOf(a.durationType) - durationOrder.indexOf(b.durationType);
            });

            return (
              <div
                key={rt.id}
                className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-card space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0EDE4] gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#7B8B82] uppercase">
                      {rt.property?.name} ({rt.category.replace("_", " ")})
                    </span>
                    <h3 className="text-lg font-black text-[#123D2B]">{rt.name}</h3>
                  </div>

                  <span className="text-xs font-bold text-[#123D2B]">
                    {sortedPlans.filter((p) => p.isEnabled).length} of {sortedPlans.length} Duration Plans Active
                  </span>
                </div>

                {/* Rate Plans Table / Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {sortedPlans.map((plan) => {
                    let unitLabel = "/hr";
                    if (plan.durationType === "DAILY") unitLabel = "/day";
                    if (plan.durationType === "WEEKLY") unitLabel = "/week";
                    if (plan.durationType === "MONTHLY") unitLabel = "/mo";
                    if (plan.durationType === "YEARLY") unitLabel = "/yr";

                    return (
                      <div
                        key={plan.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                          plan.isEnabled
                            ? "bg-[#FAF8F5] border-[#D5D2C7]"
                            : "bg-gray-50 border-gray-200 opacity-60"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-[#123D2B]">
                              {plan.durationType}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleEnabled(plan)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                                plan.isEnabled
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {plan.isEnabled ? "Active" : "Disabled"}
                            </button>
                          </div>

                          <div className="mt-2">
                            <span className="text-xl font-black text-[#123D2B]">
                              ₹{plan.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-[#5E6E65] font-semibold">{unitLabel}</span>
                          </div>

                          <div className="mt-2 space-y-1 text-[11px] text-[#5E6E65]">
                            <div>
                              Deposit: <strong>₹{plan.depositAmount || 0}</strong>
                            </div>
                            {plan.durationType === "HOURLY" && (
                              <div>
                                Hours: <strong>{plan.allowedHoursStart} - {plan.allowedHoursEnd}</strong>
                              </div>
                            )}
                            {plan.foodMonthlyCharge > 0 && (
                              <div>
                                Food: <strong>₹{plan.foodMonthlyCharge}/mo</strong>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => openEditModal(rt, plan)}
                          className="w-full py-1.5 rounded-lg border border-[#D5D2C7] bg-white text-xs font-bold text-[#123D2B] hover:bg-[#FAF8F5] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit Rate
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Rate Plan Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E8E6DF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF]">
              <div>
                <h2 className="text-base font-bold text-[#123D2B]">
                  Edit {selectedPlan?.durationType} Rate
                </h2>
                <span className="text-xs text-[#5E6E65]">{roomTypeName}</span>
              </div>
              <button onClick={() => setEditModalOpen(false)}>
                <X className="w-5 h-5 text-[#5E6E65]" />
              </button>
            </div>

            <form onSubmit={handleSaveRate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Base Price (₹)</label>
                <input
                  type="number"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-bold text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Refundable Deposit (₹)</label>
                <input
                  type="number"
                  value={form.depositAmount}
                  onChange={(e) => setForm({ ...form, depositAmount: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              {selectedPlan?.durationType === "HOURLY" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#4A5550]">Allowed Hours Start</label>
                    <input
                      type="time"
                      value={form.allowedHoursStart}
                      onChange={(e) => setForm({ ...form, allowedHoursStart: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#4A5550]">Allowed Hours End</label>
                    <input
                      type="time"
                      value={form.allowedHoursEnd}
                      onChange={(e) => setForm({ ...form, allowedHoursEnd: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Food Plan Add-on (₹/mo)</label>
                  <input
                    type="number"
                    value={form.foodMonthlyCharge}
                    onChange={(e) => setForm({ ...form, foodMonthlyCharge: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
              )}

              <div className="space-y-1 pt-1">
                <label className="font-bold text-[#4A5550] flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isEnabled}
                    onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })}
                    className="rounded text-[#123D2B]"
                  />
                  <span>Offer this duration option on public booking engine</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8E6DF]">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5D2C7] font-bold text-[#4A5550]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#123D2B] text-white font-bold hover:bg-[#0E2F21] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Update Rate Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
