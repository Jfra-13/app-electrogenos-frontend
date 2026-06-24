import React, { useEffect, useMemo, useState } from "react";
import type { RolCreable, UsuarioCreateDTO, UsuarioDTO } from "../types";
import { createUsuario, listUsuarios } from "../api/usuariosApi";
import Dropdown from "../../../components/react/Dropdown";
import { Skeleton } from "../../../components/react/ui/Skeleton";
import { notify, ToastViewport } from "../../../components/react/ui/Toast";

// Maps the backend `ROLE_*` form to a short label for the table badge.
function roleLabel(roles: string[]): string {
  const up = roles.map((r) => r.toUpperCase());
  if (up.some((r) => r.includes("ADMIN"))) return "ADMIN";
  if (up.some((r) => r.includes("EMPLEADO"))) return "EMPLEADO";
  return "USER";
}

const ROL_OPTIONS = [
  { label: "Empleado", value: "EMPLEADO" },
  { label: "Administrador", value: "ADMIN" },
];

type FormState = {
  username: string;
  password: string;
  email: string;
  rol: RolCreable;
};

const emptyForm: FormState = {
  username: "",
  password: "",
  email: "",
  rol: "EMPLEADO",
};

const emailOk = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function UsuariosManager() {
  const [rows, setRows] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listUsuarios();
      setRows(data);
      setError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error cargando usuarios";
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
    () => [...rows].sort((a, b) => a.username.localeCompare(b.username)),
    [rows],
  );

  const canSubmit = useMemo(() => {
    if (!form.username.trim()) return false;
    if (form.password.length < 8) return false;
    if (!emailOk(form.email.trim())) return false;
    return true;
  }, [form]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setFormError(null);
    const dto: UsuarioCreateDTO = {
      username: form.username.trim(),
      password: form.password,
      email: form.email.trim(),
      rol: form.rol,
    };
    try {
      const created = await createUsuario(dto);
      setRows((prev) => [created, ...prev]);
      setOpen(false);
      notify(`Usuario ${created.username} creado`, "success");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error creando usuario");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-blue-950">Empleados</h2>
          <p className="text-sm text-gray-600">
            Da de alta empleados y administradores del sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="px-5 py-2.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600"
        >
          Nuevo empleado
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
          No hay usuarios cargados todavía.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-semibold">Usuario</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Rol</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((u) => {
                const label = roleLabel(u.roles);
                return (
                  <tr
                    key={u.id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {u.username}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{u.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          label === "ADMIN"
                            ? "bg-orange-100 text-orange-700"
                            : label === "EMPLEADO"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {label}
                      </span>
                    </td>
                  </tr>
                );
              })}
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
              aria-label="Nuevo empleado"
              className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-5"
            >
              <div>
                <h2 className="text-lg font-bold text-blue-950">
                  Nuevo empleado
                </h2>
                <p className="text-sm text-gray-500">
                  La contraseña debe tener al menos 8 caracteres.
                </p>
              </div>

              <div>
                <label
                  htmlFor="usuario-username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Usuario
                </label>
                <input
                  id="usuario-username"
                  value={form.username}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, username: e.target.value }))
                  }
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="vendedor1"
                />
              </div>

              <div>
                <label
                  htmlFor="usuario-email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  id="usuario-email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="vendedor1@empresa.com"
                />
              </div>

              <div>
                <label
                  htmlFor="usuario-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contraseña
                </label>
                <input
                  id="usuario-password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <Dropdown
                  options={ROL_OPTIONS}
                  value={form.rol}
                  className="min-h-10 w-full"
                  onChange={(val) =>
                    setForm((f) => ({ ...f, rol: val as RolCreable }))
                  }
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
