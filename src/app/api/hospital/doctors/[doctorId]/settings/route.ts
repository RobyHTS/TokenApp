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

  if (!doctor) return NextResponse.json({ error: "Not found" }, { status: 404 });
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
  const { status, estimatedReturn, tokenEnabled, schedules } = await req.json();

  const doctor = await db.doctor.findFirst({
    where: { id: doctorId, hospitalId: session.userId },
  });
  if (!doctor) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (estimatedReturn !== undefined)
    updateData.estimatedReturn = estimatedReturn ? new Date(estimatedReturn) : null;
  if (tokenEnabled !== undefined) updateData.tokenEnabled = tokenEnabled;

  const updated = await db.doctor.update({ where: { id: doctorId }, data: updateData });

  if (schedules && Array.isArray(schedules)) {
    await db.doctorSchedule.deleteMany({ where: { doctorId } });
    if (schedules.length > 0) {
      await db.doctorSchedule.createMany({
        data: schedules.map((s: Record<string, unknown>) => ({ ...s, doctorId })),
      });
    }
  }

  // Notify patients if doctor goes unavailable
  if (status && ["EMERGENCY", "ON_LEAVE", "IN_IP"].includes(status)) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const pendingTokens = await db.token.findMany({
      where: {
        doctorId,
        status: { in: ["PENDING", "CURRENT"] },
        date: { gte: today, lt: tomorrow },
        patientId: { not: null },
      },
    });

    const statusMessages: Record<string, string> = {
      EMERGENCY: "is attending an emergency case",
      ON_LEAVE: "is currently on leave",
      IN_IP: "is attending inpatient duties",
    };

    if (pendingTokens.length > 0) {
      await db.notification.createMany({
        data: pendingTokens
          .filter((t: { patientId: string | null }) => t.patientId)
          .map((t: { patientId: string | null; tokenNumber: number }) => ({
            patientId: t.patientId!,
            title: "Doctor Status Update",
            message: `Dr. ${updated.name} ${statusMessages[status]}. ${
              estimatedReturn
                ? `Estimated return: ${new Date(estimatedReturn).toLocaleTimeString()}`
                : ""
            }`,
          })),
      });
    }
  }

  return NextResponse.json(updated);
}
