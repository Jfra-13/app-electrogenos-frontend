import React, { useEffect, useRef } from "react";
import type { SolicitudCompraResponseDTO } from "../types";
import SummaryCard from "./SummaryCard";

// Native <dialog>: gives backdrop, Esc-to-close and focus management for free.
// Enter/exit animation lives in global.css (gated by prefers-reduced-motion).
// Replaces the old inline swap of SummaryCard.
export default function SuccessDialog({
  data,
  onNewSale,
}: {
  data: SolicitudCompraResponseDTO | null;
  onNewSale: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  // Sync the native dialog with React state. showModal() handles focus + Esc.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (data && !el.open) el.showModal();
    if (!data && el.open) el.close();
  }, [data]);

  return (
    <dialog
      ref={ref}
      className="success-dialog m-auto w-full max-w-md rounded-2xl bg-transparent p-0"
      // Esc or backdrop close -> treat as starting a new sale (resets flow).
      onClose={onNewSale}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      {data && (
        <div className="space-y-3">
          <div className="flex flex-col items-center gap-2 text-center">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-blue-950">
              ¡Venta registrada!
            </h2>
          </div>

          <SummaryCard data={data} onNewSale={onNewSale} />

          <a
            href="/admin/ventas/historial"
            className="block w-full text-center py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold bg-white hover:bg-gray-50"
          >
            Ver historial
          </a>
        </div>
      )}
    </dialog>
  );
}
