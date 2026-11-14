// 기대 목록은 Token 원본에서 만들지 않고 spec을 그대로 적어, Token이 빠지거나 이름이 바뀌면 실패하게 한다.
import { readFile } from "node:fs/promises";

import { beforeAll, describe, expect, it } from "vitest";

const families = ["blue", "gray", "green", "amber", "red", "cyan", "purple", "mint"] as const;
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const roles = ["neutral", "primary", "success", "warning", "danger", "info"] as const;
const roleFamily = {
  neutral: "gray",
  primary: "blue",
  success: "green",
  warning: "amber",
  danger: "red",
  info: "cyan",
} as const;

const primitiveVars = [
  "--tide-color-white",
  "--tide-color-black",
  ...families.flatMap((family) => steps.map((step) => `--tide-color-${family}-${step}`)),
];

const semanticClasses = [
  "bg-canvas",
  "bg-surface",
  "bg-raised",
  "bg-disabled",
  "bg-overlay",
  // 무채색 호버·클릭(ADR 0022 §3)
  "bg-hover",
  "bg-active",
  ...roles.flatMap((role) =>
    [
      "solid",
      "solid-hover",
      "solid-active",
      "subtle",
      "subtle-hover",
      "subtle-active",
      "faint",
    ].map((state) => `bg-${role}-${state}`),
  ),
  "text-default",
  "text-muted",
  "text-disabled",
  "text-on-solid",
  ...roles.filter((role) => role !== "neutral").map((role) => `text-${role}`),
  // neutral의 on-subtle은 text-default를 공유한다(ADR 0022 §1).
  ...roles.filter((role) => role !== "neutral").map((role) => `text-${role}-on-subtle`),
  "border-default",
  "border-strong",
  "border-raised",
  ...roles.filter((role) => role !== "neutral").map((role) => `border-${role}`),
  // 파스텔 테두리(슬롯 subtle-border). neutral도 있다.
  ...roles.map((role) => `border-${role}-subtle`),
  "outline-focus",
];

// spec 「`@tide-design/foundation`」 타이포그래피. [이름, 크기 px, 행간 px, 굵기]
const textStyles = [
  ["display-lg", 56, 64, 700],
  ["display-md", 48, 56, 700],
  ["heading-xl", 40, 48, 700],
  ["heading-lg", 32, 40, 700],
  ["heading-md", 24, 32, 700],
  ["heading-sm", 20, 28, 600],
  ["heading-xs", 18, 28, 600],
  ["body-lg", 18, 28, 400],
  ["body-md", 16, 24, 400],
  ["body-sm", 14, 20, 400],
  ["label-lg", 16, 20, 500],
  ["label-md", 14, 20, 500],
  ["label-sm", 12, 16, 500],
  ["caption", 12, 16, 400],
] as const;
const fontSizes = [12, 14, 16, 18, 20, 24, 32, 40, 48, 56] as const;
const fontWeights = { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700 } as const;

const typographyVars = [
  "--tide-font-sans",
  "--tide-font-mono",
  ...fontSizes.map((px) => `--tide-font-size-${px}`),
  ...Object.keys(fontWeights).map((name) => `--tide-font-${name}`),
  ...textStyles.flatMap(([name]) => [
    `--tide-text-${name}`,
    `--tide-text-${name}--line-height`,
    `--tide-text-${name}--font-weight`,
  ]),
];

// spec 「`@tide-design/foundation`」 radius·Elevation·포커스 표시. [이름, 값]
const radii = [
  ["sm", "0.25rem"],
  ["md", "0.375rem"],
  ["lg", "0.5rem"],
  ["xl", "0.75rem"],
  ["full", "9999px"],
] as const;
// [단계, 가까운 레이어, 비율, 먼 레이어, 비율]
const shadows = [
  ["sm", "0 1px 1px", 60, "0 1px 2px", 100],
  ["md", "0 1px 3px", 50, "0 4px 12px -2px", 100],
  ["lg", "0 2px 6px -1px", 50, "0 12px 24px -6px", 100],
] as const;
const shapeVars = [
  ...radii.map(([name]) => `--tide-rounded-${name}`),
  "--tide-focus-ring-width",
  "--tide-focus-ring-offset",
];
const shadowVars = shadows.map(([name]) => `--tide-shadow-${name}`);

