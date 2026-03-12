import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { doctorId, fee = 100 } = await req.json();

  if (!doctorId) {
    return NextResponse.json({ error: "Doctor ID required" }, { status: 400 });
  }

  const doctor = await db.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor || !doctor.tokenEnabled) {
    return NextResponse.json({ error: "Booking not available for this doctor" }, { status: 400 });
  }

  const patient = await db.patient.findUnique({ where: { id: session.userId } });
  if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

  if (patient.walletBalance < fee) {
    return NextResponse.json(
      { error: "Insufficient wallet balance. Please add money to your wallet." },
      { status: 400 }
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingToken = await db.token.findFirst({
    where: {
      doctorId,
      patientId: session.userId,
      status: { in: ["PENDING", "CURRENT"] },
      date: { gte: today, lt: tomorrow },
    },
  });

  if (existingToken) {
    return NextResponse.json(
      { error: "You already have an active token for this doctor today" },
      { status: 409 }
    );
  }

  const lastToken = await db.token.findFirst({
    where: { doctorId, date: { gte: today, lt: tomorrow } },
    orderBy: { tokenNumber: "desc" },
  });
  const tokenNumber = (lastToken?.tokenNumber ?? 0) + 1;

  const [token] = await db.$transaction([
    db.token.create({
      data: { doctorId, patientId: session.userId, tokenNumber, fee },
    }),
    db.patient.update({
      where: { id: session.userId },
      data: { walletBalance: { decrement: fee } },
    }),
    db.transaction.create({
      data: {
        patientId: session.userId,
        amount: fee,
        type: "DEBIT",
        description: `Token #${tokenNumber} booked with Dr. ${doctor.name}`,
      },
    }),
    db.notification.create({
      data: {
        patientId: session.userId,
        title: "Token Booked!",
        message: `Token #${tokenNumber} booked with Dr. ${doctor.name}. ₹${fee} deducted from wallet.`,
      },
    }),
  ]);

  return NextResponse.json(token);
}
