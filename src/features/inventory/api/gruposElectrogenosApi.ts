import type {
  GrupoElectrogenoCreateDTO,
  GrupoElectrogenoDTO,
  GrupoElectrogenoUpdateDTO,
  PaginatedResponseDTO,
} from "../types";
import { getApiBaseUrl } from "../../../lib/api/baseUrl";

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

export async function listGruposElectrogenos(options?: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<PaginatedResponseDTO<GrupoElectrogenoDTO>> {
  const page = options?.page ?? 0;
  const size = options?.size ?? 20;
  const sort = options?.sort ?? "id,asc";
  const url = new URL("/api/v1/grupos-electrogenos", getApiBaseUrl());
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));
  url.searchParams.set("sort", sort);

  const res = await fetch(url.toString(), {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error(`Error listando grupos electrógenos (${res.status})`);
  }

  return (await res.json()) as PaginatedResponseDTO<GrupoElectrogenoDTO>;
}

export async function createGrupoElectrogeno(
  dto: GrupoElectrogenoCreateDTO,
): Promise<GrupoElectrogenoDTO> {
  const url = new URL("/api/v1/grupos-electrogenos", getApiBaseUrl());
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    throw new Error(`Error creando grupo electrógeno (${res.status})`);
  }

  return (await res.json()) as GrupoElectrogenoDTO;
}

export async function updateGrupoElectrogeno(
  id: number,
  dto: GrupoElectrogenoUpdateDTO,
): Promise<GrupoElectrogenoDTO> {
  const url = new URL(`/api/v1/grupos-electrogenos/${id}`, getApiBaseUrl());
  const res = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    throw new Error(`Error editando grupo electrógeno (${res.status})`);
  }

  return (await res.json()) as GrupoElectrogenoDTO;
}

export async function deleteGrupoElectrogeno(id: number): Promise<void> {
  const url = new URL(`/api/v1/grupos-electrogenos/${id}`, getApiBaseUrl());
  const res = await fetch(url.toString(), {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error(`Error eliminando grupo electrógeno (${res.status})`);
  }
}
