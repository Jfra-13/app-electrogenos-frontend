// Reportes feature DTOs. Ranking/Ingresos shapes are reused from dashboard.

export type TipoPago = "EFECTIVO" | "CHEQUE";

export type ReportePagoDTO = {
  solicitante: string;
  cantidad: number;
};

// Boss view: sales aggregated per seller (GET /ventas/por-empleado).
export type VentaPorEmpleadoDTO = {
  vendedor: string;
  cantidadVentas: number;
  totalRecaudado: number;
};

export type { RankingClienteDTO, IngresosTotalesDTO } from "../dashboard/types";
