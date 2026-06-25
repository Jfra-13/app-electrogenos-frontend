// Cliente DTOs. Backend calls this entity "entidad"; the UI always says "Cliente".
// Mirrors /api/v1/clientes (see PLAN-FRONT-clientes-ventas.md §6).

export type ClienteDTO = {
  id: number;
  nombre: string;
  createdAt?: string;
};

export type ClienteCreateDTO = {
  nombre: string;
};
