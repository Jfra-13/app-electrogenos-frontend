import React, { useEffect, useMemo, useState } from "react";
import type { GrupoElectrogenoDTO } from "../../inventory/types";
import { listGruposElectrogenos } from "../../inventory/api/gruposElectrogenosApi";
import {
  TIPO_COMBUSTIBLE_LABELS,
  TIPO_ARRANQUE_LABELS,
  labelOf,
} from "../../../lib/enums";
import { formatPEN } from "../../../lib/format";

// Mobility filter is derived: a grupo is "Móvil" when esMovil is true or its
// tipoGrupo says so; everything else counts as "Fijo".
function esMovil(g: GrupoElectrogenoDTO): boolean {
  return g.esMovil === true || g.tipoGrupo === "Móvil";
}

// Selector of available grupos + stock (Model B): the seller picks one concrete
// group and sells THAT group. Refetches on mount and on the "stock-updated"
// event fired after a sale. Includes a code search + toggle filters
// (combustible / arranque / movilidad) so the seller can locate a grupo.
export default function GruposPanel({
  onSelect,
  selectedCodigo,
}: {
  onSelect?: (g: GrupoElectrogenoDTO) => void;
  selectedCodigo?: string | null;
}) {
  const [grupos, setGrupos] = useState<GrupoElectrogenoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state — all client-side over the already-loaded list. null = "Todos".
  const [query, setQuery] = useState("");
  const [combustible, setCombustible] =
    useState<keyof typeof TIPO_COMBUSTIBLE_LABELS | null>(null);
  const [arranque, setArranque] =
    useState<keyof typeof TIPO_ARRANQUE_LABELS | null>(null);
  const [movilidad, setMovilidad] = useState<"movil" | "fijo" | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listGruposElectrogenos({
          size: 50,
          sort: "codigo,asc",
        });
        if (active) setGrupos(res.content);
      } catch (err) {
        if (active)
          setError(err instanceof Error ? err.message : "Error cargando grupos");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    window.addEventListener("stock-updated", load);
    return () => {
      active = false;
      window.removeEventListener("stock-updated", load);
    };
  }, []);

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return grupos.filter((g) => {
      if (q && !g.codigo.toLowerCase().includes(q)) return false;
      if (combustible && g.tipoCombustible !== combustible) return false;
      if (arranque && g.tipoArranque !== arranque) return false;
      if (movilidad === "movil" && !esMovil(g)) return false;
      if (movilidad === "fijo" && esMovil(g)) return false;
      return true;
    });
  }, [grupos, query, combustible, arranque, movilidad]);

  const hasFilters =
    query.trim() !== "" ||
    combustible !== null ||
    arranque !== null ||
    movilidad !== null;

  const clearFilters = () => {
    setQuery("");
    setCombustible(null);
    setArranque(null);
    setMovilidad(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-blue-950">Grupos disponibles</h3>
        <p className="text-xs text-gray-500">
          Referencia de stock, potencia y características para llenar la solicitud
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      {!loading && !error && grupos.length > 0 && (
        <div className="space-y-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por código…"
            aria-label="Buscar grupo por código"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
          />

          <div className="flex flex-wrap gap-2">
            <Toggle
              active={combustible === null && arranque === null && movilidad === null}
              onClick={clearFilters}
            >
              Todos
            </Toggle>

            {(
              Object.keys(TIPO_COMBUSTIBLE_LABELS) as Array<
                keyof typeof TIPO_COMBUSTIBLE_LABELS
              >
            ).map((key) => (
              <Toggle
                key={key}
                active={combustible === key}
                onClick={() =>
                  setCombustible((c) => (c === key ? null : key))
                }
              >
                {TIPO_COMBUSTIBLE_LABELS[key]}
              </Toggle>
            ))}

            {(
              Object.keys(TIPO_ARRANQUE_LABELS) as Array<
                keyof typeof TIPO_ARRANQUE_LABELS
              >
            ).map((key) => (
              <Toggle
                key={key}
                active={arranque === key}
                onClick={() => setArranque((a) => (a === key ? null : key))}
              >
                {TIPO_ARRANQUE_LABELS[key]}
              </Toggle>
            ))}

            <Toggle
              active={movilidad === "movil"}
              onClick={() =>
                setMovilidad((m) => (m === "movil" ? null : "movil"))
              }
            >
              Móvil
            </Toggle>
            <Toggle
              active={movilidad === "fijo"}
              onClick={() => setMovilidad((m) => (m === "fijo" ? null : "fijo"))}
            >
              Fijo
            </Toggle>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Cargando inventario...</p>
      ) : grupos.length === 0 ? (
        <p className="text-sm text-gray-500">No hay grupos en el inventario.</p>
      ) : visibles.length === 0 ? (
        <p className="text-sm text-gray-500">
          Ningún grupo coincide con el filtro.
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-1 text-orange-600 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-4 font-medium">Código</th>
                <th className="py-2 pr-4 font-medium">Tipo</th>
                <th className="py-2 pr-4 font-medium">Combustible</th>
                <th className="py-2 pr-4 font-medium">Arranque</th>
                <th className="py-2 pr-4 font-medium">Capó</th>
                <th className="py-2 pr-4 font-medium">Potencia (kVA)</th>
                <th className="py-2 pr-4 font-medium">Precio</th>
                <th className="py-2 pr-4 font-medium">Stock</th>
                {onSelect && <th className="py-2 font-medium" />}
              </tr>
            </thead>
            <tbody>
              {visibles.map((g) => {
                const sinStock = (g.stock ?? 0) <= 0;
                const activo = selectedCodigo === g.codigo;
                return (
                  <tr
                    key={g.id}
                    className={`border-b border-gray-50 ${
                      sinStock ? "opacity-50" : ""
                    } ${activo ? "bg-orange-50" : ""}`}
                  >
                    <td className="py-2 pr-4 font-semibold text-gray-900">
                      {g.codigo}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">
                      {g.tipoGrupo ?? (esMovil(g) ? "Móvil" : "Fijo")}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">
                      {labelOf(TIPO_COMBUSTIBLE_LABELS, g.tipoCombustible)}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">
                      {labelOf(TIPO_ARRANQUE_LABELS, g.tipoArranque)}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">
                      {g.capo ? "Sí" : "—"}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">
                      {g.pMin} – {g.pMax}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">
                      {g.precioVentaCalculado != null
                        ? formatPEN(g.precioVentaCalculado)
                        : "—"}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`font-semibold ${
                          sinStock ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {g.stock ?? 0}
                      </span>
                    </td>
                    {onSelect && (
                      <td className="py-2">
                        <button
                          type="button"
                          disabled={sinStock}
                          onClick={() => onSelect(g)}
                          aria-pressed={activo}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border disabled:opacity-40 disabled:cursor-not-allowed ${
                            activo
                              ? "bg-orange-500 text-white border-orange-500"
                              : "border-orange-500 text-orange-600 hover:bg-orange-50"
                          }`}
                        >
                          {activo ? "Seleccionado" : "Seleccionar"}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "bg-orange-500 text-white border-orange-500"
          : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"
      }`}
    >
      {children}
    </button>
  );
}
