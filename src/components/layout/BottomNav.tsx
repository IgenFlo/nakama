"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { Role } from "@/generated/prisma/client";

type NavItem = { href: string; label: string; icon: IconName };

const appNavItems: NavItem[] = [
  { href: "/dashboard", label: "Accueil", icon: "home" },
  { href: "/lovers", label: "Lovers", icon: "heart" },
  { href: "/settings", label: "Réglages", icon: "settings" },
];

const adminNavItem: NavItem = {
  href: "/admin",
  label: "Admin",
  icon: "shield",
};

interface BottomNavProps {
  role: Role;
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const items =
    role === "ADMIN" ? [...appNavItems, adminNavItem] : appNavItems;

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-onyx/8 flex pb-safe">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "flex flex-1 flex-col items-center gap-1 pt-2.5 pb-2 text-[11px] font-medium transition-colors relative",
              active ? "text-primary" : "text-text-muted",
            ].join(" ")}
          >
            {/* Indicateur actif — ligne en haut */}
            {active ? (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
            ) : null}

            {/* Fond pill sur l'icône active */}
            <span
              className={[
                "flex items-center justify-center w-10 h-6 rounded-full transition-colors",
                active ? "bg-primary/10" : "",
              ].join(" ")}
            >
              <Icon
                name={item.icon}
                size={18}
                strokeWidth={active ? 2.5 : 1.8}
              />
            </span>

            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
