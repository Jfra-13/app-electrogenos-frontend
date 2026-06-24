import React, { useMemo, useState } from "react";
import type {
  SolicitudCompraRequestDTO,
  TipoCombustible,
  TipoPago,
} from "../types";
import {
  TIPO_COMBUSTIBLE_LABELS,
  TIPO_PAGO_LABELS,
  optionsOf,
} from "../../../lib/enums";

type FormState = {
  nombreSolicitante: string;
  tipoPago: TipoPago;
  cantidad: string;
  potenciaRequerida: string;
  tipoCombustible: TipoCombustible;
  vidaUtilSolicitada: string;
  entidadId: string;
};

export default function SalesForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (dto: SolicitudCompraRequestDTO) => void;
  submitting?: boolean;
}) {
  const [state, setState] = useState<FormState>({
    nombreSolicitante: "",
    tipoPago: "CHEQUE",
    cantidad: "1",
    potenciaRequerida: "",
    tipoCombustible: "NAFTA",
    vidaUtilSolicitada: "",
    entidadId: "",
  });

  const canSubmit = useMemo(() => {
    if (!state.nombreSolicitante.trim()) return false;
    if (!state.potenciaRequerida.trim()) return false;
    if (!state.vidaUtilSolicitada.trim()) return false;
    if (!state.cantidad.trim()) return false;
    if (!state.entidadId.trim()) return false;

    const potencia = Number(state.potenciaRequerida);
    const vidaUtil = Number(state.vidaUtilSolicitada);
    const cantidad = Number(state.cantidad);
    const entidadId = Number(state.entidadId);

    if (!Number.isFinite(potencia) || potencia <= 0) return false;
    if (!Number.isFinite(vidaUtil) || vidaUtil <= 0) return false;
    if (!Number.isFinite(cantidad) || cantidad <= 0) return false;
    if (!Number.isFinite(entidadId) || entidadId <= 0) return false;

    return true;
  }, [state]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || submitting) return;

    onSubmit({
      nombreSolicitante: state.nombreSolicitante.trim(),
      tipoPago: state.tipoPago,
      cantidad: Number(state.cantidad),
      potenciaRequerida: Number(state.potenciaRequerida),
      tipoCombustible: state.tipoCombustible,
      vidaUtilSolicitada: Number(state.vidaUtilSolicitada),
      entidadId: Number(state.entidadId),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
    >
      <div>
        <label htmlFor="venta-nombre-solicitante" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre del solicitante
        </label>
        <input
          id="venta-nombre-solicitante"
          value={state.nombreSolicitante}
          onChange={(e) =>
            setState((s) => ({ ...s, nombreSolicitante: e.target.value }))
          }
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          placeholder="Nombre y apellido"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="venta-tipo-pago" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de pago
          </label>
          <select
            id="venta-tipo-pago"
            value={state.tipoPago}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                tipoPago: e.target.value as TipoPago,
              }))
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          >
            {optionsOf(TIPO_PAGO_LABELS).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="venta-cantidad" className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad
          </label>
          <input
            id="venta-cantidad"
            value={state.cantidad}
            onChange={(e) =>
              setState((s) => ({ ...s, cantidad: e.target.value }))
            }
            inputMode="numeric"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            placeholder="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="venta-potencia-requerida" className="block text-sm font-medium text-gray-700 mb-2">
            Potencia requerida (kVA)
          </label>
          <input
            id="venta-potencia-requerida"
            value={state.potenciaRequerida}
            onChange={(e) =>
              setState((s) => ({ ...s, potenciaRequerida: e.target.value }))
            }
            inputMode="decimal"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            placeholder="120"
          />
        </div>

        <div>
          <label htmlFor="venta-vida-util" className="block text-sm font-medium text-gray-700 mb-2">
            Vida util (anos)
          </label>
          <input
            id="venta-vida-util"
            value={state.vidaUtilSolicitada}
            onChange={(e) =>
              setState((s) => ({ ...s, vidaUtilSolicitada: e.target.value }))
            }
            inputMode="numeric"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            placeholder="10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="venta-tipo-combustible" className="block text-sm font-medium text-gray-700 mb-2">
            Combustible
          </label>
          <select
            id="venta-tipo-combustible"
            value={state.tipoCombustible}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                tipoCombustible: e.target.value as TipoCombustible,
              }))
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          >
            {optionsOf(TIPO_COMBUSTIBLE_LABELS).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="venta-entidad-id" className="block text-sm font-medium text-gray-700 mb-2">
            Entidad ID
          </label>
          <input
            id="venta-entidad-id"
            value={state.entidadId}
            onChange={(e) =>
              setState((s) => ({ ...s, entidadId: e.target.value }))
            }
            inputMode="numeric"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            placeholder="1"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || !!submitting}
        className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50"
      >
        {submitting ? "Procesando..." : "Procesar Solicitud"}
      </button>
    </form>
  );
}
