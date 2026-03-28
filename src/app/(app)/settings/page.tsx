import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { PushToggle } from "@/components/ui/PushToggle";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true },
  });

  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="p-4 space-y-4">
      <PageHeader title="Réglages" />

      {/* Profil */}
      <Card className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-lg">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-text truncate">{user?.name}</p>
          {user?.email ? (
            <p className="text-sm text-text-muted truncate">{user.email}</p>
          ) : null}
          {user?.phone ? (
            <p className="text-sm text-text-muted truncate">{user.phone}</p>
          ) : null}
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <PushToggle />
      </Card>

      <LogoutButton />
    </div>
  );
}
