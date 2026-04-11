/** Default matches Plainbot / Tailwind primary orange. */
export const DEFAULT_WIDGET_ACCENT = "#f97316";

/**
 * Validates and normalizes a hex colour to #rrggbb.
 * Returns null if invalid (caller may fall back to default).
 */
export function normalizeWidgetAccentColor(input: unknown): string | null {
  if (input == null || typeof input !== "string") return null;
  let s = input.trim();
  if (!s) return null;
  if (!s.startsWith("#")) s = `#${s}`;
  const hex = s.slice(1);
  if (!/^[0-9a-fA-F]{3}$/.test(hex) && !/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  return `#${full.toLowerCase()}`;
}

export function resolvedWidgetAccentColor(stored: string | null | undefined): string {
  return normalizeWidgetAccentColor(stored) ?? DEFAULT_WIDGET_ACCENT;
}
