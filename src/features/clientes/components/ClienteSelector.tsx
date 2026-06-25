import React, { useEffect, useRef, useState } from "react";
import type { ClienteDTO } from "../types";
import { buscarClientes, crearCliente } from "../api/clientesApi";
import { ApiError } from "../../../lib/api/http";

// Autocomplete combobox with inline create. Replaces the raw `entidadId` input:
// the seller searches a client by name and the parent receives the full ClienteDTO
// (its `id` becomes `entidadId`, its `nombre` becomes `nombreSolicitante`).
export default function ClienteSelector({
  value,
  onChange,
}: {
  value: ClienteDTO | null;
  onChange: (cliente: ClienteDTO | null) => void;
}) {
  const [query, setQuery] = useState(value?.nombre ?? "");
  const [results, setResults] = useState<ClienteDTO[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced search (~300ms). Skips when the text already matches the selection.
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (value && q === value.nombre) return;
    if (!q) {
      setResults([]);
      return;
    }

    setLoading(true);
    const id = setTimeout(async () => {
      try {
        setResults(await buscarClientes(q));
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error buscando clientes");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [query, open, value]);

  // Close the dropdown on outside click.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const select = (cliente: ClienteDTO) => {
    onChange(cliente);
    setQuery(cliente.nombre);
    setResults([]);
    setOpen(false);
  };

  const handleChange = (text: string) => {
    setQuery(text);
    setOpen(true);
    // Editing the text invalidates the previous pick so a stale client can't ship.
    if (value) onChange(null);
  };

  const handleCreate = async () => {
    const nombre = query.trim();
    if (!nombre) return;
    setCreating(true);
    setError(null);
    try {
      select(await crearCliente(nombre));
    } catch (e) {
      // 409 = already exists: re-fetch and pick the exact (or first) match.
      if (e instanceof ApiError && e.status === 409) {
        try {
          const found = await buscarClientes(nombre);
          const exact =
            found.find((c) => c.nombre.toLowerCase() === nombre.toLowerCase()) ??
            found[0];
          if (exact) {
            select(exact);
            return;
          }
        } catch {
          /* fall through to the error message below */
        }
      }
      setError(e instanceof Error ? e.message : "Error creando cliente");
    } finally {
      setCreating(false);
    }
  };

  const q = query.trim();
  const showCreate =
    open && !loading && !creating && q.length > 0 && results.length === 0 && !value;
  const showPanel =
    open && (loading || creating || results.length > 0 || showCreate || !!error);

  return (
    <div className="relative" ref={boxRef}>
      <input
        id="venta-cliente"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setOpen(true)}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls="cliente-listbox"
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
        placeholder="Buscar cliente por nombre"
      />

      {value && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-green-600">
          ✓ seleccionado
        </span>
      )}

      {showPanel && (
        <div
          id="cliente-listbox"
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {loading && <p className="px-4 py-3 text-sm text-gray-500">Buscando…</p>}

          {!loading &&
            results.map((c) => (
              <button
                type="button"
                key={c.id}
                role="option"
                aria-selected={value?.id === c.id}
                onClick={() => select(c)}
                className="block w-full px-4 py-2.5 text-left text-sm text-gray-800 hover:bg-orange-50"
              >
                {c.nombre}
              </button>
            ))}

          {showCreate && (
            <button
              type="button"
              onClick={handleCreate}
              className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-orange-600 hover:bg-orange-50"
            >
              + Crear cliente «{q}»
            </button>
          )}

          {creating && <p className="px-4 py-3 text-sm text-gray-500">Creando…</p>}
          {error && <p className="px-4 py-3 text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
