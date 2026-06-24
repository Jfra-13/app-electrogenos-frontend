import { getApiBaseUrl } from "../../../lib/api/baseUrl";
import { getAuthHeaders, getErrorMessage } from "../../../lib/api/http";
import type {
  GrupoElectrogenoDTO,
  PaginatedResponseDTO,
} from "../../inventory/types";

// GET /grupos-electrogenos/filtro/combustible?tipo= — public, paginated.
export async function listGruposByCombustible(
  tipo: string,
  page: number,
  size: number,
): Promise<PaginatedResponseDTO<GrupoElectrogenoDTO>> {
  const url = new URL(
    "/api/v1/grupos-electrogenos/filtro/combustible",
    getApiBaseUrl(),
  );
  url.searchParams.set("tipo", tipo);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));

  const res = await fetch(url.toString(), {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    const message = await getErrorMessage(
      res,
      `Error cargando catálogo (${res.status})`,
    );
    throw new Error(message);
  }

  return (await res.json()) as PaginatedResponseDTO<GrupoElectrogenoDTO>;
}
