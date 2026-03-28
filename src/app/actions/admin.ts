"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { createUserSchema, resetPasswordSchema } from "@/lib/validations";
import bcryptjs from "bcryptjs";

type ActionResult = { success: true } | { error: string };

export async function createUserAction(data: {
  name: string;
  email?: string;
  phone?: string;
  password: string;
}): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Accès refusé" };
  }

  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const email = data.email?.trim() || null;
  const phone = data.phone?.trim() || null;

  if (!email && !phone) {
    return { error: "Email ou téléphone requis" };
  }

  const passwordHash = await bcryptjs.hash(data.password, 12);

  try {
    await db.user.create({
      data: {
        name: data.name.trim(),
        email,
        phone,
        passwordHash,
        role: "FRIEND",
      },
    });
    return { success: true };
  } catch {
    return { error: "Email ou téléphone déjà utilisé" };
  }
}

export async function resetPasswordAction(
  userId: string,
  password: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Accès refusé" };
  }

  const parsed = resetPasswordSchema.safeParse({ password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const passwordHash = await bcryptjs.hash(password, 12);

  try {
    await db.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { success: true };
  } catch {
    return { error: "Utilisateur introuvable" };
  }
}
