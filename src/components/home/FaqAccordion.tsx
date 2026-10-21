"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

const DEFAULT_FAQS = [
  {
    q: "Can I book for a few hours?",
    a: "Yes! Stayzy offers dedicated Hourly stay packages from 2 to 10 hours between 8:00 AM and 10:00 PM. It is ideal for focused work sprints, remote interviews, or resting during flight layovers. You get a private desk, 300 Mbps Wi-Fi, air conditioning, and washroom access with zero deposit required.",
  },
  {
    q: "Is food included?",
    a: "For daily and weekly bookings, daily meals are included in the tariff. For monthly and yearly stays, our nutritious 3-meal plan (Breakfast, Lunch, and Dinner) can be selected during booking or added to your monthly invoice at actual cost. Special dietary preferences (vegetarian / non-vegetarian) can be noted.",
  },
  {
    q: "Is a deposit required?",
    a: "Hourly, daily, and weekly bookings require zero security deposit. For monthly and yearly stays, a 100% refundable security deposit is collected and securely held. It is refunded directly to your bank account within 3 to 5 business days after move-out inspection, subject only to actual unpaid electricity dues or room damages.",
  },
  {
    q: "Can I extend my stay?",
    a: "Yes, easily! You can extend your booking directly from your resident dashboard at any time. As long as your specific room or bed is available for the additional days, the system extends your booking instantly at your locked-in rate without any surcharge or penalty.",
  },
  {
    q: "How does cancellation work?",
    a: "Cancellations made 48 hours or more before your scheduled check-in receive a 100% full refund with zero cancellation fees. For cancellations within 48 hours of check-in, only the first night/day charge is retained. Hourly bookings can be cancelled free of charge up to 6 hours before start time.",
  },
  {
    q: "Can I visit before booking?",
    a: "Yes, we encourage it! You can schedule an in-person walkthrough anytime using the 'Schedule a Visit' form on this page. Pick your preferred property, date, and time slot, and our community manager will show you the rooms, dining spaces, and facilities.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);

  useEffect(() => {
    async function loadCMS() {
      try {
        const res = await fetch("/api/content");
        const data = await res.json();
        if (data.success && data.content?.faq_content?.items?.length > 0) {
          const cmsFaqs = data.content.faq_content.items.map((item: any) => ({
            q: item.question,
            a: item.answer,
          }));
          setFaqs(cmsFaqs);
        }
      } catch (e) {
        // Fallback to static
      }
    }
    loadCMS();
  }, []);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 bg-white border-t border-[#E8E6DF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#123D2B] bg-[#E8F1D5] px-3.5 py-1.5 rounded-full inline-block">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123D2B] mt-3">
            Clear answers to common questions
          </h2>
          <p className="text-sm sm:text-base text-[#5E6E65] mt-2">
            Everything you need to know about flexible PG living, schedules, deposits, and visits.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-[#E8E6DF] rounded-2xl overflow-hidden transition-colors bg-[#FAF8F5]"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-bold text-base text-[#192621] hover:text-[#123D2B] transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#123D2B]/40" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#123D2B] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-[#4A5550] leading-relaxed border-t border-[#F0EDE4] bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
