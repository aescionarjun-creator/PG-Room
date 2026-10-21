import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, ShieldAlert, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#123D2B] text-[#E8F1D5] pt-16 pb-12 border-t border-[#1E543C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#1E543C]">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F1D5] flex items-center justify-center text-[#123D2B] font-black text-xl">
                S
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Stayzy
              </span>
            </div>
            <p className="text-[#C1D2C5] text-sm leading-relaxed max-w-sm">
              Your space. Your schedule. Discover thoughtfully furnished private rooms and shared co-living spaces for an hour, a day, or months at a time.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0C2B1E] border border-[#1E543C] text-xs text-[#E8F1D5]">
                <Sparkles className="w-3.5 h-3.5 text-[#E8F1D5]" />
                Transparent PG & Flexible Stays in Bengaluru
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-[#C1D2C5]">
              <li>
                <Link href="/explore?durationType=HOURLY" className="hover:text-white transition-colors">
                  Hourly Pods & Day Stays
                </Link>
              </li>
              <li>
                <Link href="/explore?durationType=DAILY" className="hover:text-white transition-colors">
                  Daily Stays & Weekends
                </Link>
              </li>
              <li>
                <Link href="/explore?durationType=MONTHLY" className="hover:text-white transition-colors">
                  Monthly Co-Living PG
                </Link>
              </li>
              <li>
                <Link href="/explore?category=PRIVATE" className="hover:text-white transition-colors">
                  Private Studio Rooms
                </Link>
              </li>
              <li>
                <Link href="/explore?category=TWIN_SHARING" className="hover:text-white transition-colors">
                  Twin Sharing Rooms
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Company */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">
              Policies & Help
            </h4>
            <ul className="space-y-2 text-sm text-[#C1D2C5]">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Stayzy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Property Manager Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Locations & Contact */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">
              Properties
            </h4>
            <div className="space-y-3 text-xs text-[#C1D2C5]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#E8F1D5] shrink-0 mt-0.5" />
                <span>
                  <strong>Stayzy Haven</strong>
                  <br />
                  80 Feet Rd, 4th Block, Koramangala, Bengaluru
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#E8F1D5] shrink-0 mt-0.5" />
                <span>
                  <strong>Stayzy Heights</strong>
                  <br />
                  17th Cross, Sector 2, HSR Layout, Bengaluru
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#E8F1D5] shrink-0 mt-0.5" />
                <span>
                  <strong>Stayzy Urban</strong>
                  <br />
                  12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-3.5 h-3.5 text-[#E8F1D5]" />
                <span>+91 80 4567 8900</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#E8F1D5]" />
                <span>support@stayzy.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer & Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8FA596]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E8F1D5]" />
            <span>
              Stayzy Hospitality Technologies • Verified Co-living & Flexible Stays Operator in Bengaluru.
            </span>
          </div>
          <p>© {new Date().getFullYear()} Stayzy Hospitality Technologies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
