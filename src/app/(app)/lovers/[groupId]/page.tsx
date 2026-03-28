import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { EditGroupName } from "@/components/modules/EditGroupName";

export default async function GroupDetailPage({
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
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
    },
  });

  if (!group) notFound();
  if (!group.members.some((m) => m.userId === meId)) redirect("/lovers");

  return (
    <div className="p-4 space-y-4">
      {/* Header avec nom éditable inline */}
      <div className="flex items-center gap-1 min-h-11">
        <Link
          href="/lovers"
          aria-label="Retour"
          className="flex items-center justify-center -ml-2 w-11 h-11 rounded-full text-text-muted hover:bg-onyx/5 active:bg-onyx/10 transition-colors shrink-0"
        >
          <Icon name="chevronLeft" size={22} strokeWidth={2.5} />
        </Link>
        <div className="flex-1 min-w-0">
          <EditGroupName
            groupId={groupId}
            initialName={group.name ?? "les chouquettes onctueuses"}
          />
        </div>
      </div>

      {/* Membres */}
      <Card className="p-0 divide-y divide-onyx/6 overflow-hidden">
        <p className="px-4 pt-3 pb-2 text-xs text-text-muted uppercase tracking-wide font-medium">
          Membres
        </p>
        {group.members.map((m) => (
          <div key={m.userId} className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {m.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text">
                {m.user.name}
                {m.userId === meId ? (
                  <span className="text-text-muted font-normal"> (moi)</span>
                ) : null}
              </p>
              {(m.user.email ?? m.user.phone) ? (
                <p className="text-xs text-text-muted truncate">
                  {m.user.email ?? m.user.phone}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </Card>

      {/* Modules */}
      <div className="space-y-2">
        <p className="px-1 text-xs text-text-muted uppercase tracking-wide font-medium">
          Modules
        </p>

        <Link
          href={`/lovers/${groupId}/expenses`}
          className="block active:scale-[0.98] transition-transform"
        >
          <Card className="flex items-center gap-4 py-3.5">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
              <Icon name="wallet" size={18} className="text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text">Dépenses</p>
              <p className="text-xs text-text-muted mt-0.5">
                Gérer et équilibrer les dépenses communes
              </p>
            </div>
            <Icon name="chevronRight" size={18} className="text-text-muted shrink-0" />
          </Card>
        </Link>

        <Link
          href={`/lovers/${groupId}/navy-push`}
          className="block active:scale-[0.98] transition-transform"
        >
          <Card className="flex items-center gap-4 py-3.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon name="sparkles" size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text">Navy Push</p>
              <p className="text-xs text-text-muted mt-0.5">
                Envoyer une notification à tout le groupe
              </p>
            </div>
            <Icon name="chevronRight" size={18} className="text-text-muted shrink-0" />
          </Card>
        </Link>
      </div>
    </div>
  );
}
