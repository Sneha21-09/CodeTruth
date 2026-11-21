import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon && <div className="mb-3 rounded-full bg-surface-sunken p-3 text-ink-500">{icon}</div>}
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] text-ink-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-12 text-sm text-ink-500">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}…
    </div>
  );
}
