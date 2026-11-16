"use client";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; message: string };
const Ctx = createContext<{ toast: (message: string, kind?: ToastKind) => void }>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setItems((p) => [...p, { id, kind, message }]);
    setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);
  const Icon = { success: CheckCircle2, error: XCircle, info: Info };
  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,360px)] flex-col gap-2">
        {items.map((t) => {
          const I = Icon[t.kind];
          return (
            <div key={t.id} role="status" className="pointer-events-auto flex animate-fadeIn items-start gap-2.5 rounded-lg border border-line bg-white p-3 shadow-pop">
              <I className={cn("mt-0.5 h-4 w-4 shrink-0", t.kind === "success" && "text-ok-600", t.kind === "error" && "text-bad-600", t.kind === "info" && "text-brand-600")} />
              <p className="text-sm text-ink-800">{t.message}</p>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
