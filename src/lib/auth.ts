import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import bcryptjs from "bcryptjs";
import { dbBase } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(dbBase, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    password: {
      hash: (password) => bcryptjs.hash(password, 12),
      verify: ({ hash, password }) => bcryptjs.compare(password, hash),
    },
  },
  user: {
    modelName: "User",
    additionalFields: {
      phone: { type: "string", required: false },
      role: {
        type: "string",
        required: false,
        defaultValue: "FRIEND",
        input: false,
      },
    },
  },
  session: { modelName: "Session" },
  account: { modelName: "Account" },
  verification: { modelName: "Verification" },
  advanced: {
    cookiePrefix: "nakama",
    generateId: () => crypto.randomUUID(),
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
