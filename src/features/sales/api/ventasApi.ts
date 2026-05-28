import { getApiBaseUrl } from "../../../lib/api/baseUrl";
import type {
  PaginatedResponseDTO,
  SolicitudCompraRequestDTO,
  SolicitudCompraResponseDTO,
} from "../types";

function getJwtTokenFromCookie(): string | undefined {
  const parts = document.cookie.split(";").map((c) => c.trim());
  const tokenPart = parts.find((c) => c.startsWith("jwt_token="));
  if (!tokenPart) return undefined;
  const value = tokenPart.slice("jwt_token=".length);
  return value || undefined;
}

function getAuthHeaders(): HeadersInit {
  const token = getJwtTokenFromCookie();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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

  if (!res.ok) {
    let message: string | undefined;
    try {
      const data = (await res.json()) as { message?: string } | undefined;
      message = data?.message;
    } catch (e) {
      // Ignore JSON parse errors.
    }

    if (!message) {
      try {
        const errorText = await res.text();
        message = errorText || undefined;
      } catch (e) {
        // Ignore read errors.
      }
    }

    throw new Error(message || `Error creando venta (${res.status})`);
  }

  return (await res.json()) as SolicitudCompraResponseDTO;
}

export async function listVentas(options?: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<PaginatedResponseDTO<SolicitudCompraResponseDTO>> {
  const page = options?.page ?? 0;
  const size = options?.size ?? 10;
  const sort = options?.sort ?? "id,desc";
  const url = new URL("/api/v1/ventas", getApiBaseUrl());
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));
  url.searchParams.set("sort", sort);

  const res = await fetch(url.toString(), {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error(`Error listando ventas (${res.status})`);
  }

  return (await res.json()) as PaginatedResponseDTO<SolicitudCompraResponseDTO>;
}
