// Presentation-layer formatters. Currency is PEN, locale es-PE.

export function formatPEN(n: number | null | undefined): string {
  const value = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return value.toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });
}

// Power range label. Falls back gracefully when only one bound is known.
export function formatPotencia(
  min: number | null | undefined,
  max: number | null | undefined,
): string {
  const hasMin = typeof min === "number" && Number.isFinite(min);
  const hasMax = typeof max === "number" && Number.isFinite(max);

  if (hasMin && hasMax) {
    return min === max ? `${min} kVA` : `${min}–${max} kVA`;
  }
  if (hasMin) return `${min} kVA`;
  if (hasMax) return `${max} kVA`;
  return "—";
}
