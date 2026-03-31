import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth-guard";
import { resetPasswordSchema } from "@/lib/validations";
import bcryptjs from "bcryptjs";

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { session, error } = await getAdminSession();
  if (error) return error;

  const { id } = await ctx.params;

  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 422 },
    );
  }

  const passwordHash = await bcryptjs.hash(parsed.data.password, 12);

  try {
    await db.account.updateMany({
      where: { userId: id, providerId: "credential" },
      data: { password: passwordHash },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }
}
