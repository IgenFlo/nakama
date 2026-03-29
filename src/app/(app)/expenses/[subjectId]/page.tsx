import { getSession } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { AddExpenseForm } from "@/components/modules/AddExpenseForm";
import { DeleteExpenseButton } from "@/components/modules/DeleteExpenseButton";
import { BalanceSummary } from "@/components/modules/BalanceSummary";
import { computeBalance } from "@/lib/balance";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { subjectId } = await params;
  const meId = session.user.id;

  const subject = await db.expenseSubject.findUnique({
    where: { id: subjectId },
    include: {
      group: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
      },
      expenses: {
        orderBy: { date: "desc" },
        include: { paidBy: { select: { id: true, name: true } } },
      },
    },
  });

  if (!subject) notFound();
  if (!subject.group.members.some((m) => m.userId === meId)) redirect("/lovers");

  const members = subject.group.members.map((m) => ({
    id: m.user.id,
    name: m.user.name,
  }));

  const balance = computeBalance(
    subject.expenses.map((e) => ({ paidById: e.paidById, amount: Number(e.amount) })),
    members,
  );

  const totalAmount = subject.expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  );

  return (
    <div className="p-4 space-y-4">
      <PageHeader
        title={subject.name}
        backHref={`/lovers/${subject.groupId}/expenses`}
      />

      {/* Balance */}
      {subject.expenses.length > 0 && (
        <BalanceSummary
          balance={balance}
          members={members}
          total={totalAmount}
          meId={meId}
        />
      )}

      {/* Liste des dépenses */}
      {subject.expenses.length > 0 ? (
        <div className="space-y-1.5">
          <p className="px-1 text-xs text-text-muted uppercase tracking-wide font-medium">
            Dépenses
          </p>
          <Card className="p-0 divide-y divide-onyx/6 overflow-hidden">
            {subject.expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center gap-2 pl-4 pr-2 py-1"
              >
                <div className="flex-1 flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {expense.description || "Sans description"}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {expense.paidBy.id === meId ? "Moi" : expense.paidBy.name}
                      {" · "}
                      {new Date(expense.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-text shrink-0">
                    {Number(expense.amount).toFixed(2)} €
                  </span>
                </div>
                <DeleteExpenseButton expenseId={expense.id} />
              </div>
            ))}
          </Card>
        </div>
      ) : (
        <Card className="py-6 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-lavender/60 flex items-center justify-center">
            <Icon name="wallet" size={20} className="text-text-muted" />
          </div>
          <p className="text-sm text-text-muted text-center">
            Aucune dépense pour l&apos;instant.
          </p>
        </Card>
      )}

      {/* Ajouter */}
      <Card>
        <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-3">
          Ajouter une dépense
        </p>
        <AddExpenseForm subjectId={subjectId} members={members} meId={meId} />
      </Card>
    </div>
  );
}