// spec 「`@tide-design/foundation`」 motion·z-index. [이름, 값]
const durations = [
  ["fast", "150ms"],
  ["normal", "300ms"],
] as const;
const zIndices = [
  ["sticky", "100"],
  ["modal", "200"],
  ["popover", "300"],
  ["toast", "400"],
  ["tooltip", "500"],
] as const;
const motionVars = [
  ...durations.map(([name]) => `--tide-duration-${name}`),
  "--tide-ease-out",
  ...zIndices.map(([name]) => `--tide-z-${name}`),
];

// 색 계열 변수 묶음과 accent 슬롯(ADR 0022 §2). [슬롯, light 값, dark 값]
// 값: 숫자는 그 계열 단계, 문자열은 Primitive, [단계, 덮는 색, 비율]은 덮기, ["mix", a, b]는 반씩 섞기다.
type SlotSpec =
  | number
  | string
  | readonly [number, string, number]
  | readonly ["mix", number | string, number | string];
const slotRule: readonly (readonly [string, SlotSpec, SlotSpec])[] = [
  ["solid", 600, 600],
  ["solid-hover", [600, "black", 0.14], [600, "black", 0.14]],
  ["solid-active", [600, "black", 0.2], [600, "black", 0.2]],
  ["subtle", 100, 950],
  ["subtle-hover", [100, "gray-950", 0.04], [950, "white", 0.06]],
  ["subtle-active", [100, "gray-950", 0.08], [950, "white", 0.1]],
  ["faint", 50, ["mix", "gray-950", 950]],
  ["text", 700, 300],
  ["border", 600, 400],
  ["subtle-border", 200, 800],
  ["on-solid", "white", "white"],
  ["on-subtle", 950, 100],
];

