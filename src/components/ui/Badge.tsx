type Variant = "primary" | "success" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-crimson-violet/10 text-crimson-violet",
  success: "bg-hunter-green/10 text-hunter-green",
  neutral: "bg-lavender text-onyx/60",
};

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
