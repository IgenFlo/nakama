import { getSession } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { LoverRequestCard } from "@/components/modules/LoverRequestCard";

export default async function LoverRequestsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const meId = session.user.id;

  const requests = await db.loverRequest.findMany({
    where: { toId: meId, status: "PENDING" },
    include: {
      from: { select: { name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/lovers" className="text-text-muted text-lg leading-none">
          ‹
        </Link>
        <h1 className="text-xl font-bold text-text">Demandes reçues</h1>
      </div>

      {requests.length === 0 ? (
        <Card>
          <p className="text-sm text-text-muted">
            Aucune demande en attente.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id}>
              <LoverRequestCard
                requestId={req.id}
                fromName={req.from.name}
                fromIdentifier={req.from.email ?? req.from.phone ?? null}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
