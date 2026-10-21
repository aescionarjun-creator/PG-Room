"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DemoBanner } from "@/components/common/DemoBanner";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreeTerms) {
      setError("Please accept the Stayzy Terms of Service & Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Registration failed.");
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 w-full">
      <div className="bg-white rounded-3xl border border-[#E8E6DF] p-8 shadow-card-hover space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#123D2B] text-[#E8F1D5] font-black text-xl flex items-center justify-center mx-auto shadow-sm">
            S
          </div>
          <h1 className="text-2xl font-extrabold text-[#123D2B]">Create Your Account</h1>
          <p className="text-xs text-[#5E6E65]">
            Join Stayzy to book flexible rooms, keyless check-ins, and coliving spaces.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#5E6E65]">Full Legal Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#7B8B82] absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#5E6E65]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#7B8B82] absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#5E6E65]">Mobile Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#7B8B82] absolute left-3 top-3.5" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#5E6E65]">Choose Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#7B8B82] absolute left-3 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 pt-1 text-[11px] text-[#5E6E65] cursor-pointer">
            <input
              type="checkbox"
              required
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded text-[#123D2B] mt-0.5"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-[#123D2B] font-bold underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#123D2B] font-bold underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#123D2B] text-white font-bold text-xs hover:bg-[#0E2F21] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>{loading ? "Creating Account..." : "Create Account & Continue"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#5E6E65] border-t border-[#F0EDE4]">
          <p>
            Already have an account?{" "}
            <Link
              href={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="font-bold text-[#123D2B] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
      <DemoBanner />
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={<div className="py-20 text-center text-xs">Loading registration...</div>}>
          <RegisterForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
