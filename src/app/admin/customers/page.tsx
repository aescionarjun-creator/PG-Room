"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Phone,
  Mail,
  CalendarCheck,
  CreditCard,
  LifeBuoy,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E6DF] gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#123D2B] uppercase tracking-wider">
            Resident Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D2B] mt-0.5">
            Customers & Resident Profiles
          </h1>
          <p className="text-xs text-[#5E6E65] mt-1">
            Registered customer accounts, contact information, lifetime stays, and support tickets.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="p-2.5 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] hover:bg-[#FAF8F5] self-start sm:self-auto"
          title="Refresh customers"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E6DF] flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#7B8B82] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-medium"
          />
        </div>

        <span className="text-xs font-bold text-[#123D2B]">
          {filtered.length} Customer Accounts Registered
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-[#5E6E65] bg-white rounded-3xl border border-[#E8E6DF]">
          Loading customer records...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-[#E8E6DF]">
          <Users className="w-12 h-12 text-[#7B8B82] mx-auto" />
          <h3 className="text-base font-bold text-[#123D2B]">No customers found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-card flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#E8F1D5] text-[#123D2B] font-black text-base flex items-center justify-center">
                      {c.name ? c.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#123D2B]">{c.name}</h3>
                      <span className="text-[11px] text-[#5E6E65]">
                        Member since {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {c.activeStays > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Active Resident
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
                      Customer
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-[#5E6E65]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#123D2B]" />
                    <span>{c.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#123D2B]" />
                    <span>{c.phone}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] text-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#7B8B82] block">Bookings</span>
                    <span className="font-bold text-[#123D2B]">{c.totalBookings}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#7B8B82] block">Total Spent</span>
                    <span className="font-bold text-[#123D2B]">₹{c.totalSpend.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#7B8B82] block">Tickets</span>
                    <span className="font-bold text-[#123D2B]">{c.ticketsCount}</span>
                  </div>
                </div>

                {c.recentBooking && (
                  <div className="mt-3 p-3 rounded-xl bg-white border border-[#E8E6DF] text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#7B8B82] block mb-1">
                      Most Recent Stay
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#123D2B]">
                        {c.recentBooking.roomType?.name}
                      </span>
                      <Link
                        href={`/admin/bookings/${c.recentBooking.id}`}
                        className="text-xs font-bold text-[#123D2B] underline hover:text-[#0E2F21]"
                      >
                        View Folio →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#F0EDE4] flex items-center justify-between text-xs">
                <span className="text-[#7B8B82] text-[10px] font-mono">UID: {c.id.slice(-8)}</span>
                <a
                  href={`mailto:${c.email}`}
                  className="px-3 py-1.5 rounded-lg border border-[#D5D2C7] bg-white font-bold text-[#123D2B] hover:bg-[#FAF8F5]"
                >
                  Contact Resident
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
