"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Download,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Search,
  Filter,
  RefreshCw,
  X,
  FileSpreadsheet,
  ShieldCheck,
  Building2,
} from "lucide-react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [pendingRent, setPendingRent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"payments" | "schedules" | "refunds">("payments");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Record Offline Payment Modal
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [recordForm, setRecordForm] = useState({
    bookingId: "",
    amount: 15000,
    provider: "MANUAL_OFFLINE",
    transactionRef: `OFFLINE_${Date.now().toString().slice(-6)}`,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const [payRes, bookRes] = await Promise.all([
        fetch(`/api/admin/payments?status=${statusFilter}`),
        fetch("/api/admin/bookings"),
      ]);

      const payData = await payRes.json();
      const bookData = await bookRes.json();

      if (payData.success) {
        setPayments(payData.payments || []);
        setSchedules(payData.schedules || []);
        setRefunds(payData.refunds || []);
        setTotalCollected(payData.totalCollected || 0);
        setPendingRent(payData.pendingRent || 0);
      } else {
        setError(payData.error);
      }

      if (bookData.success && bookData.bookings?.length > 0) {
        setBookingsList(bookData.bookings);
        if (!recordForm.bookingId) {
          setRecordForm((prev) => ({ ...prev, bookingId: bookData.bookings[0].id }));
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recordForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to record payment");
      }
      alert(data.message);
      setRecordModalOpen(false);
      fetchPayments();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeTab === "payments") {
      csvContent += "Transaction Ref,Booking Ref,Guest Name,Amount,Status,Provider,Paid At\n";
      payments.forEach((p) => {
        csvContent += `"${p.transactionRef}","${p.booking?.bookingReference || ""}","${p.booking?.guestName || ""}","${p.amount}","${p.status}","${p.provider}","${new Date(p.createdAt).toISOString()}"\n`;
      });
    } else if (activeTab === "schedules") {
      csvContent += "Schedule ID,Booking Ref,Description,Due Date,Amount,Status\n";
      schedules.forEach((s) => {
        csvContent += `"${s.id}","${s.booking?.bookingReference || ""}","${s.description}","${new Date(s.dueDate).toLocaleDateString()}","${s.amount}","${s.status}"\n`;
      });
    } else {
      csvContent += "Refund ID,Booking Ref,Amount,Reason,Status,Requested At\n";
      refunds.forEach((r) => {
        csvContent += `"${r.id}","${r.booking?.bookingReference || ""}","${r.amount}","${r.reason}","${r.status}","${new Date(r.requestedAt).toLocaleDateString()}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stayzy_${activeTab}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPayments = payments.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.transactionRef?.toLowerCase().includes(q) ||
      p.booking?.bookingReference?.toLowerCase().includes(q) ||
      p.booking?.guestName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E6DF] gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#123D2B] uppercase tracking-wider">
            Financial Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D2B] mt-0.5">
            Payments & Rent Schedules
          </h1>
          <p className="text-xs text-[#5E6E65] mt-1">
            Track received revenue, scheduled installments, manual cash entries, and process refunds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRecordModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] transition-colors cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Record Offline Payment
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] text-xs font-bold hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={fetchPayments}
            className="p-2.5 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] hover:bg-[#FAF8F5]"
            title="Refresh payments"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#E8E6DF] shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-[#7B8B82] block">
            Collected Revenue
          </span>
          <span className="text-2xl font-black text-[#123D2B]">
            ₹{totalCollected.toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] text-emerald-600 block mt-0.5">Realized funds</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E8E6DF] shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-[#7B8B82] block">
            Pending Rent Installments
          </span>
          <span className="text-2xl font-black text-amber-700">
            ₹{pendingRent.toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] text-amber-600 block mt-0.5">Scheduled upcoming</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E8E6DF] shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-[#7B8B82] block">
            Total Transactions
          </span>
          <span className="text-2xl font-black text-[#123D2B]">{payments.length}</span>
          <span className="text-[11px] text-[#5E6E65] block mt-0.5">Gateway & counter</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E8E6DF] shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-[#7B8B82] block">
            Refunds Tracked
          </span>
          <span className="text-2xl font-black text-red-700">{refunds.length}</span>
          <span className="text-[11px] text-red-600 block mt-0.5">Processed claims</span>
        </div>
      </div>

      {/* Tab Navigation & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E6DF] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "payments"
                ? "bg-[#123D2B] text-[#E8F1D5]"
                : "text-[#5E6E65] hover:bg-[#FAF8F5]"
            }`}
          >
            Payments Received ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab("schedules")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "schedules"
                ? "bg-[#123D2B] text-[#E8F1D5]"
                : "text-[#5E6E65] hover:bg-[#FAF8F5]"
            }`}
          >
            Rent Schedules ({schedules.length})
          </button>
          <button
            onClick={() => setActiveTab("refunds")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "refunds"
                ? "bg-[#123D2B] text-[#E8F1D5]"
                : "text-[#5E6E65] hover:bg-[#FAF8F5]"
            }`}
          >
            Refunds ({refunds.length})
          </button>
        </div>

        {activeTab === "payments" && (
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-[#7B8B82] absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, guest..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-medium"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content by Active Tab */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#5E6E65] bg-white rounded-3xl border border-[#E8E6DF]">
          Loading financial ledger...
        </div>
      ) : activeTab === "payments" ? (
        filteredPayments.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-[#E8E6DF]">
            <CreditCard className="w-12 h-12 text-[#7B8B82] mx-auto" />
            <h3 className="text-base font-bold text-[#123D2B]">No payment records found</h3>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E8E6DF] overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#E8E6DF] text-[#7B8B82] uppercase text-[10px] font-extrabold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Transaction Ref</th>
                    <th className="py-3.5 px-4">Booking & Guest</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Gateway / Source</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Paid Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDE4]">
                  {filteredPayments.map((p) => {
                    const isOffline = p.provider === "MANUAL_OFFLINE" || p.provider.startsWith("OFFLINE");

                    return (
                      <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-[#123D2B]">
                          {p.transactionRef}
                          {p.isDemo && (
                            <span className="block text-[9px] font-sans font-bold text-amber-700">
                              Demo Signature Verified
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <Link
                            href={`/admin/bookings/${p.bookingId}`}
                            className="font-bold text-[#123D2B] hover:underline block"
                          >
                            {p.booking?.bookingReference}
                          </Link>
                          <span className="text-[#5E6E65] block">{p.booking?.guestName}</span>
                        </td>

                        <td className="py-4 px-4 font-black text-sm text-[#123D2B]">
                          ₹{p.amount.toLocaleString("en-IN")}
                        </td>

                        <td className="py-4 px-4">
                          {isOffline ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                              Manual Offline Cash/UPI
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 w-fit">
                              <ShieldCheck className="w-3 h-3" />
                              Gateway Verified
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {p.status}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-[#5E6E65]">
                          {new Date(p.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : activeTab === "schedules" ? (
        schedules.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#5E6E65] bg-white rounded-3xl border border-[#E8E6DF]">
            No future rent schedules currently due.
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E8E6DF] overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#E8E6DF] text-[#7B8B82] uppercase text-[10px] font-extrabold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Booking Ref</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Installment Due</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDE4]">
                  {schedules.map((s) => (
                    <tr key={s.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-4 px-4 font-bold text-[#123D2B]">
                        <Link href={`/admin/bookings/${s.bookingId}`} className="hover:underline">
                          {s.booking?.bookingReference}
                        </Link>
                        <span className="block text-[10px] text-[#5E6E65] font-normal">
                          {s.booking?.guestName}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-[#123D2B]">
                        {new Date(s.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-[#5E6E65]">{s.description}</td>
                      <td className="py-4 px-4 font-black text-[#123D2B]">
                        ₹{s.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            s.status === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : refunds.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#5E6E65] bg-white rounded-3xl border border-[#E8E6DF]">
          No refunds processed yet.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E8E6DF] overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E8E6DF] text-[#7B8B82] uppercase text-[10px] font-extrabold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Refund ID</th>
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Refund Amount</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE4]">
                {refunds.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-4 px-4 font-mono font-bold text-[#123D2B]">{r.id.slice(-8)}</td>
                    <td className="py-4 px-4 font-bold text-[#123D2B]">
                      {r.booking?.bookingReference}
                    </td>
                    <td className="py-4 px-4 font-black text-red-700">
                      ₹{r.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-4 text-[#5E6E65]">{r.reason}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#5E6E65]">
                      {new Date(r.requestedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Offline Payment Modal */}
      {recordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E8E6DF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF]">
              <h2 className="text-base font-bold text-[#123D2B]">Record Offline Counter Payment</h2>
              <button onClick={() => setRecordModalOpen(false)}>
                <X className="w-5 h-5 text-[#5E6E65]" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Select Booking</label>
                <select
                  value={recordForm.bookingId}
                  onChange={(e) => setRecordForm({ ...recordForm, bookingId: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                >
                  {bookingsList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bookingReference} - {b.guestName} (₹{b.totalAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Amount Paid (₹)</label>
                <input
                  type="number"
                  required
                  value={recordForm.amount}
                  onChange={(e) => setRecordForm({ ...recordForm, amount: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Payment Method</label>
                <select
                  value={recordForm.provider}
                  onChange={(e) => setRecordForm({ ...recordForm, provider: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                >
                  <option value="MANUAL_OFFLINE">Cash on Arrival</option>
                  <option value="UPI_COUNTER">Direct UPI (PhonePe / GPay QR)</option>
                  <option value="BANK_NEFT">Bank Transfer (NEFT / RTGS)</option>
                  <option value="POS_CARD">POS Counter Terminal</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Transaction / Receipt Reference</label>
                <input
                  type="text"
                  required
                  value={recordForm.transactionRef}
                  onChange={(e) => setRecordForm({ ...recordForm, transactionRef: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Staff Notes</label>
                <input
                  type="text"
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  placeholder="e.g. Received by receptionist Priya"
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E8E6DF]">
                <button
                  type="button"
                  onClick={() => setRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5D2C7] font-bold text-[#4A5550]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#123D2B] text-white font-bold hover:bg-[#0E2F21] disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
