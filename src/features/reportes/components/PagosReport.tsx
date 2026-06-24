import React, { useState } from "react";
import { getReportePagos } from "../api/reportesApi";
import type { TipoPago } from "../types";
import { TIPO_PAGO_LABELS } from "../../../lib/enums";
import { Skeleton } from "../../../components/react/ui/Skeleton";
import { card, ReportError, ReportHeader, useReportData } from "./shared";

const TABS: TipoPago[] = ["EFECTIVO", "CHEQUE"];

export default function PagosReport() {
  const [tipo, setTipo] = useState<TipoPago>("EFECTIVO");
  // Refetches whenever the active tab changes.
  const { data, loading, error } = useReportData(
    () => getReportePagos(tipo),
    [tipo],
  );

  const rows = data ?? [];
  const totalCantidad = rows.reduce((sum, r) => sum + r.cantidad, 0);

  return (
    <section className="space-y-8">
      <ReportHeader
        title="Reporte por Pago"
        subtitle="Ventas agrupadas por método de pago."
      />

      <div className="inline-flex rounded-xl bg-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
              tipo === t
                ? "bg-white text-blue-950 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {TIPO_PAGO_LABELS[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={`${card} space-y-3`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : error ? (
        <ReportError error={error} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className={`${card} lg:col-span-2`}>
            {rows.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay ventas con pago en {TIPO_PAGO_LABELS[tipo].toLowerCase()}.
              </p>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      N°
                    </th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Solicitante
                    </th>
                    <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Cantidad
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((r, i) => (
                    <tr key={`${r.solicitante}-${i}`}>
                      <td className="py-3 text-sm font-semibold text-gray-400">
                        {i + 1}
                      </td>
                      <td className="py-3 text-sm text-gray-800">
                        {r.solicitante}
                      </td>
                      <td className="py-3 text-right text-sm font-semibold text-blue-950">
                        {r.cantidad}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>

          <div className={`${card} h-fit`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total {TIPO_PAGO_LABELS[tipo]}
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-950">
              {totalCantidad}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              unidades en {rows.length}{" "}
              {rows.length === 1 ? "venta" : "ventas"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
