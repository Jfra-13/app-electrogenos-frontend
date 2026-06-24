import React from "react";
import type { SolicitudCompraResponseDTO } from "../types";
import { Badge } from "../../../components/react/ui/Badge";
import {
  TIPO_COMBUSTIBLE_LABELS,
  TIPO_PAGO_LABELS,
  labelOf,
} from "../../../lib/enums";
import { formatPEN } from "../../../lib/format";

export default function SummaryCard({
  data,
}: {
  data?: SolicitudCompraResponseDTO | null;
}) {
  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-500">
        Completa el formulario para ver el resumen de la solicitud.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-blue-950">Resumen de Venta</h3>
        <p className="text-xs text-gray-500">Datos generados por el backend</p>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Identificador</span>
          <span className="font-semibold text-gray-900">
            {data.identificador}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Solicitante</span>
          <span className="font-semibold text-gray-900">
            {data.nombreSolicitante}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Tipo de pago</span>
          <Badge tone={data.tipoPago === "EFECTIVO" ? "success" : "info"}>
            {labelOf(TIPO_PAGO_LABELS, data.tipoPago)}
          </Badge>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Cantidad</span>
          <span className="font-semibold text-gray-900">{data.cantidad}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Potencia requerida</span>
          <span className="font-semibold text-gray-900">
            {data.potenciaRequerida} kVA
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Combustible</span>
          <span className="font-semibold text-gray-900">
            {labelOf(TIPO_COMBUSTIBLE_LABELS, data.tipoCombustible)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Vida util</span>
          <span className="font-semibold text-gray-900">
            {data.vidaUtilSolicitada} anos
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Entidad</span>
          <span className="font-semibold text-gray-900">
            {data.entidadNombre}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Grupo asignado</span>
          <span className="font-semibold text-gray-900">
            {data.grupoCodigo}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Precio unitario</span>
          <span className="font-semibold text-gray-900">
            {formatPEN(data.precioVentaUnitario)}
          </span>
        </div>
      </div>
    </div>
  );
}
