"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-primary/30 bg-primary/10 text-primary",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  info: "border-white/10 bg-white/[0.06] text-foreground",
};

const ICONS: Record<ToastVariant, string> = {
  success: "\u2713",
  error: "\u2717",
  info: "\u2139",
};

function ToastItem({ id, onDismiss, toast }: { id: string; onDismiss: (id: string) => void; toast: Toast }) {
  const onDismissRef = React.useRef(onDismiss);
  onDismissRef.current = onDismiss;

  React.useEffect(() => {
    const timer = setTimeout(() => onDismissRef.current(id), 4000);
    return () => clearTimeout(timer);
  }, [id]);

  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-sm",
        "animate-[slide-in_0.2s_ease-out]",
        VARIANT_STYLES[toast.variant]
      )}
    >
      <span className="shrink-0 font-bold">{ICONS[toast.variant]}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((message: string, variant: ToastVariant = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev.slice(-2), { id, message, variant }]);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <ToastItem key={t.id} id={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
