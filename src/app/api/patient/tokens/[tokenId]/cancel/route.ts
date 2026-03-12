import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { tokenId } = await params;

  const token = await db.token.findFirst({
    where: { id: tokenId, patientId: session.userId },
    include: { doctor: true },
  });

  if (!token) return NextResponse.json({ error: "Token not found" }, { status: 404 });
  if (token.status !== "PENDING") {
    return NextResponse.json({ error: "Only pending tokens can be cancelled" }, { status: 400 });
  }

  await db.$transaction([
    db.token.update({ where: { id: tokenId }, data: { status: "CANCELLED" } }),
    db.patient.update({
      where: { id: session.userId },
      data: { walletBalance: { increment: token.fee } },
    }),
    db.transaction.create({
      data: {
        patientId: session.userId,
        amount: token.fee,
        type: "CREDIT",
        description: `Refund for cancelled token #${token.tokenNumber} with Dr. ${token.doctor.name}`,
      },
    }),
    db.notification.create({
      data: {
        patientId: session.userId,
        title: "Token Cancelled",
        message: `Token #${token.tokenNumber} cancelled. ₹${token.fee} refunded to your wallet.`,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
