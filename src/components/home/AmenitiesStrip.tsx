import React from "react";
import {
  Wifi,
  Utensils,
  Laptop,
  ShowerHead,
  KeyRound,
  Zap,
  Sparkles,
  Shirt,
} from "lucide-react";

const AMENITIES = [
  {
    title: "300 Mbps Wi-Fi",
    desc: "Uncapped fiber with dual-band routers on every floor",
    icon: Wifi,
  },
  {
    title: "Fresh Home Meals",
    desc: "Nutritious 3-time daily breakfast, lunch & dinner",
    icon: Utensils,
  },
  {
    title: "Ergonomic Work Desk",
    desc: "Solid wood desk, orthopaedic chair & power hub",
    icon: Laptop,
  },
  {
    title: "Attached Bath & Geyser",
    desc: "Private clean bathroom with 24/7 hot water",
    icon: ShowerHead,
  },
  {
    title: "Keyless Biometric Entry",
    desc: "Seamless 24/7 digital lock access for residents",
    icon: KeyRound,
  },
  {
    title: "100% Power Backup",
    desc: "Heavy-duty diesel generator for uninterrupted power",
    icon: Zap,
  },
  {
    title: "Daily Housekeeping",
    desc: "Regular room cleaning, dusting & trash removal",
    icon: Sparkles,
  },
  {
    title: "Laundry & Ironing Station",
    desc: "Front-load automatic washing machines & iron racks",
    icon: Shirt,
  },
];

export function AmenitiesStrip() {
  return (
    <section id="amenities" className="py-16 bg-[#F3EFE6] border-y border-[#E8E6DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#123D2B]">
            All-Inclusive Living
          </span>
          <h2 className="text-3xl font-extrabold text-[#123D2B] mt-2">
            Everything you need. Nothing you don’t.
          </h2>
          <p className="text-sm text-[#5E6E65] mt-2">
            Every room and bed in Stayzy comes fully equipped for comfort, focus, and effortless daily living.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {AMENITIES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-[#E8E6DF] shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8F1D5] flex items-center justify-center text-[#123D2B] mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#192621] mb-1">{item.title}</h3>
                <p className="text-xs text-[#5E6E65] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
