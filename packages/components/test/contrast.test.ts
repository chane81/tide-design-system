// Link·IconButton이 쓰는 글자색이 대비 쌍에 등록되어 있는지 본다(tide-v0-impl 티켓 14, Component 완료 기준 5).
// 값의 대비비는 foundation이 검사한다. 여기서는 「등록되어 있는지」만 본다.
import { contrastPairs } from "@tide-tds/foundation";
import {
  checkColorContrast,
  colorContrastRules,
  colorFamilyNames,
  colorSlotHex,
  contrastExclusions,
} from "@tide-tds/foundation/internal";
import { describe, expect, it } from "vitest";

const surfaces = ["bg-canvas", "bg-surface", "bg-raised"] as const;

const registered = (foreground: string, background: string, minRatio: number): boolean =>
  contrastPairs.some(
    (pair) =>
      pair.foreground === foreground &&
      pair.background === background &&
      pair.minRatio === minRatio,
  );

describe("Link 글자색 대비 쌍", () => {
  // Link는 accent 슬롯의 text를 표면 층 위에 쓴다. Role의 text는 Role Token으로 등록되어 있다.
  // neutral은 역할 text가 없어 text-default다.
  const roleText = [
    "text-default",
    "text-primary",
    "text-success",
    "text-warning",
    "text-danger",
    "text-info",
  ];

  it.each(roleText)("%s × 표면 층 3개가 4.5:1로 등록되어 있다", (foreground) => {
    for (const background of surfaces) {
      expect(registered(foreground, background, 4.5), `${foreground} × ${background}`).toBe(true);
    }
  });

  it("앱 Role은 text 슬롯 × 표면 층 규칙(4.5:1)으로 검사된다(tide-color가 같은 규칙을 쓴다)", () => {
    for (const background of surfaces) {
      expect(
        colorContrastRules.some(
          (rule) =>
            rule.foreground === "text" && rule.background === background && rule.minRatio === 4.5,
        ),
        `text × ${background}`,
      ).toBe(true);
    }
  });

  it("포커스 표시(outline-focus) × 표면 층이 3:1로 등록되어 있다", () => {
    for (const background of surfaces) {
      expect(registered("outline-focus", background, 3)).toBe(true);
    }
  });
});

// Badge·Card·Separator(tide-v0-impl 티켓 19)가 쓰는 색이 대비 쌍에 등록되어 있거나 제외 목록에 있는지 본다.
describe("Badge 대비 쌍", () => {
  const tideRoles = ["primary", "success", "warning", "danger", "info"] as const;
  it.each(tideRoles)("subtle: text-%s × 같은 Role subtle이 4.5:1로 등록되어 있다", (role) => {
    expect(registered(`text-${role}`, `bg-${role}-subtle`, 4.5)).toBe(true);
  });

  it("subtle neutral: text-default × bg-neutral-subtle이 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-neutral-subtle", 4.5)).toBe(true);
  });

  it.each(["neutral", ...tideRoles])(
    "solid: text-on-solid × bg-%s-solid가 4.5:1로 등록되어 있다",
    (role) => {
      expect(registered("text-on-solid", `bg-${role}-solid`, 4.5)).toBe(true);
    },
  );

  it("색 계열 6개가 text × subtle, on-solid × solid 규칙을 light·dark에서 통과한다", () => {
    expect(colorFamilyNames).toEqual(["blue", "gray", "green", "amber", "red", "cyan"]);
    for (const family of colorFamilyNames) {
      const results = checkColorContrast({
        light: colorSlotHex(family, "light"),
        dark: colorSlotHex(family, "dark"),
      });
      const used = results.filter(
        (result) =>
          (result.foreground === "text" && result.background === "subtle") ||
          (result.foreground === "on-solid" && result.background === "solid"),
      );
      // 규칙 2개 × Theme 2개
      expect(used, family).toHaveLength(4);
      expect(
        used.filter((result) => !result.pass),
        family,
      ).toEqual([]);
    }
  });

  it("앱 Role·앱 장식 계열은 text × subtle, on-solid × solid 규칙(4.5:1)으로 검사된다(tide-color가 같은 규칙을 쓴다)", () => {
    const rule = (foreground: string, background: string): boolean =>
      colorContrastRules.some(
        (r) => r.foreground === foreground && r.background === background && r.minRatio === 4.5,
      );
    expect(rule("text", "subtle")).toBe(true);
    expect(rule("on-solid", "solid")).toBe(true);
  });
});

