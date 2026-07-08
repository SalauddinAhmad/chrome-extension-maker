import { describe, expect, it } from "vitest";
import { contrastRatio, wcagGrade, bestTextOn, relativeLuminance } from "./contrast";

describe("relative luminance", () => {
  it("black is 0, white is 1", () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
  });
});

describe("contrast + WCAG grade", () => {
  it("black on white is 21:1 → AAA", () => {
    const r = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
    expect(r).toBeCloseTo(21, 0);
    expect(wcagGrade(r)).toBe("AAA");
  });
  it("same color is 1:1 → FAIL", () => {
    const r = contrastRatio({ r: 100, g: 100, b: 100 }, { r: 100, g: 100, b: 100 });
    expect(r).toBe(1);
    expect(wcagGrade(r)).toBe("FAIL");
  });
  it("indigo on white passes AA", () => {
    const r = contrastRatio({ r: 79, g: 70, b: 229 }, { r: 255, g: 255, b: 255 });
    expect(r).toBeGreaterThan(4.5);
  });
});

describe("bestTextOn", () => {
  it("returns white for a dark background", () => {
    expect(bestTextOn({ r: 15, g: 23, b: 42 })).toBe("white");
  });
  it("returns black for a light background", () => {
    expect(bestTextOn({ r: 250, g: 250, b: 250 })).toBe("black");
  });
});
