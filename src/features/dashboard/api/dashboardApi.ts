import { getApiBaseUrl } from "../../../lib/api/baseUrl";
import { ensureOk, getAuthHeaders } from "../../../lib/api/http";
import type { IngresosTotalesDTO, RankingClienteDTO } from "../types";

export async function getRankingClientes(): Promise<RankingClienteDTO[]> {
  const url = new URL("/api/v1/ventas/ranking-clientes", getApiBaseUrl());
  const res = await fetch(url.toString(), { headers: { ...getAuthHeaders() } });
  await ensureOk(res, `Error obteniendo ranking (${res.status})`);
  return (await res.json()) as RankingClienteDTO[];
}

export async function getIngresosTotales(): Promise<IngresosTotalesDTO> {
  const url = new URL("/api/v1/ventas/ingresos-totales", getApiBaseUrl());
  const res = await fetch(url.toString(), { headers: { ...getAuthHeaders() } });
  await ensureOk(res, `Error obteniendo ingresos (${res.status})`);
  return (await res.json()) as IngresosTotalesDTO;
}
