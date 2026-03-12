import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "hospital") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { doctorId } = await params;
  const doctor = await db.doctor.findFirst({
    where: { id: doctorId, hospitalId: session.userId },
    include: { schedules: true },
  });

  if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  return NextResponse.json(doctor);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "hospital") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { doctorId } = await params;
  const body = await req.json();

  const doctor = await db.doctor.findFirst({
    where: { id: doctorId, hospitalId: session.userId },
  });
  if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

  const updated = await db.doctor.update({ where: { id: doctorId }, data: body });
  return NextResponse.json(updated);
}
