import { format as dfFormat } from "date-fns";
import { es } from "date-fns/locale";
import { DEFAULT_CURRENCY, DEFAULT_TIMEZONE } from "./constants";

const arsFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: DEFAULT_CURRENCY,
  minimumFractionDigits: 2,
});

export function formatArsFromCents(cents: number): string {
  return arsFormatter.format(cents / 100);
}

export function formatDateAR(
  d: Date | string,
  pattern = "dd/MM/yyyy"
): string {
  const date = typeof d === "string" ? new Date(d + "T12:00:00") : d;
  return dfFormat(date, pattern, { locale: es });
}

export function formatDateTimeAR(d: Date): string {
  return dfFormat(d, "dd/MM/yyyy HH:mm", { locale: es });
}

export { DEFAULT_TIMEZONE };
