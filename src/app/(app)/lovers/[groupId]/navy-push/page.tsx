import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { NavyPushForm } from "@/components/modules/NavyPushForm";
import { NavyPushHistory } from "@/components/modules/NavyPushHistory";

const PAGE_SIZE = 20;

export default async function NavyPushPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { groupId } = await params;
  const meId = session.user.id;

  const group = await db.loversGroup.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });

  if (!group) notFound();
  if (!group.members.some((m) => m.userId === meId)) redirect("/lovers");

  const otherMembers = group.members
    .filter((m) => m.userId !== meId)
    .map((m) => m.user.name);

  const pushResults = await db.navyPush.findMany({
    where: { groupId },
    take: PAGE_SIZE + 1,
    orderBy: { createdAt: "desc" },
    include: { triggeredBy: { select: { id: true, name: true } } },
  });

  const hasMore = pushResults.length > PAGE_SIZE;
  const initialItems = (hasMore ? pushResults.slice(0, PAGE_SIZE) : pushResults).map((r) => ({
    id: r.id,
    message: r.message,
    createdAt: r.createdAt.toISOString(),
    triggeredBy: r.triggeredBy,
  }));
  const initialNextCursor = hasMore ? initialItems[initialItems.length - 1].id : null;

  return (
    <div className="p-4 space-y-4">
      <PageHeader title="Navy Push" backHref={`/lovers/${groupId}`} />

      <Card className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Icon name="sparkles" size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-sm text-text">
            Envoie une notification push à{" "}
            {otherMembers.length > 0 ? (
              <span className="font-semibold">{otherMembers.join(", ")}</span>
            ) : (
              "tous les membres"
            )}
            .
          </p>
          <p className="text-xs text-text-muted mt-1.5">
            Limité à un push toutes les 10 secondes.
          </p>
        </div>
      </Card>

      <Card>
        <NavyPushForm groupId={groupId} />
      </Card>

      <NavyPushHistory
        groupId={groupId}
        initialItems={initialItems}
        initialNextCursor={initialNextCursor}
      />
    </div>
  );
}
