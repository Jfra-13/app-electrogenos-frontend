import React, { useEffect, useMemo, useState } from "react";
import InventoryTable from "./InventoryTable";
import GrupoFormDialog from "./GrupoFormDialog";
import type { GrupoElectrogenoCreateDTO, GrupoElectrogenoDTO } from "../types";
import {
  createGrupoElectrogeno,
  deleteGrupoElectrogeno,
  listGruposElectrogenos,
  patchStockGrupoElectrogeno,
  uploadGrupoElectrogenoImagen,
  updateGrupoElectrogeno,
} from "../api/gruposElectrogenosApi";
import { isAdmin } from "../../../lib/api/jwt";
import { Skeleton } from "../../../components/react/ui/Skeleton";
import { notify, ToastViewport } from "../../../components/react/ui/Toast";

export default function InventoryManager() {
  const [rows, setRows] = useState<GrupoElectrogenoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<GrupoElectrogenoDTO | undefined>(
    undefined,
  );
  const [submitting, setSubmitting] = useState(false);

  // isAdmin reads the JWT cookie — client-only, so resolve after mount.
  const [admin, setAdmin] = useState(false);
  useEffect(() => setAdmin(isAdmin()), []);

  const [stockTarget, setStockTarget] = useState<GrupoElectrogenoDTO | null>(
    null,
  );
  const [stockValue, setStockValue] = useState("");
  const [stockSaving, setStockSaving] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => a.codigo.localeCompare(b.codigo));
  }, [rows]);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listGruposElectrogenos({ page: 0, size: 50 });
      setRows(data.content);
      setError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error cargando datos";
      console.error(e);
      setError(message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const handler = () => {
      refresh();
    };
    window.addEventListener("stock-updated", handler);
    return () => window.removeEventListener("stock-updated", handler);
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
      setError(null);
      notify(`${row.codigo} eliminado`, "success");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error eliminando";
      console.error(e);
      setError(message);
      notify(message, "error");
    }
  };

  const openStock = (row: GrupoElectrogenoDTO) => {
    setStockTarget(row);
    setStockValue(typeof row.stock === "number" ? String(row.stock) : "");
    setStockError(null);
  };

  const handleStockSave = async () => {
    if (!stockTarget) return;
    const nuevoStock = Number(stockValue.trim());
    if (!Number.isInteger(nuevoStock) || nuevoStock < 0) {
      setStockError("Ingresa un stock válido (entero ≥ 0).");
      return;
    }
    setStockSaving(true);
    setStockError(null);
    try {
      const updated = await patchStockGrupoElectrogeno(
        stockTarget.id,
        nuevoStock,
      );
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      window.dispatchEvent(new CustomEvent("stock-updated"));
      setStockTarget(null);
      notify(`Stock de ${updated.codigo} actualizado`, "success");
    } catch (e) {
      setStockError(e instanceof Error ? e.message : "Error actualizando stock");
    } finally {
      setStockSaving(false);
    }
  };

  const handleSubmit = async (
    dto: GrupoElectrogenoCreateDTO,
    imageFile?: File | null,
  ) => {
    setSubmitting(true);
    setError(null);
    try {
      let targetId: number | null = null;

      if (dialogMode === "create") {
        const created = await createGrupoElectrogeno(dto);
        setRows((prev) => [created, ...prev]);
        targetId = created.id;
      } else {
        if (!editing) return;
        const updated = await updateGrupoElectrogeno(editing.id, dto);
        setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        targetId = updated.id;
      }

      if (imageFile && targetId) {
        try {
          await uploadGrupoElectrogenoImagen(targetId, imageFile);
        } catch (e) {
          const message =
            e instanceof Error ? e.message : "No se pudo subir la imagen";
          console.error(e);
          setError(message);
        }
      }

      setDialogOpen(false);
      notify(
        dialogMode === "create" ? "Grupo creado" : "Grupo actualizado",
        "success",
      );
      refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error guardando";
      console.error(e);
      setError(message);
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

        {admin && (
          <button
            type="button"
            onClick={openCreate}
            className="px-5 py-2.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600"
          >
            Nuevo
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <InventoryTable
          rows={sortedRows}
          isAdmin={admin}
          onEdit={openEdit}
          onStock={openStock}
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

      {stockTarget && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-gray-900/50"
            role="presentation"
            onClick={() => {
              if (!stockSaving) setStockTarget(null);
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Editar stock"
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-4"
            >
              <div>
                <h2 className="text-lg font-bold text-blue-950">
                  Editar stock
                </h2>
                <p className="text-sm text-gray-500">{stockTarget.codigo}</p>
              </div>

              <div>
                <label htmlFor="stock-nuevo" className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo stock (unidades)
                </label>
                <input
                  id="stock-nuevo"
                  value={stockValue}
                  onChange={(e) => setStockValue(e.target.value)}
                  inputMode="numeric"
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="0"
                />
              </div>

              {stockError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                  {stockError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStockTarget(null)}
                  disabled={stockSaving}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleStockSave}
                  disabled={stockSaving}
                  className="px-5 py-2.5 rounded-lg bg-blue-950 text-white font-semibold hover:bg-blue-900 disabled:opacity-50"
                >
                  {stockSaving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastViewport />
    </section>
  );
}
