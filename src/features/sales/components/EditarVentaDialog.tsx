import React, { useEffect, useRef, useState } from "react";
import type { SolicitudCompraResponseDTO } from "../types";
import { actualizarVenta } from "../api/ventasApi";
import { ApiError } from "../../../lib/api/http";
import {
  TIPO_COMBUSTIBLE_LABELS,
  TIPO_PAGO_LABELS,
  labelOf,
} from "../../../lib/enums";
import { formatPEN } from "../../../lib/format";

// Narrowed edit: only `nombreSolicitante` is mutable. Everything financial is
// shown read-only — to change it you annul and recreate. Same single-<dialog>
// state machine as AnularDialog (form -> loading -> success | error).
type Step = "form" | "loading" | "success" | "error";

const AVISO =
  "¿Necesitás cambiar tipo de pago, cantidad o grupo? Eso no se edita: " +
  "anulá la venta y registrá una nueva.";

export default function EditarVentaDialog({
  venta,
  onClose,
  onChanged,
}: {
  venta: SolicitudCompraResponseDTO | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<Step>("form");
  const [nombre, setNombre] = useState("");
  const [errStatus, setErrStatus] = useState<number | null>(null);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (venta && !el.open) {
      setStep("form");
      setNombre(venta.nombreSolicitante);
      setErrStatus(null);
      setErrMsg("");
      el.showModal();
    }
    if (!venta && el.open) el.close();
  }, [venta]);

  if (!venta) return <dialog ref={ref} className="success-dialog hidden" />;

  const trimmed = nombre.trim();
  const canSave = trimmed.length > 0 && trimmed !== venta.nombreSolicitante;

  const submit = async () => {
    if (!canSave) return;
    setStep("loading");
    try {
      await actualizarVenta(venta.id, { nombreSolicitante: trimmed });
      setStep("success");
    } catch (e) {
      setErrStatus(e instanceof ApiError ? e.status : null);
      setErrMsg(e instanceof Error ? e.message : "Error actualizando la venta.");
      setStep("error");
    }
  };

  const onDialogClose = () => {
    if (step === "success") onChanged();
    // 409 means the sale is annulled -> the row is stale, refetch.
    else if (step === "error" && errStatus === 409) onChanged();
    else onClose();
  };

  const errorText =
    errStatus === 409
      ? "No se puede editar una venta anulada."
      : errStatus === 403
        ? "No tenés permiso para editar ventas (solo ADMIN)."
        : errMsg || "Error de conexión. Probá de nuevo.";

  const canRetry = errStatus !== 409 && errStatus !== 403;

  return (
    <dialog
      ref={ref}
      className="success-dialog m-auto w-full max-w-md rounded-2xl bg-white p-6"
      onClose={onDialogClose}
      onCancel={(e) => {
        if (step === "loading") e.preventDefault();
      }}
      onClick={(e) => {
        if (step === "loading") return;
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      {step === "form" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-blue-950">Editar venta</h2>

          <div>
            <label
              htmlFor="edit-nombre"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre del solicitante <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={150}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          {/* Read-only financial fields: shown for context, never editable. */}
          <dl className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <ReadOnlyRow label="Identificador" value={venta.identificador} />
            <ReadOnlyRow label="Grupo" value={venta.grupoCodigo} />
            <ReadOnlyRow
              label="Tipo de pago"
              value={labelOf(TIPO_PAGO_LABELS, venta.tipoPago)}
            />
            <ReadOnlyRow label="Cantidad" value={String(venta.cantidad)} />
            <ReadOnlyRow
              label="Potencia"
              value={`${venta.potenciaRequerida} kVA`}
            />
            <ReadOnlyRow
              label="Combustible"
              value={labelOf(TIPO_COMBUSTIBLE_LABELS, venta.tipoCombustible)}
            />
            <ReadOnlyRow label="Total" value={formatPEN(venta.total)} />
          </dl>

          <p className="text-xs text-gray-600">{AVISO}</p>

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
              disabled={!canSave}
              className="flex-1 py-2.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {step === "loading" && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Spinner />
          <p className="text-sm font-medium text-gray-700">Guardando…</p>
        </div>
      )}

      {step === "success" && (
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
          <h2 className="text-lg font-bold text-blue-950">Venta actualizada</h2>
          <p className="text-sm text-gray-600">
            Nuevo solicitante: <span className="font-semibold">{trimmed}</span>
          </p>
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
          <h2 className="text-lg font-bold text-blue-950">No se pudo guardar</h2>
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
                className="flex-1 py-2.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600"
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

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-semibold text-gray-900">{value}</dd>
    </div>
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
