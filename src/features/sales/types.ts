export type TipoPago = "CHEQUE" | "EFECTIVO";
export type TipoCombustible = "NAFTA" | "GAS_NATURAL" | "GASOIL";

export type SolicitudCompraRequestDTO = {
  nombreSolicitante: string;
  tipoPago: TipoPago;
  cantidad: number;
  potenciaRequerida: number;
  tipoCombustible: TipoCombustible;
  vidaUtilSolicitada: number;
  entidadId: number;
  // Model B: when present the backend sells THIS exact group (validates stock,
  // freezes its price). Absent -> falls back to tasación (backward compatible).
  grupoCodigo?: string;
};

export type SolicitudCompraResponseDTO = {
  id: number;
  identificador: string;
  nombreSolicitante: string;
  tipoPago: TipoPago;
  cantidad: number;
  potenciaRequerida: number;
  tipoCombustible: TipoCombustible;
  vidaUtilSolicitada: number;
  entidadId: number;
  entidadNombre: string;
  grupoId: number;
  grupoCodigo: string;
  precioVentaUnitario: number;
  total: number;
  // Who registered the sale. Null on legacy sales (pre vendor attribution).
  vendedorId: number | null;
  vendedorUsername: string | null;
};

export type PaginatedResponseDTO<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
