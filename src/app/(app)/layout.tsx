import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import type { Role } from "@/generated/prisma/client";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav role={session.user.role as Role} />
    </div>
  );
}
