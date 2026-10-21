"use client";

import React, { useState, useEffect } from "react";
import {
  FileEdit,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Layers,
  HelpCircle,
  Shield,
  Phone,
} from "lucide-react";

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<"hero" | "faq" | "rules" | "contact">("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Hero form state
  const [heroForm, setHeroForm] = useState({
    headline: "Your space. Your schedule.",
    tagline: "Next-Gen Flexible Coliving & Day-Stays",
    description:
      "Find a comfortable stay for an hour, a day, or a little longer. Fully furnished private suites and premium sharing PG beds with high-speed Wi-Fi, chef-curated meals, and transparent pricing.",
    primaryCtaText: "Find a Stay",
    secondaryCtaText: "Explore Rooms",
  });

  // FAQs form state
  const [faqForm, setFaqForm] = useState({
    items: [
      {
        question: "Can I book a room for just 3 or 4 hours?",
        answer: "Yes! Stayzy offers hourly day-stays between 08:00 AM and 10:00 PM with instant booking, high-speed Wi-Fi, and private work desks.",
      },
      {
        question: "How does security deposit work?",
        answer: "Security deposits are 100% refundable. Hourly and daily bookings have minimal token deposits, while monthly stays have standard deposits refunded within 48 hours of checkout.",
      },
      {
        question: "Are meals included in the pricing?",
        answer: "Chef-prepared home-style meals (Breakfast, Lunch, Dinner) are included with our Executive Twin Sharing rooms and can be added as an optional monthly add-on for private suites.",
      },
      {
        question: "Can I request an extension or cancellation?",
        answer: "Yes, you can request stay extensions or cancellations directly from your resident dashboard at any time subject to room availability.",
      },
    ],
  });

  // Rules form state
  const [rulesForm, setRulesForm] = useState({
    quietHours: "10:00 PM to 07:00 AM",
    visitorPolicy: "Guests allowed in shared lounge areas until 08:00 PM. No overnight outside guests without prior manager clearance.",
    smokingAlcohol: "Zero smoking in rooms. Dedicated open-air terrace designated for smoking. Respectful alcohol consumption permitted in private suites.",
  });

  // Contact form state
  const [contactForm, setContactForm] = useState({
    companyName: "Stayzy Living Technologies",
    supportEmail: "hello@stayzy.in",
    supportPhone: "+91 80 4567 8900",
    emergencyPhone: "+91 98765 43210",
    address: "42, 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034",
  });

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      if (data.success && data.contents) {
        if (data.contents.hero_content) {
          setHeroForm((prev) => ({ ...prev, ...data.contents.hero_content }));
        }
        if (data.contents.faq_content) {
          setFaqForm((prev) => ({ ...prev, ...data.contents.faq_content }));
        }
        if (data.contents.rules_content) {
          setRulesForm((prev) => ({ ...prev, ...data.contents.rules_content }));
        }
        if (data.contents.contact_content) {
          setContactForm((prev) => ({ ...prev, ...data.contents.contact_content }));
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async (key: string, value: any) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update CMS content");
      }

      setSuccessMsg(`Published updates for ${key}. Changes are now live!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E6DF] gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#123D2B] uppercase tracking-wider">
            Public Website CMS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D2B] mt-0.5">
            Website Content Management
          </h1>
          <p className="text-xs text-[#5E6E65] mt-1">
            Edit live hero headlines, FAQs, house rules, and contact information rendered on public pages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D5D2C7] bg-white text-xs font-bold text-[#123D2B] hover:bg-[#FAF8F5]"
          >
            <span>Preview Public Home</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={fetchContent}
            className="p-2 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] hover:bg-[#FAF8F5]"
            title="Reload content"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-[#E8E6DF] flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab("hero")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "hero"
              ? "bg-[#123D2B] text-[#E8F1D5]"
              : "text-[#5E6E65] hover:bg-[#FAF8F5]"
          }`}
        >
          Hero & Homepage Headline
        </button>
        <button
          onClick={() => setActiveTab("faq")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "faq"
              ? "bg-[#123D2B] text-[#E8F1D5]"
              : "text-[#5E6E65] hover:bg-[#FAF8F5]"
          }`}
        >
          Frequently Asked Questions (FAQ)
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "rules"
              ? "bg-[#123D2B] text-[#E8F1D5]"
              : "text-[#5E6E65] hover:bg-[#FAF8F5]"
          }`}
        >
          House Rules & Guidelines
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "contact"
              ? "bg-[#123D2B] text-[#E8F1D5]"
              : "text-[#5E6E65] hover:bg-[#FAF8F5]"
          }`}
        >
          Contact & Legal Info
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#5E6E65] bg-white rounded-3xl border border-[#E8E6DF]">
          Loading dynamic site content...
        </div>
      ) : activeTab === "hero" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Edit Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-card space-y-4">
            <h2 className="text-base font-extrabold text-[#123D2B] flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-[#123D2B]" />
              Hero Section Text & CTAs
            </h2>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Tagline Badge</label>
                <input
                  type="text"
                  value={heroForm.tagline}
                  onChange={(e) => setHeroForm({ ...heroForm, tagline: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Primary Headline</label>
                <input
                  type="text"
                  value={heroForm.headline}
                  onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-extrabold text-sm text-[#123D2B]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Subheadline Description</label>
                <textarea
                  rows={4}
                  value={heroForm.description}
                  onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] leading-relaxed font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Primary CTA Label</label>
                  <input
                    type="text"
                    value={heroForm.primaryCtaText}
                    onChange={(e) => setHeroForm({ ...heroForm, primaryCtaText: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#4A5550]">Secondary CTA Label</label>
                  <input
                    type="text"
                    value={heroForm.secondaryCtaText}
                    onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaText: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EDE4] flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSave("hero_content", heroForm)}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#123D2B] text-white font-bold hover:bg-[#0E2F21] disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Publishing..." : "Save & Publish Hero"}
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="lg:col-span-5 bg-[#FAF8F5] rounded-3xl border border-[#E8E6DF] p-6 space-y-4">
            <span className="text-[10px] font-extrabold uppercase text-[#7B8B82] block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#123D2B]" />
              Live Homepage Preview
            </span>

            <div className="p-6 bg-white rounded-2xl border border-[#E8E6DF] shadow-sm space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8F1D5] text-[#123D2B] text-[10px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>{heroForm.tagline}</span>
              </div>

              <h2 className="text-2xl font-black text-[#123D2B] leading-tight">
                {heroForm.headline}
              </h2>

              <p className="text-xs text-[#5E6E65] leading-relaxed">
                {heroForm.description}
              </p>

              <div className="flex gap-2 pt-2">
                <div className="px-3.5 py-2 rounded-lg bg-[#123D2B] text-white text-[11px] font-bold">
                  {heroForm.primaryCtaText}
                </div>
                <div className="px-3.5 py-2 rounded-lg border border-[#D5D2C7] bg-white text-[#123D2B] text-[11px] font-bold">
                  {heroForm.secondaryCtaText}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "faq" ? (
        <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE4]">
            <h2 className="text-base font-extrabold text-[#123D2B]">
              Frequently Asked Questions (Public Website Accordion)
            </h2>
            <button
              onClick={() => {
                setFaqForm({
                  items: [
                    ...faqForm.items,
                    { question: "New Question Title", answer: "Enter detailed answer here..." },
                  ],
                });
              }}
              className="px-3 py-1.5 rounded-xl border border-[#D5D2C7] text-xs font-bold text-[#123D2B] hover:bg-[#FAF8F5]"
            >
              + Add FAQ Item
            </button>
          </div>

          <div className="space-y-4">
            {faqForm.items.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => {
                      const updated = [...faqForm.items];
                      updated[idx].question = e.target.value;
                      setFaqForm({ items: updated });
                    }}
                    placeholder="Question..."
                    className="w-full h-9 px-3 rounded-xl border border-[#D5D2C7] bg-white font-bold text-[#123D2B]"
                  />
                  <button
                    onClick={() => {
                      const updated = faqForm.items.filter((_, i) => i !== idx);
                      setFaqForm({ items: updated });
                    }}
                    className="text-red-600 hover:text-red-800 text-xs font-bold px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={item.answer}
                  onChange={(e) => {
                    const updated = [...faqForm.items];
                    updated[idx].answer = e.target.value;
                    setFaqForm({ items: updated });
                  }}
                  placeholder="Answer..."
                  className="w-full p-2.5 rounded-xl border border-[#D5D2C7] bg-white text-[#5E6E65]"
                />
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#F0EDE4] flex justify-end">
            <button
              type="button"
              onClick={() => handleSave("faq_content", faqForm)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#123D2B] text-white font-bold hover:bg-[#0E2F21] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Publishing..." : "Save & Publish FAQs"}
            </button>
          </div>
        </div>
      ) : activeTab === "rules" ? (
        <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-card space-y-4">
          <h2 className="text-base font-extrabold text-[#123D2B]">
            Community House Rules & Resident Code of Conduct
          </h2>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#4A5550]">Quiet Hours Window</label>
              <input
                type="text"
                value={rulesForm.quietHours}
                onChange={(e) => setRulesForm({ ...rulesForm, quietHours: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#4A5550]">Non-Resident Visitor Policy</label>
              <textarea
                rows={2}
                value={rulesForm.visitorPolicy}
                onChange={(e) => setRulesForm({ ...rulesForm, visitorPolicy: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#4A5550]">Smoking & Alcohol Guidelines</label>
              <textarea
                rows={2}
                value={rulesForm.smokingAlcohol}
                onChange={(e) => setRulesForm({ ...rulesForm, smokingAlcohol: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
              />
            </div>

            <div className="pt-3 border-t border-[#F0EDE4] flex justify-end">
              <button
                type="button"
                onClick={() => handleSave("rules_content", rulesForm)}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#123D2B] text-white font-bold hover:bg-[#0E2F21] disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Publishing..." : "Save & Publish Rules"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-card space-y-4">
          <h2 className="text-base font-extrabold text-[#123D2B]">
            Public Contact Details & Corporate Identification
          </h2>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#4A5550]">Company / Entity Legal Name</label>
              <input
                type="text"
                value={contactForm.companyName}
                onChange={(e) => setContactForm({ ...contactForm, companyName: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Customer Inquiries Email</label>
                <input
                  type="email"
                  value={contactForm.supportEmail}
                  onChange={(e) => setContactForm({ ...contactForm, supportEmail: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">General Inquiries Phone</label>
                <input
                  type="text"
                  value={contactForm.supportPhone}
                  onChange={(e) => setContactForm({ ...contactForm, supportPhone: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#4A5550]">24/7 Security & Resident Emergency Helpline</label>
              <input
                type="text"
                value={contactForm.emergencyPhone}
                onChange={(e) => setContactForm({ ...contactForm, emergencyPhone: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#4A5550]">Registered Central Office Address</label>
              <textarea
                rows={2}
                value={contactForm.address}
                onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
              />
            </div>

            <div className="pt-3 border-t border-[#F0EDE4] flex justify-end">
              <button
                type="button"
                onClick={() => handleSave("contact_content", contactForm)}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#123D2B] text-white font-bold hover:bg-[#0E2F21] disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Publishing..." : "Save Contact Info"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
