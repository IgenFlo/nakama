import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email ou téléphone requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const createUserSchema = z
  .object({
    name: z.string().min(1, "Nom requis"),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    phone: z.string().min(6, "Téléphone invalide").optional().or(z.literal("")),
    password: z.string().min(8, "Mot de passe minimum 8 caractères"),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email ou téléphone requis",
    path: ["email"],
  });

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Mot de passe minimum 8 caractères"),
});

export const loverRequestSchema = z.object({
  toUserId: z.string().uuid(),
});

export const loverRespondSchema = z.object({
  requestId: z.string().uuid(),
  accept: z.boolean(),
});

export const expenseSubjectSchema = z.object({
  groupId: z.string().uuid(),
  name: z.string().min(1, "Nom requis"),
});

export const expenseSchema = z.object({
  subjectId: z.string().uuid(),
  amount: z.number().positive("Montant doit être positif"),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
});

export const redAlertSchema = z.object({
  groupId: z.string().uuid(),
  message: z.string().min(1, "Message requis").max(200, "200 caractères max"),
});

export const pushSubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});
