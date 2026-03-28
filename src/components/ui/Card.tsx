interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl bg-white border border-onyx/8 shadow-[0_1px_4px_rgba(7,14,13,0.07)] p-4",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
