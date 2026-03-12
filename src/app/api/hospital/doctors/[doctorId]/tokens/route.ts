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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tokens = await db.token.findMany({
    where: { doctorId, date: { gte: today, lt: tomorrow } },
    include: { patient: true },
    orderBy: { tokenNumber: "asc" },
  });

  return NextResponse.json(tokens);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "hospital") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { doctorId } = await params;
  const { patientName, patientPhone } = await req.json();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const lastToken = await db.token.findFirst({
    where: { doctorId, date: { gte: today, lt: tomorrow } },
    orderBy: { tokenNumber: "desc" },
  });
  const tokenNumber = (lastToken?.tokenNumber ?? 0) + 1;

  const token = await db.token.create({
    data: {
      doctorId,
      tokenNumber,
      isWalkIn: true,
      patientName: patientName || `Walk-in #${tokenNumber}`,
      patientPhone: patientPhone || null,
    },
  });

  return NextResponse.json(token);
}
