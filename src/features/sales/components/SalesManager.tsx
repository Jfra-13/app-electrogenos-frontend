import React, { useEffect, useState } from "react";
import SalesForm from "./SalesForm";
import SummaryCard from "./SummaryCard";
import type {
  SolicitudCompraRequestDTO,
  SolicitudCompraResponseDTO,
} from "../types";
import { createVenta } from "../api/ventasApi";
import { ApiError } from "../../../lib/api/http";
import { isAdmin, isEmpleado } from "../../../lib/api/jwt";
import { notify, ToastViewport } from "../../../components/react/ui/Toast";

export default function SalesManager() {
  const [summary, setSummary] = useState<SolicitudCompraResponseDTO | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 409 = stock insuficiente; shown as a distinct danger block per spec §6.
  const [conflict, setConflict] = useState(false);

  // Sales are 🟩 ADMIN or EMPLEADO. Only plain USER is blocked.
  const [canSell, setCanSell] = useState(false);
  useEffect(() => setCanSell(isAdmin() || isEmpleado()), []);

  const handleSubmit = async (dto: SolicitudCompraRequestDTO) => {
    setLoading(true);
    setError(null);
    setConflict(false);
    try {
      const response = await createVenta(dto);
      setSummary(response);
      window.dispatchEvent(new CustomEvent("stock-updated"));
      notify("Venta registrada", "success");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setConflict(true);
        setError(err.message || "Stock insuficiente para esta solicitud.");
      } else {
        setError(
          err instanceof Error ? err.message : "Error procesando solicitud",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-blue-950">Ventas y Tasacion</h1>
        <p className="text-sm text-gray-600">
          Procesa solicitudes de compra y el backend asignara el grupo ideal.
        </p>
        {conflict ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border-2 border-red-200">
            <p className="font-semibold">Stock insuficiente</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : (
          error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )
        )}

        {canSell ? (
          <SalesForm onSubmit={handleSubmit} submitting={loading} />
        ) : (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm border border-amber-100">
            Necesitas rol de administrador o empleado para registrar ventas.
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-blue-950">Resumen</h2>
        <SummaryCard data={summary} />
      </div>

      <ToastViewport />
    </div>
  );
}
