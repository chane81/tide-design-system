// Primitive 스케일 값 검사(tide-color-tone-impl 티켓 01, ADR 0022 §4·§5).
// 기대 값은 Token 원본에서 만들지 않고 결정 표(tide-color-tone 티켓 02 「스케일 값」, 05 Answer)를 그대로 적는다.
// 그래서 원본 값이 결정과 한 글자라도 다르면 여기서 실패한다.
import { describe, expect, it } from "vitest";

import { color, type ColorFamily, type ColorStep } from "../src/index.ts";

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

// 계열별 11단계 hex. 400·500과 gray는 바꾸지 않은 값이다(amber 400만 #ca9734로 바뀜).
const expected: Record<ColorFamily, readonly string[]> = {
  blue: [
    "#eff4fc",
    "#e3eefd",
    "#c9d7eb",
    "#a7c0e3",
    "#65a1f9",
    "#3183f5",
    "#3c70bb",
    "#2b5fa8",
    "#184c93",
    "#114080",
    "#113465",
  ],
  gray: [
    "#f5f5f6",
    "#e8e8ea",
    "#d7d8da",
    "#bec1c4",
    "#9da1a6",
    "#82878e",
    "#6b7179",
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
    "#278445",
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
    "#976500",
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
    "#bb4039",
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
    "#007c9e",
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
    "#7d5cb0",
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
    "#14817c",
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

  it("앵커 blue-500은 #3183f5다", () => {
    expect(color.blue[500]).toBe("#3183f5");
  });

  it.each(families)("%s는 50 → 950으로 갈수록 OKLCH L이 줄어든다", (family) => {
    const lightness = steps.map((step) => oklchLightness(color[family][step as ColorStep]));
    for (let index = 1; index < lightness.length; index += 1) {
      expect(lightness[index], `${family}-${steps[index]}`).toBeLessThan(lightness[index - 1]!);
    }
  });
});
