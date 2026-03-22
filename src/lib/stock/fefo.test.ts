import { describe, expect, it } from "vitest";
import {
  isEgressFefoCompliant,
  sortLotsByFefo,
  suggestFefoAllocation,
} from "./fefo";

describe("sortLotsByFefo", () => {
  it("ordena por vencimiento y luego ingreso", () => {
    const sorted = sortLotsByFefo([
      {
        id: "a",
        expiryDate: "2026-12-01",
        entryDate: "2025-01-01",
        qtyAvailable: 10,
      },
      {
        id: "b",
        expiryDate: "2026-06-01",
        entryDate: "2025-06-01",
        qtyAvailable: 5,
      },
      {
        id: "c",
        expiryDate: "2026-06-01",
        entryDate: "2025-01-01",
        qtyAvailable: 1,
      },
    ]);
    expect(sorted.map((x) => x.id)).toEqual(["c", "b", "a"]);
  });

  it("excluye cantidad 0", () => {
    const sorted = sortLotsByFefo([
      {
        id: "z",
        expiryDate: "2025-01-01",
        entryDate: "2025-01-01",
        qtyAvailable: 0,
      },
      {
        id: "y",
        expiryDate: "2026-01-01",
        entryDate: "2025-01-01",
        qtyAvailable: 2,
      },
    ]);
    expect(sorted.map((x) => x.id)).toEqual(["y"]);
  });
});

describe("suggestFefoAllocation", () => {
  it("distribuye en orden FEFO", () => {
    const lots = [
      {
        id: "early",
        expiryDate: "2026-01-01",
        entryDate: "2025-01-01",
        qtyAvailable: 3,
      },
      {
        id: "late",
        expiryDate: "2027-01-01",
        entryDate: "2025-01-01",
        qtyAvailable: 10,
      },
    ];
    expect(suggestFefoAllocation(lots, 5)).toEqual([
      { lotId: "early", take: 3 },
      { lotId: "late", take: 2 },
    ]);
  });
});

describe("isEgressFefoCompliant", () => {
  it("rechaza lote posterior si el primero alcanza", () => {
    const lots = [
      {
        id: "first",
        expiryDate: "2026-01-01",
        entryDate: "2025-01-01",
        qtyAvailable: 10,
      },
      {
        id: "second",
        expiryDate: "2027-01-01",
        entryDate: "2025-01-01",
        qtyAvailable: 10,
      },
    ];
    expect(isEgressFefoCompliant(lots, "first", 4)).toBe(true);
    expect(isEgressFefoCompliant(lots, "second", 4)).toBe(false);
  });
});
