// Link·IconButton이 쓰는 글자색이 대비 쌍에 등록되어 있는지 본다(tide-v0-impl 티켓 14, Component 완료 기준 5).
// 값의 대비비는 foundation이 검사한다. 여기서는 「등록되어 있는지」만 본다.
import { contrastPairs } from "@tide-tds/foundation";
import { colorContrastRules } from "@tide-tds/foundation/internal";
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

  it("색 계열과 앱 계열은 text 슬롯 × 표면 층 규칙(4.5:1)으로 검사된다", () => {
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
