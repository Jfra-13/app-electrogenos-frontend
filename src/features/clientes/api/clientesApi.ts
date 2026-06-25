import { getApiBaseUrl } from "../../../lib/api/baseUrl";
import { ensureOk, getAuthHeaders } from "../../../lib/api/http";
import type { ClienteDTO } from "../types";

// GET /api/v1/clientes?nombre=<q> -> plain array. ADMIN, EMPLEADO.
// An empty query returns the full list (used by the management screen).
export async function buscarClientes(nombre: string): Promise<ClienteDTO[]> {
  const url = new URL("/api/v1/clientes", getApiBaseUrl());
  const q = nombre.trim();
  if (q) url.searchParams.set("nombre", q);

  const res = await fetch(url.toString(), { headers: { ...getAuthHeaders() } });
  await ensureOk(res, `Error buscando clientes (${res.status})`);
  return (await res.json()) as ClienteDTO[];
}

// POST /api/v1/clientes -> 201 created. ADMIN, EMPLEADO.
// On 409 (already exists) ensureOk throws ApiError(409) so the caller can
// recover by re-fetching and selecting the existing client.
export async function crearCliente(nombre: string): Promise<ClienteDTO> {
  const url = new URL("/api/v1/clientes", getApiBaseUrl());
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ nombre: nombre.trim() }),
  });

  await ensureOk(res, `Error creando cliente (${res.status})`);
  return (await res.json()) as ClienteDTO;
}
