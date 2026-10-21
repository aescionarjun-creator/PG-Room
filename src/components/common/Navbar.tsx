"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  CalendarCheck,
  CalendarDays,
  Shield,
  Menu,
  X,
  PhoneCall,
  User,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Explore Stays", href: "/rooms", icon: Compass },
    { label: "How It Works", href: "/#how-it-works", icon: CalendarDays },
    { label: "Amenities", href: "/#amenities", icon: Sparkles },
    { label: "Schedule Visit", href: "/#schedule-visit", icon: CalendarDays },
    { label: "Contact", href: "/contact", icon: PhoneCall },
  ];

  // If on home page and not scrolled, display transparent header over the hero
  const isTransparent = isHome && !scrolled && !mobileMenuOpen;

  return (
    <header
      className={`z-40 transition-all duration-300 ${
        isHome
          ? `fixed top-0 left-0 right-0 ${
              isTransparent
                ? "bg-transparent border-b border-white/10 text-white"
                : "bg-[#F8F7F2]/95 backdrop-blur-md border-b border-[#E8E6DF] text-[#192621] shadow-sm"
            }`
          : "sticky top-0 bg-[#F8F7F2]/95 backdrop-blur-md border-b border-[#E8E6DF] text-[#192621] shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-sm transition-transform group-hover:scale-105 ${
                isTransparent
                  ? "bg-[#E8F1D5] text-[#123D2B]"
                  : "bg-[#123D2B] text-[#E8F1D5]"
              }`}
            >
              S
            </div>
            <div className="flex flex-col">
              <span
                className={`text-2xl font-extrabold tracking-tight transition-colors ${
                  isTransparent ? "text-white drop-shadow-sm" : "text-[#123D2B]"
                }`}
              >
                Stayzy
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-widest -mt-1 transition-colors ${
                  isTransparent ? "text-[#E8F1D5]" : "text-[#5E6E65]"
                }`}
              >
                Flexible Living
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors ${
                    isTransparent
                      ? "text-white/90 hover:text-white"
                      : active
                      ? "text-[#123D2B] font-bold"
                      : "text-[#4A5550] hover:text-[#123D2B]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/dashboard"
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isTransparent
                  ? "text-white hover:bg-white/10"
                  : "text-[#123D2B] hover:bg-[#EAE7DC]"
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              Resident Portal
            </Link>

            <Link
              href="/admin"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isTransparent
                  ? "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20"
                  : "bg-[#E8F1D5] text-[#123D2B] hover:bg-[#DBE8C3]"
              }`}
              title="Protected Admin Portal"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>

            <Link
              href="/rooms"
              className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all hover:shadow cursor-pointer ${
                isTransparent
                  ? "bg-[#E8F1D5] text-[#123D2B] hover:bg-white"
                  : "bg-[#123D2B] text-white hover:bg-[#0E2F21]"
              }`}
            >
              Find a Stay
            </Link>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/dashboard"
              className={`p-2 rounded-lg ${isTransparent ? "text-white" : "text-[#123D2B]"}`}
              title="Resident Portal"
            >
              <CalendarCheck className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isTransparent ? "text-white hover:bg-white/10" : "text-[#192621] hover:bg-[#EAE7DC]"
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-[#E8E6DF] bg-[#F8F7F2] text-[#192621] px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-[#192621] hover:bg-[#EAE7DC]"
              >
                <link.icon className="w-5 h-5 text-[#123D2B]" />
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-[#123D2B]"
            >
              <User className="w-5 h-5 text-[#123D2B]" />
              Resident Customer Portal
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-[#123D2B] bg-[#E8F1D5]"
            >
              <Shield className="w-5 h-5 text-[#123D2B]" />
              Admin Portal
            </Link>
            <Link
              href="/rooms"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full mt-2 py-3 rounded-xl text-base font-bold bg-[#123D2B] text-white"
            >
              Explore Stays
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
