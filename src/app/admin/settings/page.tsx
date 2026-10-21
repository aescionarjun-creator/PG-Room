"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Shield,
  Sparkles,
  Lock,
  Globe,
  Clock,
  Percent,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    propertyName: "Stayzy Living",
    timezone: "Asia/Kolkata",
    currency: "INR",
    currencySymbol: "₹",
    gstRatePercent: 12,
    cleaningBufferMinutes: 60,
    holdExpiryMinutes: 15,
    defaultCheckInTime: "12:00 PM",
    defaultCheckOutTime: "11:00 AM",
    supportEmail: "support@stayzy.in",
    supportPhone: "+91 80 4567 8900",
    demoModeActive: true,
    enableSignedWebhooks: true,
    razorpayKeyId: "",
    razorpayKeySecret: "",
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setForm((prev) => ({ ...prev, ...data.settings }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save settings");
      }

      setSuccessMsg("System configuration saved successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E6DF] gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#123D2B] uppercase tracking-wider">
            System Configuration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D2B] mt-0.5">
            Operations & Billing Settings
          </h1>
          <p className="text-xs text-[#5E6E65] mt-1">
            Global tax rules, cleaning buffer windows, inventory hold timeouts, and payment gateway keys.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className="p-2.5 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] hover:bg-[#FAF8F5] self-start sm:self-auto"
          title="Reload settings"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-[#5E6E65] bg-white rounded-3xl border border-[#E8E6DF]">
          Loading operational settings...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Billing & Tax Rules */}
          <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-card space-y-4">
            <h2 className="text-base font-extrabold text-[#123D2B] flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#123D2B]" />
              Tax, Billing & Inventory Timing
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">GST Rate Percentage (%)</label>
                <input
                  type="number"
                  required
                  value={form.gstRatePercent}
                  onChange={(e) => setForm({ ...form, gstRatePercent: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-bold"
                />
                <span className="text-[10px] text-[#7B8B82] block">
                  Standard hospitality GST applicable to base room charges.
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Cleaning Buffer (Minutes)</label>
                <input
                  type="number"
                  required
                  value={form.cleaningBufferMinutes}
                  onChange={(e) => setForm({ ...form, cleaningBufferMinutes: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-bold"
                />
                <span className="text-[10px] text-[#7B8B82] block">
                  Mandatory gap between consecutive stays for housekeeping.
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Temporary Checkout Hold (Minutes)</label>
                <input
                  type="number"
                  required
                  value={form.holdExpiryMinutes}
                  onChange={(e) => setForm({ ...form, holdExpiryMinutes: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-bold"
                />
                <span className="text-[10px] text-[#7B8B82] block">
                  Time a visitor has to finish payment before inventory releases.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Default Check-In Window Time</label>
                <input
                  type="text"
                  value={form.defaultCheckInTime}
                  onChange={(e) => setForm({ ...form, defaultCheckInTime: e.target.value })}
                  placeholder="12:00 PM"
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Default Check-Out Window Time</label>
                <input
                  type="text"
                  value={form.defaultCheckOutTime}
                  onChange={(e) => setForm({ ...form, defaultCheckOutTime: e.target.value })}
                  placeholder="11:00 AM"
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>
            </div>
          </div>

          {/* Regional & Currency Localization */}
          <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-card space-y-4">
            <h2 className="text-base font-extrabold text-[#123D2B] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#123D2B]" />
              Timezone & Regional Localization
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Property Operating Timezone</label>
                <input
                  type="text"
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-bold"
                />
                <span className="text-[10px] text-[#7B8B82]">
                  Default demo timezone: Asia/Kolkata (IST).
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Display Currency Code</label>
                <input
                  type="text"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-bold"
                />
              </div>
            </div>
          </div>

          {/* Payment Gateway & Production Security */}
          <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-card space-y-4">
            <h2 className="text-base font-extrabold text-[#123D2B] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#123D2B]" />
              Payment Infrastructure & Gateways
            </h2>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#123D2B] block">Demo Mode Adapter</span>
                  <span className="text-[#5E6E65] text-[11px]">
                    Provides instant simulated payment checkout with HMAC-SHA256 cryptographic signatures.
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Active & Enabled
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Razorpay / Stripe Key ID (Production)</label>
                <input
                  type="text"
                  value={form.razorpayKeyId}
                  onChange={(e) => setForm({ ...form, razorpayKeyId: e.target.value })}
                  placeholder="rzp_live_xxxxxxxxxxxxxxxx"
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Webhook Secret Key</label>
                <input
                  type="password"
                  value={form.razorpayKeySecret}
                  onChange={(e) => setForm({ ...form, razorpayKeySecret: e.target.value })}
                  placeholder="whsec_••••••••••••••••"
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#123D2B] text-white font-bold text-xs hover:bg-[#0E2F21] disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Changes..." : "Save System Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
