"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  MessageSquare,
  Send,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  RefreshCw,
  X,
  Sparkles,
  Bed,
} from "lucide-react";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Reply Modal
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [ticketStatus, setTicketStatus] = useState("RESOLVED");
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/support");
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets || []);
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
    fetchTickets();
  }, []);

  const openReplyModal = (ticket: any) => {
    setSelectedTicket(ticket);
    setReplyMessage(ticket.adminReply || "");
    setTicketStatus(ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status);
    setReplyModalOpen(true);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          reply: replyMessage,
          status: ticketStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send reply");
      }
      alert(data.message);
      setReplyModalOpen(false);
      fetchTickets();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = tickets.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E6DF] gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#123D2B] uppercase tracking-wider">
            Resident Helpdesk
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D2B] mt-0.5">
            Support Tickets & Service Requests
          </h1>
          <p className="text-xs text-[#5E6E65] mt-1">
            Review resident tickets, dispatch maintenance, and respond directly to customer inquiries.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="p-2.5 rounded-xl border border-[#D5D2C7] bg-white text-[#123D2B] hover:bg-[#FAF8F5] self-start sm:self-auto"
          title="Refresh tickets"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E6DF] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#5E6E65]">
            <Filter className="w-4 h-4 text-[#123D2B]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#5E6E65]">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] text-xs font-semibold"
            >
              <option value="ALL">All Categories</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="HOUSEKEEPING">Housekeeping</option>
              <option value="PAYMENT">Payment</option>
              <option value="GENERAL">General</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-bold text-[#123D2B]">
          {filtered.length} Tickets Found
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
          Loading resident support requests...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-[#E8E6DF]">
          <LifeBuoy className="w-12 h-12 text-[#7B8B82] mx-auto" />
          <h3 className="text-base font-bold text-[#123D2B]">No tickets match criteria</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((t) => {
            let statusBadge = (
              <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                Open
              </span>
            );
            if (t.status === "IN_PROGRESS") {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  In Progress
                </span>
              );
            } else if (t.status === "RESOLVED") {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Resolved
                </span>
              );
            }

            return (
              <div
                key={t.id}
                className="bg-white rounded-3xl border border-[#E8E6DF] p-6 shadow-card space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E8E6DF] text-[10px] font-bold text-[#123D2B]">
                        {t.category}
                      </span>
                      {statusBadge}
                    </div>
                    <h3 className="text-base font-extrabold text-[#123D2B] mt-1.5">
                      {t.subject}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#5E6E65]">
                      <span>Raised by <strong>{t.user?.name}</strong></span>
                      <span>•</span>
                      <span>{t.user?.phone || t.user?.email}</span>
                      {t.booking && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[#123D2B]">
                            Booking: {t.booking.bookingReference} ({t.booking.roomType?.name})
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => openReplyModal(t)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#123D2B] text-white text-xs font-bold hover:bg-[#0E2F21] cursor-pointer self-start shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {t.adminReply ? "Update Reply" : "Compose Reply"}
                  </button>
                </div>

                {/* Resident Message */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E6DF] text-xs text-[#192621] space-y-1">
                  <span className="text-[10px] font-bold text-[#7B8B82] uppercase block">
                    Resident Message:
                  </span>
                  <p className="leading-relaxed">{t.message}</p>
                </div>

                {/* Host / Staff Reply */}
                {t.adminReply && (
                  <div className="p-4 rounded-2xl bg-[#E8F1D5]/40 border border-[#E8F1D5] text-xs text-[#123D2B] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-[#123D2B] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#123D2B]" />
                        Stayzy Host Reply:
                      </span>
                      <span className="text-[10px] text-[#5E6E65]">
                        {t.repliedAt ? new Date(t.repliedAt).toLocaleString() : ""}
                      </span>
                    </div>
                    <p className="leading-relaxed font-medium">{t.adminReply}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      {replyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#E8E6DF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF]">
              <div>
                <h2 className="text-base font-bold text-[#123D2B]">Reply to Support Ticket</h2>
                <span className="text-xs text-[#5E6E65]">
                  From {selectedTicket?.user?.name} ({selectedTicket?.category})
                </span>
              </div>
              <button onClick={() => setReplyModalOpen(false)}>
                <X className="w-5 h-5 text-[#5E6E65]" />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Ticket Subject</label>
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] font-semibold text-[#123D2B]">
                  {selectedTicket?.subject}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Resident Issue</label>
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] text-[#5E6E65] max-h-24 overflow-y-auto">
                  {selectedTicket?.message}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Staff Response Message</label>
                <textarea
                  rows={4}
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type official response or action taken (e.g. Scheduled technician for 11 AM)..."
                  className="w-full p-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4A5550]">Set Ticket Status</label>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D2C7] bg-[#FDFCF9] font-bold"
                >
                  <option value="IN_PROGRESS">In Progress (Work Dispatched)</option>
                  <option value="RESOLVED">Resolved (Issue Addressed)</option>
                  <option value="OPEN">Keep Open</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E8E6DF]">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5D2C7] font-bold text-[#4A5550]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#123D2B] text-white font-bold hover:bg-[#0E2F21] disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? "Sending..." : "Publish Reply to Resident"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
