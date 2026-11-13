// 색 이름(Color)과 색 계열(tide-v0-impl 티켓 40).
// 1. Tide 색 이름마다 대비 쌍 규칙을 light·dark에서 검사한다.
// 2. 테스트 전용 계열(pink)을 Primitive에 더하면 계열 변수, [data-color] 규칙, 대비 쌍이 따라오는지 본다.
// 3. RoleRegistry·ColorFamilyRegistry 타입과 module augmentation(타입 검사는 `tsc --noEmit`이 이 파일도 본다).
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import type {
  Color,
  ColorFamily,
  ColorFamilyName,
  ColorFamilyRegistry,
  Role,
  RoleRegistry,
  semantic,
  TideRole,
} from "./index.ts";
import {
  checkColorContrast,
  colorSlotHex,
  roleFamily,
  roleNames,
  semanticHex,
  tideColorNames,
} from "./internal.ts";

// 앱이 Role과 장식용 계열을 더하는 것과 같은 augmentation. re-export한 모듈(index)을 대상으로 해도 원래 interface에
// 합쳐진다(TypeScript 7.0.2에서 확인, 티켓 40·41 Comments). 이 augmentation은 foundation 타입 검사 전체에 걸린다.
// 그래서 Tide 안의 계산(Semantic Token 이름)이 앱 Role로 넓어지지 않는지도 함께 본다.
declare module "./index.ts" {
  interface RoleRegistry {
    "test-brand": true;
  }
  interface ColorFamilyRegistry {
    "test-accent": true;
  }
}

describe("Tide 색 이름", () => {
  it("Role 6개 다음에 색 계열 8개가 온다", () => {
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
      "purple",
      "mint",
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
  // Primitive 원본(color.ts)에 pink 계열을 더한 것처럼 바꾼다. primitiveHex도 같은 표를 보게 한다.
  const pink = {
    50: "#fcf0f5",
    100: "#fee5f0",
    200: "#ebcbd9",
    300: "#e1adc4",
    400: "#dc7dac",
    500: "#c75b93",
    600: "#a85c81",
    700: "#90406a",
    800: "#793157",
    900: "#68274a",
    950: "#5c1d3f",
  } as const;

  async function withPink() {
    vi.resetModules();
    vi.doMock("./color.ts", async (importOriginal) => {
      const original = await importOriginal<typeof import("./color.ts")>();
      const color = { ...original.color, pink };
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
    const internal = await import("./internal.ts");
    vi.doUnmock("./color.ts");
    return internal;
  }

  it("색 이름 목록, 계열 변수, [data-color] 규칙, 대비 쌍이 함께 따라온다", async () => {
    const internal = await withPink();

    expect(internal.tideColorNames).toContain("pink");
    expect(internal.tideFamilyThemeDeclarations("dark")).toContain(
      "  --tide-pink-subtle: var(--tide-color-pink-950);",
    );
    expect(internal.tideFamilyThemeDeclarations("light")).toContain(
      "  --tide-pink-text: var(--tide-color-pink-700);",
    );
    expect(internal.dataColorRule("pink")).toContain(
      "  --tide-accent-solid: var(--tide-pink-solid);",
    );
    const results = internal.checkColorContrast({
      light: internal.colorSlotHex("pink" as never, "light"),
      dark: internal.colorSlotHex("pink" as never, "dark"),
    });
    expect(results).toHaveLength(internal.colorContrastRules.length * 2);
    expect(results.filter((result) => !result.pass)).toEqual([]);
    // Role은 그대로다.
    expect(internal.roleNames).toEqual(roleNames);
  });
});

describe("색 이름 등록 타입", () => {
  it("Role은 Tide Role 6개와 RoleRegistry에 더한 이름이다", () => {
    expectTypeOf<TideRole>().toEqualTypeOf<
      "neutral" | "primary" | "success" | "warning" | "danger" | "info"
    >();
    expectTypeOf<Role>().toEqualTypeOf<TideRole | "test-brand">();
    expectTypeOf<RoleRegistry["test-brand"]>().toEqualTypeOf<true>();
    // @ts-expect-error 색 계열 이름은 Role이 아니다.
    const family: Role = "blue";
    // @ts-expect-error 장식용으로 등록한 계열도 Role이 아니다.
    const accent: Role = "test-accent";
    expect([family, accent]).toEqual(["blue", "test-accent"]);
  });

  it("색 계열 이름은 Tide 색 계열과 ColorFamilyRegistry에 더한 이름이다", () => {
    expectTypeOf<ColorFamilyName>().toEqualTypeOf<ColorFamily | "test-accent">();
    expectTypeOf<ColorFamilyRegistry["test-accent"]>().toEqualTypeOf<true>();
    // ColorFamily는 Primitive 계열이라 augmentation으로 넓어지지 않는다.
    expectTypeOf<ColorFamily>().toEqualTypeOf<
      "blue" | "gray" | "green" | "amber" | "red" | "cyan" | "purple" | "mint"
    >();
    // @ts-expect-error Role은 색 계열 이름이 아니다.
    const role: ColorFamilyName = "primary";
    expect(role).toBe("primary");
  });

  it("Color는 Role과 색 계열 이름을 합친 것이다", () => {
    expectTypeOf<Color>().toEqualTypeOf<Role | ColorFamilyName>();
    // @ts-expect-error 등록하지 않은 색 이름은 Color가 아니다.
    const unknown: Color = "pink";
    expect(unknown).toBe("pink");
  });

  it("앱 Role은 Semantic Token 이름을 넓히지 않는다", () => {
    type BackgroundName = keyof typeof semantic.background;
    expectTypeOf<"primary-solid">().toExtend<BackgroundName>();
    expectTypeOf<"test-brand-solid">().not.toExtend<BackgroundName>();
    expectTypeOf<"primary">().toExtend<keyof typeof semantic.text>();
    expectTypeOf<"test-brand">().not.toExtend<keyof typeof semantic.text>();
  });
});
