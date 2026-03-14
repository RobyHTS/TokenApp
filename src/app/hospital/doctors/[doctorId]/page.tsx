"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Phone, Plus, Settings, UserCheck,
  CheckCircle, XCircle, SkipForward, Bell, Clock, Ticket,
} from "lucide-react";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import { format } from "date-fns";

interface Token {
  id: string;
  tokenNumber: number;
  status: string;
  patientName?: string | null;
  patientPhone?: string | null;
  isWalkIn: boolean;
  createdAt: string;
  patient?: { name: string; phone: string } | null;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  status: string;
  tokenEnabled: boolean;
}

const STATUS_CONFIG: Record<string, { strip: string; badge: string; tokenBg: string; label: string }> = {
  CURRENT:   { strip: "bg-blue-500",   badge: "bg-blue-100 text-blue-700 border-blue-200",     tokenBg: "bg-blue-600 text-white",       label: "In-Progress" },
  PENDING:   { strip: "bg-amber-400",  badge: "bg-amber-100 text-amber-700 border-amber-200",   tokenBg: "bg-amber-50 text-amber-700",   label: "Pending"     },
  SKIPPED:   { strip: "bg-orange-400", badge: "bg-orange-100 text-orange-700 border-orange-200",tokenBg: "bg-orange-50 text-orange-700", label: "Skipped"     },
  COMPLETED: { strip: "bg-green-500",  badge: "bg-green-100 text-green-700 border-green-200",   tokenBg: "bg-green-50 text-green-700",   label: "Completed"   },
  CANCELLED: { strip: "bg-red-400",    badge: "bg-red-100 text-red-700 border-red-200",         tokenBg: "bg-red-50 text-red-700",       label: "Cancelled"   },
};

