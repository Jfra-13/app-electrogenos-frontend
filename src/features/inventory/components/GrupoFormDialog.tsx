import React, { useEffect, useMemo, useState } from "react";
import type {
  GrupoElectrogenoCreateDTO,
  GrupoElectrogenoDTO,
  MaterialEje,
  TipoArranque,
  TipoCombustible,
} from "../types";
import Dropdown from "../../../components/react/Dropdown";
import {
  MATERIAL_EJE_LABELS,
  TIPO_ARRANQUE_LABELS,
  TIPO_COMBUSTIBLE_LABELS,
  optionsOf,
} from "../../../lib/enums";

type FormState = {
  codigo: string;
  vidaUtil: string;
  tipoCombustible: TipoCombustible;
  tipoArranque: TipoArranque;
  pMin: string;
  pMax: string;
  insonorizado: boolean;
  capo: boolean;
  stock: string;
  esMovil: boolean;
  cantidadRuedas: string;
  materialEje: MaterialEje | "";
};

const toNumber = (value: string) => Number(value.replace(",", ".").trim());

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
    stock: typeof grupo?.stock === "number" ? String(grupo.stock) : "",
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
      : toNumber(state.cantidadRuedas)
    : undefined;
  const stock = state.stock.trim() === "" ? undefined : toNumber(state.stock);

  return {
    codigo: state.codigo.trim(),
    vidaUtil: toNumber(state.vidaUtil),
    tipoCombustible: state.tipoCombustible,
    tipoArranque: state.tipoArranque,
    pMin: toNumber(state.pMin),
    pMax: toNumber(state.pMax),
    insonorizado: state.insonorizado,
    capo: state.capo,
    stock,
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
  onSubmit: (dto: GrupoElectrogenoCreateDTO, imageFile?: File | null) => void;
  submitting?: boolean;
}) {
  const title =
    mode === "create" ? "Nuevo Grupo Electrógeno" : "Editar Grupo Electrógeno";

  const [state, setState] = useState<FormState>(() =>
    toFormState(initialValue),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setState(toFormState(initialValue));
    setImageFile(null);
  }, [open, initialValue]);

  const canSubmit = useMemo(() => {
    if (!state.codigo.trim()) return false;
    if (!state.vidaUtil.trim()) return false;
    if (!state.pMin.trim()) return false;
    if (!state.pMax.trim()) return false;
    if (!state.stock.trim()) return false;
    const vidaUtil = toNumber(state.vidaUtil);
    if (!Number.isFinite(vidaUtil) || vidaUtil <= 0) return false;
    const pMin = toNumber(state.pMin);
    const pMax = toNumber(state.pMax);
    if (!Number.isFinite(pMin) || pMin < 0) return false;
    if (!Number.isFinite(pMax) || pMax <= 0) return false;
    if (pMax < pMin) return false;
    const stock = toNumber(state.stock);
    if (!Number.isFinite(stock) || stock < 0) return false;
    if (state.esMovil) {
      if (!state.cantidadRuedas.trim()) return false;
      if (!state.materialEje) return false;
      const n = toNumber(state.cantidadRuedas);
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
          className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-100 max-h-[85vh] flex flex-col"
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
            className="px-4 sm:px-6 py-6 space-y-5 overflow-y-auto flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              if (!canSubmit || submitting) return;
              onSubmit(toCreateDTO(state), imageFile);
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="grupo-codigo" className="block text-sm font-medium text-gray-700 mb-2">
                  Código
                </label>
                <input
                  id="grupo-codigo"
                  value={state.codigo}
                  onChange={(e) =>
                    setState((s) => ({ ...s, codigo: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="GE-0001"
                />
              </div>

              <div>
                <label htmlFor="grupo-vida-util" className="block text-sm font-medium text-gray-700 mb-2">
                  Vida útil (años)
                </label>
                <input
                  id="grupo-vida-util"
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
                <label htmlFor="grupo-stock" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock (unidades)
                </label>
                <input
                  id="grupo-stock"
                  value={state.stock}
                  onChange={(e) =>
                    setState((s) => ({ ...s, stock: e.target.value }))
                  }
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de combustible
                </label>
                <Dropdown
                  options={optionsOf(TIPO_COMBUSTIBLE_LABELS)}
                  value={state.tipoCombustible}
                  className="min-h-10 w-full"
                  onChange={(val) =>
                    setState((s) => ({
                      ...s,
                      tipoCombustible: val as TipoCombustible,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de arranque
                </label>
                <Dropdown
                  options={optionsOf(TIPO_ARRANQUE_LABELS)}
                  value={state.tipoArranque}
                  className="min-h-10 w-full"
                  onChange={(val) =>
                    setState((s) => ({
                      ...s,
                      tipoArranque: val as TipoArranque,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="grupo-p-min" className="block text-sm font-medium text-gray-700 mb-2">
                  P mínima (kVA)
                </label>
                <input
                  id="grupo-p-min"
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
                <label htmlFor="grupo-p-max" className="block text-sm font-medium text-gray-700 mb-2">
                  P máxima (kVA)
                </label>
                <input
                  id="grupo-p-max"
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
                  <label htmlFor="grupo-cantidad-ruedas" className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad de ruedas
                  </label>
                  <input
                    id="grupo-cantidad-ruedas"
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
                  <Dropdown
                    options={[
                      { label: "Seleccionar", value: "" },
                      ...optionsOf(MATERIAL_EJE_LABELS),
                    ]}
                    value={state.materialEje}
                    className="min-h-10 w-full"
                    onChange={(val) =>
                      setState((s) => ({
                        ...s,
                        materialEje: val as MaterialEje,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="grupo-imagen" className="block text-sm font-medium text-gray-700 mb-2">
                Imagen (opcional)
              </label>
              <input
                id="grupo-imagen"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(e.target.files ? e.target.files[0] : null)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Puedes cargar la imagen ahora o agregarla mas adelante.
              </p>
            </div>

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
