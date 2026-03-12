"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { getDayName } from "@/lib/utils";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  status: string;
  tokenEnabled: boolean;
  estimatedReturn?: string | null;
}

interface Schedule {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  maxPatientsPerDay: number;
  avgConsultMinutes: number;
  isActive: boolean;
}

export default function DoctorSettingsPage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [status, setStatus] = useState("IN_OP");
  const [tokenEnabled, setTokenEnabled] = useState(true);
  const [estimatedReturn, setEstimatedReturn] = useState("");
  const [schedules, setSchedules] = useState<Schedule[]>(
    Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      openTime: "09:00",
      closeTime: "17:00",
      maxPatientsPerDay: 30,
      avgConsultMinutes: 10,
      isActive: i >= 1 && i <= 5,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchDoctor = useCallback(async () => {
    const res = await fetch(`/api/hospital/doctors/${doctorId}/settings`);
    if (res.ok) {
      const data = await res.json();
      setDoctor(data);
      setStatus(data.status);
      setTokenEnabled(data.tokenEnabled);
      setEstimatedReturn(
        data.estimatedReturn ? new Date(data.estimatedReturn).toISOString().slice(0, 16) : ""
      );
      if (data.schedules?.length > 0) {
        const scheduleMap: Record<number, Schedule> = {};
        data.schedules.forEach((s: Schedule) => {
          scheduleMap[s.dayOfWeek] = s;
        });
        setSchedules((prev) => prev.map((s, i) => (scheduleMap[i] ? { ...s, ...scheduleMap[i] } : s)));
      }
    }
  }, [doctorId]);

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/hospital/doctors/${doctorId}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        tokenEnabled,
        estimatedReturn: estimatedReturn || null,
        schedules: schedules.filter((s) => s.isActive),
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const updateSchedule = (dayIndex: number, field: keyof Schedule, value: unknown) => {
    setSchedules((prev) => prev.map((s, i) => (i === dayIndex ? { ...s, [field]: value } : s)));
  };

  if (!doctor)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/hospital/doctors/${doctorId}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{doctor.name} — Settings</h1>
          <p className="text-sm text-gray-500">{doctor.specialization}</p>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Doctor Status</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "IN_OP", label: "In OP", color: "border-green-400 bg-green-50 text-green-700" },
            { value: "IN_IP", label: "In IP", color: "border-blue-400 bg-blue-50 text-blue-700" },
            { value: "EMERGENCY", label: "Emergency", color: "border-red-400 bg-red-50 text-red-700" },
            { value: "ON_LEAVE", label: "On Leave", color: "border-gray-400 bg-gray-50 text-gray-700" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                status === opt.value ? opt.color : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {["EMERGENCY", "IN_IP", "ON_LEAVE"].includes(status) && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Return to OP
            </label>
            <input
              type="datetime-local"
              value={estimatedReturn}
              onChange={(e) => setEstimatedReturn(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Token Booking Toggle */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Token Booking</h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900 text-sm">Enable New Token Bookings</p>
            <p className="text-xs text-gray-500 mt-0.5">Allow patients to book tokens for this doctor</p>
          </div>
          <button
            onClick={() => setTokenEnabled(!tokenEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${tokenEnabled ? "bg-blue-600" : "bg-gray-300"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${tokenEnabled ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Weekly OP Schedule</h2>
        <div className="space-y-3">
          {schedules.map((schedule, index) => (
            <div
              key={index}
              className={`border rounded-xl p-4 transition-colors ${schedule.isActive ? "border-blue-100 bg-blue-50/30" : "border-gray-100 bg-gray-50"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900 text-sm">{getDayName(index)}</span>
                <button
                  onClick={() => updateSchedule(index, "isActive", !schedule.isActive)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${schedule.isActive ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${schedule.isActive ? "translate-x-5" : "translate-x-1"}`}
                  />
                </button>
              </div>
              {schedule.isActive && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Open</label>
                    <input
                      type="time"
                      value={schedule.openTime}
                      onChange={(e) => updateSchedule(index, "openTime", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Close</label>
                    <input
                      type="time"
                      value={schedule.closeTime}
                      onChange={(e) => updateSchedule(index, "closeTime", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Max Patients/Day</label>
                    <input
                      type="number"
                      value={schedule.maxPatientsPerDay}
                      onChange={(e) => updateSchedule(index, "maxPatientsPerDay", parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Avg. Min/Patient</label>
                    <input
                      type="number"
                      value={schedule.avgConsultMinutes}
                      onChange={(e) => updateSchedule(index, "avgConsultMinutes", parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min={1}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors ${saved ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"} disabled:opacity-50`}
      >
        <Save className="w-4 h-4" />
        {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
      </button>
    </div>
  );
}
