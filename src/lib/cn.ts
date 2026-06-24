// Minimal class joiner. No tailwind-merge: variants here don't conflict.
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
