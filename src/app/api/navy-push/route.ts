import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth-guard";
import { navyPushSchema } from "@/lib/validations";
import { sendPushNotification } from "@/lib/push";

const RATE_LIMIT_MS = 10_000;

export async function POST(request: Request) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const body = await request.json();
  const parsed = navyPushSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 422 },
    );
  }

  const { groupId, message } = parsed.data;
  const userId = session.user.id;

  const membership = await db.loversGroupMember.findUnique({
    where: { userId },
  });
  if (!membership || membership.groupId !== groupId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const lastPush = await db.navyPush.findFirst({
    where: { groupId },
    orderBy: { createdAt: "desc" },
  });
  if (lastPush) {
    const elapsed = Date.now() - lastPush.createdAt.getTime();
    if (elapsed < RATE_LIMIT_MS) {
      const remaining = Math.ceil((RATE_LIMIT_MS - elapsed) / 1000);
      return NextResponse.json(
        { error: `Attends encore ${remaining}s avant le prochain Navy Push` },
        { status: 429 },
      );
    }
  }

  await db.navyPush.create({
    data: { groupId, triggeredById: userId, message },
  });

  const subscriptions = await db.pushSubscription.findMany({
    where: {
      user: {
        groupMembership: { groupId },
      },
      userId: { not: userId },
    },
  });

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

  revalidatePath(`/lovers/${groupId}/navy-push`);

  return NextResponse.json({ success: true, sent: subscriptions.length });
}
