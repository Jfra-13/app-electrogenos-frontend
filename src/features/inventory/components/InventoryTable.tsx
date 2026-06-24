import React, { useState } from "react";
import type { GrupoElectrogenoDTO } from "../types";
import { Badge } from "../../../components/react/ui/Badge";
import { TIPO_COMBUSTIBLE_LABELS, labelOf } from "../../../lib/enums";

const PencilIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const TrashIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

const BoxIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

function isMovil(row: GrupoElectrogenoDTO): boolean {
  return row.esMovil ?? row.tipoGrupo === "Móvil";
}

function StockCell({ stock }: { stock?: number }) {
  if (typeof stock !== "number") return <span className="text-gray-400">—</span>;
  if (stock === 0) return <Badge tone="danger">Sin stock</Badge>;
  if (stock <= 5) return <Badge tone="warning">{stock} u.</Badge>;
  return <span className="text-sm text-gray-700">{stock} u.</span>;
}

export default function InventoryTable({
  rows,
  isAdmin,
  onEdit,
  onStock,
  onDelete,
}: {
  rows: GrupoElectrogenoDTO[];
  isAdmin: boolean;
  onEdit: (row: GrupoElectrogenoDTO) => void;
  onStock: (row: GrupoElectrogenoDTO) => void;
  onDelete: (row: GrupoElectrogenoDTO) => void;
}) {
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const colSpan = isAdmin ? 6 : 5;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-gray-500 w-16">
              Imagen
            </th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Código
            </th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Tipo
            </th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Combustible
            </th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Potencias
            </th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Stock
            </th>
            {isAdmin && (
              <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-gray-500 w-36">
                Acciones
              </th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                {row.imageUrl ? (
                  <img
                    src={row.imageUrl}
                    alt={row.codigo}
                    className="h-10 w-10 rounded-md object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                    N/A
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-blue-950">
                {row.codigo}
              </td>
              <td className="px-6 py-4">
                {isMovil(row) ? (
                  <Badge tone="info">Móvil</Badge>
                ) : (
                  <Badge tone="neutral">Fijo</Badge>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {labelOf(TIPO_COMBUSTIBLE_LABELS, row.tipoCombustible)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                <div className="flex flex-col">
                  <span>
                    Min: <span className="font-semibold">{row.pMin} kVA</span>
                  </span>
                  <span>
                    Max: <span className="font-semibold">{row.pMax} kVA</span>
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <StockCell stock={row.stock} />
              </td>
              {isAdmin && (
                <td className="px-6 py-4">
                  <div className="relative flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                      aria-label={`Editar ${row.codigo}`}
                      title="Editar"
                    >
                      <PencilIcon size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onStock(row)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 text-blue-950 hover:bg-blue-50"
                      aria-label={`Editar stock de ${row.codigo}`}
                      title="Editar stock"
                    >
                      <BoxIcon size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(row.id)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 text-red-600 hover:bg-red-50"
                      aria-label={`Eliminar ${row.codigo}`}
                      title="Eliminar"
                    >
                      <TrashIcon size={16} />
                    </button>

                    {confirmingId === row.id && (
                      <div className="absolute right-0 top-10 z-10 w-56 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                        <p className="text-sm text-gray-700">
                          ¿Eliminar{" "}
                          <span className="font-semibold">{row.codigo}</span>?
                        </p>
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirmingId(null)}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmingId(null);
                              onDelete(row);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                className="px-6 py-10 text-sm text-gray-500 text-center"
                colSpan={colSpan}
              >
                No hay grupos electrógenos cargados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
