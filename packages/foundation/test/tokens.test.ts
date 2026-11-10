// 빌드한 tokens.css(Tailwind 없이 쓰는 사용자의 공개 계약)를 검사한다.
// 기대 목록은 Token 원본에서 만들지 않고 spec 「`@tide-tds/foundation`」 컬러 항목을 그대로 적는다.
// 그래서 원본에서 Token이 빠지거나 이름이 바뀌면(breaking change) 여기서 실패한다.
import { readFile } from "node:fs/promises";

import { beforeAll, describe, expect, it } from "vitest";

const families = ["blue", "gray", "green", "amber", "red", "cyan"] as const;
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
  ...roles.flatMap((role) =>
    ["solid", "solid-hover", "solid-active", "subtle", "subtle-hover", "subtle-active"].map(
      (state) => `bg-${role}-${state}`,
    ),
  ),
  "text-default",
  "text-muted",
  "text-disabled",
  "text-on-solid",
  ...roles.filter((role) => role !== "neutral").map((role) => `text-${role}`),
  "border-default",
  "border-strong",
  ...roles.filter((role) => role !== "neutral").map((role) => `border-${role}`),
  "outline-focus",
];

// spec 「`@tide-tds/foundation`」 타이포그래피. [이름, 크기 px, 행간 px, 굵기]
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

const contractVars = [
  ...primitiveVars,
  ...typographyVars,
  ...semanticClasses.map((name) => `--tide-${name}`),
  "--tide-shadow-color",
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

describe("tokens.css", () => {
  let css: string;
  let root: Map<string, string>;
  let light: Map<string, string>;
  let dark: Map<string, string>;

  beforeAll(async () => {
    css = await readFile(new URL("../dist/tokens.css", import.meta.url), "utf8");
    root = declarations(css, ":root");
    light = declarations(css, ':root,\n[data-theme="light"]');
    dark = declarations(css, '[data-theme="dark"]');
  });

  it("--tide-* 공개 계약 목록이 spec과 같다", () => {
    const defined = [...css.matchAll(/^\s*(--tide-[\w-]+):/gm)].map((match) => match[1]!);
    expect([...new Set(defined)].sort()).toEqual([...contractVars].sort());
  });

  it("Theme과 무관한 :root 블록은 Primitive 색과 타이포그래피만 담는다", () => {
    expect([...root.keys()].sort()).toEqual([...primitiveVars, ...typographyVars].sort());
  });

  it("Primitive는 6계열 11단계와 white, black이고 hex가 정본이다", () => {
    const primitive = [...root].filter(([name]) => name.startsWith("--tide-color-"));
    expect(primitive.map(([name]) => name).sort()).toEqual([...primitiveVars].sort());
    for (const [, value] of primitive) expect(value).toMatch(/^#[0-9a-f]{6}$/);
    expect(root.get("--tide-color-blue-500")).toBe("#3183f5");
    expect(root.get("--tide-color-white")).toBe("#ffffff");
    expect(root.get("--tide-color-black")).toBe("#000000");
  });

  it("light와 dark가 같은 Semantic 변수를 정의하고 각각 color-scheme을 지정한다", () => {
    expect(light.get("color-scheme")).toBe("light");
    expect(dark.get("color-scheme")).toBe("dark");
    expect([...light.keys()].sort()).toEqual([...dark.keys()].sort());
    expect(light.size).toBe(semanticClasses.length + 2);
  });

  it("Theme은 속성 선택자로만 바꾼다(요소 단위 data-theme, prefers-color-scheme 없음)", () => {
    expect(css).not.toContain("prefers-color-scheme");
    expect(css).not.toContain("@theme");
    const selectors = [...css.matchAll(/^([^\s{}/][^{}]*?)\s*\{/gm)].map((match) => match[1]!);
    expect(selectors).toEqual([":root", ':root,\n[data-theme="light"]', '[data-theme="dark"]']);
  });

  it("alpha는 overlay와 shadow 색에만 8자리 hex로 쓴다", () => {
    const alphaVars = [...css.matchAll(/(--tide-[\w-]+):\s*#[0-9a-f]{8};/g)].map((m) => m[1]);
    expect([...new Set(alphaVars)].sort()).toEqual(["--tide-bg-overlay", "--tide-shadow-color"]);
    // gray-950 #28292c, black #000000. 50% = 80, 70% = b3, 8% = 14, 30% = 4d
    expect(light.get("--tide-bg-overlay")).toBe("#28292c80");
    expect(dark.get("--tide-bg-overlay")).toBe("#28292cb3");
    expect(light.get("--tide-shadow-color")).toBe("#28292c14");
    expect(dark.get("--tide-shadow-color")).toBe("#0000004d");
  });

  describe("매핑(tide-v0 티켓 09)", () => {
    const ref = (name: string): string => `var(--tide-color-${name})`;

    it.each(roles)("%s 배경", (role) => {
      const family = roleFamily[role];
      const subtleDark = role === "neutral" ? [900, 800, 700] : [950, 900, 800];
      const states = ["", "-hover", "-active"];
      states.forEach((state, index) => {
        const solid = [600, 700, 800][index];
        expect(light.get(`--tide-bg-${role}-solid${state}`)).toBe(ref(`${family}-${solid}`));
        expect(dark.get(`--tide-bg-${role}-solid${state}`)).toBe(ref(`${family}-${solid}`));
        expect(light.get(`--tide-bg-${role}-subtle${state}`)).toBe(
          ref(`${family}-${[50, 100, 200][index]}`),
        );
        expect(dark.get(`--tide-bg-${role}-subtle${state}`)).toBe(
          ref(`${family}-${subtleDark[index]}`),
        );
      });
    });

    it.each(roles.filter((role) => role !== "neutral"))("%s 글자와 테두리", (role) => {
      const family = roleFamily[role];
      expect(light.get(`--tide-text-${role}`)).toBe(ref(`${family}-800`));
      expect(dark.get(`--tide-text-${role}`)).toBe(ref(`${family}-200`));
      expect(light.get(`--tide-border-${role}`)).toBe(ref(`${family}-600`));
      expect(dark.get(`--tide-border-${role}`)).toBe(ref(`${family}-400`));
    });

    it("공통 Token", () => {
      const expected: Record<string, [string, string]> = {
        "bg-canvas": ["white", "gray-950"],
        "bg-surface": ["white", "gray-950"],
        "bg-raised": ["white", "gray-900"],
        "bg-disabled": ["gray-100", "gray-900"],
        "text-default": ["gray-900", "gray-50"],
        "text-muted": ["gray-600", "gray-300"],
        "text-disabled": ["gray-400", "gray-600"],
        "text-on-solid": ["white", "white"],
        "border-default": ["gray-200", "gray-800"],
        "border-strong": ["gray-500", "gray-400"],
        "outline-focus": ["blue-600", "blue-400"],
      };
      for (const [name, [lightValue, darkValue]] of Object.entries(expected)) {
        expect(light.get(`--tide-${name}`), name).toBe(ref(lightValue));
        expect(dark.get(`--tide-${name}`), name).toBe(ref(darkValue));
      }
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
});
