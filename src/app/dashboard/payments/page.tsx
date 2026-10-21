"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function DashboardPaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await fetch("/api/payments/my");
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-[#5E6E65]">Loading payments...</div>;
  }

  const payments = data?.payments || [];
  const schedules = data?.schedules || [];
  const refunds = data?.refunds || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#123D2B]">Rent & Payments</h1>
        <p className="text-xs text-[#5E6E65] mt-0.5">
          Review payment transactions, download receipts, and track upcoming installment milestones.
        </p>
      </div>

      {/* Payment History List */}
      <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 sm:p-8 shadow-soft space-y-6">
        <h2 className="text-base font-bold text-[#123D2B]">Transaction History</h2>

        {payments.length === 0 ? (
          <p className="text-xs text-[#5E6E65] py-4">No completed payments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#5E6E65] border-b border-[#E8E6DF]">
                <tr>
                  <th className="p-3.5">Ref / Transaction</th>
                  <th className="p-3.5">Stay</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE4]">
                {payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]">
                    <td className="p-3.5 font-mono font-bold text-[#123D2B]">
                      {p.transactionRef}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-[#192621]">
                        {p.booking.roomType.name}
                      </div>
                      <div className="text-[11px] text-[#7B8B82]">
                        Ref: {p.booking.bookingReference}
                      </div>
                    </td>
                    <td className="p-3.5 font-black text-[#192621]">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-mono">
                        {p.provider}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === "SUCCESS"
                            ? "bg-[#E8F1D5] text-[#123D2B]"
                            : p.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#5E6E65]">
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleDateString("en-IN")
                        : new Date(p.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-3.5">
                      <Link
                        href={`/dashboard/bookings/${p.bookingId}`}
                        className="p-1.5 inline-flex items-center gap-1 text-[#123D2B] font-bold hover:underline"
                        title="View printable tax receipt"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Invoice
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rent Payment Schedules (for Long stays / yearly) */}
      {schedules.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 sm:p-8 shadow-soft space-y-4">
          <h2 className="text-base font-bold text-[#123D2B]">
            Scheduled Future Installments
          </h2>
          <p className="text-xs text-[#5E6E65]">
            Upcoming monthly rent milestones scheduled under your annual or flexible agreement.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {schedules.map((s: any) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl border border-[#E8E6DF] bg-[#FAF8F5] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[#192621] block">{s.description}</span>
                  <span className="text-[#5E6E65] text-[11px]">
                    Due Date: {new Date(s.dueDate).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-black text-[#123D2B] text-sm block">
                    ₹{s.amount.toLocaleString("en-IN")}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.status === "PAID"
                        ? "bg-[#E8F1D5] text-[#123D2B]"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refunds History */}
      {refunds.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 sm:p-8 shadow-soft space-y-4">
          <h2 className="text-base font-bold text-[#123D2B]">Refund Requests & Returns</h2>
          <div className="divide-y divide-[#F0EDE4] text-xs">
            {refunds.map((r: any) => (
              <div key={r.id} className="py-3 flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#192621] block">₹{r.amount.toLocaleString("en-IN")}</span>
                  <span className="text-[#5E6E65] text-[11px]">{r.reason}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E8F1D5] text-[#123D2B]">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
