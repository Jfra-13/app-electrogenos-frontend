import type { UsuarioCreateDTO, UsuarioDTO } from "../types";
import { getApiBaseUrl } from "../../../lib/api/baseUrl";
import { getAuthHeaders, getErrorMessage } from "../../../lib/api/http";

// GET /api/v1/usuarios → plain array (not paginated). ADMIN only.
export async function listUsuarios(): Promise<UsuarioDTO[]> {
  const url = new URL("/api/v1/usuarios", getApiBaseUrl());
  const res = await fetch(url.toString(), {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    const message = await getErrorMessage(
      res,
      `Error listando usuarios (${res.status})`,
    );
    throw new Error(message);
  }

  return (await res.json()) as UsuarioDTO[];
}

// POST /api/v1/usuarios → creates an EMPLEADO or ADMIN. ADMIN only.
export async function createUsuario(
  dto: UsuarioCreateDTO,
): Promise<UsuarioDTO> {
  const url = new URL("/api/v1/usuarios", getApiBaseUrl());
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
      `Error creando usuario (${res.status})`,
    );
    throw new Error(message);
  }

  return (await res.json()) as UsuarioDTO;
}
