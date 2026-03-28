"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

// ─── Envoyer une demande ──────────────────────────────────────────────────────

export async function sendLoverRequestAction(
  toUserId: string,
): Promise<{ error?: string }> {
  const session = await requireAuth();
  const fromId = session.user.id;

  if (fromId === toUserId) {
    return { error: "Tu ne peux pas t'envoyer une demande à toi-même" };
  }

  // Vérifie qu'il n'existe pas déjà une demande active entre ces deux users
  const existing = await db.loverRequest.findFirst({
    where: {
      status: "PENDING",
      OR: [
        { fromId, toId: toUserId },
        { fromId: toUserId, toId: fromId },
      ],
    },
  });

  if (existing) {
    return { error: "Une demande est déjà en cours entre vous" };
  }

  // Vérifie que les deux ne sont pas déjà dans le même groupe
  const [fromMembership, toMembership] = await Promise.all([
    db.loversGroupMember.findUnique({ where: { userId: fromId } }),
    db.loversGroupMember.findUnique({ where: { userId: toUserId } }),
  ]);

  if (
    fromMembership &&
    toMembership &&
    fromMembership.groupId === toMembership.groupId
  ) {
    return { error: "Vous faites déjà partie du même groupe" };
  }

  await db.loverRequest.create({
    data: { fromId, toId: toUserId, status: "PENDING" },
  });

  revalidatePath("/lovers");
  return {};
}

// ─── Répondre à une demande ───────────────────────────────────────────────────

export async function respondLoverRequestAction(
  requestId: string,
  accept: boolean,
): Promise<{ error?: string; groupId?: string }> {
  const session = await requireAuth();
  const toId = session.user.id;

  const request = await db.loverRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) return { error: "Demande introuvable" };
  if (request.toId !== toId) return { error: "Accès refusé" };
  if (request.status !== "PENDING") return { error: "Demande déjà traitée" };

  if (!accept) {
    await db.loverRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });
    revalidatePath("/lovers");
    revalidatePath("/lovers/requests");
    return {};
  }

  // ─── Formation du groupe (transaction) ─────────────────────────────────────
  const fromId = request.fromId;

  const groupId = await db.$transaction(async (tx) => {
    const [fromMembership, toMembership] = await Promise.all([
      tx.loversGroupMember.findUnique({ where: { userId: fromId } }),
      tx.loversGroupMember.findUnique({ where: { userId: toId } }),
    ]);

    // Priorité : groupe du demandeur → groupe de l'accepteur → nouveau groupe
    const targetGroupId =
      fromMembership?.groupId ?? toMembership?.groupId ?? null;

    let resolvedGroupId: string;

    if (targetGroupId) {
      resolvedGroupId = targetGroupId;

      // Retirer fromUser de son ancien groupe si différent du groupe cible
      if (fromMembership && fromMembership.groupId !== resolvedGroupId) {
        await tx.loversGroupMember.delete({ where: { userId: fromId } });
        const remaining = await tx.loversGroupMember.count({
          where: { groupId: fromMembership.groupId },
        });
        if (remaining === 0) {
          await tx.loversGroup.delete({ where: { id: fromMembership.groupId } });
        }
      }

      // Retirer toUser de son ancien groupe si différent du groupe cible
      if (toMembership && toMembership.groupId !== resolvedGroupId) {
        await tx.loversGroupMember.delete({ where: { userId: toId } });
        const remaining = await tx.loversGroupMember.count({
          where: { groupId: toMembership.groupId },
        });
        if (remaining === 0) {
          await tx.loversGroup.delete({ where: { id: toMembership.groupId } });
        }
      }

      // Ajouter les membres manquants dans le groupe cible
      const membersInGroup = await tx.loversGroupMember.findMany({
        where: { groupId: resolvedGroupId, userId: { in: [fromId, toId] } },
        select: { userId: true },
      });
      const existingIds = new Set(membersInGroup.map((m) => m.userId));

      const toCreate: { groupId: string; userId: string }[] = [];
      if (!existingIds.has(fromId)) toCreate.push({ groupId: resolvedGroupId, userId: fromId });
      if (!existingIds.has(toId)) toCreate.push({ groupId: resolvedGroupId, userId: toId });

      if (toCreate.length > 0) {
        await tx.loversGroupMember.createMany({ data: toCreate });
      }
    } else {
      // Aucun groupe existant → en créer un nouveau
      const group = await tx.loversGroup.create({
        data: { name: "les chouquettes onctueuses" },
      });
      resolvedGroupId = group.id;
      await tx.loversGroupMember.createMany({
        data: [
          { groupId: resolvedGroupId, userId: fromId },
          { groupId: resolvedGroupId, userId: toId },
        ],
      });
    }

    // Marquer la demande comme acceptée
    await tx.loverRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    });

    return resolvedGroupId;
  });

  revalidatePath("/lovers");
  revalidatePath("/lovers/requests");
  revalidatePath(`/lovers/${groupId}`);

  return { groupId };
}

// ─── Renommer le groupe ────────────────────────────────────────────────────────

export async function updateGroupNameAction(
  groupId: string,
  name: string,
): Promise<{ error?: string }> {
  const session = await requireAuth();

  const membership = await db.loversGroupMember.findUnique({
    where: { userId: session.user.id },
  });
  if (!membership || membership.groupId !== groupId) {
    return { error: "Accès refusé" };
  }

  const trimmed = name.trim();
  if (!trimmed) return { error: "Le nom ne peut pas être vide" };
  if (trimmed.length > 50) return { error: "50 caractères maximum" };

  await db.loversGroup.update({
    where: { id: groupId },
    data: { name: trimmed },
  });

  revalidatePath(`/lovers/${groupId}`);
  revalidatePath("/lovers");
  revalidatePath("/dashboard");
  return {};
}
