// 덮기·섞기 계산 값 검사(tide-color-tone-impl 티켓 02, ADR 0022 §2).
// 기대 값은 Token 원본에서 만들지 않고 결정 표(tide-color-tone 티켓 02 「계산된 호버·클릭 값」)를 그대로 적는다.
// 반올림 허용: 없다(±0). sRGB 채널마다 반올림한 hex가 표와 한 글자도 다르지 않아야 한다.
import { describe, expect, it } from "vitest";

import { type ThemeName } from "../src/index.ts";
import { mixHex, semanticHex } from "../src/internal.ts";

// [Role, 계열, subtle-hover, subtle-active, solid-hover, solid-active] (light)
const decided = [
  ["primary", "blue", "#dce6f5", "#d4deec", "#3460a1", "#305a96"],
  ["success", "green", "#d4edd8", "#cde5d1", "#22723b", "#1f6a37"],
  ["warning", "amber", "#efe5c2", "#e6ddbc", "#825700", "#795100"],
  ["danger", "red", "#f6dedc", "#eed7d4", "#a13731", "#96332e"],
  ["info", "cyan", "#d6e9f1", "#cfe1e9", "#006b88", "#00637e"],
] as const;

const themes: ThemeName[] = ["light", "dark"];

describe("계산된 호버·클릭 값(결정 표, ±0)", () => {
  it.each(decided)(
    "%s(%s) light: subtle-hover %s, subtle-active %s, solid-hover %s, solid-active %s",
    (role, _family, subtleHover, subtleActive, solidHover, solidActive) => {
      expect(semanticHex(`bg-${role}-subtle-hover`, "light")).toBe(subtleHover);
      expect(semanticHex(`bg-${role}-subtle-active`, "light")).toBe(subtleActive);
      expect(semanticHex(`bg-${role}-solid-hover`, "light")).toBe(solidHover);
      expect(semanticHex(`bg-${role}-solid-active`, "light")).toBe(solidActive);
    },
  );

  it.each(decided)("%s solid 호버·클릭은 dark에서도 light와 같다", (role) => {
    expect(semanticHex(`bg-${role}-solid-hover`, "dark")).toBe(
      semanticHex(`bg-${role}-solid-hover`, "light"),
    );
    expect(semanticHex(`bg-${role}-solid-active`, "dark")).toBe(
      semanticHex(`bg-${role}-solid-active`, "light"),
    );
  });
});

describe("mixHex", () => {
  it("sRGB 채널마다 섞고 반올림한다", () => {
    expect(mixHex("#ffffff", "#000000", 0.5)).toBe("#808080");
    expect(mixHex("#e3eefd", "#28292c", 0.04)).toBe("#dce6f5");
    expect(mixHex("#123456", "#abcdef", 0)).toBe("#123456");
    expect(mixHex("#123456", "#abcdef", 1)).toBe("#abcdef");
  });

  it("덮기·섞기 Token은 모두 불투명한 6자리 hex다", () => {
    for (const theme of themes) {
      for (const [role] of decided) {
        for (const state of [
          "subtle-hover",
          "subtle-active",
          "solid-hover",
          "solid-active",
          "faint",
        ]) {
          expect(semanticHex(`bg-${role}-${state}` as never, theme)).toMatch(/^#[0-9a-f]{6}$/);
        }
      }
    }
  });
});
