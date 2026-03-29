import { getSession } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { AddSubjectForm } from "@/components/modules/AddSubjectForm";
import { DeleteSubjectButton } from "@/components/modules/DeleteSubjectButton";

export default async function ExpensesPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { groupId } = await params;
  const meId = session.user.id;

  const group = await db.loversGroup.findUnique({
    where: { id: groupId },
    include: {
      members: { select: { userId: true } },
      expenseSubjects: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { expenses: true } } },
      },
    },
  });

  if (!group) notFound();
  if (!group.members.some((m) => m.userId === meId)) redirect("/lovers");

  return (
    <div className="p-4 space-y-4">
      <PageHeader title="Dépenses" backHref={`/lovers/${groupId}`} />

      {/* Sujets */}
      {group.expenseSubjects.length > 0 ? (
        <Card className="p-0 divide-y divide-onyx/6 overflow-hidden">
          {group.expenseSubjects.map((subject) => (
            <div key={subject.id} className="flex items-center gap-2 pl-4 pr-2 py-1">
              <Link
                href={`/expenses/${subject.id}`}
                className="flex-1 flex items-center justify-between gap-3 py-2 active:opacity-70 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon name="wallet" size={15} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">
                      {subject.name}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {subject._count.expenses} dépense
                      {subject._count.expenses !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <Icon name="chevronRight" size={16} className="text-text-muted" />
              </Link>
              <DeleteSubjectButton subjectId={subject.id} />
            </div>
          ))}
        </Card>
      ) : (
        <Card className="py-6 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-lavender/60 flex items-center justify-center">
            <Icon name="wallet" size={20} className="text-text-muted" />
          </div>
          <p className="text-sm text-text-muted text-center">
            Aucun sujet pour l&apos;instant.<br />Crée-en un ci-dessous.
          </p>
        </Card>
      )}

      {/* Nouveau sujet */}
      <Card>
        <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-3">
          Nouveau sujet
        </p>
        <AddSubjectForm groupId={groupId} />
      </Card>
    </div>
  );
}
