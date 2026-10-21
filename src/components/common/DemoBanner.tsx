"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, UserCheck, X, Check } from "lucide-react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(true); // default hidden to prevent flash
  const [switching, setSwitching] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  useEffect(() => {
    const isDismissed = localStorage.getItem("stayzy_banner_dismissed") === "true";
    if (!isDismissed) {
      setDismissed(false);
    }

    // Check current auth status
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user?.role) {
          setCurrentRole(d.user.role);
        }
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("stayzy_banner_dismissed", "true");
  };

  const switchRole = async (role: "CUSTOMER" | "ADMIN") => {
    try {
      setSwitching(true);
      const res = await fetch("/api/auth/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSwitching(false);
    }
  };

  if (dismissed) return null;

  return (
    <div className="bg-[#123D2B] text-white text-xs py-2 px-4 border-b border-[#1E543C] shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E8F1D5] inline-block animate-pulse" />
          <span className="font-bold text-[#E8F1D5] text-[11px] uppercase tracking-wider">
            Stayzy Platform Environment
          </span>
          <span className="text-white/70 hidden md:inline text-[11px]">
            Live calendar pricing, keyless lock credentials, and verified inventory across Koramangala, HSR Layout & Indiranagar.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#0D2F21] p-0.5 rounded-lg border border-[#1E543C]">
            <button
              onClick={() => switchRole("CUSTOMER")}
              disabled={switching}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                currentRole === "CUSTOMER"
                  ? "bg-[#1E543C] text-white"
                  : "text-[#E8F1D5] hover:bg-[#123D2B]"
              }`}
              title="Test resident experience"
            >
              <UserCheck className="w-3 h-3" />
              Resident Account
              {currentRole === "CUSTOMER" && <Check className="w-3 h-3 text-[#E8F1D5]" />}
            </button>
            <button
              onClick={() => switchRole("ADMIN")}
              disabled={switching}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                currentRole === "ADMIN"
                  ? "bg-[#1E543C] text-white"
                  : "text-[#E8F1D5] hover:bg-[#123D2B]"
              }`}
              title="Test property operations & inventory"
            >
              <ShieldCheck className="w-3 h-3" />
              Property Manager
              {currentRole === "ADMIN" && <Check className="w-3 h-3 text-[#E8F1D5]" />}
            </button>
          </div>

          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
