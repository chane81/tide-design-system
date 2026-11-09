// 대비 쌍 검사. Token 원본을 직접 import한다(ADR 0003).
// 기준은 WCAG 2.x 대비비 하나다. 텍스트 4.5:1, UI 경계·포커스 3:1(tide-v0 티켓 09).
import { describe, expect, it } from "vitest";

import { color, contrastPairs, type ThemeName } from "../src/index.ts";
import {
  contrastExclusions,
  contrastRatio,
  semanticEntries,
  semanticHex,
} from "../src/internal.ts";

const themes: ThemeName[] = ["light", "dark"];

describe("contrastRatio", () => {
  it("WCAG 2.x 대비비를 계산한다", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#777777")).toBe(1);
    // tide-v0 티켓 08에서 계산한 blue 단계별 흰색 대비
    expect(contrastRatio(color.blue[500], color.white)).toBeCloseTo(3.69, 2);
    expect(contrastRatio(color.blue[600], color.white)).toBeCloseTo(5.05, 2);
  });

  it("반투명 색은 받지 않는다", () => {
    expect(() => contrastRatio("#28292c80", "#ffffff")).toThrow();
  });
});

describe("대비 쌍", () => {
  it("light와 dark를 합쳐 128쌍 이상을 검사한다", () => {
    expect(contrastPairs.length * themes.length).toBeGreaterThanOrEqual(128);
  });

  for (const theme of themes) {
    describe(theme, () => {
      it.each(contrastPairs.map((pair) => [pair.foreground, pair.background, pair] as const))(
        "%s / %s",
        (_foreground, _background, pair) => {
          const ratio = contrastRatio(
            semanticHex(pair.foreground, theme),
            semanticHex(pair.background, theme),
          );
          expect(ratio).toBeGreaterThanOrEqual(pair.minRatio);
        },
      );
    });
  }

  it("같은 쌍을 두 번 등록하지 않는다", () => {
    const keys = contrastPairs.map((pair) => `${pair.foreground}/${pair.background}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("Semantic Token 등록", () => {
  const tokens = semanticEntries().map((entry) => entry.className);
  const paired = new Set(contrastPairs.flatMap((pair) => [pair.foreground, pair.background]));
  const excluded = new Set(contrastExclusions.map((exclusion) => exclusion.token));

  it("모든 Semantic Token이 대비 쌍이나 제외 목록에 있다", () => {
    const unregistered = tokens.filter((token) => !paired.has(token) && !excluded.has(token));
    expect(unregistered).toEqual([]);
  });

  it("제외한 Token은 대비 쌍에 쓰지 않는다", () => {
    expect([...excluded].filter((token) => paired.has(token))).toEqual([]);
  });

  it("제외 목록은 장식용 border, disabled, overlay뿐이다", () => {
    expect([...excluded].sort()).toEqual(
      ["bg-disabled", "bg-overlay", "border-default", "text-disabled"].sort(),
    );
  });

  it("대비 쌍과 제외 목록은 있는 Token만 가리킨다", () => {
    const known = new Set<string>(tokens);
    expect([...paired, ...excluded].filter((token) => !known.has(token))).toEqual([]);
  });
});
