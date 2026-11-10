// 색 이름(Color)과 색 계열(tide-v0-impl 티켓 40).
// 1. Tide 색 이름마다 대비 쌍 규칙을 light·dark에서 검사한다.
// 2. 테스트 전용 계열(violet)을 Primitive에 더하면 계열 변수, [data-color] 규칙, 대비 쌍이 따라오는지 본다.
// 3. ColorRegistry 타입과 module augmentation(타입 검사는 `tsc --noEmit`이 이 파일도 본다).
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import type { Color, ColorFamily, ColorRegistry, Role } from "../src/index.ts";
import {
  checkColorContrast,
  colorSlotHex,
  roleFamily,
  roleNames,
  semanticHex,
  tideColorNames,
} from "../src/internal.ts";

// 앱이 브랜드 계열을 더하는 것과 같은 augmentation. re-export한 모듈(index)을 대상으로 해도 원래 interface에 합쳐진다
// (TypeScript 7.0.2에서 확인, 티켓 40 Comments).
declare module "../src/index.ts" {
  interface ColorRegistry {
    "test-brand": true;
  }
}

describe("Tide 색 이름", () => {
  it("Role 6개 다음에 색 계열 6개가 온다", () => {
    expect(tideColorNames).toEqual([
      "neutral",
      "primary",
      "success",
      "warning",
      "danger",
      "info",
      "blue",
      "gray",
      "green",
      "amber",
      "red",
      "cyan",
    ]);
  });

  it.each(tideColorNames)("%s는 대비 쌍 규칙을 light·dark에서 모두 통과한다", (name) => {
    const failures = checkColorContrast({
      light: colorSlotHex(name, "light"),
      dark: colorSlotHex(name, "dark"),
    }).filter((result) => !result.pass);
    expect(failures).toEqual([]);
  });

  it("Role의 accent 슬롯 hex는 Role Token hex와 같다", () => {
    for (const theme of ["light", "dark"] as const) {
      const primary = colorSlotHex("primary", theme);
      expect(primary.solid).toBe(semanticHex("bg-primary-solid", theme));
      expect(primary.text).toBe(semanticHex("text-primary", theme));
      const neutral = colorSlotHex("neutral", theme);
      expect(neutral.text).toBe(semanticHex("text-default", theme));
      expect(neutral.border).toBe(semanticHex("border-strong", theme));
    }
  });

  it("Role이 쓰는 계열의 on-solid는 공통 text-on-solid와 같다(Role은 on-solid를 따로 두지 않는다)", () => {
    for (const role of roleNames) {
      const family = roleFamily[role];
      for (const theme of ["light", "dark"] as const) {
        expect(colorSlotHex(family, theme)["on-solid"]).toBe(semanticHex("text-on-solid", theme));
      }
    }
  });

  it("neutral은 gray와 다른 색이다(dark subtle, text, light border)", () => {
    const neutral = colorSlotHex("neutral", "dark");
    const gray = colorSlotHex("gray", "dark");
    expect(neutral.subtle).not.toBe(gray.subtle);
    expect(neutral.text).not.toBe(gray.text);
    expect(neutral.solid).toBe(gray.solid);
    // border-strong은 light gray-500, gray 계열 border는 light gray-600이다(dark는 둘 다 gray-400).
    expect(colorSlotHex("neutral", "light").border).not.toBe(colorSlotHex("gray", "light").border);
  });
});

describe("테스트 전용 계열을 더하면", () => {
  // Primitive 원본(color.ts)에 violet 계열을 더한 것처럼 바꾼다. primitiveHex도 같은 표를 보게 한다.
  const violet = {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
    950: "#2e1065",
  } as const;

  async function withViolet() {
    vi.resetModules();
    vi.doMock("../src/color.ts", async (importOriginal) => {
      const original = await importOriginal<typeof import("../src/color.ts")>();
      const color = { ...original.color, violet };
      return {
        ...original,
        color,
        primitiveHex: (name: string): string => {
          if (name === "white" || name === "black") return color[name];
          const index = name.lastIndexOf("-");
          return (color as unknown as Record<string, Record<string, string>>)[
            name.slice(0, index)
          ]![name.slice(index + 1)]!;
        },
      };
    });
    const internal = await import("../src/internal.ts");
    vi.doUnmock("../src/color.ts");
    return internal;
  }

  it("색 이름 목록, 계열 변수, [data-color] 규칙, 대비 쌍이 함께 따라온다", async () => {
    const internal = await withViolet();

    expect(internal.tideColorNames).toContain("violet");
    expect(internal.tideFamilyThemeDeclarations("dark")).toContain(
      "  --tide-violet-subtle: var(--tide-color-violet-950);",
    );
    expect(internal.tideFamilyThemeDeclarations("light")).toContain(
      "  --tide-violet-text: var(--tide-color-violet-800);",
    );
    expect(internal.dataColorRule("violet")).toContain(
      "  --tide-accent-solid: var(--tide-violet-solid);",
    );
    const results = internal.checkColorContrast({
      light: internal.colorSlotHex("violet" as never, "light"),
      dark: internal.colorSlotHex("violet" as never, "dark"),
    });
    expect(results).toHaveLength(internal.colorContrastRules.length * 2);
    expect(results.filter((result) => !result.pass)).toEqual([]);
    // Role은 그대로다.
    expect(internal.roleNames).toEqual(roleNames);
  });
});

describe("ColorRegistry 타입", () => {
  it("Color는 Role, Tide 색 계열, augmentation으로 더한 이름이다", () => {
    expectTypeOf<Color>().toEqualTypeOf<Role | ColorFamily | "test-brand">();
    expectTypeOf<ColorRegistry["test-brand"]>().toEqualTypeOf<true>();
    // @ts-expect-error 등록하지 않은 색 이름은 Color가 아니다.
    const unknown: Color = "purple";
    expect(unknown).toBe("purple");
  });
});
