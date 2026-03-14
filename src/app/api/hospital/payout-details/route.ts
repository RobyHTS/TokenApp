import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "hospital") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const details = await db.payoutDetails.findUnique({
    where: { hospitalId: session.userId },
  });

  return NextResponse.json(details ?? {});
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "hospital") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { upiId, accountHolderName, bankName, accountNumber, ifscCode, accountType } = body;

  const details = await db.payoutDetails.upsert({
    where: { hospitalId: session.userId },
    update: { upiId, accountHolderName, bankName, accountNumber, ifscCode, accountType },
    create: { hospitalId: session.userId, upiId, accountHolderName, bankName, accountNumber, ifscCode, accountType },
  });

  return NextResponse.json(details);
}
