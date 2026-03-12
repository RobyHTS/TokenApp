import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const hospitals = await db.hospital.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      phone: true,
      doctors: {
        select: {
          id: true,
          name: true,
          specialization: true,
          status: true,
          tokenEnabled: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(hospitals);
}