export default function DoctorDashboardPage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInForm, setWalkInForm] = useState({ patientName: "", patientPhone: "" });
  const [activeTab, setActiveTab] = useState<"active" | "all">("active");
  const [reminderSent, setReminderSent] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [docRes, tokensRes] = await Promise.all([
      fetch(`/api/hospital/doctors/${doctorId}`),
      fetch(`/api/hospital/doctors/${doctorId}/tokens`),
    ]);
    if (docRes.ok) setDoctor(await docRes.json());
    if (tokensRes.ok) setTokens(await tokensRes.json());
    setLoading(false);
  }, [doctorId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const updateTokenStatus = async (tokenId: string, status: string) => {
    const res = await fetch(`/api/hospital/tokens/${tokenId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchData();
  };

  const sendReminder = (phone: string | null | undefined, tokenId: string) => {
    if (phone) {
      window.open(`sms:${phone}?body=Your token number is coming up soon. Please be ready at the hospital.`);
    }
    setReminderSent(tokenId);
    setTimeout(() => setReminderSent(null), 2000);
  };

  const createWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/hospital/doctors/${doctorId}/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(walkInForm),
    });
    if (res.ok) {
      setShowWalkIn(false);
      setWalkInForm({ patientName: "", patientPhone: "" });
      fetchData();
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  if (!doctor) return <div className="text-center py-12 text-gray-500">Doctor not found</div>;

  const pending   = tokens.filter((t) => t.status === "PENDING");
  const current   = tokens.find((t) => t.status === "CURRENT");
  const completed = tokens.filter((t) => t.status === "COMPLETED");
  const cancelled = tokens.filter((t) => t.status === "CANCELLED");
  const skipped   = tokens.filter((t) => t.status === "SKIPPED");

  const activeTokens = [
    ...(current ? [current] : []),
    ...pending,
    ...skipped,
  ];

  const displayTokens = activeTab === "active" ? activeTokens : [...tokens].sort((a, b) => a.tokenNumber - b.tokenNumber);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/hospital/dashboard" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{doctor.name}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(doctor.status)}`}>
              {getStatusLabel(doctor.status)}
            </span>
          </div>
          <p className="text-gray-500 text-sm">{doctor.specialization}</p>
        </div>
        <Link
          href={`/hospital/doctors/${doctorId}/settings`}
          className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:border-blue-200 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { label: "Total",     value: tokens.length,     color: "text-gray-900",    bg: "bg-gray-50"   },
          { label: "Pending",   value: pending.length,    color: "text-amber-600",   bg: "bg-amber-50"  },
          { label: "Done",      value: completed.length,  color: "text-green-600",   bg: "bg-green-50"  },
          { label: "Cancelled", value: cancelled.length,  color: "text-red-600",     bg: "bg-red-50"    },
          { label: "Skipped",   value: skipped.length,    color: "text-orange-600",  bg: "bg-orange-50" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-gray-100 text-center`}>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs + Walk-in */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm bg-white">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-5 py-2.5 font-semibold transition-colors ${activeTab === "active" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
          >
            Active ({activeTokens.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-5 py-2.5 font-semibold transition-colors ${activeTab === "all" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
          >
            All ({tokens.length})
          </button>
        </div>
        <button
          onClick={() => setShowWalkIn(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Walk-in Token
        </button>
      </div>

      {/* Walk-in Modal */}
      {showWalkIn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Create Walk-in Token</h3>
            <form onSubmit={createWalkIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={walkInForm.patientName}
                  onChange={(e) => setWalkInForm({ ...walkInForm, patientName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Patient name (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={walkInForm.patientPhone}
                  onChange={(e) => setWalkInForm({ ...walkInForm, patientPhone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowWalkIn(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold">
                  Create Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Token Cards */}
      <div className="space-y-3">
        {displayTokens.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Ticket className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {activeTab === "active" ? "No active tokens right now" : "No tokens today"}
            </p>
          </div>
        ) : (
          displayTokens.map((token) => {
            const cfg   = STATUS_CONFIG[token.status] ?? STATUS_CONFIG.PENDING;
            const name  = token.patient?.name || token.patientName || "Walk-in";
            const phone = token.patient?.phone || token.patientPhone;
            const hasActions = token.status !== "COMPLETED" && token.status !== "CANCELLED";

            return (
              <div
                key={token.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Status colour strip */}
                <div className={`h-1.5 ${cfg.strip}`} />

                <div className="p-4">
                  {/* Top row: token number + info + status badge */}
                  <div className="flex items-start gap-4">
                    {/* Token number — ticket stub */}
                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center font-black text-lg leading-none ${cfg.tokenBg}`}>
                      <span className="text-[10px] font-semibold opacity-60 mb-0.5">#</span>
                      {token.tokenNumber}
                    </div>

                    {/* Patient info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-bold text-gray-900">{name}</p>
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {phone ? (
                          <a
                            href={`tel:${phone}`}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            {phone}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">No phone</span>
                        )}
                        {token.isWalkIn && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium">Walk-in</span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                          <Clock className="w-3 h-3" />
                          {format(new Date(token.createdAt), "hh:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dashed divider + actions (ticket stub style) */}
                  {hasActions && (
                    <>
                      <div className="border-t border-dashed border-gray-200 my-3" />
                      <div className="flex items-center gap-2 flex-wrap">

                        {/* PENDING actions */}
                        {token.status === "PENDING" && (
                          <>
                            <a
                              href={phone ? `tel:${phone}` : undefined}
                              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              Call
                            </a>
                            <button
                              onClick={() => sendReminder(phone, token.id)}
                              className={`flex items-center gap-1.5 text-xs font-semibold border px-3 py-1.5 rounded-lg transition-colors ${
                                reminderSent === token.id
                                  ? "bg-purple-600 text-white border-purple-600"
                                  : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                              }`}
                            >
                              <Bell className="w-3.5 h-3.5" />
                              {reminderSent === token.id ? "Sent!" : "Remind"}
                            </button>
                            <button
                              onClick={() => updateTokenStatus(token.id, "SKIPPED")}
                              className="flex items-center gap-1.5 text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <SkipForward className="w-3.5 h-3.5" />
                              Skip
                            </button>
                            <button
                              onClick={() => updateTokenStatus(token.id, "CURRENT")}
                              className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors ml-auto"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Invite
                            </button>
                          </>
                        )}

                        {/* IN-PROGRESS (CURRENT) actions */}
                        {token.status === "CURRENT" && (
                          <button
                            onClick={() => updateTokenStatus(token.id, "COMPLETED")}
                            className="flex items-center gap-1.5 text-sm font-semibold bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark as Completed
                          </button>
                        )}

                        {/* SKIPPED actions */}
                        {token.status === "SKIPPED" && (
                          <>
                            <button
                              onClick={() => updateTokenStatus(token.id, "CURRENT")}
                              className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Invite
                            </button>
                            <button
                              onClick={() => sendReminder(phone, token.id)}
                              className={`flex items-center gap-1.5 text-xs font-semibold border px-3 py-1.5 rounded-lg transition-colors ${
                                reminderSent === token.id
                                  ? "bg-purple-600 text-white border-purple-600"
                                  : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                              }`}
                            >
                              <Bell className="w-3.5 h-3.5" />
                              {reminderSent === token.id ? "Sent!" : "Remind"}
                            </button>
                            <a
                              href={phone ? `tel:${phone}` : undefined}
                              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              Call
                            </a>
                            <button
                              onClick={() => updateTokenStatus(token.id, "CANCELLED")}
                              className="flex items-center gap-1.5 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors ml-auto"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Cancel
                            </button>
                          </>
                        )}

                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
