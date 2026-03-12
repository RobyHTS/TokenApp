import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favorites = await db.favorite.findMany({
    where: { patientId: session.userId },
    include: {
      hospital: true,
      doctor: { include: { hospital: true } },
    },
  });

  return NextResponse.json(favorites);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { hospitalId, doctorId } = await req.json();

  const existing = await db.favorite.findFirst({
    where: {
      patientId: session.userId,
      hospitalId: hospitalId || undefined,
      doctorId: doctorId || undefined,
    },
  });

  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await db.favorite.create({
    data: {
      patientId: session.userId,
      hospitalId: hospitalId || null,
      doctorId: doctorId || null,
    },
  });

  return NextResponse.json({ favorited: true });
}
