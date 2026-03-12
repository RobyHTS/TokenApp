import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { User, Wallet, FileText, Shield, Trash2, LogOut, ChevronRight } from "lucide-react";

export default async function PatientProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "patient") redirect("/auth/patient/login");

  const patient = await db.patient.findUnique({
    where: { id: session.userId },
    select: { name: true, phone: true, walletBalance: true },
  });

  if (!patient) redirect("/auth/patient/login");

  return (
    <div className="space-y-5 pb-20 md:pb-6 md:pl-56">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {patient.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{patient.name}</h1>
            <p className="text-green-100">{patient.phone}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        <Link
          href="/patient/profile/edit"
          className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium text-gray-900 text-sm">Edit Profile</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        <Link
          href="/patient/profile/wallet"
          className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <Wallet className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <span className="font-medium text-gray-900 text-sm block">Wallet</span>
              <span className="text-xs text-gray-500">Balance: ₹{patient.walletBalance.toFixed(2)}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        <Link
          href="/terms"
          className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <span className="font-medium text-gray-900 text-sm">Terms & Conditions</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        <Link
          href="/privacy"
          className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="font-medium text-gray-900 text-sm">Privacy Policy</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
              <LogOut className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium text-gray-900 text-sm">Logout</span>
          </button>
        </form>

        <button className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 transition-colors text-left">
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-red-500" />
          </div>
          <span className="font-medium text-red-600 text-sm">Delete Account</span>
        </button>
      </div>
    </div>
  );
}
