"use client";
import { useState, useEffect, useCallback, useRef } from "react";

export type ToastKind = "info" | "success" | "warn";

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

let globalShow: ((msg: string, kind?: ToastKind) => void) | null = null;

/** Call from anywhere — no prop-drilling needed. */
export function showToast(message: string, kind: ToastKind = "info") {
  globalShow?.(message, kind);
}

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const add = useCallback((message: string, kind: ToastKind = "info") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3400);
  }, []);

  useEffect(() => {
    globalShow = add;
    return () => { globalShow = null; };
  }, [add]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-host" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className={"toast toast-" + t.kind}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
