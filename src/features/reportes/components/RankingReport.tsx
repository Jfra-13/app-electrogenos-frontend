import React, { useEffect, useState } from "react";
import { getRankingClientes } from "../api/reportesApi";
import { Skeleton } from "../../../components/react/ui/Skeleton";
import { card, ReportError, ReportHeader, useReportData } from "./shared";

const trophy = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8m-4-4v4m-5-17h10v4a5 5 0 01-10 0V4zm0 1H5a2 2 0 002 4m10-4h2a2 2 0 01-2 4" />
  </svg>
);

export default function RankingReport() {
  const { data, loading, error } = useReportData(getRankingClientes);

  // Bars grow from 0 to final width once data is on screen.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    if (data) {
      const id = requestAnimationFrame(() => setGrown(true));
      return () => cancelAnimationFrame(id);
    }
  }, [data]);

  const ranking = [...(data ?? [])].sort(
    (a, b) => b.totalSolicitados - a.totalSolicitados,
  );
  const max = ranking[0]?.totalSolicitados || 1;

  return (
    <section className="space-y-8">
      <ReportHeader
        title="Ranking de Clientes"
        subtitle="Clientes ordenados por cantidad total de grupos solicitados."
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
          <p className="text-sm text-gray-500">Sin datos de ranking.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {ranking.map((c, i) => {
            const first = i === 0;
            return (
              <li
                key={c.nombreEntidad}
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
                    {first ? trophy : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="truncate font-semibold text-blue-950">
                        {c.nombreEntidad}
                      </span>
                      <span className="shrink-0 text-sm font-bold text-blue-950">
                        {c.totalSolicitados}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-orange-500 transition-[width] duration-700 ease-out motion-reduce:transition-none"
                        style={{
                          width: grown
                            ? `${(c.totalSolicitados / max) * 100}%`
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
