import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth-guard";
import { createUserSchema } from "@/lib/validations";
import bcryptjs from "bcryptjs";

export async function GET() {
  const { session, error } = await getAdminSession();
  if (error) return error;

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const { session, error } = await getAdminSession();
  if (error) return error;

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 422 },
    );
  }

  const email = (body.email as string)?.trim() || null;
  const phone = (body.phone as string)?.trim() || null;

  if (!email && !phone) {
    return NextResponse.json({ error: "Email ou téléphone requis" }, { status: 422 });
  }

  const passwordHash = await bcryptjs.hash(body.password as string, 12);

  try {
    const user = await db.user.create({
      data: {
        name: (body.name as string).trim(),
        email,
        phone,
        passwordHash,
        role: "FRIEND",
      },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Email ou téléphone déjà utilisé" }, { status: 409 });
  }
}
