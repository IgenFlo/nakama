"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-seashell hover:opacity-90 active:opacity-75 active:scale-[0.97]",
  secondary:
    "bg-lavender/60 text-text hover:bg-lavender active:bg-lavender active:scale-[0.97]",
  danger:
    "bg-red-600 text-white hover:opacity-90 active:opacity-75 active:scale-[0.97]",
  ghost:
    "bg-transparent text-text hover:bg-onyx/5 active:bg-onyx/10 active:scale-[0.97]",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium",
        "transition-all duration-100",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
