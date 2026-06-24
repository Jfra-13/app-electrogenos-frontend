import React, { useEffect, useState } from "react";
import { listVentas } from "../api/ventasApi";
import type { SolicitudCompraResponseDTO } from "../types";
import { Badge } from "../../../components/react/ui/Badge";
import { TIPO_PAGO_LABELS, labelOf } from "../../../lib/enums";
import { formatPEN } from "../../../lib/format";
import { Skeleton } from "../../../components/react/ui/Skeleton";
import { ApiError } from "../../../lib/api/http";
import { isAdmin } from "../../../lib/api/jwt";

export default function SalesHistory() {
  const [rows, setRows] = useState<SolicitudCompraResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // isAdmin reads the JWT cookie — client-only, resolve after mount.
  const [admin, setAdmin] = useState(false);
  useEffect(() => setAdmin(isAdmin()), []);

  // ADMIN-only seller filter. `vendedorId` is the committed value sent to the
  // API; `filterInput` is the raw text being typed.
  const [vendedorId, setVendedorId] = useState<number | undefined>(undefined);
  const [filterInput, setFilterInput] = useState("");

  const fetchPage = async (pageIndex: number, seller?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listVentas({
        page: pageIndex,
        size: 10,
        vendedorId: seller,
      });
      setRows(data.content);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error(e);
      setRows([]);
      if (e instanceof ApiError && e.status === 403) {
        setError("No tenés permisos para ver el historial de ventas.");
      } else {
        setError(e instanceof Error ? e.message : "Error cargando ventas.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(page, vendedorId);
  }, [page, vendedorId]);

  const applyFilter = () => {
    const n = Number(filterInput.trim());
    const next = Number.isInteger(n) && n > 0 ? n : undefined;
    setPage(0);
    setVendedorId(next);
  };

  const clearFilter = () => {
    setFilterInput("");
    setPage(0);
    setVendedorId(undefined);
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-950">
          Historial de Ventas
        </h1>
        <p className="text-sm text-gray-600">
          {admin
            ? "Visualiza todas las ventas registradas en el sistema."
            : "Visualiza las ventas que registraste."}
        </p>
      </div>

      {admin && (
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="filtro-vendedor"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Filtrar por ID de vendedor
            </label>
            <input
              id="filtro-vendedor"
              value={filterInput}
              onChange={(e) => setFilterInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilter();
              }}
              inputMode="numeric"
              className="w-48 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="Ej. 5"
            />
          </div>
          <button
            type="button"
            onClick={applyFilter}
            className="px-4 py-2.5 rounded-lg bg-blue-950 text-white font-semibold hover:bg-blue-900"
          >
            Aplicar
          </button>
          {vendedorId !== undefined && (
            <button
              type="button"
              onClick={clearFilter}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            >
              Limpiar
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : error ? null : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-gray-500">
                  Identificador
                </th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-gray-500">
                  Solicitante
                </th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-gray-500">
                  Grupo
                </th>
                {admin && (
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-gray-500">
                    Vendedor
                  </th>
                )}
                <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-gray-500">
                  Pago
                </th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-gray-500">
                  Precio
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-semibold text-blue-950">
                    {row.identificador}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {row.nombreSolicitante}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {row.grupoCodigo}
                  </td>
                  {admin && (
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {row.vendedorUsername ?? "—"}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <Badge
                      tone={row.tipoPago === "EFECTIVO" ? "success" : "info"}
                    >
                      {labelOf(TIPO_PAGO_LABELS, row.tipoPago)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {formatPEN(row.precioVentaUnitario)}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={admin ? 6 : 5}
                    className="px-6 py-10 text-sm text-gray-500 text-center"
                  >
                    No hay ventas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0 || loading}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-sm text-gray-600">Pagina {page + 1}</span>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={loading || page >= totalPages - 1}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}
