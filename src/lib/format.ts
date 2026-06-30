// Presentation-layer formatters. Currency is PEN, locale es-PE.

export function formatPEN(n: number | null | undefined): string {
  const value = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return value.toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });
}

// ISO datetime -> short es-PE label. Returns "—" for null/invalid input.
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
