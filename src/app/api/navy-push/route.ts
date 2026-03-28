import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth-guard";
import { redAlertSchema } from "@/lib/validations";
import { sendPushNotification } from "@/lib/push";

const RATE_LIMIT_MS = 10_000; // 10 secondes

export async function POST(request: Request) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const body = await request.json();
  const parsed = redAlertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 422 },
    );
  }

  const { groupId, message } = parsed.data;
  const userId = session.user.id;

  // Vérifier que l'utilisateur est membre du groupe
  const membership = await db.loversGroupMember.findUnique({
    where: { userId },
  });
  if (!membership || membership.groupId !== groupId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // Rate limit : un Navy Push par groupe toutes les 10 secondes
  const lastAlert = await db.redAlert.findFirst({
    where: { groupId },
    orderBy: { createdAt: "desc" },
  });
  if (lastAlert) {
    const elapsed = Date.now() - lastAlert.createdAt.getTime();
    if (elapsed < RATE_LIMIT_MS) {
      const remaining = Math.ceil((RATE_LIMIT_MS - elapsed) / 1000);
      return NextResponse.json(
        { error: `Attends encore ${remaining}s avant le prochain Navy Push` },
        { status: 429 },
      );
    }
  }

  // Enregistrer l'alerte
  await db.redAlert.create({
    data: { groupId, triggeredById: userId },
  });

  // Récupérer les subscriptions push de tous les membres du groupe (sauf l'expéditeur)
  const subscriptions = await db.pushSubscription.findMany({
    where: {
      user: {
        groupMembership: { groupId },
      },
      userId: { not: userId },
    },
  });

  // Envoyer les notifications en parallèle (erreurs silencieuses par subscription)
  const senderName = session.user.name ?? "Quelqu'un";
  const pushResults = subscriptions.map((sub) =>
    sendPushNotification(
      { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
      {
        title: `🧚‍♀️ Navy Push — ${senderName}`,
        body: message,
        url: `/lovers/${groupId}/navy-push`,
      },
    ).catch(() => null),
  );

  await Promise.all(pushResults);

  return NextResponse.json({ success: true, sent: subscriptions.length });
}
