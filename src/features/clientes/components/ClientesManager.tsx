import React, { useEffect, useMemo, useState } from "react";
import type { ClienteDTO } from "../types";
import { buscarClientes, crearCliente } from "../api/clientesApi";
import { ApiError } from "../../../lib/api/http";
import { Skeleton } from "../../../components/react/ui/Skeleton";
import { notify, ToastViewport } from "../../../components/react/ui/Toast";

export default function ClientesManager() {
  const [rows, setRows] = useState<ClienteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      setRows(await buscarClientes(""));
      setError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error cargando clientes";
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

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [rows],
  );

  const canSubmit = nombre.trim().length > 0;

  const openCreate = () => {
    setNombre("");
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await crearCliente(nombre);
      setRows((prev) => [created, ...prev]);
      setOpen(false);
      notify(`Cliente ${created.nombre} creado`, "success");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setFormError("Ya existe un cliente con ese nombre.");
      } else {
        setFormError(e instanceof Error ? e.message : "Error creando cliente");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-blue-950">Clientes</h2>
          <p className="text-sm text-gray-600">
            Administra el catálogo de clientes que reciben las ventas.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="px-5 py-2.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600"
        >
          Nuevo cliente
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : sortedRows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
          No hay clientes cargados todavía.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">ID</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {c.nombre}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{c.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-gray-900/50"
            role="presentation"
            onClick={() => {
              if (!submitting) setOpen(false);
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Nuevo cliente"
              className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-5"
            >
              <h2 className="text-lg font-bold text-blue-950">Nuevo cliente</h2>

              <div>
                <label
                  htmlFor="cliente-nombre"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nombre
                </label>
                <input
                  id="cliente-nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="Constructora del Sur S.A."
                />
              </div>

              {formError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="px-5 py-2.5 rounded-lg bg-blue-950 text-white font-semibold hover:bg-blue-900 disabled:opacity-50"
                >
                  {submitting ? "Guardando..." : "Crear"}
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
