"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

// ─── Vérifier que l'user est membre du groupe lié à un sujet ─────────────────

async function assertSubjectMember(subjectId: string, userId: string) {
  const subject = await db.expenseSubject.findUnique({
    where: { id: subjectId },
    select: { groupId: true },
  });
  if (!subject) throw new Error("Sujet introuvable");

  const membership = await db.loversGroupMember.findUnique({
    where: { userId },
  });
  if (!membership || membership.groupId !== subject.groupId) {
    throw new Error("Accès refusé");
  }
  return subject.groupId;
}

// ─── Sujets ───────────────────────────────────────────────────────────────────

export async function createSubjectAction(
  groupId: string,
  name: string,
): Promise<{ error?: string; id?: string }> {
  const session = await requireAuth();

  const membership = await db.loversGroupMember.findUnique({
    where: { userId: session.user.id },
  });
  if (!membership || membership.groupId !== groupId) {
    return { error: "Accès refusé" };
  }

  const trimmed = name.trim();
  if (!trimmed) return { error: "Nom requis" };

  const subject = await db.expenseSubject.create({
    data: { groupId, name: trimmed },
  });

  revalidatePath(`/lovers/${groupId}/expenses`);
  return { id: subject.id };
}

export async function deleteSubjectAction(
  subjectId: string,
): Promise<{ error?: string }> {
  const session = await requireAuth();

  try {
    const groupId = await assertSubjectMember(subjectId, session.user.id);
    await db.expenseSubject.delete({ where: { id: subjectId } });
    revalidatePath(`/lovers/${groupId}/expenses`);
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ─── Dépenses ─────────────────────────────────────────────────────────────────

export async function createExpenseAction(data: {
  subjectId: string;
  amount: number;
  description?: string;
  paidById: string;
}): Promise<{ error?: string; id?: string }> {
  const session = await requireAuth();

  try {
    await assertSubjectMember(data.subjectId, session.user.id);
  } catch (e) {
    return { error: (e as Error).message };
  }

  if (data.amount <= 0) return { error: "Montant invalide" };

  const expense = await db.expense.create({
    data: {
      subjectId: data.subjectId,
      paidById: data.paidById,
      amount: data.amount,
      description: data.description?.trim() || null,
    },
  });

  revalidatePath(`/expenses/${data.subjectId}`);
  return { id: expense.id };
}

export async function deleteExpenseAction(
  expenseId: string,
): Promise<{ error?: string }> {
  const session = await requireAuth();

  const expense = await db.expense.findUnique({
    where: { id: expenseId },
    select: { subjectId: true, paidById: true },
  });
  if (!expense) return { error: "Dépense introuvable" };

  try {
    await assertSubjectMember(expense.subjectId, session.user.id);
  } catch (e) {
    return { error: (e as Error).message };
  }

  await db.expense.delete({ where: { id: expenseId } });
  revalidatePath(`/expenses/${expense.subjectId}`);
  return {};
}