describe("Card·Separator 대비 쌍", () => {
  it("Card 글자: text-default × bg-surface가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-surface", 4.5)).toBe(true);
  });

  it("Card 경계와 Separator 선(border-default)은 장식용 구분선으로 대비 검사에서 제외되어 있다", () => {
    expect(contrastExclusions.some((item) => item.token === "border-default")).toBe(true);
  });
});

// Alert(tide-v0-impl 티켓 20)가 쓰는 역할 text·border·subtle 배경 조합과 닫기 버튼 포커스 표시가 등록되어 있는지 본다.
describe("Alert 대비 쌍", () => {
  const tideRoles = ["primary", "success", "warning", "danger", "info"] as const;
  const allRoles = ["neutral", ...tideRoles] as const;
  const border = (role: (typeof allRoles)[number]): string =>
    role === "neutral" ? "border-strong" : `border-${role}`;
  const text = (role: (typeof allRoles)[number]): string =>
    role === "neutral" ? "text-default" : `text-${role}`;

  it.each(allRoles)(
    "%s: 글자·아이콘(역할 text) × 같은 Role subtle이 4.5:1로 등록되어 있다",
    (role) => {
      expect(registered(text(role), `bg-${role}-subtle`, 4.5)).toBe(true);
    },
  );

  it.each(allRoles)("%s: 역할 경계 × 같은 Role subtle(안쪽)이 3:1로 등록되어 있다", (role) => {
    expect(registered(border(role), `bg-${role}-subtle`, 3)).toBe(true);
  });

  it.each(allRoles)("%s: 역할 경계 × 표면 층(바깥)이 3:1로 등록되어 있다", (role) => {
    for (const background of surfaces) {
      expect(registered(border(role), background, 3), `${border(role)} × ${background}`).toBe(true);
    }
  });

  it.each(allRoles)(
    "%s: 닫기 버튼 포커스 표시(outline-focus) × 같은 Role subtle이 3:1로 등록되어 있다",
    (role) => {
      expect(registered("outline-focus", `bg-${role}-subtle`, 3)).toBe(true);
    },
  );

  it.each(allRoles)(
    "%s: 닫기 버튼(ghost) hover·누름 글자 × subtle-hover·subtle-active가 4.5:1로 등록되어 있다",
    (role) => {
      for (const state of ["subtle-hover", "subtle-active"]) {
        expect(registered(text(role), `bg-${role}-${state}`, 4.5)).toBe(true);
      }
    },
  );

  it("앱 Role은 text × subtle(4.5:1), border × 표면 층(3:1) 규칙으로 검사된다(tide-color가 같은 규칙을 쓴다)", () => {
    const rule = (foreground: string, background: string, minRatio: number): boolean =>
      colorContrastRules.some(
        (r) =>
          r.foreground === foreground && r.background === background && r.minRatio === minRatio,
      );
    expect(rule("text", "subtle", 4.5)).toBe(true);
    for (const background of surfaces) expect(rule("border", background, 3)).toBe(true);
  });
});

// Avatar(tide-v0-impl 티켓 21)의 fallback은 색 계열의 text(아이콘) × subtle(배경)이다. 색 이름 규칙으로 검사된다.
// 이미지 층은 사용자 사진이라 대비 검사 대상이 아니다.
describe("Avatar 대비 쌍", () => {
  it("색 계열 6개의 fallback 아이콘(text) × 배경(subtle)이 light·dark에서 4.5:1을 통과한다", () => {
    for (const family of colorFamilyNames) {
      const used = checkColorContrast({
        light: colorSlotHex(family, "light"),
        dark: colorSlotHex(family, "dark"),
      }).filter((result) => result.foreground === "text" && result.background === "subtle");
      // Theme 2개
      expect(used, family).toHaveLength(2);
      expect(
        used.filter((result) => !result.pass),
        family,
      ).toEqual([]);
    }
  });

  it("앱 장식 계열은 text × subtle 규칙(4.5:1)으로 검사된다(tide-color가 같은 규칙을 쓴다)", () => {
    expect(
      colorContrastRules.some(
        (r) => r.foreground === "text" && r.background === "subtle" && r.minRatio === 4.5,
      ),
    ).toBe(true);
  });
});
