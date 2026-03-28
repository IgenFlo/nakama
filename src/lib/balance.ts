export type Member = { id: string; name: string };

export type BalanceTransaction = {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number; // arrondi à 2 décimales
};

export type BalanceResult = {
  totals: Record<string, number>;   // userId → montant total payé
  share: number;                     // part égale par personne
  net: Record<string, number>;       // userId → net (positif = on lui doit, négatif = il doit)
  transactions: BalanceTransaction[];
};

/**
 * Algorithme greedy :
 * 1. Calculer le total payé par personne
 * 2. Calculer la part égale
 * 3. Net = payé - part
 * 4. Matcher le plus gros débiteur avec le plus gros créditeur, itérer
 */
export function computeBalance(
  expenses: { paidById: string; amount: number }[],
  members: Member[],
): BalanceResult {
  const totals: Record<string, number> = {};
  for (const m of members) totals[m.id] = 0;
  for (const e of expenses) {
    totals[e.paidById] = (totals[e.paidById] ?? 0) + e.amount;
  }

  const total = Object.values(totals).reduce((a, b) => a + b, 0);
  const share = members.length > 0 ? total / members.length : 0;

  const net: Record<string, number> = {};
  for (const m of members) {
    net[m.id] = round2((totals[m.id] ?? 0) - share);
  }

  const nameMap = Object.fromEntries(members.map((m) => [m.id, m.name]));

  // Séparer créditeurs (net > 0) et débiteurs (net < 0)
  const creditors = members
    .filter((m) => net[m.id] > 0.005)
    .map((m) => ({ id: m.id, amount: net[m.id] }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = members
    .filter((m) => net[m.id] < -0.005)
    .map((m) => ({ id: m.id, amount: net[m.id] }))
    .sort((a, b) => a.amount - b.amount); // plus négatif en premier

  const transactions: BalanceTransaction[] = [];

  while (creditors.length > 0 && debtors.length > 0) {
    const creditor = creditors[0];
    const debtor = debtors[0];
    const amount = round2(Math.min(creditor.amount, -debtor.amount));

    transactions.push({
      fromId: debtor.id,
      fromName: nameMap[debtor.id] ?? debtor.id,
      toId: creditor.id,
      toName: nameMap[creditor.id] ?? creditor.id,
      amount,
    });

    creditor.amount = round2(creditor.amount - amount);
    debtor.amount = round2(debtor.amount + amount);

    if (creditor.amount < 0.005) creditors.shift();
    if (debtor.amount > -0.005) debtors.shift();
  }

  return { totals, share: round2(share), net, transactions };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
