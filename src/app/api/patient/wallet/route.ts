import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patient = await db.patient.findUnique({
    where: { id: session.userId },
    select: { walletBalance: true },
  });

  const transactions = await db.transaction.findMany({
    where: { patientId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ balance: patient?.walletBalance, transactions });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount } = await req.json();
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const [patient] = await db.$transaction([
    db.patient.update({
      where: { id: session.userId },
      data: { walletBalance: { increment: amount } },
    }),
    db.transaction.create({
      data: {
        patientId: session.userId,
        amount,
        type: "CREDIT",
        description: `Wallet top-up of ₹${amount}`,
      },
    }),
  ]);

  return NextResponse.json({ balance: patient.walletBalance });
}
