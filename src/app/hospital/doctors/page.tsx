import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import { Plus, Stethoscope, Settings, Phone, Ticket, CheckCircle, Clock, ChevronRight } from "lucide-react";

const STATUS_GRADIENT: Record<string, string> = {
  IN_OP:      "from-emerald-500 to-teal-600",
  IN_IP:      "from-blue-500 to-indigo-600",
  EMERGENCY:  "from-red-500 to-rose-600",
  ON_LEAVE:   "from-gray-400 to-slate-500",
};

const STATUS_DOT: Record<string, string> = {
  IN_OP:     "bg-emerald-400",
  IN_IP:     "bg-blue-400",
  EMERGENCY: "bg-red-400",
  ON_LEAVE:  "bg-gray-400",
};

export default async function DoctorsPage() {
  const session = await getSession();
  if (!session || session.role !== "hospital") redirect("/auth/hospital/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const doctors = await db.doctor.findMany({
    where: { hospitalId: session.userId },
    include: {
      schedules: true,
      tokens: {
        where: { createdAt: { gte: today, lt: tomorrow } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-sm text-gray-500 mt-0.5">{doctors.length} doctor{doctors.length !== 1 ? "s" : ""} registered</p>
        </div>
        <Link
          href="/hospital/doctors/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Doctor
        </Link>
      </div>

      {doctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-24">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-10 h-10 text-blue-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No doctors yet</h3>
          <p className="text-gray-400 text-sm mb-6">Add doctors to start managing token queues</p>
          <Link
            href="/hospital/doctors/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Doctor
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {doctors.map((doctor) => {
            const totalToday   = doctor.tokens.length;
            const pendingToday = doctor.tokens.filter((t) => t.status === "PENDING" || t.status === "CURRENT").length;
            const doneToday    = doctor.tokens.filter((t) => t.status === "COMPLETED").length;
            const activeDays   = doctor.schedules.filter((s) => s.isActive).length;
            const gradient     = STATUS_GRADIENT[doctor.status] ?? STATUS_GRADIENT.ON_LEAVE;
            const dot          = STATUS_DOT[doctor.status] ?? STATUS_DOT.ON_LEAVE;
            const initial      = doctor.name.replace("Dr. ", "").charAt(0).toUpperCase();

            return (
              <div key={doctor.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

                {/* Gradient header */}
                <div className={`bg-gradient-to-r ${gradient} p-5 relative`}>
                  <div className="flex items-start justify-between">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-black text-2xl border-2 border-white/30">
                        {initial}
                      </div>
                      {/* Status dot */}
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 ${dot} rounded-full border-2 border-white`} />
                    </div>

                    {/* Settings shortcut */}
                    <Link
                      href={`/hospital/doctors/${doctor.id}/settings`}
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                    >
                      <Settings className="w-4 h-4 text-white" />
                    </Link>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-bold text-white text-lg leading-tight">{doctor.name}</h3>
                    <p className="text-white/75 text-sm">{doctor.specialization}</p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  {/* Phone + meta */}
                  <div className="flex items-center justify-between">
                    {doctor.phone ? (
                      <a href={`tel:${doctor.phone}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                        {doctor.phone}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">No phone</span>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${getStatusColor(doctor.status)}`}>
                        {getStatusLabel(doctor.status)}
                      </span>
                    </div>
                  </div>

                  {/* Today's stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Today",   value: totalToday,   icon: Ticket,       color: "text-blue-600",  bg: "bg-blue-50"   },
                      { label: "Pending", value: pendingToday, icon: Clock,        color: "text-amber-600", bg: "bg-amber-50"  },
                      { label: "Done",    value: doneToday,    icon: CheckCircle,  color: "text-green-600", bg: "bg-green-50"  },
                    ].map((stat) => (
                      <div key={stat.label} className={`${stat.bg} rounded-xl p-2.5 text-center`}>
                        <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                        <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Booking status + active days */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${doctor.tokenEnabled ? "bg-green-500" : "bg-gray-300"}`} />
                      <span className={doctor.tokenEnabled ? "text-green-700 font-semibold" : "text-gray-400"}>
                        Booking {doctor.tokenEnabled ? "ON" : "OFF"}
                      </span>
                    </div>
                    <span className="text-gray-400">{activeDays} active day{activeDays !== 1 ? "s" : ""}/week</span>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/hospital/doctors/${doctor.id}`}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Ticket className="w-4 h-4" />
                    View Token Queue
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
