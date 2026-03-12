import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import { Plus, Stethoscope, Settings } from "lucide-react";

export default async function DoctorsPage() {
  const session = await getSession();
  if (!session || session.role !== "hospital") redirect("/auth/hospital/login");

  const doctors = await db.doctor.findMany({
    where: { hospitalId: session.userId },
    include: { schedules: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
        <Link
          href="/hospital/doctors/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Doctor
        </Link>
      </div>

      {doctors.length === 0 ? (
        <div className="text-center py-20">
          <Stethoscope className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No doctors yet</h3>
          <p className="text-gray-500 text-sm mb-6">Add doctors to start managing tokens</p>
          <Link
            href="/hospital/doctors/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Doctor
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                    {doctor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{doctor.name}</p>
                    <p className="text-sm text-gray-500">{doctor.specialization}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(doctor.status)}`}>
                  {getStatusLabel(doctor.status)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm mb-4">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    doctor.tokenEnabled ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500"
                  }`}
                >
                  {doctor.tokenEnabled ? "Booking On" : "Booking Off"}
                </span>
                <span className="text-gray-400 text-xs">
                  {doctor.schedules.filter((s) => s.isActive).length} active days
                </span>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/hospital/doctors/${doctor.id}`}
                  className="flex-1 text-center bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  View Tokens
                </Link>
                <Link
                  href={`/hospital/doctors/${doctor.id}/settings`}
                  className="flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
