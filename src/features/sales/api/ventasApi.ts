import { getApiBaseUrl } from "../../../lib/api/baseUrl";
import { ensureOk, getAuthHeaders } from "../../../lib/api/http";
import type {
  PaginatedResponseDTO,
  SolicitudCompraRequestDTO,
  SolicitudCompraResponseDTO,
  SolicitudCompraUpdateDTO,
} from "../types";

export async function createVenta(
  dto: SolicitudCompraRequestDTO,
): Promise<SolicitudCompraResponseDTO> {
  const url = new URL("/api/v1/ventas", getApiBaseUrl());
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(dto),
  });

  // ensureOk throws ApiError (carries status) so the UI can branch on 409
  // (stock insuficiente) and 403 (sin rol).
  await ensureOk(res, `Error creando venta (${res.status})`);

  return (await res.json()) as SolicitudCompraResponseDTO;
}

export async function listVentas(options?: {
  page?: number;
  size?: number;
  sort?: string;
  // ADMIN only: filter by seller. The backend ignores it for EMPLEADO (always
  // scoped to their own sales).
  vendedorId?: number;
}): Promise<PaginatedResponseDTO<SolicitudCompraResponseDTO>> {
  const page = options?.page ?? 0;
  const size = options?.size ?? 10;
  const sort = options?.sort ?? "id,desc";
  const url = new URL("/api/v1/ventas", getApiBaseUrl());
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));
  url.searchParams.set("sort", sort);
  if (typeof options?.vendedorId === "number") {
    url.searchParams.set("vendedorId", String(options.vendedorId));
  }

  const res = await fetch(url.toString(), {
    headers: {
      ...getAuthHeaders(),
    },
  });

  // ensureOk throws ApiError (carries status) so the UI can branch on 403.
  await ensureOk(res, `Error listando ventas (${res.status})`);

  return (await res.json()) as PaginatedResponseDTO<SolicitudCompraResponseDTO>;
}

// Annuls a sale (soft-delete): restores stock, leaves an audit trail, drops it
// from financial reports. ADMIN only. 409 = already annulled, 403 = not ADMIN.
export async function anularVenta(
  id: number,
  motivo: string,
): Promise<SolicitudCompraResponseDTO> {
  const url = new URL(`/api/v1/ventas/${id}/anulacion`, getApiBaseUrl());
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ motivo }),
  });

  await ensureOk(res, `Error anulando venta (${res.status})`);

  return (await res.json()) as SolicitudCompraResponseDTO;
}

// Narrowed PUT: only `nombreSolicitante` is editable. ADMIN only.
// 409 = the sale is annulled (cannot be edited).
export async function actualizarVenta(
  id: number,
  dto: SolicitudCompraUpdateDTO,
): Promise<SolicitudCompraResponseDTO> {
  const url = new URL(`/api/v1/ventas/${id}`, getApiBaseUrl());
  const res = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(dto),
  });

  await ensureOk(res, `Error actualizando venta (${res.status})`);

  return (await res.json()) as SolicitudCompraResponseDTO;
}
