// Ce script a servi a migrer les passwordHash de la table users vers accounts.
// La colonne passwordHash a ete supprimee du schema User — ce script est obsolete.
// Il est conserve comme reference historique.

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Ce script de migration est obsolete (passwordHash supprime du schema User).");
  console.log("Les comptes ont deja ete migres vers la table accounts.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
