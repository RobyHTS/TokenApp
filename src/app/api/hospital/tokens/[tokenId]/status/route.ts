import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "hospital") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { tokenId } = await params;
  const { status } = await req.json();

  const validStatuses = ["PENDING", "CURRENT", "COMPLETED", "CANCELLED", "SKIPPED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const token = await db.token.findUnique({
    where: { id: tokenId },
    include: { doctor: true },
  });

  if (!token || token.doctor.hospitalId !== session.userId) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }

  const updated = await db.token.update({ where: { id: tokenId }, data: { status } });

  if (status === "CURRENT" && token.patientId) {
    await db.notification.create({
      data: {
        patientId: token.patientId,
        title: "It's your turn!",
        message: `Token #${token.tokenNumber} with ${token.doctor.name} is now being called.`,
      },
    });
  }

  return NextResponse.json(updated);
}
