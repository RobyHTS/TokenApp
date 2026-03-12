"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Ticket, XCircle, CheckCircle, IndianRupee } from "lucide-react";

interface RevenueData {
  totalBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
  hospitalShare: number;
  chartData: { date: string; revenue: number }[];
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [period, setPeriod] = useState("monthly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/hospital/revenue?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [period]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Revenue & Analytics</h1>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          {["weekly", "monthly", "yearly"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                period === p ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Bookings", value: data.totalBookings, icon: Ticket, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Completed", value: data.completedBookings, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
              { label: "Cancelled", value: data.cancelledBookings, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
              { label: "Total Revenue", value: `₹${data.totalRevenue.toFixed(0)}`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <IndianRupee className="w-6 h-6 text-blue-200" />
              <span className="font-semibold text-lg">Your Revenue Share (30%)</span>
            </div>
            <p className="text-4xl font-bold">₹{data.hospitalShare.toFixed(2)}</p>
            <p className="text-blue-200 text-sm mt-2">Based on {period} bookings</p>
          </div>

          {data.chartData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Revenue Trend</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(d) => d.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [`₹${value}`, "Revenue"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Payout Request</h2>
            <p className="text-sm text-gray-500 mb-4">
              Request a payout for your accumulated revenue share
            </p>
            <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              Request Payout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
