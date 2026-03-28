import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserRow, type RelationStatus } from "@/components/modules/UserRow";

export default async function LoversPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const meId = session.user.id;

  const [allUsers, myMembership, pendingRequests] = await Promise.all([
    db.user.findMany({
      where: { id: { not: meId } },
      select: { id: true, name: true, email: true, phone: true },
      orderBy: { name: "asc" },
    }),
    db.loversGroupMember.findUnique({
      where: { userId: meId },
      include: {
        group: {
          include: {
            members: { include: { user: { select: { id: true, name: true } } } },
          },
        },
      },
    }),
    db.loverRequest.findMany({
      where: { status: "PENDING", OR: [{ fromId: meId }, { toId: meId }] },
      select: { id: true, fromId: true, toId: true },
    }),
  ]);

  const receivedCount = pendingRequests.filter((r) => r.toId === meId).length;
  const myGroupMemberIds = new Set(
    myMembership?.group.members.map((m) => m.userId) ?? [],
  );

  function getStatus(userId: string): RelationStatus {
    if (myGroupMemberIds.has(userId)) return "same_group";
    const req = pendingRequests.find(
      (r) =>
        (r.fromId === meId && r.toId === userId) ||
        (r.toId === meId && r.fromId === userId),
    );
    if (req) return req.fromId === meId ? "pending_sent" : "pending_received";
    return "none";
  }

  const requestsAction = receivedCount > 0 ? (
    <Link
      href="/lovers/requests"
      className="flex items-center gap-1.5 text-sm text-primary font-medium"
    >
      Demandes
      <Badge variant="primary">{receivedCount}</Badge>
    </Link>
  ) : (
    <Link
      href="/lovers/requests"
      className="flex items-center justify-center w-9 h-9 rounded-full text-text-muted hover:bg-onyx/5 transition-colors"
      aria-label="Demandes reçues"
    >
      <Icon name="clock" size={18} />
    </Link>
  );

  return (
    <div className="p-4 space-y-4">
      <PageHeader title="Lovers" action={requestsAction} />

      {/* Groupe actuel */}
      {myMembership ? (
        <Link
          href={`/lovers/${myMembership.groupId}`}
          className="block active:scale-[0.98] transition-transform"
        >
          <Card className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Icon name="users" size={16} className="text-primary" />
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
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lavender/60 flex items-center justify-center shrink-0">
              <Icon name="heart" size={16} className="text-text-muted" />
            </div>
            <p className="text-sm text-text-muted">
              Tu ne fais pas encore partie d&apos;un groupe. Invite quelqu&apos;un !
            </p>
          </div>
        </Card>
      )}

      {/* Liste utilisateurs */}
      {allUsers.length > 0 ? (
        <Card className="p-0 divide-y divide-onyx/6 overflow-hidden">
          {allUsers.map((user) => (
            <div key={user.id} className="px-4 py-3">
              <UserRow
                userId={user.id}
                name={user.name}
                identifier={user.email ?? user.phone ?? null}
                status={getStatus(user.id)}
              />
            </div>
          ))}
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-text-muted text-center py-2">
            Aucun autre utilisateur pour l&apos;instant.
          </p>
        </Card>
      )}
    </div>
  );
}
