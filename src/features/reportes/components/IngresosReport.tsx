import React, { useEffect, useState } from "react";
import { getIngresosTotales, getReportePagos } from "../api/reportesApi";
import { formatPEN } from "../../../lib/format";
import { TIPO_PAGO_LABELS } from "../../../lib/enums";
import { Skeleton } from "../../../components/react/ui/Skeleton";
import { card, ReportError, ReportHeader, useReportData } from "./shared";

type IngresosData = {
  total: number;
  porPago: { tipo: "EFECTIVO" | "CHEQUE"; unidades: number }[];
};

async function loadIngresos(): Promise<IngresosData> {
  const [total, efectivo, cheque] = await Promise.all([
    getIngresosTotales(),
    getReportePagos("EFECTIVO"),
    getReportePagos("CHEQUE"),
  ]);
  const sum = (rows: { cantidad: number }[]) =>
    rows.reduce((s, r) => s + r.cantidad, 0);
  return {
    total: total.totalRecaudado,
    porPago: [
      { tipo: "EFECTIVO", unidades: sum(efectivo) },
      { tipo: "CHEQUE", unidades: sum(cheque) },
    ],
  };
}

// Eases a value from 0 to `target` with requestAnimationFrame (easeOutCubic).
function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function BigCounter({ total }: { total: number }) {
  const value = useCountUp(total);
  return (
    <p className="text-5xl font-bold tracking-tight text-blue-950 sm:text-6xl">
      {formatPEN(value)}
    </p>
  );
}

export default function IngresosReport() {
  const { data, loading, error } = useReportData(loadIngresos);

  return (
    <section className="space-y-8">
      <ReportHeader
        title="Ingresos Totales"
        subtitle="Recaudación acumulada y desglose por método de pago."
      />

      {loading ? (
        <div className="space-y-6">
          <div className={`${card} flex flex-col items-center gap-3 py-12`}>
            <Skeleton className="h-12 w-64" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        </div>
      ) : error ? (
        <ReportError error={error} />
      ) : data ? (
        <div className="space-y-6">
          <div className={`${card} flex flex-col items-center gap-2 py-12`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total recaudado
            </p>
            <BigCounter total={data.total} />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {data.porPago.map((p) => (
              <div key={p.tipo} className={card}>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {TIPO_PAGO_LABELS[p.tipo]}
                </p>
                <p className="mt-2 text-3xl font-bold text-blue-950">
                  {p.unidades}
                </p>
                <p className="mt-1 text-sm text-gray-500">unidades vendidas</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
