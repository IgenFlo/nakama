import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth-guard";
import { pushSubscribeSchema } from "@/lib/validations";

// Enregistrer ou mettre à jour une subscription
export async function POST(request: Request) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const body = await request.json();
  const parsed = pushSubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 422 },
    );
  }

  const { endpoint, keys } = parsed.data;

  await db.pushSubscription.upsert({
    where: { endpoint },
    create: {
      userId: session.user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    update: {
      userId: session.user.id,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });

  return NextResponse.json({ success: true });
}

// Supprimer une subscription (désinscription)
export async function DELETE(request: Request) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const body = await request.json() as { endpoint?: string };
  if (!body.endpoint) {
    return NextResponse.json({ error: "endpoint requis" }, { status: 422 });
  }

  await db.pushSubscription.deleteMany({
    where: { endpoint: body.endpoint, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
