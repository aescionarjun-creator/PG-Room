"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DemoBanner } from "@/components/common/DemoBanner";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Layers,
  Tag,
  CalendarCheck,
  CalendarDays,
  Users,
  CreditCard,
  DoorOpen,
  LifeBuoy,
  FileEdit,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Shield,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // If on login page, render children directly without the admin chrome
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) {
          if (data.user.role === "ADMIN") {
            setUser(data.user);
          } else {
            // Logged in as customer, not admin
            setUser(data.user);
          }
        } else {
          // Not logged in at all -> redirect to admin login
          router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const handleSwitchToAdmin = async () => {
    await fetch("/api/auth/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "ADMIN" }),
    });
    window.location.reload();
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center text-xs font-semibold text-[#5E6E65]">
        Authenticating Stayzy Property Manager session...
      </div>
    );
  }

  if (user && user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#F8F7F2] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-[#E8E6DF] max-w-md w-full shadow-card space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#123D2B] text-[#E8F1D5] flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#123D2B]">Admin Access Required</h2>
          <p className="text-xs text-[#5E6E65] leading-relaxed">
            You are logged in as <strong>{user.email}</strong> with customer privileges. Stayzy operations portal requires administrator access.
          </p>
          <div className="pt-2 space-y-3">
            <button
              onClick={handleSwitchToAdmin}
              className="w-full py-3 rounded-xl bg-[#123D2B] text-[#E8F1D5] text-xs font-bold hover:bg-[#0E2F21] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Switch to Stayzy Admin Role
            </button>
            <Link
              href="/dashboard"
              className="block w-full py-2.5 rounded-xl border border-[#D5D2C7] text-xs font-bold text-[#123D2B] hover:bg-[#FAF8F5]"
            >
              Back to Resident Customer Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Properties", href: "/admin/properties", icon: Building2 },
    { label: "Rooms & Suites", href: "/admin/rooms", icon: BedDouble },
    { label: "Beds & Inventory", href: "/admin/beds", icon: Layers },
    { label: "Rates & Pricing", href: "/admin/rates", icon: Tag },
    { label: "Bookings & Stays", href: "/admin/bookings", icon: CalendarCheck },
    { label: "Occupancy Calendar", href: "/admin/calendar", icon: CalendarDays },
    { label: "Residents / Customers", href: "/admin/customers", icon: Users },
    { label: "Payments & Rent", href: "/admin/payments", icon: CreditCard },
    { label: "Property Visits", href: "/admin/visits", icon: DoorOpen },
    { label: "Support & Helpdesk", href: "/admin/support", icon: LifeBuoy },
    { label: "Website Content CMS", href: "/admin/content", icon: FileEdit },
    { label: "Operations Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
      <DemoBanner />

      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#123D2B] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10"
              aria-label="Toggle admin menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E8F1D5] text-[#123D2B] font-black text-lg flex items-center justify-center shadow-inner">
                S
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  Stayzy
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F1D5] text-[#123D2B] tracking-wide uppercase">
                    Admin
                  </span>
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </Link>

            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/20 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#E8F1D5] animate-pulse" />
              <span className="text-[#E8F1D5] font-semibold">{user?.email || "admin@stayzy.com"}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Sign out of Admin Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl border border-[#E8E6DF] p-3 shadow-card">
              <div className="px-3 py-2.5 mb-1 border-b border-[#F0EDE4]">
                <span className="text-[10px] font-extrabold text-[#7B8B82] uppercase tracking-wider">
                  Operations Console
                </span>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[#123D2B] text-[#E8F1D5] shadow-sm"
                          : "text-[#4A5550] hover:text-[#123D2B] hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? "text-[#E8F1D5]" : "text-[#7B8B82]"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#E8F1D5]" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick Public Site Link */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-2">
              <span className="text-[11px] font-bold text-[#123D2B] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#123D2B]" />
                Customer Experience
              </span>
              <p className="text-[11px] text-[#5E6E65] leading-relaxed">
                Check how your inventory, rates, and content changes appear to public visitors.
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#123D2B] hover:underline"
              >
                Browse Room Catalog <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </aside>

          {/* Mobile Navigation Drawer */}
          {mobileNavOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex">
              <div className="w-4/5 max-w-sm bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#E8E6DF]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#123D2B] text-[#E8F1D5] font-black flex items-center justify-center">
                        S
                      </div>
                      <span className="font-extrabold text-[#123D2B]">Stayzy Operations</span>
                    </div>
                    <button
                      onClick={() => setMobileNavOpen(false)}
                      className="p-1.5 rounded-lg text-[#5E6E65] hover:bg-[#FAF8F5]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === "/admin"
                          ? pathname === "/admin"
                          : pathname.startsWith(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileNavOpen(false)}
                          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                            isActive
                              ? "bg-[#123D2B] text-[#E8F1D5]"
                              : "text-[#4A5550] hover:bg-[#FAF8F5]"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-4 border-t border-[#E8E6DF] space-y-2">
                  <div className="text-xs font-semibold text-[#5E6E65]">
                    Logged in as {user?.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
              <div className="flex-1" onClick={() => setMobileNavOpen(false)} />
            </div>
          )}

          {/* Admin Page Content */}
          <main className="lg:col-span-9 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
