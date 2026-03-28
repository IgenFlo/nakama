import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        className={[
          "h-11 rounded-xl border px-3.5 text-sm text-text bg-white outline-none transition-colors",
          "placeholder:text-text-muted",
          error
            ? "border-red-400 focus:border-red-500"
            : "border-onyx/15 focus:border-primary",
          className,
        ].join(" ")}
        {...props}
      />
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
