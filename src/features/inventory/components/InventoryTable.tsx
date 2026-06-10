import React from "react";
import type { GrupoElectrogenoDTO } from "../types";

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

export default function InventoryTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: GrupoElectrogenoDTO[];
  onEdit: (row: GrupoElectrogenoDTO) => void;
  onDelete: (row: GrupoElectrogenoDTO) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
              Combustible
            </th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Potencias
            </th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-gray-500 w-28">
              Acciones
            </th>
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
              <td className="px-6 py-4 text-sm text-gray-700">
                {row.tipoCombustible}
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
                <div className="flex items-center gap-2 justify-end">
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
                    onClick={() => onDelete(row)}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 text-red-600 hover:bg-red-50"
                    aria-label={`Eliminar ${row.codigo}`}
                    title="Eliminar"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                className="px-6 py-10 text-sm text-gray-500 text-center"
                colSpan={5}
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
