import React, { useEffect, useMemo, useState } from "react";
import InventoryTable from "./InventoryTable";
import GrupoFormDialog from "./GrupoFormDialog";
import type { GrupoElectrogenoCreateDTO, GrupoElectrogenoDTO } from "../types";
import {
  createGrupoElectrogeno,
  deleteGrupoElectrogeno,
  listGruposElectrogenos,
  updateGrupoElectrogeno,
} from "../api/gruposElectrogenosApi";

export default function InventoryManager() {
  const [rows, setRows] = useState<GrupoElectrogenoDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<GrupoElectrogenoDTO | undefined>(
    undefined,
  );
  const [submitting, setSubmitting] = useState(false);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => a.codigo.localeCompare(b.codigo));
  }, [rows]);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listGruposElectrogenos({ page: 0, size: 50 });
      setRows(data.content);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openCreate = () => {
    setDialogMode("create");
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (row: GrupoElectrogenoDTO) => {
    setDialogMode("edit");
    setEditing(row);
    setDialogOpen(true);
  };

  const handleDelete = async (row: GrupoElectrogenoDTO) => {
    try {
      await deleteGrupoElectrogeno(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (dto: GrupoElectrogenoCreateDTO) => {
    setSubmitting(true);
    try {
      if (dialogMode === "create") {
        const created = await createGrupoElectrogeno(dto);
        setRows((prev) => [created, ...prev]);
      } else {
        if (!editing) return;
        const updated = await updateGrupoElectrogeno(editing.id, dto);
        setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      }

      setDialogOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-blue-950">Inventario</h2>
          <p className="text-sm text-gray-600">
            Gestiona los grupos electrógenos (crear, editar, eliminar).
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="px-5 py-2.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600"
        >
          Nuevo
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-sm text-gray-500">
          Cargando inventario...
        </div>
      ) : (
        <InventoryTable
          rows={sortedRows}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <GrupoFormDialog
        open={dialogOpen}
        mode={dialogMode}
        initialValue={editing}
        onClose={() => {
          if (!submitting) setDialogOpen(false);
        }}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </section>
  );
}
