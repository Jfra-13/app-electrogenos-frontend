import React, { useState } from "react";
import SalesForm from "./SalesForm";
import SummaryCard from "./SummaryCard";
import type {
  SolicitudCompraRequestDTO,
  SolicitudCompraResponseDTO,
} from "../types";
import { createVenta } from "../api/ventasApi";

export default function SalesManager() {
  const [summary, setSummary] = useState<SolicitudCompraResponseDTO | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (dto: SolicitudCompraRequestDTO) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createVenta(dto);
      setSummary(response);
      window.dispatchEvent(new CustomEvent("stock-updated"));
    } catch (err: any) {
      setError(err.message || "Error procesando solicitud");
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
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}
        <SalesForm onSubmit={handleSubmit} submitting={loading} />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-blue-950">Resumen</h2>
        <SummaryCard data={summary} />
      </div>
    </div>
  );
}
