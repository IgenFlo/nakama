import { getSession } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const meId = session.user.id;

  const [myMembership, pendingCount] = await Promise.all([
    db.loversGroupMember.findUnique({
      where: { userId: meId },
      include: {
        group: {
          include: {
            members: { include: { user: { select: { name: true, id: true } } } },
          },
        },
      },
    }),
    db.loverRequest.count({ where: { toId: meId, status: "PENDING" } }),
  ]);

  return (
    <div className="p-4 space-y-5">
      <div className="pt-1">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wide">
          Bonjour
        </p>
        <h1 className="text-2xl font-bold text-text mt-0.5">
          {session.user.name}
        </h1>
      </div>

      {/* Groupe */}
      {myMembership ? (
        <Link
          href={`/lovers/${myMembership.groupId}`}
          className="block active:scale-[0.98] transition-transform"
        >
          <Card className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Icon name="heart" size={18} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text truncate">
                  {myMembership.group.name ?? "les chouquettes onctueuses"}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {myMembership.group.members
                    .map((m) => (m.userId === meId ? "Moi" : m.user.name))
                    .join(" & ")}
                </p>
              </div>
            </div>
            <Icon name="chevronRight" size={18} className="text-text-muted shrink-0" />
          </Card>
        </Link>
      ) : (
        <Link
          href="/lovers"
          className="block active:scale-[0.98] transition-transform"
        >
          <Card className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-lavender/60 flex items-center justify-center shrink-0">
                <Icon name="userPlus" size={18} className="text-text-muted" />
              </div>
              <p className="text-sm text-text-muted">
                Pas encore de groupe — invite quelqu&apos;un
              </p>
            </div>
            <Icon name="chevronRight" size={18} className="text-text-muted shrink-0" />
          </Card>
        </Link>
      )}

      {/* Demandes en attente */}
      {pendingCount > 0 && (
        <Link
          href="/lovers/requests"
          className="block active:scale-[0.98] transition-transform"
        >
          <Card className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Icon name="heart" size={18} className="text-primary" />
              </div>
              <p className="text-sm font-medium text-text">Demandes reçues</p>
            </div>
            <Badge variant="primary">{pendingCount}</Badge>
          </Card>
        </Link>
      )}
    </div>
  );
}
