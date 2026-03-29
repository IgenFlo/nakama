@AGENTS.md

# Nakama

App couple/amis : gestion de dépenses partagées, groupes, notifications push. PWA standalone déployée sur Vercel + Neon PostgreSQL.

## Stack

- **Next.js 16** App Router (Server Components, Server Actions)
- **Prisma 7** avec `@prisma/adapter-pg`, client généré dans `src/generated/prisma` (gitignored)
- **NextAuth v5** (beta 30) — JWT, credentials provider (email ou téléphone + bcryptjs)
- **Tailwind CSS v4** avec `@tailwindcss/postcss`
- **Serwist** (service worker PWA, précache, push notifications)
- **web-push** (VAPID) pour les notifications serveur
- **Zod** pour la validation
- **pnpm** comme package manager

## Architecture

```
src/
├── app/
│   ├── (auth)/login/           # Page de connexion
│   ├── (app)/                  # Pages authentifiées (avec BottomNav)
│   │   ├── dashboard/          # Accueil : résumé groupe, requêtes en attente
│   │   ├── lovers/             # Liste utilisateurs, requêtes, [groupId] (détail, expenses, navy-push)
│   │   ├── expenses/[subjectId]/ # Détail dépenses + balance
│   │   ├── settings/           # Profil, toggle notifs, version, logout
│   │   └── admin/users/        # Gestion utilisateurs (ADMIN)
│   ├── api/
│   │   ├── auth/[...nextauth]/ # Handlers NextAuth
│   │   ├── push/subscribe/     # POST/DELETE subscription push
│   │   ├── push/vapid-key/     # GET clé publique VAPID
│   │   ├── navy-push/          # POST envoyer notif groupe (rate limit 10s)
│   │   └── admin/users/        # GET/POST + [id]/reset-password PATCH
│   └── actions/
│       ├── auth.ts             # login, logout
│       ├── admin.ts            # createUser, resetPassword
│       ├── lovers.ts           # sendRequest, respond, updateGroupName
│       └── expenses.ts         # CRUD subjects + expenses
├── components/
│   ├── ui/                     # Button, Card, Input, Icon, PageHeader, PushToggle, LogoutButton, Badge
│   ├── forms/                  # LoginForm, CreateUserForm
│   ├── layout/                 # BottomNav
│   └── modules/                # AddExpenseForm, AddSubjectForm, BalanceSummary, EditGroupName, NavyPushForm, UserRow, etc.
├── lib/
│   ├── auth.ts                 # Config NextAuth (credentials, JWT callbacks)
│   ├── db.ts                   # Singleton PrismaClient avec PrismaPg adapter
│   ├── auth-guard.ts           # getAuthSession, getAdminSession, requireAuth, requireAdmin
│   ├── balance.ts              # Algorithme greedy de répartition des dépenses
│   ├── push.ts                 # sendPushNotification via web-push
│   └── validations.ts          # Schémas Zod (login, user, expense, push, etc.)
├── hooks/
│   └── usePushSubscription.ts  # Hook client push (subscribe/unsubscribe, état, erreur, timeout SW)
├── proxy.ts                    # Middleware auth (redirect login/dashboard, guard admin)
└── sw.ts                       # Service worker (Serwist precache + push handler + notification click)
```

## Design system

Palette définie dans `globals.css` avec tokens Tailwind v4 :

| Token           | Valeur    | Usage                    |
|-----------------|-----------|--------------------------|
| `primary`       | `#4c1036` | Crimson violet — actions  |
| `accent`        | `#3f6c51` | Hunter green — succès     |
| `bg`            | `#fef5ef` | Seashell — fond           |
| `bg-secondary`  | `#dbd7ea` | Lavender — cartes/fonds   |
| `text`          | `#070e0d` | Onyx — texte principal    |
| `text-muted`    | onyx 60%  | Texte secondaire (WCAG)   |

Icônes SVG via `Icon.tsx` (stroke-based, 24x24 viewBox, style Lucide). Pas d'emojis.

## Base de données (Prisma)

Schéma dans `prisma/schema.prisma`. Tables SQL mappées en snake_case (`@@map`).

**Modèles :** User, LoverRequest, LoversGroup, LoversGroupMember, ExpenseSubject, Expense, NavyPush, PushSubscription

**Points clés :**
- Un User ne peut être membre que d'un seul groupe (`groupMembership` est unique)
- La formation de groupe lors de l'acceptation d'une requête est transactionnelle (priorité : groupe expéditeur → groupe receveur → nouveau groupe)
- Le nom de groupe par défaut est "les chouquettes onctueuses"
- `src/generated/prisma` est dans `.gitignore` → le build Vercel fait `prisma generate` avant `next build`

## Déploiement

- **Hosting :** Vercel (free tier)
- **BDD :** Neon PostgreSQL (free tier, URL pooled)
- **GitHub :** compte IgenFlo (SSH key `floehr` via alias `github.com-floehr`)
- **Build script :** `prisma generate && NEXT_PUBLIC_APP_VERSION=0.$(git rev-list --count HEAD) next build`
- **Version :** auto-incrémentée au nombre de commits, affichée dans Settings (format `v0.X`)

### Variables d'environnement Vercel requises

```
DATABASE_URL                    # URL Neon pooled
AUTH_SECRET                     # openssl rand -base64 32
NEXT_PUBLIC_VAPID_PUBLIC_KEY    # Clé publique VAPID (embarquée au build)
VAPID_PRIVATE_KEY               # Clé privée VAPID
VAPID_SUBJECT                   # mailto:smash.nakama@gmail.com
```

## Commandes utiles

```bash
pnpm dev                # Dev local
pnpm build              # Build prod (prisma generate + next build + version)
pnpm db:generate        # Régénérer le client Prisma
pnpm db:push            # Appliquer le schéma à la BDD
pnpm db:seed            # Seeder l'admin (utilise .env.local)
pnpm db:studio          # Interface Prisma Studio
```

## Conventions

- Server Actions dans `src/app/actions/` avec `revalidatePath()` après mutation
- Validation Zod dans `src/lib/validations.ts`, schémas partagés entre actions et API routes
- Auth guard : `requireAuth()` / `requireAdmin()` dans les actions, `getAuthSession()` / `getAdminSession()` dans les API routes
- Composants UI réutilisables dans `src/components/ui/`, modules métier dans `src/components/modules/`
- CSS : pas d'emojis, icônes SVG via `<Icon name="..." />`, safe area iOS via `.pb-safe`
- Le service worker est désactivé en dev (`disable: process.env.NODE_ENV !== "production"`)

## Git multi-compte

L'utilisateur alterne entre Flo-Galadrim et IgenFlo :
```bash
# Pousser sur IgenFlo (ce projet)
git remote set-url origin git@github.com-floehr:IgenFlo/nakama.git

# SSH config : Host github.com-floehr → IdentityFile ~/.ssh/floehr
```
