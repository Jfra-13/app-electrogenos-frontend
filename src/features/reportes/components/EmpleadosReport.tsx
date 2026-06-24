import React, { useEffect, useState } from "react";
import { getVentasPorEmpleado } from "../api/reportesApi";
import { formatPEN } from "../../../lib/format";
import { Skeleton } from "../../../components/react/ui/Skeleton";
import { card, ReportError, ReportHeader, useReportData } from "./shared";

export default function EmpleadosReport() {
  const { data, loading, error } = useReportData(getVentasPorEmpleado);

  // Bars grow from 0 to final width once data is on screen.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    if (data) {
      const id = requestAnimationFrame(() => setGrown(true));
      return () => cancelAnimationFrame(id);
    }
  }, [data]);

  const ranking = [...(data ?? [])].sort(
    (a, b) => b.totalRecaudado - a.totalRecaudado,
  );
  const max = ranking[0]?.totalRecaudado || 1;

  return (
    <section className="space-y-8">
      <ReportHeader
        title="Ranking por Empleado"
        subtitle="Vendedores ordenados por total recaudado."
      />

      {loading ? (
        <div className={`${card} space-y-4`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <ReportError error={error} />
      ) : ranking.length === 0 ? (
        <div className={card}>
          <p className="text-sm text-gray-500">
            Sin ventas atribuidas a empleados todavía.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {ranking.map((e, i) => {
            const first = i === 0;
            return (
              <li
                key={e.vendedor}
                className={`${card} ${first ? "ring-1 ring-orange-200 bg-orange-50/40" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      first
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="truncate font-semibold text-blue-950">
                        {e.vendedor}
                      </span>
                      <span className="shrink-0 text-sm font-bold text-blue-950">
                        {formatPEN(e.totalRecaudado)}
                      </span>
                    </div>
                    <div className="mb-2 text-xs text-gray-500">
                      {e.cantidadVentas} venta{e.cantidadVentas === 1 ? "" : "s"}
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-orange-500 transition-[width] duration-700 ease-out motion-reduce:transition-none"
                        style={{
                          width: grown
                            ? `${(e.totalRecaudado / max) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