/** 두 hex를 sRGB 채널마다 섞는다(브라우저의 불투명 합성과 같다). 테스트 안에서 따로 계산한다. */
function mix(a: string, b: string, amount: number): string {
  const channels = (hex: string): number[] =>
    [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
  const to = channels(b);

  return `#${channels(a)
    .map((value, index) =>
      Math.round(value * (1 - amount) + to[index]! * amount)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}
const slots = slotRule.map(([slot]) => slot);
const familyVars = families.flatMap((family) => slots.map((slot) => `--tide-${family}-${slot}`));
const accentVars = slots.map((slot) => `--tide-accent-${slot}`);
// data-color로 고르는 색 이름: Role 6개와 색 계열 8개(장식 계열 purple·mint 포함)
const colorNames = [...roles, ...families];

const contractVars = [
  ...primitiveVars,
  ...typographyVars,
  ...shapeVars,
  ...motionVars,
  ...semanticClasses.map((name) => `--tide-${name}`),
  "--tide-shadow-color",
  ...shadowVars,
  ...familyVars,
  ...accentVars,
];

const rem = (px: number): string => `${px / 16}rem`;

/** 선택자 하나의 블록 본문에서 `--이름: 값` 목록을 꺼낸다 */
function declarations(css: string, selector: string): Map<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`블록이 없다: ${selector}`);
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));

  return new Map(
    [...body.matchAll(/(--[\w-]+|color-scheme):\s*([^;]+);/g)].map((match) => [
      match[1]!,
      match[2]!.trim(),
    ]),
  );
}

/** 같은 Theme 블록 안의 `var(--tide-*)` 별칭을 따라가서 Primitive 참조(또는 값)까지 푼다 */
function resolveAliases(block: Map<string, string>): Map<string, string> {
  const resolve = (value: string): string => {
    const target = /^var\((--tide-[\w-]+)\)$/.exec(value)?.[1];

    return target && block.has(target) ? resolve(block.get(target)!) : value;
  };

  return new Map([...block].map(([name, value]) => [name, resolve(value)]));
}

describe("tokens.css", () => {
  let css: string;
  let root: Map<string, string>;
  let light: Map<string, string>;
  let dark: Map<string, string>;
  // Role Token은 계열 변수의 별칭이다. 매핑은 별칭을 푼 값으로 확인한다.
  let lightResolved: Map<string, string>;
  let darkResolved: Map<string, string>;

  beforeAll(async () => {
    css = await readFile(new URL("../dist/tokens.css", import.meta.url), "utf8");
    root = declarations(css, ":root");
    light = declarations(css, ':root,\n[data-theme="light"]');
    dark = declarations(css, '[data-theme="dark"]');
    lightResolved = resolveAliases(light);
    darkResolved = resolveAliases(dark);
  });

  it("--tide-* 공개 계약 목록이 spec과 같다", () => {
    const defined = [...css.matchAll(/^\s*(--tide-[\w-]+):/gm)].map((match) => match[1]!);
    expect([...new Set(defined)].sort()).toEqual([...contractVars].sort());
  });

  it("Theme과 무관한 :root 블록은 Primitive 색, 타이포그래피, radius, 포커스 ring, motion, 쌓임 단계만 담는다", () => {
    expect([...root.keys()].sort()).toEqual(
      [...primitiveVars, ...typographyVars, ...shapeVars, ...motionVars].sort(),
    );
  });

  it("Primitive는 8계열 11단계와 white, black이고 hex가 정본이다", () => {
    const primitive = [...root].filter(([name]) => name.startsWith("--tide-color-"));
    expect(primitive.map(([name]) => name).sort()).toEqual([...primitiveVars].sort());
    for (const [, value] of primitive) expect(value).toMatch(/^#[0-9a-f]{6}$/);
    expect(root.get("--tide-color-blue-500")).toBe("#148cfc");
    expect(root.get("--tide-color-white")).toBe("#ffffff");
    expect(root.get("--tide-color-black")).toBe("#000000");
  });

  it("light와 dark가 같은 Semantic 변수를 정의하고 각각 color-scheme을 지정한다", () => {
    expect(light.get("color-scheme")).toBe("light");
    expect(dark.get("color-scheme")).toBe("dark");
    expect([...light.keys()].sort()).toEqual([...dark.keys()].sort());
    // color-scheme, --tide-shadow-color, 그림자 3단계, 계열 변수, accent 기본값
    expect(light.size).toBe(
      semanticClasses.length + 2 + shadowVars.length + familyVars.length + accentVars.length,
    );
  });

  it("Theme과 색 이름은 속성 선택자로만 바꾼다(요소 단위 data-theme·data-color, prefers-color-scheme 없음)", () => {
    expect(css).not.toContain("prefers-color-scheme");
    expect(css).not.toContain("@theme");
    const selectors = [...css.matchAll(/^([^\s{}/][^{}]*?)\s*\{/gm)].map((match) => match[1]!);
    expect(selectors).toEqual([
      ":root",
      ':root,\n[data-theme="light"]',
      '[data-theme="dark"]',
      ...colorNames.map((name) => `[data-color="${name}"]`),
    ]);
  });

  describe("색 계열과 accent 슬롯(티켓 40)", () => {
    const ref = (family: string, step: number | string): string =>
      `var(--tide-color-${typeof step === "number" ? `${family}-${step}` : step})`;
    const primitive = (family: string, step: number | string): string =>
      root.get(`--tide-color-${typeof step === "number" ? `${family}-${step}` : step}`)!;
    // 단계는 Primitive 변수 참조, 덮기·섞기는 빌드할 때 계산한 hex다(런타임 color-mix() 없음).
    const expected = (family: string, spec: SlotSpec): string => {
      if (typeof spec === "number" || typeof spec === "string") return ref(family, spec);
      if (spec[0] === "mix")
        return mix(primitive(family, spec[1]), primitive(family, spec[2]), 0.5);

      return mix(primitive(family, spec[0]), primitive(family, spec[1]), spec[2]);
    };

    it.each(families)("%s 계열 변수는 매핑 규칙을 따른다", (family) => {
      for (const [slot, lightSpec, darkSpec] of slotRule) {
        expect(light.get(`--tide-${family}-${slot}`), slot).toBe(expected(family, lightSpec));
        expect(dark.get(`--tide-${family}-${slot}`), slot).toBe(expected(family, darkSpec));
      }
    });

    it("덮기·섞기 값은 6자리 hex이고 color-mix()를 쓰지 않는다", () => {
      expect(css).not.toMatch(/color-mix\(in srgb, var\(--tide-color-/);
      expect(light.get("--tide-blue-subtle-hover")).toMatch(/^#[0-9a-f]{6}$/);
      expect(dark.get("--tide-blue-faint")).toMatch(/^#[0-9a-f]{6}$/);
    });

    it("gray는 일반 계열 규칙을 따르고 neutral과 다르다", () => {
      expect(dark.get("--tide-gray-subtle")).toBe(ref("gray", 950));
      expect(darkResolved.get("--tide-bg-neutral-subtle")).toBe(ref("gray", 900));
      expect(dark.get("--tide-gray-text")).toBe(ref("gray", 300));
      expect(dark.get("--tide-gray-border")).toBe(ref("gray", 400));
      // gray dark faint는 gray-950과 gray-950을 섞은 값이라 gray-950 그대로다.
      expect(dark.get("--tide-gray-faint")).toBe(primitive("gray", 950));
    });

    it("Role Token은 계열 변수의 별칭이고, 덮어쓴 슬롯만 Primitive를 가리킨다", () => {
      expect(light.get("--tide-bg-primary-solid")).toBe("var(--tide-blue-solid)");
      expect(dark.get("--tide-text-danger")).toBe("var(--tide-red-text)");
      expect(light.get("--tide-border-info")).toBe("var(--tide-cyan-border)");
      expect(light.get("--tide-bg-neutral-subtle")).toBe("var(--tide-gray-subtle)");
      expect(dark.get("--tide-bg-neutral-subtle")).toBe(ref("gray", 900));
    });

    it("accent 기본값은 두 Theme 모두 primary다", () => {
      for (const block of [light, dark]) {
        expect(block.get("--tide-accent-solid")).toBe("var(--tide-bg-primary-solid)");
        expect(block.get("--tide-accent-text")).toBe("var(--tide-text-primary)");
        expect(block.get("--tide-accent-on-solid")).toBe("var(--tide-text-on-solid)");
      }
    });

    it.each(families)("[data-color=%s]는 accent 슬롯에 계열 변수를 꽂는다", (family) => {
      const rule = declarations(css, `[data-color="${family}"]`);
      expect([...rule]).toEqual(
        slots.map((slot) => [`--tide-accent-${slot}`, `var(--tide-${family}-${slot})`]),
      );
    });

    it.each(roles.filter((role) => role !== "neutral"))(
      "[data-color=%s]는 accent 슬롯에 Role Token을 꽂는다",
      (role) => {
        const rule = declarations(css, `[data-color="${role}"]`);
        expect(rule.get("--tide-accent-solid-hover")).toBe(`var(--tide-bg-${role}-solid-hover)`);
        expect(rule.get("--tide-accent-subtle-active")).toBe(
          `var(--tide-bg-${role}-subtle-active)`,
        );
        expect(rule.get("--tide-accent-text")).toBe(`var(--tide-text-${role})`);
        expect(rule.get("--tide-accent-border")).toBe(`var(--tide-border-${role})`);
        expect(rule.get("--tide-accent-on-solid")).toBe("var(--tide-text-on-solid)");
        expect(rule.get("--tide-accent-faint")).toBe(`var(--tide-bg-${role}-faint)`);
        expect(rule.get("--tide-accent-on-subtle")).toBe(`var(--tide-text-${role}-on-subtle)`);
        expect(rule.get("--tide-accent-subtle-border")).toBe(`var(--tide-border-${role}-subtle)`);
      },
    );

    it("[data-color=neutral]의 글자와 테두리는 text-default, border-strong이다", () => {
      const rule = declarations(css, '[data-color="neutral"]');
      expect(rule.get("--tide-accent-subtle")).toBe("var(--tide-bg-neutral-subtle)");
      expect(rule.get("--tide-accent-text")).toBe("var(--tide-text-default)");
      expect(rule.get("--tide-accent-border")).toBe("var(--tide-border-strong)");
      // on-subtle은 text-default를 공유하고, faint·subtle-border는 Role Token이 있다.
      expect(rule.get("--tide-accent-on-subtle")).toBe("var(--tide-text-default)");
      expect(rule.get("--tide-accent-faint")).toBe("var(--tide-bg-neutral-faint)");
      expect(rule.get("--tide-accent-subtle-border")).toBe("var(--tide-border-neutral-subtle)");
    });
  });

  it("alpha는 overlay, 무채색 호버·클릭, shadow 색에만 8자리 hex로 쓴다", () => {
    const alphaVars = [...css.matchAll(/(--tide-[\w-]+):\s*#[0-9a-f]{8};/g)].map((m) => m[1]);
    expect([...new Set(alphaVars)].sort()).toEqual([
      "--tide-bg-active",
      "--tide-bg-hover",
      "--tide-bg-overlay",
      "--tide-shadow-color",
    ]);
    // gray-950 #28292c, black #000000. 50% = 80, 70% = b3, 8% = 14, 30% = 4d
    expect(light.get("--tide-bg-overlay")).toBe("#28292c80");
    expect(dark.get("--tide-bg-overlay")).toBe("#28292cb3");
    expect(light.get("--tide-shadow-color")).toBe("#28292c14");
    expect(dark.get("--tide-shadow-color")).toBe("#0000004d");
    // 무채색 호버·클릭(ADR 0022 §3): light gray-950 4%(0a)·8%(14), dark white 6%(0f)·10%(1a)
    expect(light.get("--tide-bg-hover")).toBe("#28292c0a");
    expect(light.get("--tide-bg-active")).toBe("#28292c14");
    expect(dark.get("--tide-bg-hover")).toBe("#ffffff0f");
    expect(dark.get("--tide-bg-active")).toBe("#ffffff1a");
  });

  describe("매핑(tide-v0 티켓 09, ADR 0022 §2)", () => {
    const ref = (name: string): string => `var(--tide-color-${name})`;
    const hex = (name: string): string => root.get(`--tide-color-${name}`)!;

    it.each(roles)("%s 배경", (role) => {
      const family = roleFamily[role];
      const step = (n: number): string => `${family}-${n}`;
      for (const theme of ["light", "dark"] as const) {
        const resolved = theme === "light" ? lightResolved : darkResolved;
        // solid 3단계: 600, 600 + black 14% / 20%(두 Theme 같음)
        expect(resolved.get(`--tide-bg-${role}-solid`)).toBe(ref(step(600)));
        expect(resolved.get(`--tide-bg-${role}-solid-hover`)).toBe(
          mix(hex(step(600)), hex("black"), 0.14),
        );
        expect(resolved.get(`--tide-bg-${role}-solid-active`)).toBe(
          mix(hex(step(600)), hex("black"), 0.2),
        );
      }
      // light subtle 3단계: 100, 100 + gray-950 4% / 8%. faint: 50
      expect(lightResolved.get(`--tide-bg-${role}-subtle`)).toBe(ref(step(100)));
      expect(lightResolved.get(`--tide-bg-${role}-subtle-hover`)).toBe(
        mix(hex(step(100)), hex("gray-950"), 0.04),
      );
      expect(lightResolved.get(`--tide-bg-${role}-subtle-active`)).toBe(
        mix(hex(step(100)), hex("gray-950"), 0.08),
      );
      expect(lightResolved.get(`--tide-bg-${role}-faint`)).toBe(ref(step(50)));
      // dark faint: gray-950과 950을 반씩 섞기
      expect(darkResolved.get(`--tide-bg-${role}-faint`)).toBe(
        mix(hex("gray-950"), hex(step(950)), 0.5),
      );
      if (role === "neutral") {
        // neutral dark subtle 3단계는 덮어쓴 단계 900 / 800 / 700 그대로다(gray-950은 dark canvas와 같은 색).
        expect(darkResolved.get("--tide-bg-neutral-subtle")).toBe(ref("gray-900"));
        expect(darkResolved.get("--tide-bg-neutral-subtle-hover")).toBe(ref("gray-800"));
        expect(darkResolved.get("--tide-bg-neutral-subtle-active")).toBe(ref("gray-700"));
      } else {
        // dark subtle 3단계: 950, 950 + white 6% / 10%
        expect(darkResolved.get(`--tide-bg-${role}-subtle`)).toBe(ref(step(950)));
        expect(darkResolved.get(`--tide-bg-${role}-subtle-hover`)).toBe(
          mix(hex(step(950)), hex("white"), 0.06),
        );
        expect(darkResolved.get(`--tide-bg-${role}-subtle-active`)).toBe(
          mix(hex(step(950)), hex("white"), 0.1),
        );
      }
    });

    it.each(roles.filter((role) => role !== "neutral"))("%s 글자와 테두리", (role) => {
      const family = roleFamily[role];
      expect(lightResolved.get(`--tide-text-${role}`)).toBe(ref(`${family}-700`));
      expect(darkResolved.get(`--tide-text-${role}`)).toBe(ref(`${family}-300`));
      expect(lightResolved.get(`--tide-border-${role}`)).toBe(ref(`${family}-600`));
      expect(darkResolved.get(`--tide-border-${role}`)).toBe(ref(`${family}-400`));
      expect(lightResolved.get(`--tide-text-${role}-on-subtle`)).toBe(ref(`${family}-950`));
      expect(darkResolved.get(`--tide-text-${role}-on-subtle`)).toBe(ref(`${family}-100`));
      expect(lightResolved.get(`--tide-border-${role}-subtle`)).toBe(ref(`${family}-200`));
      expect(darkResolved.get(`--tide-border-${role}-subtle`)).toBe(ref(`${family}-800`));
    });

    it("neutral 파스텔 테두리는 gray 규칙을 따른다(gray 스케일 그대로)", () => {
      expect(lightResolved.get("--tide-border-neutral-subtle")).toBe(ref("gray-200"));
      expect(darkResolved.get("--tide-border-neutral-subtle")).toBe(ref("gray-800"));
    });

    it("공통 Token", () => {
      const expected: Record<string, [string, string]> = {
        "bg-canvas": ["white", "gray-950"],
        "bg-surface": ["white", "gray-950"],
        "bg-raised": ["white", "gray-900"],
        "bg-disabled": ["gray-100", "gray-900"],
        "text-default": ["gray-900", "gray-50"],
        "text-muted": ["gray-700", "gray-300"],
        "text-disabled": ["gray-400", "gray-600"],
        "text-on-solid": ["white", "white"],
        "border-default": ["gray-200", "gray-800"],
        "border-strong": ["gray-500", "gray-400"],
        "outline-focus": ["blue-600", "blue-400"],
      };
      for (const [name, [lightValue, darkValue]] of Object.entries(expected)) {
        expect(lightResolved.get(`--tide-${name}`), name).toBe(ref(lightValue));
        expect(darkResolved.get(`--tide-${name}`), name).toBe(ref(darkValue));
      }
      // raised 표면 경계: light는 투명(키워드), dark는 gray-800
      expect(lightResolved.get("--tide-border-raised")).toBe("transparent");
      expect(darkResolved.get("--tide-border-raised")).toBe(ref("gray-800"));
    });
  });
  describe("타이포그래피", () => {
    it("font-family는 sans(Pretendard Variable 우선)와 mono(시스템 스택) 두 개다", () => {
      expect(root.get("--tide-font-sans")).toMatch(/^"Pretendard Variable", Pretendard, /);
      expect(root.get("--tide-font-sans")).toMatch(/, sans-serif$/);
      expect(root.get("--tide-font-mono")).toMatch(/, monospace$/);
      expect(root.get("--tide-font-mono")).not.toContain("Pretendard");
      // 웹폰트는 앱이 로드한다.
      expect(css).not.toContain("@font-face");
    });

    it("Primitive 크기는 rem이다", () => {
      for (const px of fontSizes) expect(root.get(`--tide-font-size-${px}`)).toBe(rem(px));
    });

    it("굵기는 300/400/500/600/700 다섯 개다", () => {
      for (const [name, value] of Object.entries(fontWeights)) {
        expect(root.get(`--tide-font-${name}`), name).toBe(String(value));
      }
    });

    it.each(textStyles)("텍스트 스타일 %s: %ipx/%ipx, %i", (name, size, lineHeight, weight) => {
      const weightName = Object.entries(fontWeights).find(([, value]) => value === weight)![0];
      expect(root.get(`--tide-text-${name}`)).toBe(`var(--tide-font-size-${size})`);
      expect(root.get(`--tide-text-${name}--line-height`)).toBe(rem(lineHeight));
      expect(root.get(`--tide-text-${name}--font-weight`)).toBe(`var(--tide-font-${weightName})`);
    });

    it("자간 하위 변수와 루트 font-size가 없다", () => {
      expect(css).not.toContain("letter-spacing");
      expect(css).not.toMatch(/^\s*font-size:/m);
    });
  });

  describe("radius·Elevation·포커스 표시", () => {
    it.each(radii)("radius %s는 %s다", (name, value) => {
      expect(root.get(`--tide-rounded-${name}`)).toBe(value);
    });

    it("포커스 ring은 2px 두께, 2px offset이다", () => {
      expect(root.get("--tide-focus-ring-width")).toBe("2px");
      expect(root.get("--tide-focus-ring-offset")).toBe("2px");
    });

    it.each(shadows)("그림자 %s: %s %i% + %s %i%", (name, near, nearMix, far, farMix) => {
      const mix = (percent: number): string =>
        `color-mix(in srgb, var(--tide-shadow-color) ${percent}%, transparent)`;
      const expected = `${near} ${mix(nearMix)}, ${far} ${mix(farMix)}`;
      // 같은 값이 두 Theme 블록에 다시 선언되어 요소 단위 data-theme에서도 그 Theme의 shadow 색을 읽는다.
      expect(light.get(`--tide-shadow-${name}`)).toBe(expected);
      expect(dark.get(`--tide-shadow-${name}`)).toBe(expected);
      expect(root.has(`--tide-shadow-${name}`)).toBe(false);
    });
  });

  describe("motion·쌓임 단계", () => {
    it.each(durations)("duration %s는 %s다", (name, value) => {
      expect(root.get(`--tide-duration-${name}`)).toBe(value);
    });

    it("easing은 out 하나이고 Tailwind ease-out과 같은 곡선이다", () => {
      expect(root.get("--tide-ease-out")).toBe("cubic-bezier(0, 0, 0.2, 1)");
      expect([...root.keys()].filter((name) => name.startsWith("--tide-ease-"))).toEqual([
        "--tide-ease-out",
      ]);
    });

    it.each(zIndices)("쌓임 단계 %s는 %s다", (name, value) => {
      expect(root.get(`--tide-z-${name}`)).toBe(value);
    });

    it("쌓임 단계는 sticky < modal < popover < toast < tooltip이고 100 간격이다", () => {
      const values = zIndices.map(([name]) => Number(root.get(`--tide-z-${name}`)));
      expect(values.slice(1).map((value, index) => value - values[index]!)).toEqual([
        100, 100, 100, 100,
      ]);
    });
  });
});
