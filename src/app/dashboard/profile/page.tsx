"use client";

import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react";

export default function DashboardProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.user) {
          setUser(json.user);
          setName(json.user.name || "");
          setPhone(json.user.phone || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile.");
      }
      setSuccess("Profile settings saved successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-[#5E6E65]">Loading profile...</div>;
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[#123D2B]">Account & Profile</h1>
        <p className="text-xs text-[#5E6E65] mt-0.5">
          Manage your contact credentials and digital keyless access phone number.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 sm:p-8 shadow-soft space-y-6">
        {success && (
          <div className="p-3.5 rounded-xl bg-[#E8F1D5] text-[#123D2B] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#5E6E65]">Email Address</label>
            <input
              disabled
              value={user?.email || ""}
              className="w-full h-11 px-3.5 rounded-xl border border-[#E8E6DF] bg-gray-50 text-gray-500 font-medium cursor-not-allowed"
            />
            <span className="text-[10px] text-[#7B8B82]">
              Email is permanently linked to your digital rental agreement.
            </span>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#5E6E65]">Full Legal Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#5E6E65]">Mobile Phone (Keyless Access)</label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
            />
          </div>

          <div className="pt-4 border-t border-[#F0EDE4] space-y-3">
            <span className="font-bold text-sm text-[#123D2B] block">Change Password</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#5E6E65] block mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5E6E65] block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 rounded-xl bg-[#123D2B] text-white font-bold text-xs hover:bg-[#0E2F21] transition-all cursor-pointer mt-4"
          >
            {saving ? "Saving Changes..." : "Save Account Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
