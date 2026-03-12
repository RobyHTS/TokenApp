import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import { Plus, Users, Activity, Stethoscope } from "lucide-react";

export default async function HospitalDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "hospital") redirect("/auth/hospital/login");

  const hospital = await db.hospital.findUnique({
    where: { id: session.userId },
    include: {
      doctors: {
        include: {
          tokens: {
            where: {
              date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lte: new Date(new Date().setHours(23, 59, 59, 999)),
              },
            },
          },
        },
      },
    },
  });

  if (!hospital) redirect("/auth/hospital/login");

  const totalTodayTokens = hospital.doctors.reduce(
    (sum, doc) => sum + doc.tokens.length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{hospital.name}</h1>
          <p className="text-gray-500 text-sm">{hospital.location}</p>
        </div>
        <Link
          href="/hospital/doctors/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors w-fit"
        >
          <Plus className="w-4 h-4" />
          Add Doctor
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Doctors</span>
            <Stethoscope className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{hospital.doctors.length}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Today&apos;s Tokens</span>
            <Activity className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalTodayTokens}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Active Now</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {hospital.doctors.filter((d) => d.status === "IN_OP").length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Booking Enabled</span>
            <Activity className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {hospital.doctors.filter((d) => d.tokenEnabled).length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Doctors</h2>
          <Link href="/hospital/doctors/new" className="text-blue-600 text-sm hover:underline">
            + Add Doctor
          </Link>
        </div>
        {hospital.doctors.length === 0 ? (
          <div className="p-12 text-center">
            <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No doctors added yet</p>
            <Link
              href="/hospital/doctors/new"
              className="mt-4 inline-block text-blue-600 text-sm hover:underline"
            >
              Add your first doctor
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {hospital.doctors.map((doctor) => {
              const pending = doctor.tokens.filter((t) => t.status === "PENDING").length;
              const completed = doctor.tokens.filter((t) => t.status === "COMPLETED").length;
              const current = doctor.tokens.find((t) => t.status === "CURRENT");
              return (
                <div
                  key={doctor.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      {doctor.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{doctor.name}</div>
                      <div className="text-sm text-gray-500">{doctor.specialization}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 text-sm">
                      <span className="text-gray-500">Today: {doctor.tokens.length}</span>
                      {current && (
                        <span className="text-blue-600">Current: #{current.tokenNumber}</span>
                      )}
                      <span className="text-yellow-600">Pending: {pending}</span>
                      <span className="text-green-600">Done: {completed}</span>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(doctor.status)}`}
                    >
                      {getStatusLabel(doctor.status)}
                    </span>
                    <Link
                      href={`/hospital/doctors/${doctor.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View →
                    </Link>
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
