import { describe, expect, it } from "vitest";
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, normalizeHex, formatRgb, formatHsl } from "./convert";

describe("hex ↔ rgb", () => {
  it("expands short-form hex", () => {
    expect(normalizeHex("#abc")).toBe("#AABBCC");
    expect(normalizeHex("f00")).toBe("#FF0000");
  });
  it("rejects invalid hex", () => {
    expect(() => normalizeHex("nope")).toThrow();
    expect(() => normalizeHex("#12345")).toThrow();
  });
  it("round-trips hex → rgb → hex", () => {
    for (const hex of ["#4F46E5", "#000000", "#FFFFFF", "#22C55E"]) {
      expect(rgbToHex(hexToRgb(hex))).toBe(hex);
    }
  });
  it("preserves alpha in 8-digit hex", () => {
    const rgb = hexToRgb("#4F46E580");
    expect(rgb.a).toBeCloseTo(0x80 / 255, 2);
    expect(rgbToHex(rgb)).toBe("#4F46E580");
  });
});

describe("rgb ↔ hsl", () => {
  it("converts primary red to hsl(0, 100%, 50%)", () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
  });
  it("round-trips within 1-unit tolerance", () => {
    const cases = [{ r: 79, g: 70, b: 229 }, { r: 34, g: 197, b: 94 }, { r: 250, g: 204, b: 21 }];
    for (const rgb of cases) {
      const back = hslToRgb(rgbToHsl(rgb));
      expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(1);
    }
  });
});

describe("format helpers", () => {
  it("emits rgb/rgba correctly", () => {
    expect(formatRgb({ r: 10, g: 20, b: 30 })).toBe("rgb(10, 20, 30)");
    expect(formatRgb({ r: 10, g: 20, b: 30, a: 0.5 })).toBe("rgba(10, 20, 30, 0.5)");
  });
  it("emits hsl/hsla correctly", () => {
    expect(formatHsl({ h: 210, s: 50, l: 40 })).toBe("hsl(210, 50%, 40%)");
    expect(formatHsl({ h: 210, s: 50, l: 40, a: 0.25 })).toBe("hsla(210, 50%, 40%, 0.25)");
  });
});
