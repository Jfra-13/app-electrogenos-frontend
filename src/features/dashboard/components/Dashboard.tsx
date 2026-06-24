import React, { useEffect, useState, type ReactNode } from "react";
import { listGruposElectrogenos } from "../../inventory/api/gruposElectrogenosApi";
import { listVentas } from "../../sales/api/ventasApi";
import { getIngresosTotales, getRankingClientes } from "../api/dashboardApi";
import { Skeleton } from "../../../components/react/ui/Skeleton";
import { formatPEN } from "../../../lib/format";

type AsyncState<T> = { data?: T; loading: boolean; error?: string };

// One-shot loader: runs `fn` once on mount, tracks loading/data/error.
function useAsync<T>(fn: () => Promise<T>): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ loading: true });
  useEffect(() => {
    let alive = true;
    fn()
      .then((data) => alive && setState({ data, loading: false }))
      .catch(
        (e) =>
          alive &&
          setState({
            loading: false,
            error: e instanceof Error ? e.message : "Error desconocido",
          }),
      );
    return () => {
      alive = false;
    };
    // fn is created fresh per render but the load must run only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return state;
}

const card = "bg-white rounded-2xl border border-gray-100 shadow-sm p-6";

function KpiCard({
  label,
  value,
  loading,
  error,
  icon,
}: {
  label: string;
  value: ReactNode;
  loading: boolean;
  error?: string;
  icon: ReactNode;
}) {
  return (
    <div className={card}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </p>
        <span className="text-orange-500">{icon}</span>
      </div>
      <div className="mt-3">
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <p className="text-2xl font-bold text-blue-950">{value}</p>
        )}
      </div>
    </div>
  );
}

// Minimal inline icons (lucide-react is not installed).
const icons = {
  grid: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  cart: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005.414 17H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  money: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m0-6a9 9 0 110 0z" />
    </svg>
  ),
  box: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
};

export default function Dashboard() {
  // size: 200 covers both Total Grupos (totalElements) and Stock Total (sum of content).
  const grupos = useAsync(() => listGruposElectrogenos({ size: 200 }));
  const ventas = useAsync(() => listVentas({ size: 5 }));
  const ingresos = useAsync(getIngresosTotales);
  const ranking = useAsync(getRankingClientes);

  const stockTotal = grupos.data?.content.reduce(
    (sum, g) => sum + (g.stock ?? 0),
    0,
  );

  const topClientes = [...(ranking.data ?? [])]
    .sort((a, b) => b.totalSolicitados - a.totalSolicitados)
    .slice(0, 3);
  const maxRanking = topClientes[0]?.totalSolicitados || 1;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-blue-950">Panel de Control</h1>
        <p className="text-sm text-gray-600">
          Resumen operativo del sistema en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Grupos"
          value={grupos.data?.totalElements ?? 0}
          loading={grupos.loading}
          error={grupos.error}
          icon={icons.grid}
        />
        <KpiCard
          label="Ventas"
          value={ventas.data?.totalElements ?? 0}
          loading={ventas.loading}
          error={ventas.error}
          icon={icons.cart}
        />
        <KpiCard
          label="Ingresos Totales"
          value={formatPEN(ingresos.data?.totalRecaudado)}
          loading={ingresos.loading}
          error={ingresos.error}
          icon={icons.money}
        />
        <KpiCard
          label="Stock Total"
          value={stockTotal ?? 0}
          loading={grupos.loading}
          error={grupos.error}
          icon={icons.box}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimas ventas */}
        <div className={`${card} lg:col-span-2`}>
          <h2 className="text-lg font-bold text-blue-950 mb-4">Últimas ventas</h2>
          {ventas.loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : ventas.error ? (
            <p className="text-sm text-red-600">{ventas.error}</p>
          ) : ventas.data && ventas.data.content.length > 0 ? (
            <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Identificador
                  </th>
                  <th className="pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Solicitante
                  </th>
                  <th className="pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Grupo
                  </th>
                  <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Precio
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ventas.data.content.map((v) => (
                  <tr key={v.id}>
                    <td className="py-3 text-sm font-semibold text-blue-950">
                      {v.identificador}
                    </td>
                    <td className="py-3 text-sm text-gray-700">
                      {v.nombreSolicitante}
                    </td>
                    <td className="py-3 text-sm text-gray-700">{v.grupoCodigo}</td>
                    <td className="py-3 text-right text-sm text-gray-700">
                      {formatPEN(v.precioVentaUnitario)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay ventas registradas.</p>
          )}
        </div>

        {/* Ranking top 3 */}
        <div className={card}>
          <h2 className="text-lg font-bold text-blue-950 mb-4">Top clientes</h2>
          {ranking.loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : ranking.error ? (
            <p className="text-sm text-red-600">{ranking.error}</p>
          ) : topClientes.length > 0 ? (
            <ul className="space-y-4">
              {topClientes.map((c, i) => (
                <li key={c.nombreEntidad}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-800">
                      {i + 1}. {c.nombreEntidad}
                    </span>
                    <span className="font-semibold text-blue-950">
                      {c.totalSolicitados}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-[width] duration-500 motion-reduce:transition-none"
                      style={{
                        width: `${(c.totalSolicitados / maxRanking) * 100}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Sin datos de ranking.</p>
          )}
        </div>
      </div>
    </section>
  );
}
