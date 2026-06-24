// Dashboard-only DTOs. The rest reuse inventory/sales types.

export type RankingClienteDTO = {
  nombreEntidad: string;
  totalSolicitados: number;
};

export type IngresosTotalesDTO = {
  totalRecaudado: number;
};
