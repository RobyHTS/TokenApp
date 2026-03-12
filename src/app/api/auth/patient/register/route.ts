import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { createSessionToken } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, password } = await req.json();

    if (!name || !phone || !password) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const existing = await db.patient.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: "Account with this phone already exists" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const patient = await db.patient.create({
      data: { name, phone, password: hashedPassword },
    });

    const token = createSessionToken({ userId: patient.id, role: "patient", name: patient.name });
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ id: patient.id, name: patient.name });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
