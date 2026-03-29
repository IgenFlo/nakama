import { getSession } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { PushToggle } from "@/components/ui/PushToggle";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const name = session.user.name ?? "Utilisateur";
  const email = session.user.email;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="p-4 space-y-4">
      <PageHeader title="Réglages" />

      {/* Profil */}
      <Card className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-lg">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-text truncate">{name}</p>
          {email ? (
            <p className="text-sm text-text-muted truncate">{email}</p>
          ) : null}
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <PushToggle />
      </Card>

      <LogoutButton />

      {/* Version */}
      <p className="text-center text-xs text-text-muted pb-2">
        v{process.env.NEXT_PUBLIC_APP_VERSION ?? "dev"}
      </p>
    </div>
  );
}
