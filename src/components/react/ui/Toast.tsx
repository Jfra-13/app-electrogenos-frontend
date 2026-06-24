import { useSyncExternalStore } from "react";
import { cn } from "../../../lib/cn";

type Tone = "success" | "error" | "info";
type Toast = { id: number; message: string; tone: Tone };

const tones: Record<Tone, string> = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-blue-950 text-white",
};

const DISMISS_MS = 4000;

// Module-level singleton store so notify() works from any island without a
// provider. Astro mounts each island as its own React root; a Context provider
// would not be shared across them, but a shared module is.
let toasts: Toast[] = [];
let seq = 0;
const listeners = new Set<() => void>();

function publish() {
  listeners.forEach((l) => l());
}

function remove(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  publish();
}

export function notify(message: string, tone: Tone = "info") {
  const id = ++seq;
  toasts = [...toasts, { id, message, tone }];
  publish();
  setTimeout(() => remove(id), DISMISS_MS);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// Render once per page (in any island). It subscribes to the shared store.
export function ToastViewport() {
  const list = useSyncExternalStore(
    subscribe,
    () => toasts,
    () => toasts,
  );
  return (
    <div
      role="region"
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      {list.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => remove(t.id)}
          className={cn(
            "pointer-events-auto rounded-lg px-4 py-3 text-sm font-medium shadow-lg",
            tones[t.tone],
          )}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
