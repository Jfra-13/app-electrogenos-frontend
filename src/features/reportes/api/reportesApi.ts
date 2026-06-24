import { getApiBaseUrl } from "../../../lib/api/baseUrl";
import { ensureOk, getAuthHeaders } from "../../../lib/api/http";
import type { ReportePagoDTO, TipoPago, VentaPorEmpleadoDTO } from "../types";

export async function getReportePagos(
  tipo: TipoPago,
): Promise<ReportePagoDTO[]> {
  const url = new URL("/api/v1/ventas/reporte-pagos", getApiBaseUrl());
  url.searchParams.set("tipo", tipo);
  const res = await fetch(url.toString(), { headers: { ...getAuthHeaders() } });
  await ensureOk(res, `Error obteniendo reporte de pagos (${res.status})`);
  return (await res.json()) as ReportePagoDTO[];
}

export async function getVentasPorEmpleado(): Promise<VentaPorEmpleadoDTO[]> {
  const url = new URL("/api/v1/ventas/por-empleado", getApiBaseUrl());
  const res = await fetch(url.toString(), { headers: { ...getAuthHeaders() } });
  await ensureOk(res, `Error obteniendo ventas por empleado (${res.status})`);
  return (await res.json()) as VentaPorEmpleadoDTO[];
}

// Ranking and total income live in the dashboard API; reused as-is here.
export { getRankingClientes, getIngresosTotales } from "../../dashboard/api/dashboardApi";
