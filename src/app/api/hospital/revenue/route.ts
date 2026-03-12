import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "hospital") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "monthly";

  const now = new Date();
  let startDate: Date;

  if (period === "weekly") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
  } else if (period === "yearly") {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const tokens = await db.token.findMany({
    where: {
      doctor: { hospitalId: session.userId },
      createdAt: { gte: startDate },
    },
    include: { doctor: true },
  });

  const totalBookings = tokens.length;
  const cancelledBookings = tokens.filter((t) => t.status === "CANCELLED").length;
  const completedBookings = tokens.filter((t) => t.status === "COMPLETED").length;
  const totalRevenue = tokens
    .filter((t) => t.status !== "CANCELLED")
    .reduce((sum, t) => sum + t.fee, 0);
  const hospitalShare = totalRevenue * 0.3;

  const revenueByDate: Record<string, number> = {};
  tokens.forEach((token) => {
    if (token.status !== "CANCELLED") {
      const dateKey = token.createdAt.toISOString().split("T")[0];
      revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + token.fee;
    }
  });

  const chartData = Object.entries(revenueByDate)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    totalBookings,
    cancelledBookings,
    completedBookings,
    totalRevenue,
    hospitalShare,
    chartData,
  });
}
