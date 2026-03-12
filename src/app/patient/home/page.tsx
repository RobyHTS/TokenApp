import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import { Plus, Heart, Ticket, ChevronRight, Stethoscope } from "lucide-react";

export default async function PatientHomePage() {
  const session = await getSession();
  if (!session || session.role !== "patient") redirect("/auth/patient/login");

  const patient = await db.patient.findUnique({
    where: { id: session.userId },
    include: {
      favorites: {
        include: {
          hospital: true,
          doctor: { include: { hospital: true } },
        },
        take: 5,
      },
      tokens: {
        where: {
          status: { in: ["PENDING", "CURRENT"] },
          date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
        include: { doctor: { include: { hospital: true } } },
        orderBy: { tokenNumber: "asc" },
        take: 3,
      },
    },
  });

  if (!patient) redirect("/auth/patient/login");

  return (
    <div className="space-y-6 pb-20 md:pb-6 md:pl-56">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-6">
        <p className="text-green-100 text-sm mb-1">Welcome back</p>
        <h1 className="text-2xl font-bold mb-3">{patient.name}</h1>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-xs">Wallet Balance</p>
            <p className="text-2xl font-bold">₹{patient.walletBalance.toFixed(2)}</p>
          </div>
          <Link
            href="/patient/profile/wallet"
            className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
          >
            Add Money
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/patient/book"
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 hover:border-green-200 hover:bg-green-50 transition-colors"
        >
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-green-600" />
          </div>
          <span className="font-medium text-gray-900 text-sm">Book Token</span>
        </Link>
        <Link
          href="/patient/tokens"
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 hover:border-blue-200 hover:bg-blue-50 transition-colors"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Ticket className="w-5 h-5 text-blue-600" />
          </div>
          <span className="font-medium text-gray-900 text-sm">My Tokens</span>
        </Link>
      </div>

      {/* Active Tokens */}
      {patient.tokens.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Active Tokens Today</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {patient.tokens.map((token) => (
              <div key={token.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{token.doctor.name}</p>
                    <p className="text-xs text-gray-500">{token.doctor.hospital.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">#{token.tokenNumber}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        token.status === "CURRENT"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {token.status === "CURRENT" ? "Your Turn!" : "Pending"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      token.doctor.status === "IN_OP" ? "bg-green-500 animate-pulse" : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-xs text-gray-500">
                    Doctor: {getStatusLabel(token.doctor.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favourites */}
      {patient.favorites.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Favourites</h2>
            <Link href="/patient/favourites" className="text-green-600 text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {patient.favorites.map((fav) => {
              const name = fav.doctor?.name || fav.hospital?.name || "";
              const subtitle = fav.doctor?.specialization || fav.hospital?.location || "";
              const status = fav.doctor?.status;
              return (
                <div key={fav.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                      {fav.doctor ? (
                        <Stethoscope className="w-4 h-4 text-green-600" />
                      ) : (
                        <Heart className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{name}</p>
                      <p className="text-xs text-gray-500">{subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(status)}`}>
                        {getStatusLabel(status)}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {patient.tokens.length === 0 && patient.favorites.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">No active tokens</h3>
          <p className="text-sm text-gray-500 mb-4">Book a token to get started</p>
          <Link
            href="/patient/book"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Book Token
          </Link>
        </div>
      )}
    </div>
  );
}
