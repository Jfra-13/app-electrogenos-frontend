export type TipoPago = "CHEQUE" | "EFECTIVO";
export type TipoCombustible = "NAFTA" | "GAS_NATURAL" | "GASOIL";
export type EstadoVenta = "ACTIVA" | "ANULADA";

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
  // Anulación (soft-delete). Legacy/active sales come back as ACTIVA with the
  // audit fields null. A sale is never deleted: it is annulled with a trail.
  estado: EstadoVenta;
  motivoAnulacion: string | null;
  anuladaAt: string | null;
  anuladaPor: string | null;
};

// Body for POST /ventas/{id}/anulacion. `motivo` is required (NotBlank).
export type AnulacionRequestDTO = {
  motivo: string;
};

// Body for the now-narrowed PUT /ventas/{id}: only the solicitant name is
// editable. Everything financial is immutable — annul and recreate instead.
export type SolicitudCompraUpdateDTO = {
  nombreSolicitante: string;
};

export type PaginatedResponseDTO<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
