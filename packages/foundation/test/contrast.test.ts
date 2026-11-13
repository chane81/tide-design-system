// Token 원본을 직접 import한다(ADR 0003). 하한 등급은 ADR 0023이다.
import { describe, expect, it } from "vitest";

import { color, contrastPairs, type ThemeName } from "../src/index";
import {
  contrastExclusions,
  contrastPairRatio,
  contrastRatio,
  semanticEntries,
  semanticHex,
} from "../src/internal";

const themes: ThemeName[] = ["light", "dark"];

describe("contrastRatio", () => {
  it("WCAG 2.x 대비비를 계산한다", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#777777")).toBe(1);
    expect(contrastRatio(color.blue[500], color.white)).toBeCloseTo(3.69, 2);
    expect(contrastRatio(color.blue[600], color.white)).toBeCloseTo(4.36, 2);
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
    for (const pair of translucent) {
      expect(["bg-canvas", "bg-raised"], pair.background).toContain(pair.surface);
    }
    // Role 색 글자는 dark 누름에서 4:1에도 못 미쳐 raised 위에는 text-default만 둔다.
    expect(
      translucent.filter((pair) => pair.surface === "bg-raised").map((pair) => pair.foreground),
    ).toEqual(["text-default", "text-default"]);
    // light: 흰색 위 gray-950 #28292c 4%(0a/255) → #f7f7f7, dark: gray-950 위 white 6%(0f/255) → #353638
    const hover = {
      foreground: "text-default",
      background: "bg-hover",
      minRatio: 4,
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

  it("Role 글자 × 같은 Role faint는 4.5:1(outline·ghost hover, ADR 0025), × subtle-hover 쌍은 없고, Alert 경계 × subtle 쌍은 없고, text × subtle-active는 thumb용 3:1뿐이다(ADR 0022·0023)", () => {
    const roleText = /^text-(primary|success|warning|danger|info)$/;
    const hover = contrastPairs.filter(
      (pair) => roleText.test(pair.foreground) && pair.background.endsWith("-faint"),
    );
    expect(hover).toHaveLength(5);
    expect(hover.every((pair) => pair.minRatio === 4.5)).toBe(true);
    expect(
      contrastPairs.filter(
        (pair) => roleText.test(pair.foreground) && pair.background.endsWith("-subtle-hover"),
      ),
    ).toEqual([]);
    // Role 글자 × 무채색 덮기는 쓰지 않는다(무채색 덮기는 neutral 글자 text-default만).
    expect(
      contrastPairs.filter(
        (pair) =>
          roleText.test(pair.foreground) && ["bg-hover", "bg-active"].includes(pair.background),
      ),
    ).toEqual([]);
    expect(
      contrastPairs.filter(
        (pair) => pair.foreground.startsWith("border-") && pair.background.endsWith("-subtle"),
      ),
    ).toEqual([]);
    // Switch 꺼짐 누름 thumb(text-accent × subtle-active)은 글자가 아닌 UI 요소라 3:1이다.
    const thumb = contrastPairs.filter(
      (pair) => roleText.test(pair.foreground) && pair.background.endsWith("-subtle-active"),
    );
    expect(thumb).toHaveLength(5);
    expect(thumb.every((pair) => pair.minRatio === 3)).toBe(true);
  });

  it("하한은 세 등급(4.5·4·3)이고 등급마다 쓰임이 나뉜다(ADR 0023)", () => {
    expect([...new Set(contrastPairs.map((pair) => pair.minRatio))].sort()).toEqual([3, 4, 4.5]);
    // 일시 상태: hover·누름 배경 위 글자는 4다.
    for (const pair of contrastPairs) {
      const transient =
        pair.background === "bg-hover" ||
        pair.background === "bg-active" ||
        /-(subtle-hover|solid-hover|solid-active)$/.test(pair.background);
      if (
        transient &&
        !pair.foreground.startsWith("border-") &&
        pair.foreground !== "outline-focus"
      ) {
        expect(pair.minRatio, `${pair.foreground} × ${pair.background}`).toBe(4);
      }
    }
    // solid 위 글자는 4다.
    expect(
      contrastPairs
        .filter((pair) => pair.foreground === "text-on-solid")
        .map((pair) => pair.minRatio),
    ).toEqual(Array(18).fill(4));
    // 정지 상태 글자(표면 층, subtle·faint 위)는 4.5다.
    for (const pair of contrastPairs) {
      if (
        pair.foreground.startsWith("text-") &&
        /^bg-(canvas|surface|raised)$|-(subtle|faint)$/.test(pair.background)
      ) {
        expect(pair.minRatio, `${pair.foreground} × ${pair.background}`).toBe(4.5);
      }
    }
    // UI 경계·포커스 표시는 3이다.
    for (const pair of contrastPairs) {
      if (pair.foreground.startsWith("border-") || pair.foreground === "outline-focus") {
        expect(pair.minRatio, `${pair.foreground} × ${pair.background}`).toBe(3);
      }
    }
  });

  it("같은 쌍을 두 번 등록하지 않는다", () => {
    // 반투명 배경은 표면까지 합쳐 하나의 쌍이다.
    const keys = contrastPairs.map(
      (pair) => `${pair.foreground}/${pair.background}/${pair.surface ?? ""}`,
    );
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
