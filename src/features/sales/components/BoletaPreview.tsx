import React from "react";
import type { GrupoElectrogenoDTO } from "../../inventory/types";
import {
  TIPO_COMBUSTIBLE_LABELS,
  labelOf,
} from "../../../lib/enums";
import { formatPEN, formatPotencia } from "../../../lib/format";

// Live receipt derived from the group already loaded in the panel — no extra
// fetch. Sits in a sticky column next to the form so the seller sees the real
// price, total and available stock before confirming the sale.
export default function BoletaPreview({
  grupo,
  cantidad,
}: {
  grupo: GrupoElectrogenoDTO | null;
  cantidad: number;
}) {
  if (!grupo) {
    return (
      <aside className="lg:sticky lg:top-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-blue-950">Boleta</h3>
        <p className="mt-2 text-sm text-gray-500">
          Elegí un grupo de la tabla para ver el detalle de la venta.
        </p>
      </aside>
    );
  }

  const stock = grupo.stock ?? 0;
  const precio = grupo.precioVentaCalculado ?? 0;
  const qty = Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 0;
  const total = precio * qty;
  const excedeStock = qty > stock;

  return (
    <aside className="lg:sticky lg:top-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-blue-950">Boleta</h3>
        <p className="text-xs text-gray-500">Detalle en vivo de la venta</p>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Grupo</span>
          <span className="font-semibold text-gray-900">{grupo.codigo}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Potencia</span>
          <span className="font-semibold text-gray-900">
            {formatPotencia(grupo.pMin, grupo.pMax)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Combustible</span>
          <span className="font-semibold text-gray-900">
            {labelOf(TIPO_COMBUSTIBLE_LABELS, grupo.tipoCombustible)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Precio unitario</span>
          <span className="font-semibold text-gray-900">
            {formatPEN(precio)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Cantidad</span>
          <span className="font-semibold text-gray-900">{qty}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Stock disponible</span>
          <span
            className={`font-semibold ${
              excedeStock ? "text-red-600" : "text-gray-900"
            }`}
          >
            {stock}
          </span>
        </div>
        <div className="flex justify-between gap-4 border-t border-gray-100 pt-3">
          <span className="text-gray-500">Total</span>
          <span className="text-xl font-bold text-blue-950">
            {formatPEN(total)}
          </span>
        </div>
      </div>

      {excedeStock && (
        <p className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100">
          La cantidad supera el stock disponible ({stock}).
        </p>
      )}
    </aside>
  );
}
