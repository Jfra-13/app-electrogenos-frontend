import React, { useEffect, useMemo, useState } from "react";
import type {
  GrupoElectrogenoCreateDTO,
  GrupoElectrogenoDTO,
  MaterialEje,
  TipoArranque,
  TipoCombustible,
} from "../types";

type FormState = {
  codigo: string;
  vidaUtil: string;
  tipoCombustible: TipoCombustible;
  tipoArranque: TipoArranque;
  pMin: string;
  pMax: string;
  insonorizado: boolean;
  capo: boolean;
  esMovil: boolean;
  cantidadRuedas: string;
  materialEje: MaterialEje | "";
};

function toFormState(grupo?: GrupoElectrogenoDTO): FormState {
  return {
    codigo: grupo?.codigo ?? "",
    vidaUtil: typeof grupo?.vidaUtil === "number" ? String(grupo.vidaUtil) : "",
    tipoCombustible: grupo?.tipoCombustible ?? "NAFTA",
    tipoArranque: grupo?.tipoArranque ?? "AUTOMATICO",
    pMin: typeof grupo?.pMin === "number" ? String(grupo.pMin) : "",
    pMax: typeof grupo?.pMax === "number" ? String(grupo.pMax) : "",
    insonorizado: !!grupo?.insonorizado,
    capo: !!grupo?.capo,
    esMovil: grupo?.esMovil ?? grupo?.tipoGrupo === "Móvil",
    cantidadRuedas:
      typeof grupo?.cantidadRuedas === "number"
        ? String(grupo.cantidadRuedas)
        : "",
    materialEje: grupo?.materialEje ?? "",
  };
}

function toCreateDTO(state: FormState): GrupoElectrogenoCreateDTO {
  const cantidadRuedas = state.esMovil
    ? state.cantidadRuedas.trim() === ""
      ? undefined
      : Number(state.cantidadRuedas)
    : undefined;

  return {
    codigo: state.codigo.trim(),
    vidaUtil: Number(state.vidaUtil),
    tipoCombustible: state.tipoCombustible,
    tipoArranque: state.tipoArranque,
    pMin: Number(state.pMin),
    pMax: Number(state.pMax),
    insonorizado: state.insonorizado,
    capo: state.capo,
    esMovil: state.esMovil,
    cantidadRuedas,
    materialEje: state.esMovil ? state.materialEje || undefined : undefined,
  };
}

export default function GrupoFormDialog({
  open,
  mode,
  initialValue,
  onClose,
  onSubmit,
  submitting,
}: {
  open: boolean;
  mode: "create" | "edit";
  initialValue?: GrupoElectrogenoDTO;
  onClose: () => void;
  onSubmit: (dto: GrupoElectrogenoCreateDTO) => void;
  submitting?: boolean;
}) {
  const title =
    mode === "create" ? "Nuevo Grupo Electrógeno" : "Editar Grupo Electrógeno";

  const [state, setState] = useState<FormState>(() =>
    toFormState(initialValue),
  );

  useEffect(() => {
    if (!open) return;
    setState(toFormState(initialValue));
  }, [open, initialValue]);

  const canSubmit = useMemo(() => {
    if (!state.codigo.trim()) return false;
    if (!state.vidaUtil.trim()) return false;
    if (!state.pMin.trim()) return false;
    if (!state.pMax.trim()) return false;
    const vidaUtil = Number(state.vidaUtil);
    if (!Number.isFinite(vidaUtil) || vidaUtil <= 0) return false;
    const pMin = Number(state.pMin);
    const pMax = Number(state.pMax);
    if (!Number.isFinite(pMin) || pMin < 0) return false;
    if (!Number.isFinite(pMax) || pMax <= 0) return false;
    if (pMax < pMin) return false;
    if (state.esMovil) {
      if (!state.cantidadRuedas.trim()) return false;
      if (!state.materialEje) return false;
      const n = Number(state.cantidadRuedas);
      if (!Number.isFinite(n) || n <= 0) return false;
    }
    return true;
  }, [state]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-gray-900/50"
        role="presentation"
        onClick={() => {
          if (!submitting) onClose();
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-100"
        >
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-blue-950">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              disabled={!!submitting}
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50"
              aria-label="Cerrar"
              title="Cerrar"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form
            className="px-6 py-6 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!canSubmit || submitting) return;
              onSubmit(toCreateDTO(state));
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código
                </label>
                <input
                  value={state.codigo}
                  onChange={(e) =>
                    setState((s) => ({ ...s, codigo: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="GE-0001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vida útil (años)
                </label>
                <input
                  value={state.vidaUtil}
                  onChange={(e) =>
                    setState((s) => ({ ...s, vidaUtil: e.target.value }))
                  }
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de combustible
                </label>
                <select
                  value={state.tipoCombustible}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      tipoCombustible: e.target.value as TipoCombustible,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  <option value="NAFTA">NAFTA</option>
                  <option value="GAS_NATURAL">GAS_NATURAL</option>
                  <option value="GASOIL">GASOIL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de arranque
                </label>
                <select
                  value={state.tipoArranque}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      tipoArranque: e.target.value as TipoArranque,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  <option value="AUTOMATICO">AUTOMATICO</option>
                  <option value="MANUAL">MANUAL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  P mínima (kVA)
                </label>
                <input
                  value={state.pMin}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      pMin: e.target.value,
                    }))
                  }
                  inputMode="decimal"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  P máxima (kVA)
                </label>
                <input
                  value={state.pMax}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      pMax: e.target.value,
                    }))
                  }
                  inputMode="decimal"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={state.insonorizado}
                  onChange={(e) =>
                    setState((s) => ({ ...s, insonorizado: e.target.checked }))
                  }
                />
                <span className="text-sm text-gray-700">Insonorizado</span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={state.capo}
                  onChange={(e) =>
                    setState((s) => ({ ...s, capo: e.target.checked }))
                  }
                />
                <span className="text-sm text-gray-700">Capo</span>
              </label>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">Es Móvil</p>
                <p className="text-xs text-gray-500">
                  Activa para cargar datos del chasis
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    esMovil: !s.esMovil,
                    ...(s.esMovil
                      ? { cantidadRuedas: "", materialEje: "" }
                      : {}),
                  }))
                }
                className={`h-8 w-14 rounded-full border transition-colors ${
                  state.esMovil
                    ? "bg-orange-500 border-orange-500"
                    : "bg-gray-200 border-gray-200"
                }`}
                aria-pressed={state.esMovil}
                aria-label="Toggle es móvil"
              >
                <span
                  className={`block h-7 w-7 rounded-full bg-white shadow-sm transition-transform ${
                    state.esMovil ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {state.esMovil && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad de ruedas
                  </label>
                  <input
                    value={state.cantidadRuedas}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        cantidadRuedas: e.target.value,
                      }))
                    }
                    inputMode="numeric"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    placeholder="4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material del eje
                  </label>
                  <select
                    value={state.materialEje}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        materialEje: e.target.value as MaterialEje,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  >
                    <option value="">Seleccionar</option>
                    <option value="ACERO">ACERO</option>
                    <option value="ALEACION">ALEACION</option>
                  </select>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={!!submitting}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!canSubmit || !!submitting}
                className="px-5 py-2.5 rounded-lg bg-blue-950 text-white font-semibold hover:bg-blue-900 disabled:opacity-50"
              >
                {submitting ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
