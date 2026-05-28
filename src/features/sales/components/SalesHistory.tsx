import React, { useEffect, useState } from "react";
import { listVentas } from "../api/ventasApi";
import type { SolicitudCompraResponseDTO } from "../types";

export default function SalesHistory() {
  const [rows, setRows] = useState<SolicitudCompraResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPage = async (pageIndex: number) => {
    setLoading(true);
    try {
      const data = await listVentas({ page: pageIndex, size: 10 });
      setRows(data.content);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(page);
  }, [page]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-950">
          Historial de Ventas
        </h1>
        <p className="text-sm text-gray-600">
          Visualiza las solicitudes procesadas en el sistema.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-500">
          Cargando ventas...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                  <td className="px-6 py-4 text-sm text-gray-700">
                    ${row.precioVentaUnitario.toLocaleString("es-AR")}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
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
