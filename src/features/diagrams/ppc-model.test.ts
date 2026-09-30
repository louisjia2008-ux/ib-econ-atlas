import { describe, expect, it } from "vitest";
import { classifyPPCPoint, frontierOutput, frontierTable, movePPCPoint } from "./ppc-model";

describe("PPC model", () => {
  it("classifies points inside, on and outside the current frontier", () => {
    expect(classifyPPCPoint({ x: 60, y: 80 }, 100)).toBe("on");
    expect(classifyPPCPoint({ x: 40, y: 40 }, 100)).toBe("inside");
    expect(classifyPPCPoint({ x: 80, y: 90 }, 100)).toBe("outside");
  });

  it("represents an outward shift as a larger feasible set", () => {
    const point = { x: 80, y: 80 };
    expect(classifyPPCPoint(point, 100)).toBe("outside");
    expect(classifyPPCPoint(point, 120)).toBe("inside");
    expect(frontierOutput(80, 120)).toBeGreaterThan(frontierOutput(80, 100));
  });

  it("supports clamped keyboard movement", () => {
    expect(movePPCPoint({ x: 1, y: 149 }, "ArrowLeft", 5)).toEqual({ x: 0, y: 149 });
    expect(movePPCPoint({ x: 1, y: 149 }, "ArrowUp", 5)).toEqual({ x: 1, y: 150 });
  });

  it("provides a five-row tabular alternative", () => {
    const rows = frontierTable(100);
    expect(rows).toHaveLength(5);
    expect(rows[0]).toEqual({ x: 0, y: 100 });
    expect(rows.at(-1)).toEqual({ x: 100, y: 0 });
  });
});
