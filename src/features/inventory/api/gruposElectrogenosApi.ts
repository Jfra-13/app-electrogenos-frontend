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

async function getErrorMessage(res: Response, fallback: string) {
  try {
    const data = (await res.json()) as { message?: string } | undefined;
    if (data?.message) return data.message;
  } catch (e) {
    // Ignore JSON parse errors and fall back to text.
  }

  try {
    const text = await res.text();
    if (text) return text;
  } catch (e) {
    // Ignore read errors.
  }

  return fallback;
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
    const message = await getErrorMessage(
      res,
      `Error listando grupos electrógenos (${res.status})`,
    );
    throw new Error(message);
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
    const message = await getErrorMessage(
      res,
      `Error creando grupo electrógeno (${res.status})`,
    );
    throw new Error(message);
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
    const message = await getErrorMessage(
      res,
      `Error editando grupo electrógeno (${res.status})`,
    );
    throw new Error(message);
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
    const message = await getErrorMessage(
      res,
      `Error eliminando grupo electrógeno (${res.status})`,
    );
    throw new Error(message);
  }
}

export async function uploadGrupoElectrogenoImagen(
  id: number,
  file: File,
): Promise<GrupoElectrogenoDTO> {
  const url = new URL(
    `/api/v1/grupos-electrogenos/${id}/imagen`,
    getApiBaseUrl(),
  );
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  if (!res.ok) {
    const message = await getErrorMessage(
      res,
      `Error subiendo imagen (${res.status})`,
    );
    throw new Error(message);
  }

  return (await res.json()) as GrupoElectrogenoDTO;
}
