import { describe, expect, it } from "vitest";
import {
  coverageDays,
  isAnomalousConsumption,
  movingAverage,
} from "./consumption";

describe("movingAverage", () => {
  it("últimos N días", () => {
    expect(movingAverage([1, 2, 3, 4, 10], 3)).toBeCloseTo((3 + 4 + 10) / 3);
    expect(movingAverage([1], 3)).toBeNull();
  });
});

describe("coverageDays", () => {
  it("stock / promedio diario", () => {
    expect(coverageDays(100, 10)).toBe(10);
    expect(coverageDays(100, 0)).toBeNull();
  });
});

describe("isAnomalousConsumption", () => {
  it("detecta pico respecto a historia", () => {
    const flat = Array(20).fill(5) as number[];
    expect(isAnomalousConsumption(flat, 6, 2)).toBe(false);
    expect(isAnomalousConsumption(flat, 40, 2)).toBe(true);
  });
});
