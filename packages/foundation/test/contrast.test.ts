// 대비 쌍 검사. Token 원본을 직접 import한다(ADR 0003).
// 기준은 WCAG 2.x 대비비 하나다. 텍스트 4.5:1, UI 경계·포커스 3:1(tide-v0 티켓 09).
import { describe, expect, it } from "vitest";

import { color, contrastPairs, type ThemeName } from "../src/index.ts";
import {
  contrastExclusions,
  contrastPairRatio,
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
    // blue 단계별 흰색 대비(500은 tide-v0 티켓 08, 600은 ADR 0022 값)
    expect(contrastRatio(color.blue[500], color.white)).toBeCloseTo(3.69, 2);
    expect(contrastRatio(color.blue[600], color.white)).toBeCloseTo(4.97, 2);
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
          // 반투명 배경(bg-hover·bg-active)은 쌍의 표면 위에 합성한 값으로 계산한다.
          const ratio = contrastPairRatio(pair, theme);
          expect(ratio).toBeGreaterThanOrEqual(pair.minRatio);
        },
      );
    });
  }

  it("반투명 배경 쌍은 표면을 적고, 그 값은 표면 위에 합성한 hex다", () => {
    const translucent = contrastPairs.filter(
      (pair) => semanticHex(pair.background, "light").length === 9,
    );
    expect(translucent.length).toBeGreaterThan(0);
    for (const pair of translucent) expect(pair.surface, pair.background).toBe("bg-canvas");
    // light: 흰색 위 gray-950 #28292c 4%(0a/255) → #f7f7f7, dark: gray-950 위 white 6%(0f/255) → #353638
    const hover = {
      foreground: "text-default",
      background: "bg-hover",
      minRatio: 4.5,
      surface: "bg-canvas",
    } as const;
    expect(contrastPairRatio(hover, "light")).toBeCloseTo(
      contrastRatio(semanticHex("text-default", "light"), "#f7f7f7"),
      5,
    );
    expect(contrastPairRatio(hover, "dark")).toBeCloseTo(
      contrastRatio(semanticHex("text-default", "dark"), "#353638"),
      5,
    );
  });

  it("text × subtle-hover·subtle-active와 Alert 경계 × subtle 쌍은 없다(ADR 0022)", () => {
    const removed = contrastPairs.filter(
      (pair) =>
        (/^text-(primary|success|warning|danger|info)$/.test(pair.foreground) &&
          /-subtle-(hover|active)$/.test(pair.background)) ||
        (pair.foreground.startsWith("border-") && pair.background.endsWith("-subtle")),
    );
    expect(removed).toEqual([]);
  });

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

  it("제외 목록은 장식용 border, 파스텔 테두리, disabled, overlay뿐이다", () => {
    expect([...excluded].sort()).toEqual(
      [
        "bg-disabled",
        "bg-overlay",
        "border-default",
        "border-raised",
        "text-disabled",
        // 파스텔 테두리(subtle-border)는 꾸밈이다(ADR 0022 §1).
        ...["neutral", "primary", "success", "warning", "danger", "info"].map(
          (role) => `border-${role}-subtle`,
        ),
      ].sort(),
    );
  });

  it("대비 쌍과 제외 목록은 있는 Token만 가리킨다", () => {
    const known = new Set<string>(tokens);
    expect([...paired, ...excluded].filter((token) => !known.has(token))).toEqual([]);
  });
});
