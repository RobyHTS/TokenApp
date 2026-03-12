import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "hospital") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, phone, specialization } = await req.json();
  if (!name || !phone || !specialization) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  }

  const doctor = await db.doctor.create({
    data: { hospitalId: session.userId, name, phone, specialization },
  });

  return NextResponse.json(doctor);
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "hospital") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doctors = await db.doctor.findMany({
    where: { hospitalId: session.userId },
    include: { schedules: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(doctors);
}
