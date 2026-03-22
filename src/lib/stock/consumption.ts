/**
 * Serie diaria de unidades consumidas (índice 0 = día más antiguo).
 */
export function movingAverage(
  series: number[],
  windowSize: number
): number | null {
  if (windowSize <= 0 || series.length < windowSize) return null;
  const slice = series.slice(-windowSize);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / windowSize;
}

/** Cobertura simple en días: stock actual / promedio diario (null si promedio 0). */
export function coverageDays(
  currentStock: number,
  avgDailyConsumption: number
): number | null {
  if (avgDailyConsumption <= 0) return null;
  return currentStock / avgDailyConsumption;
}

export function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function standardDeviationSample(values: number[]): number | null {
  if (values.length < 2) return null;
  const m = mean(values);
  if (m === null) return null;
  const sq = values.map((v) => (v - m) ** 2);
  const varSample = sq.reduce((a, b) => a + b, 0) / (values.length - 1);
  return Math.sqrt(varSample);
}

/**
 * Consumo “anómalo” si el valor del día supera media + z * desvío (muestra).
 */
export function isAnomalousConsumption(
  historicalDaily: number[],
  todayQty: number,
  zThreshold = 2.5
): boolean {
  if (historicalDaily.length < 5 || todayQty <= 0) return false;
  const m = mean(historicalDaily);
  const sd = standardDeviationSample(historicalDaily);
  if (m === null || sd === null || sd === 0) {
    return m != null && todayQty > m * 2;
  }
  return todayQty > m + zThreshold * sd;
}
