"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DemoBanner } from "@/components/common/DemoBanner";
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  Calendar,
  LifeBuoy,
  User,
  Compass,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  Heart,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          // If not logged in, prompt login
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Bookings", href: "/dashboard/bookings", icon: CalendarCheck },
    { label: "Saved Stays", href: "/dashboard/saved", icon: Heart },
    { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { label: "Visits", href: "/dashboard/visits", icon: Calendar },
    { label: "Support", href: "/dashboard/support", icon: LifeBuoy },
    { label: "Profile", href: "/dashboard/profile", icon: User },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center text-xs text-[#5E6E65]">
        Loading your resident dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
      <DemoBanner />

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#F8F7F2]/95 backdrop-blur-md border-b border-[#E8E6DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-xl text-[#192621] hover:bg-[#EAE7DC]"
              aria-label="Toggle resident menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#123D2B] text-[#E8F1D5] font-black text-lg flex items-center justify-center">
                S
              </div>
              <span className="text-xl font-extrabold text-[#123D2B] tracking-tight hidden sm:inline">
                Stayzy
              </span>
            </Link>

            <span className="text-xs font-bold text-[#5E6E65] pl-2 border-l border-[#D5D2C7] hidden md:inline">
              Resident Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/rooms"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#123D2B] hover:bg-[#EAE7DC] transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              Explore Stays
            </Link>

            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#E8F1D5] text-[#123D2B] hover:bg-[#DBE8C3] transition-colors"
              title="Admin Portal"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>

            {user && (
              <div className="flex items-center gap-2.5 pl-3 border-l border-[#D5D2C7]">
                <div className="w-8 h-8 rounded-full bg-[#123D2B] text-[#E8F1D5] flex items-center justify-center font-extrabold text-xs">
                  {user.name?.charAt(0) || "U"}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-bold text-[#192621] block leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-[#7B8B82] block leading-tight">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-[#5E6E65] hover:text-red-600 rounded-lg transition-colors ml-1 cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        {/* Desktop Forest-Green Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <nav className="bg-[#123D2B] text-white rounded-3xl p-4 shadow-card-hover space-y-1.5 sticky top-24">
            <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-widest text-[#E8F1D5]/70">
              Resident Navigation
            </div>

            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    active
                      ? "bg-[#E8F1D5] text-[#123D2B] shadow-sm font-extrabold"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? "text-[#123D2B]" : "text-[#E8F1D5]"}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-[#123D2B]" />}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-white/10">
              <Link
                href="/rooms"
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Compass className="w-4 h-4 text-[#E8F1D5]" />
                Book New Stay
              </Link>
            </div>
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex">
            <div className="w-72 bg-[#123D2B] text-white h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#E8F1D5] text-[#123D2B] font-black flex items-center justify-center text-sm">
                      S
                    </div>
                    <span className="font-extrabold text-white text-base">Resident Portal</span>
                  </div>
                  <button onClick={() => setMobileNavOpen(false)} className="text-white/80 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {navItems.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                          active
                            ? "bg-[#E8F1D5] text-[#123D2B]"
                            : "text-white/80 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${active ? "text-[#123D2B]" : "text-[#E8F1D5]"}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/15 space-y-2">
                <Link
                  href="/rooms"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-xs font-bold bg-[#E8F1D5] text-[#123D2B]"
                >
                  <Compass className="w-4 h-4" />
                  Explore Stays
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileNavOpen(false)} />
          </div>
        )}

        {/* Warm-White Content Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
