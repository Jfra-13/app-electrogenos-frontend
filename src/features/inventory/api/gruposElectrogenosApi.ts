import type {
  GrupoElectrogenoCreateDTO,
  GrupoElectrogenoDTO,
  GrupoElectrogenoUpdateDTO,
  PaginatedResponseDTO,
} from "../types";
import { getApiBaseUrl } from "../../../lib/api/baseUrl";
import { getAuthHeaders, getErrorMessage } from "../../../lib/api/http";

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

export async function patchStockGrupoElectrogeno(
  id: number,
  nuevoStock: number,
): Promise<GrupoElectrogenoDTO> {
  const url = new URL(
    `/api/v1/grupos-electrogenos/${id}/stock`,
    getApiBaseUrl(),
  );
  url.searchParams.set("nuevoStock", String(nuevoStock));

  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    const message = await getErrorMessage(
      res,
      `Error actualizando stock (${res.status})`,
    );
    throw new Error(message);
  }

  return (await res.json()) as GrupoElectrogenoDTO;
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
