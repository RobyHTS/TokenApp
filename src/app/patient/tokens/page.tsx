import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { getTokenStatusColor } from "@/lib/utils";
import { Ticket, Clock } from "lucide-react";
import { format } from "date-fns";

export default async function PatientTokensPage() {
  const session = await getSession();
  if (!session || session.role !== "patient") redirect("/auth/patient/login");

  const tokens = await db.token.findMany({
    where: { patientId: session.userId },
    include: { doctor: { include: { hospital: true } } },
    orderBy: { createdAt: "desc" },
  });

  const activeTokens = tokens.filter((t) => ["PENDING", "CURRENT"].includes(t.status));
  const pastTokens = tokens.filter((t) => !["PENDING", "CURRENT"].includes(t.status));

  return (
    <div className="space-y-6 pb-20 md:pb-6 md:pl-56">
      <h1 className="text-2xl font-bold text-gray-900">My Tokens</h1>

      {tokens.length === 0 ? (
        <div className="text-center py-16">
          <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tokens booked yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTokens.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 text-xs uppercase tracking-wider mb-3">Active</h2>
              <div className="space-y-3">
                {activeTokens.map((token) => (
                  <div key={token.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{token.doctor.name}</p>
                        <p className="text-sm text-gray-500">{token.doctor.specialization}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{token.doctor.hospital.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">#{token.tokenNumber}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTokenStatusColor(token.status)}`}>
                          {token.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(token.createdAt), "dd MMM, hh:mm a")}
                      </div>
                      {token.fee > 0 && <span>₹{token.fee}</span>}
                      {token.status === "PENDING" && (
                        <form action={`/api/patient/tokens/${token.id}/cancel`} method="POST">
                          <button type="submit" className="text-red-500 hover:text-red-700 font-medium transition-colors">
                            Cancel
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {pastTokens.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 text-xs uppercase tracking-wider mb-3">History</h2>
              <div className="space-y-3">
                {pastTokens.map((token) => (
                  <div key={token.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 opacity-80">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{token.doctor.name}</p>
                        <p className="text-sm text-gray-500">{token.doctor.specialization}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{token.doctor.hospital.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-400">#{token.tokenNumber}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTokenStatusColor(token.status)}`}>
                          {token.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(token.createdAt), "dd MMM, hh:mm a")}
                      </div>
                      {token.fee > 0 && <span>₹{token.fee}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
