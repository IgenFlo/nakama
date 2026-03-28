import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

interface PageHeaderProps {
  title: string;
  backHref?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, backHref, action }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-1 min-h-11">
      {backHref ? (
        <Link
          href={backHref}
          className="flex items-center justify-center -ml-2 w-11 h-11 rounded-full text-text-muted hover:bg-onyx/5 active:bg-onyx/10 transition-colors shrink-0"
          aria-label="Retour"
        >
          <Icon name="chevronLeft" size={22} strokeWidth={2.5} />
        </Link>
      ) : null}
      <h1 className="flex-1 text-xl font-bold text-text">{title}</h1>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
