// 기대 값은 Token 원본에서 만들지 않고 결정 표(ADR 0022)를 그대로 적어, 원본 값이 결정과 다르면 실패하게 한다.
import { describe, expect, it } from "vitest";

import { color, type ColorFamily, type ColorStep } from "./color";

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const expected: Record<ColorFamily, readonly string[]> = {
  blue: [
    "#ecf5ff",
    "#e1eeff",
    "#bfd8f7",
    "#97c2f4",
    "#53a3fe",
    "#148cfc",
    "#1e7bd8",
    "#0060b3",
    "#004e94",
    "#00427f",
    "#003568",
  ],
  gray: [
    "#f5f5f6",
    "#e8e8ea",
    "#d7d8da",
    "#bec1c4",
    "#9da1a6",
    "#82878e",
    "#747a81",
    "#5b6068",
    "#4a4e54",
    "#3f4247",
    "#28292c",
  ],
  green: [
    "#ecf7ee",
    "#dbf5df",
    "#c2dfc7",
    "#9ecba6",
    "#60b775",
    "#15a14c",
    "#428a55",
    "#0b7335",
    "#055f2a",
    "#045123",
    "#02471e",
  ],
  amber: [
    "#f8f4e5",
    "#f7edc8",
    "#e2d6a9",
    "#d6bb79",
    "#ca9734",
    "#b47900",
    "#9b702f",
    "#815600",
    "#6a4600",
    "#5b3b00",
    "#543601",
  ],
  red: [
    "#fcf1ef",
    "#ffe6e3",
    "#efcdc8",
    "#e5aea7",
    "#f47368",
    "#ea3e39",
    "#b55a51",
    "#a82d29",
    "#921315",
    "#7c1212",
    "#671513",
  ],
  cyan: [
    "#edf5f9",
    "#ddf1f9",
    "#c1dbe6",
    "#97c6da",
    "#51aed0",
    "#0094bc",
    "#3484a1",
    "#006a87",
    "#00576f",
    "#004a5f",
    "#1c4351",
  ],
  purple: [
    "#f5f2fc",
    "#f0e9ff",
    "#d9d0ed",
    "#c4b5e4",
    "#ad8de5",
    "#956ed3",
    "#8469b0",
    "#6b4e99",
    "#583e81",
    "#4b336f",
    "#412963",
  ],
  mint: [
    "#ebf6f5",
    "#d7f4f1",
    "#b9dfdb",
    "#91cbc6",
    "#54b3ad",
    "#219a94",
    "#3a8883",
    "#116e6a",
    "#0b5a57",
    "#0e4c49",
    "#11403e",
  ],
};

const families = Object.keys(expected) as ColorFamily[];

// sRGB hex → OKLCH L(OKLab의 L과 같다). 변환 행렬은 OKLab 정의의 값이다.
function oklchLightness(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((index) => {
    const channel = Number.parseInt(hex.slice(index, index + 2), 16) / 255;

    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
}

describe("Primitive 스케일", () => {
  it("계열은 Role 계열 6개 다음에 장식 계열 purple·mint가 온다", () => {
    const names = Object.keys(color).filter((name) => name !== "white" && name !== "black");
    expect(names).toEqual(families);
  });

  it.each(families)("%s 스케일 값이 결정 표와 같다", (family) => {
    expect(steps.map((step) => color[family][step as ColorStep])).toEqual(expected[family]);
  });

  it("앵커 blue-500은 #148cfc다", () => {
    expect(color.blue[500]).toBe("#148cfc");
  });

  it.each(families)("%s는 50 → 950으로 갈수록 OKLCH L이 줄어든다", (family) => {
    const lightness = steps.map((step) => oklchLightness(color[family][step as ColorStep]));
    for (let index = 1; index < lightness.length; index += 1) {
      expect(lightness[index], `${family}-${steps[index]}`).toBeLessThan(lightness[index - 1]!);
    }
  });
});
