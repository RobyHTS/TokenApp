"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Plus, Settings, UserCheck, CheckCircle, XCircle, SkipForward } from "lucide-react";
import { getTokenStatusColor, getStatusColor, getStatusLabel } from "@/lib/utils";
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

export default function DoctorDashboardPage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInForm, setWalkInForm] = useState({ patientName: "", patientPhone: "" });
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");

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
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  if (!doctor) return <div className="text-center py-12 text-gray-500">Doctor not found</div>;

  const pending = tokens.filter((t) => t.status === "PENDING");
  const current = tokens.find((t) => t.status === "CURRENT");
  const completed = tokens.filter((t) => t.status === "COMPLETED");
  const cancelled = tokens.filter((t) => t.status === "CANCELLED");
  const skipped = tokens.filter((t) => t.status === "SKIPPED");

  const displayTokens =
    activeTab === "pending" ? [...(current ? [current] : []), ...pending] : tokens;

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: tokens.length, color: "text-gray-900" },
          { label: "Pending", value: pending.length, color: "text-yellow-600" },
          { label: "Done", value: completed.length, color: "text-green-600" },
          { label: "Cancelled", value: cancelled.length, color: "text-red-600" },
          { label: "Skipped", value: skipped.length, color: "text-orange-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "pending" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Active ({(current ? 1 : 0) + pending.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "all" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >
            All ({tokens.length})
          </button>
        </div>
        <button
          onClick={() => setShowWalkIn(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Walk-in Token
        </button>
      </div>

      {showWalkIn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
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
                <button
                  type="button"
                  onClick={() => setShowWalkIn(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold"
                >
                  Create Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {displayTokens.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            {activeTab === "pending" ? "No active tokens right now" : "No tokens today"}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {displayTokens.map((token) => {
              const name = token.patient?.name || token.patientName || "Walk-in";
              const phone = token.patient?.phone || token.patientPhone;
              return (
                <div
                  key={token.id}
                  className={`px-5 py-4 flex items-center justify-between ${token.status === "CURRENT" ? "bg-blue-50" : "hover:bg-gray-50"} transition-colors`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${token.status === "CURRENT" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                    >
                      {token.tokenNumber}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{name}</p>
                      {phone && (
                        <a
                          href={`tel:${phone}`}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          {phone}
                        </a>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTokenStatusColor(token.status)}`}>
                          {token.status === "CURRENT" ? "Current" : token.status}
                        </span>
                        {token.isWalkIn && <span className="text-xs text-gray-400">Walk-in</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {token.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => updateTokenStatus(token.id, "CURRENT")}
                          className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Call
                        </button>
                        <button
                          onClick={() => updateTokenStatus(token.id, "SKIPPED")}
                          className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <SkipForward className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateTokenStatus(token.id, "CANCELLED")}
                          className="flex items-center gap-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {token.status === "CURRENT" && (
                      <button
                        onClick={() => updateTokenStatus(token.id, "COMPLETED")}
                        className="flex items-center gap-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Done
                      </button>
                    )}
                    <span className="text-xs text-gray-400">
                      {format(new Date(token.createdAt), "hh:mm a")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
