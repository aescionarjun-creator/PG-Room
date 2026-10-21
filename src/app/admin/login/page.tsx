"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DemoBanner } from "@/components/common/DemoBanner";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Shield, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, requiredRole: "ADMIN" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Admin authentication failed.");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdminLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoType: "admin" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/admin");
        router.refresh();
      } else {
        throw new Error(data.error || "Demo admin login failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
      <DemoBanner />
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-3xl border border-[#E8E6DF] p-8 max-w-md w-full shadow-card-hover space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#123D2B] text-[#E8F1D5] flex items-center justify-center mx-auto shadow-md">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#123D2B]">
              Property Manager Portal
            </h1>
            <p className="text-xs text-[#5E6E65]">
              Authorized Stayzy administrative and operations login.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Demo Admin Login */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-2.5">
            <span className="text-[11px] font-bold text-[#123D2B] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#123D2B]" />
              Staff Demo Mode
            </span>
            <button
              type="button"
              onClick={handleDemoAdminLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#123D2B] text-[#E8F1D5] text-xs font-bold hover:bg-[#0E2F21] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Shield className="w-4 h-4" />
              Quick Sign In as Stayzy Admin
            </button>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#5E6E65]">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7B8B82] absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@stayzy.com"
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#5E6E65]">Admin Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7B8B82] absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#123D2B] text-white font-bold text-xs hover:bg-[#0E2F21] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? "Authenticating..." : "Enter Operations Console"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#5E6E65] border-t border-[#F0EDE4]">
            <Link href="/login" className="font-bold text-[#123D2B] hover:underline">
              Switch to Resident Customer Login
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
