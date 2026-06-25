import React from "react";
import type { TipoPago } from "../types";
import {
  TIPO_PAGO_LABELS,
  TIPO_COMBUSTIBLE_LABELS,
  optionsOf,
  labelOf,
} from "../../../lib/enums";
import { formatPotencia } from "../../../lib/format";
import type { GrupoElectrogenoDTO } from "../../inventory/types";
import type { ClienteDTO } from "../../clientes/types";
import ClienteSelector from "../../clientes/components/ClienteSelector";

// Presentational: SalesManager owns the sale state. The seller only fills
// cliente · cantidad · tipo de pago; potencia/combustible/vida are derived
// (read-only) from the group chosen in the panel — never typed.
export default function SalesForm({
  cliente,
  onClienteChange,
  tipoPago,
  onTipoPagoChange,
  cantidad,
  onCantidadChange,
  grupo,
  canSubmit,
  submitting,
  onSubmit,
}: {
  cliente: ClienteDTO | null;
  onClienteChange: (c: ClienteDTO | null) => void;
  tipoPago: TipoPago;
  onTipoPagoChange: (t: TipoPago) => void;
  cantidad: string;
  onCantidadChange: (v: string) => void;
  grupo: GrupoElectrogenoDTO | null;
  canSubmit: boolean;
  submitting?: boolean;
  onSubmit: () => void;
}) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || submitting) return;
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
    >
      <div>
        <label
          htmlFor="venta-cliente"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Cliente
        </label>
        <ClienteSelector value={cliente} onChange={onClienteChange} />
        <p className="mt-1.5 text-xs text-gray-500">
          Buscá un cliente existente o creá uno nuevo sin salir del formulario.
        </p>
      </div>

      {/* Selected group: derived, read-only. Empty until one is picked. */}
      <div>
        <span className="block text-sm font-medium text-gray-700 mb-2">
          Grupo seleccionado
        </span>
        {grupo ? (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-gray-700 space-y-1">
            <div className="font-semibold text-blue-950">{grupo.codigo}</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
              <span>{formatPotencia(grupo.pMin, grupo.pMax)}</span>
              <span>
                {labelOf(TIPO_COMBUSTIBLE_LABELS, grupo.tipoCombustible)}
              </span>
              <span>Vida útil: {grupo.vidaUtil} años</span>
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-500">
            Elegí un grupo en la tabla de abajo.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="venta-tipo-pago"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tipo de pago
          </label>
          <select
            id="venta-tipo-pago"
            value={tipoPago}
            onChange={(e) => onTipoPagoChange(e.target.value as TipoPago)}
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
          <label
            htmlFor="venta-cantidad"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Cantidad
          </label>
          <input
            id="venta-cantidad"
            value={cantidad}
            onChange={(e) => onCantidadChange(e.target.value)}
            inputMode="numeric"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            placeholder="1"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || !!submitting}
        className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Procesando..." : "Procesar venta"}
      </button>
    </form>
  );
}
