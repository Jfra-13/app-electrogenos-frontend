export type TipoCombustible = "NAFTA" | "GAS_NATURAL" | "GASOIL";
export type TipoArranque = "AUTOMATICO" | "MANUAL";
export type MaterialEje = "ACERO" | "ALEACION";

export type GrupoElectrogenoDTO = {
  id: number;
  codigo: string;
  vidaUtil: number;
  tipoCombustible: TipoCombustible;
  tipoArranque: TipoArranque;
  pMin: number;
  pMax: number;
  insonorizado?: boolean;
  capo?: boolean;
  potenciaMedia?: number;
  precioVentaCalculado?: number;
  tipoGrupo?: "Fijo" | "Móvil";
  cantidadRuedas?: number;
  materialEje?: MaterialEje;
  esMovil?: boolean;
};

export type GrupoElectrogenoCreateDTO = {
  codigo: string;
  vidaUtil: number;
  tipoCombustible: TipoCombustible;
  tipoArranque: TipoArranque;
  pMin: number;
  pMax: number;
  insonorizado?: boolean;
  capo?: boolean;
  cantidadRuedas?: number;
  materialEje?: MaterialEje;
  esMovil?: boolean;
};

export type GrupoElectrogenoUpdateDTO = Partial<GrupoElectrogenoCreateDTO>;

export type PaginatedResponseDTO<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
