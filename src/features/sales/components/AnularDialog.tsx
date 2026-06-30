import React, { useEffect, useRef, useState } from "react";
import type { SolicitudCompraResponseDTO } from "../types";
import { anularVenta } from "../api/ventasApi";
import { ApiError } from "../../../lib/api/http";
import { formatPEN, formatDateTime } from "../../../lib/format";

// Single native <dialog> driven by a state machine: form -> loading ->
// success | error. One window, the content swaps — no stacked modals.
// Reuses the .success-dialog enter/exit transition from global.css.
type Step = "form" | "loading" | "success" | "error";

const AVISO =
  "Anular no borra la venta. La marca como anulada, devuelve el stock y la " +
  "saca de los ingresos. Queda registro de quién y por qué.";

export default function AnularDialog({
  venta,
  onClose,
  onChanged,
}: {
  // The sale to annul. Null keeps the dialog closed.
  venta: SolicitudCompraResponseDTO | null;
  // Plain close: nothing changed on the server.
  onClose: () => void;
  // Server state changed (annulled, or 409 stale) -> parent refetches.
  onChanged: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<Step>("form");
  const [motivo, setMotivo] = useState("");
  const [result, setResult] = useState<SolicitudCompraResponseDTO | null>(null);
  const [errStatus, setErrStatus] = useState<number | null>(null);
  const [errMsg, setErrMsg] = useState("");

  // Sync native dialog with the `venta` prop, resetting the machine on open.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (venta && !el.open) {
      setStep("form");
      setMotivo("");
      setResult(null);
      setErrStatus(null);
      setErrMsg("");
      el.showModal();
    }
    if (!venta && el.open) el.close();
  }, [venta]);

  if (!venta) return <dialog ref={ref} className="success-dialog hidden" />;

  const submit = async () => {
    const reason = motivo.trim();
    if (!reason) return;
    setStep("loading");
    try {
      // The backend returns the annulled sale with the audit fields filled in.
      const updated = await anularVenta(venta.id, reason);
      setResult(updated);
      setStep("success");
    } catch (e) {
      const status = e instanceof ApiError ? e.status : null;
      setErrStatus(status);
      setErrMsg(e instanceof Error ? e.message : "Error anulando la venta.");
      setStep("error");
    }
  };

  // 409 (already annulled) means the list row is stale -> refetch on close.
  const closeAfterError = () => {
    if (errStatus === 409) onChanged();
    else onClose();
  };

  // Esc/backdrop is disabled while loading; otherwise treated as plain close.
  const onDialogClose = () => {
    if (step === "success") onChanged();
    else if (step === "error") closeAfterError();
    else onClose();
  };

  const errorText =
    errStatus === 409
      ? "La venta ya estaba anulada."
      : errStatus === 403
        ? "No tenés permiso para anular ventas (solo ADMIN)."
        : errMsg || "Error de conexión. Probá de nuevo.";

  const canRetry = errStatus !== 409 && errStatus !== 403;

  return (
    <dialog
      ref={ref}
      className="success-dialog m-auto w-full max-w-md rounded-2xl bg-white p-6"
      onClose={onDialogClose}
      onCancel={(e) => {
        // Block Esc during the network call.
        if (step === "loading") e.preventDefault();
      }}
      onClick={(e) => {
        if (step === "loading") return;
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      {step === "form" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-blue-950">Anular venta</h2>
          </div>

          <dl className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Venta</dt>
              <dd className="font-semibold text-gray-900">
                {venta.identificador}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Grupo</dt>
              <dd className="font-semibold text-gray-900">{venta.grupoCodigo}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Total</dt>
              <dd className="font-bold text-blue-950">{formatPEN(venta.total)}</dd>
            </div>
          </dl>

          <p className="text-xs text-gray-600">{AVISO}</p>

          <div>
            <label
              htmlFor="motivo-anulacion"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Motivo <span className="text-red-500">*</span>
            </label>
            <textarea
              id="motivo-anulacion"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Ej.: Cliente canceló la compra"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!motivo.trim()}
              className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anular venta
            </button>
          </div>
        </div>
      )}

      {step === "loading" && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Spinner />
          <p className="text-sm font-medium text-gray-700">Anulando…</p>
        </div>
      )}

      {step === "success" && result && (
        <div className="space-y-4 text-center">
          <span
            aria-hidden="true"
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600"
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
          <h2 className="text-lg font-bold text-blue-950">Anulación exitosa</h2>
          <dl className="rounded-lg bg-gray-50 p-3 text-sm space-y-1 text-left">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Venta</dt>
              <dd className="font-semibold text-gray-900">
                {result.identificador}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Stock devuelto</dt>
              <dd className="font-semibold text-gray-900">
                +{result.cantidad} → {result.grupoCodigo}
              </dd>
            </div>
            {result.anuladaPor && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Anulada por</dt>
                <dd className="font-semibold text-gray-900">
                  {result.anuladaPor} · {formatDateTime(result.anuladaAt)}
                </dd>
              </div>
            )}
          </dl>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="w-full py-2.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600"
          >
            Cerrar
          </button>
        </div>
      )}

      {step === "error" && (
        <div className="space-y-4 text-center">
          <span
            aria-hidden="true"
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600"
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </span>
          <h2 className="text-lg font-bold text-blue-950">No se pudo anular</h2>
          <p className="text-sm text-gray-600">{errorText}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold bg-white hover:bg-gray-50"
            >
              Cerrar
            </button>
            {canRetry && (
              <button
                type="button"
                onClick={() => setStep("form")}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Reintentar
              </button>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin text-orange-500"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.37 0 0 5.37 0 12h4z"
      />
    </svg>
  );
}
