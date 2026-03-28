import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserListItem } from "@/components/modules/UserListItem";
import { AdminUsersClient } from "./AdminUsersClient";

export default async function AdminUsersPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, phone: true, role: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-4 space-y-4">
      <PageHeader
        title="Utilisateurs"
        action={
          <span className="text-sm text-text-muted">
            {users.length} compte{users.length > 1 ? "s" : ""}
          </span>
        }
      />

      <AdminUsersClient />

      <Card className="p-0 overflow-hidden">
        {users.length === 0 ? (
          <p className="p-6 text-sm text-text-muted text-center">
            Aucun utilisateur
          </p>
        ) : (
          <ul className="divide-y divide-onyx/6">
            {users.map((user) => (
              <UserListItem key={user.id} user={user} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
