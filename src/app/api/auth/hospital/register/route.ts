import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { createSessionToken } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, location, phone, email, password } = body;

    if (!name || !location || !phone || !password) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const existing = await db.hospital.findFirst({
      where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Hospital with this phone/email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const hospital = await db.hospital.create({
      data: { name, location, phone, email: email || null, password: hashedPassword },
    });

    const token = createSessionToken({ userId: hospital.id, role: "hospital", name: hospital.name });
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ id: hospital.id, name: hospital.name });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
