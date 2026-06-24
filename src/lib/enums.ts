// Enum <-> label maps. The API speaks UPPER_SNAKE enums; the UI shows labels.
// Use these in selects and tables to avoid magic strings across components.

export const TIPO_COMBUSTIBLE_LABELS = {
  NAFTA: "Nafta",
  GAS_NATURAL: "Gas Natural",
  GASOIL: "Gasoil",
} as const;

export const TIPO_ARRANQUE_LABELS = {
  AUTOMATICO: "Automático",
  MANUAL: "Manual",
} as const;

export const MATERIAL_EJE_LABELS = {
  ACERO: "Acero",
  ALEACION: "Aleación",
} as const;

export const TIPO_PAGO_LABELS = {
  EFECTIVO: "Efectivo",
  CHEQUE: "Cheque",
} as const;

type LabelMap = Record<string, string>;

export function labelOf(map: LabelMap, value: string | undefined): string {
  if (!value) return "—";
  return map[value] ?? value;
}

// Turn a label map into `{ value, label }[]` for <Select> options.
export function optionsOf(
  map: LabelMap,
): ReadonlyArray<{ value: string; label: string }> {
  return Object.entries(map).map(([value, label]) => ({ value, label }));
}

// Reverse lookup (label -> enum); falls back to the input when not found.
export function enumOf(map: LabelMap, label: string): string {
  const hit = Object.entries(map).find(([, l]) => l === label);
  return hit ? hit[0] : label;
}
