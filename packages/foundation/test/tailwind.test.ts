// 빌드한 CSS를 실제 Tailwind로 컴파일해 공개 표면(만들어지는 class)을 확인한다.
// 컴파일 API: @tailwindcss/node 4.3.5의 compile(css, { base, onDependency }).build(candidates).
// 공식 문서에는 없는 API라 설치 버전의 타입 선언(dist/index.d.ts)으로 확인했다.
import { fileURLToPath } from "node:url";

import { compile } from "@tailwindcss/node";
import { beforeAll, describe, expect, it } from "vitest";

const packageDir = fileURLToPath(new URL("../", import.meta.url));

async function buildCss(candidates: string[]): Promise<string> {
  const compiler = await compile('@import "tailwindcss";\n@import "./dist/tailwind.css";\n', {
    base: packageDir,
    onDependency: () => {},
  });

  return compiler.build(candidates);
}

/** 출력 CSS에서 class 규칙 하나의 본문을 꺼낸다 */
function ruleBody(css: string, className: string): string | undefined {
  // CSS 선택자에서는 `:`가 `\:`로 이스케이프된다.
  const selector = className.replace(/:/g, "\\:");
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return new RegExp(`\\.${escaped}\\s*\\{([^}]*)\\}`).exec(css)?.[1];
}

const roles = ["neutral", "primary", "success", "warning", "danger", "info"] as const;
const accentRoles = roles.filter((role) => role !== "neutral");
const states = ["solid", "solid-hover", "solid-active", "subtle", "subtle-hover", "subtle-active"];

// spec 「`@tide-design/foundation`」 Semantic 색. [class, CSS 속성]
const semanticClasses: [string, string][] = [
  ...["canvas", "surface", "raised", "disabled", "overlay"].map(
    (name) => [`bg-${name}`, "background-color"] as [string, string],
  ),
  ...roles.flatMap((role) =>
    states.map((state) => [`bg-${role}-${state}`, "background-color"] as [string, string]),
  ),
  ...["default", "muted", "disabled", "on-solid", ...accentRoles].map(
    (name) => [`text-${name}`, "color"] as [string, string],
  ),
  ...["default", "strong", "raised", ...accentRoles].map(
    (name) => [`border-${name}`, "border-color"] as [string, string],
  ),
  ["outline-focus", "outline-color"],
];

// 생기면 안 되는 class: 다른 namespace의 이름, 강도 생략, neutral 글자·테두리, shadow 색
const meaninglessClasses = [
  "text-bg-primary-solid",
  "text-primary-solid",
  "text-canvas",
  "bg-primary",
  "bg-default",
  "bg-muted",
  "bg-on-solid",
  "bg-focus",
  "border-canvas",
  "border-on-solid",
  "border-focus",
  "outline-primary",
  "outline-default",
  "text-focus",
  "text-neutral",
  "border-neutral",
  "bg-shadow-color",
  "shadow-shadow-color",
  // 계열 Utility class는 노출하지 않는다. accent는 강도를 생략하지 않고, 속성마다 정한 이름만 생긴다(티켓 40).
  "bg-blue-solid",
  "bg-gray-subtle",
  "text-blue-text",
  "border-blue-border",
  "bg-accent",
  "bg-accent-text",
  "text-accent-solid",
  "border-accent-solid",
  "outline-accent",
];

// accent Utility class(티켓 40). [class, CSS 속성, 변수]
const accentClasses: [string, string, string][] = [
  ...["solid", "solid-hover", "solid-active", "subtle", "subtle-hover", "subtle-active"].map(
    (slot) =>
      [`bg-accent-${slot}`, "background-color", `--tide-accent-${slot}`] as [
        string,
        string,
        string,
      ],
  ),
  ["text-accent", "color", "--tide-accent-text"],
  ["text-accent-on-solid", "color", "--tide-accent-on-solid"],
  ["border-accent", "border-color", "--tide-accent-border"],
];

// Tailwind 기본 팔레트 중 Tide에 없는 계열
const defaultOnlyFamilies = [
  "slate",
  "zinc",
  "neutral",
  "stone",
  "orange",
  "yellow",
  "lime",
  "emerald",
  "teal",
  "sky",
  "indigo",
  "violet",
  "fuchsia",
  "pink",
  "rose",
  "mauve",
  "olive",
  "mist",
  "taupe",
];

describe("tailwind.css", () => {
  let css: string;

  beforeAll(async () => {
    css = await buildCss([
      ...semanticClasses.map(([name]) => name),
      ...accentClasses.map(([name]) => name),
      ...meaninglessClasses,
      ...defaultOnlyFamilies.flatMap((family) => [`bg-${family}-500`, `text-${family}-50`]),
      "bg-blue-500",
      "bg-red-500",
      "bg-purple-500",
      "text-mint-700",
      "text-green-700",
      "border-gray-200",
      "bg-white",
      "text-black",
      "hover:bg-primary-solid-hover",
      "dark:bg-canvas",
    ]);
  });

  it.each(semanticClasses)(
    "Semantic class %s가 --tide-* 공개 계약을 가리킨다",
    (name, property) => {
      expect(ruleBody(css, name)).toContain(`${property}: var(--tide-${name})`);
    },
  );

  it.each(accentClasses)(
    "accent class %s가 accent 슬롯 변수를 가리킨다",
    (name, property, cssVar) => {
      expect(ruleBody(css, name)).toContain(`${property}: var(${cssVar})`);
    },
  );

  it("상태 색도 variant와 함께 쓸 수 있다", () => {
    expect(css).toMatch(
      /\.hover\\:bg-primary-solid-hover:hover\s*\{\s*background-color: var\(--tide-bg-primary-solid-hover\)/,
    );
  });

  it("의미 없는 조합은 class가 생기지 않는다", () => {
    for (const name of meaninglessClasses) expect(ruleBody(css, name), name).toBeUndefined();
  });

  it("Primitive class가 Tide 값을 쓴다", () => {
    expect(ruleBody(css, "bg-blue-500")).toContain("background-color: var(--tide-color-blue-500)");
    expect(ruleBody(css, "bg-red-500")).toContain("background-color: var(--tide-color-red-500)");
    // 장식 계열 purple·mint도 Tide Primitive다(ADR 0022 §5).
    expect(ruleBody(css, "bg-purple-500")).toContain(
      "background-color: var(--tide-color-purple-500)",
    );
    expect(ruleBody(css, "text-mint-700")).toContain("color: var(--tide-color-mint-700)");
    expect(ruleBody(css, "text-green-700")).toContain("color: var(--tide-color-green-700)");
    expect(ruleBody(css, "border-gray-200")).toContain("border-color: var(--tide-color-gray-200)");
    expect(ruleBody(css, "bg-white")).toContain("background-color: var(--tide-color-white)");
    expect(ruleBody(css, "text-black")).toContain("color: var(--tide-color-black)");
  });

  it("Tailwind 기본 팔레트가 남지 않는다", () => {
    for (const family of defaultOnlyFamilies) {
      expect(ruleBody(css, `bg-${family}-500`), family).toBeUndefined();
      expect(css).not.toContain(`--color-${family}-`);
    }
    // Tide와 이름이 같은 계열도 기본값(oklch)이 아니다.
    expect(css).not.toMatch(/--color-(red|blue|gray|green|amber|cyan|purple|mint)-\d+:\s*oklch/);
  });

  it("dark variant는 data-theme=dark를 따른다", () => {
    expect(css).toMatch(
      /\.dark\\:bg-canvas:where\(\[data-theme=dark\], \[data-theme=dark\] \*\)\s*\{\s*background-color: var\(--tide-bg-canvas\)/,
    );
    expect(css).not.toContain("prefers-color-scheme: dark");
  });
});

// spec 「`@tide-design/foundation`」 타이포그래피. 기대 목록은 Token 원본에서 만들지 않고 spec을 그대로 적는다.
const textStyles = [
  "display-lg",
  "display-md",
  "heading-xl",
  "heading-lg",
  "heading-md",
  "heading-sm",
  "heading-xs",
  "body-lg",
  "body-md",
  "body-sm",
  "label-lg",
  "label-md",
  "label-sm",
  "caption",
];
const fontWeights = ["light", "normal", "medium", "semibold", "bold"];

// Tailwind 기본값 중 지워야 하는 것
const defaultTextSizes = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"];
const defaultOnlyWeights = ["thin", "extralight", "extrabold", "black"];
// Tailwind 기본값 중 남기는 것. [class, CSS 속성]
const keptClasses: [string, string][] = [
  ["leading-tight", "line-height"],
  ["leading-6", "line-height"],
  ["tracking-tight", "letter-spacing"],
  ["tracking-normal", "letter-spacing"],
  ["tabular-nums", "font-variant-numeric"],
];

describe("tailwind.css 타이포그래피", () => {
  let css: string;

  beforeAll(async () => {
    css = await buildCss([
      ...textStyles.map((name) => `text-${name}`),
      ...fontWeights.map((name) => `font-${name}`),
      ...defaultTextSizes.map((size) => `text-${size}`),
      "text-8xl",
      "text-9xl",
      ...defaultOnlyWeights.map((name) => `font-${name}`),
      "font-sans",
      "font-mono",
      "font-serif",
      ...keptClasses.map(([name]) => name),
      "text-muted",
      "md:text-heading-xl",
    ]);
  });

  it.each(textStyles)("텍스트 스타일 text-%s가 크기, 행간, 굵기를 함께 정한다", (name) => {
    const body = ruleBody(css, `text-${name}`);
    expect(body).toContain(`font-size: var(--tide-text-${name})`);
    expect(body).toContain(`line-height: var(--tw-leading, var(--tide-text-${name}--line-height))`);
    expect(body).toContain(
      `font-weight: var(--tw-font-weight, var(--tide-text-${name}--font-weight))`,
    );
    // 자간은 0이라 letter-spacing을 정하지 않는다.
    expect(body).not.toContain("letter-spacing");
  });

  it.each(fontWeights)("굵기 font-%s가 --tide-* 공개 계약을 가리킨다", (name) => {
    expect(ruleBody(css, `font-${name}`)).toContain(`font-weight: var(--tide-font-${name})`);
  });

  it("font-family는 sans와 mono만 있다", () => {
    expect(ruleBody(css, "font-sans")).toContain("font-family: var(--tide-font-sans)");
    expect(ruleBody(css, "font-mono")).toContain("font-family: var(--tide-font-mono)");
    expect(ruleBody(css, "font-serif")).toBeUndefined();
    expect(css).not.toContain("--font-serif");
    expect(css).not.toContain("ui-serif");
  });

  it("기본 글꼴은 Tide sans다", () => {
    expect(css).toMatch(/--default-font-family:\s*var\(--tide-font-sans\)/);
    expect(css).toMatch(/--default-mono-font-family:\s*var\(--tide-font-mono\)/);
  });

  it("Tailwind 기본 크기와 굵기가 남지 않는다", () => {
    for (const size of [...defaultTextSizes, "8xl", "9xl"]) {
      expect(ruleBody(css, `text-${size}`), size).toBeUndefined();
      expect(css).not.toContain(`--text-${size}:`);
    }
    for (const name of defaultOnlyWeights) {
      expect(ruleBody(css, `font-${name}`), name).toBeUndefined();
      expect(css).not.toContain(`--font-weight-${name}`);
    }
  });

  it.each(keptClasses)("Tailwind 기본 %s는 남는다", (name, property) => {
    expect(ruleBody(css, name)).toContain(`${property}:`);
  });

  it("텍스트 스타일과 글자색은 이름이 겹치지 않고 따로 생긴다", () => {
    expect(ruleBody(css, "text-muted")).toContain("color: var(--tide-text-muted)");
    expect(ruleBody(css, "text-body-md")).not.toContain("color:");
  });

  it("반응형 variant와 함께 쓸 수 있다", () => {
    expect(css).toMatch(/\.md\\:text-heading-xl\s*\{\s*font-size: var\(--tide-text-heading-xl\)/);
  });

  it("base CSS가 어절 단위 줄바꿈을 켜고 루트 font-size를 바꾸지 않는다", () => {
    const base = /@layer base\s*\{[\s\S]*\}/.exec(css)?.[0] ?? "";
    expect(base).toMatch(/html,\s*:host\s*\{\s*word-break: keep-all;\s*overflow-wrap: break-word;/);
    const htmlRules = [...css.matchAll(/(?:^|\})\s*html[^{]*\{([^}]*)\}/g)].map((m) => m[1]!);
    for (const rule of htmlRules) expect(rule).not.toMatch(/(^|[^-])font-size:/);
  });
});

// spec 「`@tide-design/foundation`」 radius·Elevation·포커스 표시. 기대 목록은 spec을 그대로 적는다.
const radii = ["sm", "md", "lg", "xl", "full"];
const shadows = ["sm", "md", "lg"];
// Tailwind 기본값 중 지워야 하는 것
const removedShapeClasses = [
  "rounded",
  "rounded-xs",
  "rounded-2xl",
  "rounded-3xl",
  "rounded-4xl",
  "rounded-t-2xl",
  "shadow",
  "shadow-2xs",
  "shadow-xs",
  "shadow-xl",
  "shadow-2xl",
  "inset-shadow-2xs",
  "inset-shadow-xs",
  "inset-shadow-sm",
  "drop-shadow-xs",
  "drop-shadow-sm",
  "drop-shadow-md",
  "drop-shadow-lg",
  "drop-shadow-xl",
  "drop-shadow-2xl",
  "text-shadow-2xs",
  "text-shadow-xs",
  "text-shadow-sm",
  "text-shadow-md",
  "text-shadow-lg",
];
const removedShapeVars = [
  "--radius-xs",
  "--radius-2xl",
  "--radius-3xl",
  "--radius-4xl",
  "--shadow-2xs",
  "--shadow-xs",
  "--shadow-xl",
  "--shadow-2xl",
  "--inset-shadow-",
  "--drop-shadow-",
  "--text-shadow-",
];

describe("tailwind.css radius·Elevation·포커스 표시", () => {
  let css: string;

  beforeAll(async () => {
    css = await buildCss([
      ...radii.map((name) => `rounded-${name}`),
      "rounded-t-lg",
      ...shadows.map((name) => `shadow-${name}`),
      ...removedShapeClasses,
      "rounded-none",
      "shadow-none",
      "focus-ring",
      "focus-field",
      "focus-visible:focus-ring",
      "focus:focus-field",
      "aria-invalid:border-danger",
      "dark:shadow-md",
    ]);
  });

  it.each(radii)("radius rounded-%s가 --tide-* 공개 계약을 가리킨다", (name) => {
    expect(ruleBody(css, `rounded-${name}`)).toContain(
      `border-radius: var(--tide-rounded-${name})`,
    );
  });

  it("방향별 radius도 Tide 단계를 쓴다", () => {
    const body = ruleBody(css, "rounded-t-lg");
    expect(body).toContain("border-top-left-radius: var(--tide-rounded-lg)");
    expect(body).toContain("border-top-right-radius: var(--tide-rounded-lg)");
  });

  it.each(shadows)("그림자 shadow-%s가 --tide-* 공개 계약을 가리킨다", (name) => {
    const body = ruleBody(css, `shadow-${name}`);
    expect(body).toContain(`--tw-shadow: var(--tide-shadow-${name})`);
    expect(body).toContain("box-shadow:");
  });

  it("Theme 분기 없이 같은 class가 dark variant에서도 같은 공개 계약을 쓴다", () => {
    expect(css).toMatch(
      /\.dark\\:shadow-md:where\(\[data-theme=dark\], \[data-theme=dark\] \*\)\s*\{\s*--tw-shadow: var\(--tide-shadow-md\)/,
    );
  });

  it("Tailwind 기본 radius와 그림자가 남지 않는다", () => {
    for (const name of removedShapeClasses) expect(ruleBody(css, name), name).toBeUndefined();
    for (const name of removedShapeVars) expect(css, name).not.toContain(name);
  });

  it("theme 변수가 없는 rounded-none, shadow-none은 남는다", () => {
    expect(ruleBody(css, "rounded-none")).toContain("border-radius: 0");
    expect(ruleBody(css, "shadow-none")).toContain("--tw-shadow: 0 0 #0000");
  });

  it("focus-ring은 outline 2px, offset 2px이고 focus 색을 쓴다", () => {
    const body = ruleBody(css, "focus-ring");
    expect(body).toContain("outline: var(--tide-focus-ring-width) solid var(--tide-outline-focus)");
    expect(body).toContain("outline-offset: var(--tide-focus-ring-offset)");
  });

  it("focus-field는 border 색과 inset 1px를 두고, 투명 outline은 forced-colors에서만 둔다", () => {
    const body = ruleBody(css, "focus-field");
    expect(body).toContain("border-color: var(--tide-outline-focus)");
    expect(body).toContain("box-shadow: inset 0 0 0 1px var(--tide-outline-focus)");
    // 평소 투명 outline을 두면 transition-colors가 outline-color를 currentColor에서 전환해 클릭 직후 번쩍인다.
    expect(body).toContain("outline: none");
    expect(css).toMatch(
      /\.focus-field\s*\{[^}]*@media \(forced-colors: active\)\s*\{\s*outline: var\(--tide-focus-ring-width\) solid transparent/,
    );
  });

  it("variant와 함께 쓸 수 있다", () => {
    expect(css).toMatch(/\.focus-visible\\:focus-ring:focus-visible\s*\{\s*outline:/);
    expect(css).toMatch(/\.focus\\:focus-field:focus\s*\{\s*border-color:/);
  });

  it("error+focus 조합은 같은 2px 표시를 오류 색으로 그린다", () => {
    // border와 inset을 둘 다 border-danger로 맞춰, 빨강 border 안쪽에 파랑 inset이 겹치지 않는다(ADR 0026).
    expect(css).toMatch(
      /\.aria-invalid\\:border-danger\[aria-invalid="true"\]\s*\{\s*border-color: var\(--tide-border-danger\)/,
    );
    const field = /\.focus\\:focus-field:focus\s*\{([\s\S]*?)\n {2}\}/.exec(css)?.[1] ?? "";
    expect(field).toMatch(
      /&\[aria-invalid="true"\]\s*\{\s*border-color: var\(--tide-border-danger\);\s*box-shadow: inset 0 0 0 1px var\(--tide-border-danger\);/,
    );
  });
});

// spec 「`@tide-design/foundation`」 motion·z-index. 기대 목록은 spec을 그대로 적는다.
const durations = ["fast", "normal"];
const zIndices = ["sticky", "modal", "popover", "toast", "tooltip"];
// 시간을 적지 않은 transition class. 모두 --default-transition-* 를 읽는다.
const defaultTransitions = [
  "transition",
  "transition-colors",
  "transition-opacity",
  "transition-transform",
  "transition-shadow",
];

describe("tailwind.css motion·쌓임 단계", () => {
  let css: string;

  beforeAll(async () => {
    css = await buildCss([
      ...durations.map((name) => `duration-${name}`),
      ...zIndices.map((name) => `z-${name}`),
      ...defaultTransitions,
      "ease-out",
      "ease-in",
      "ease-in-out",
      "duration-150",
      "z-0",
      "z-10",
      "motion-safe:duration-normal",
    ]);
  });

  it.each(durations)("duration-%s가 --tide-* 공개 계약을 가리킨다", (name) => {
    const body = ruleBody(css, `duration-${name}`);
    expect(body).toContain(`--tw-duration: var(--tide-duration-${name})`);
    expect(body).toContain(`transition-duration: var(--tide-duration-${name})`);
  });

  it("ease-out이 --tide-ease-out을 가리키고 ease-in, ease-in-out은 Tailwind 기본값으로 남는다", () => {
    expect(ruleBody(css, "ease-out")).toContain("transition-timing-function: var(--tide-ease-out)");
    expect(ruleBody(css, "ease-in")).toContain("transition-timing-function: var(--ease-in)");
    expect(ruleBody(css, "ease-in-out")).toContain(
      "transition-timing-function: var(--ease-in-out)",
    );
    expect(css).toMatch(/--ease-in: cubic-bezier\(0\.4, 0, 1, 1\)/);
  });

  it.each(defaultTransitions)("시간을 적지 않은 %s는 Tide 기본값(fast, out)을 쓴다", (name) => {
    const body = ruleBody(css, name);
    expect(body).toContain("transition-duration: var(--tw-duration, var(--tide-duration-fast))");
    expect(body).toContain("transition-timing-function: var(--tw-ease, var(--tide-ease-out))");
  });

  it("Tailwind 기본 transition 값(150ms, cubic-bezier(0.4, 0, 0.2, 1))이 남지 않는다", () => {
    expect(css).not.toContain("--default-transition-duration");
    expect(css).not.toContain("--default-transition-timing-function");
    for (const name of defaultTransitions) {
      expect(ruleBody(css, name), name).not.toContain("cubic-bezier(0.4, 0, 0.2, 1)");
    }
  });

  it("motion-safe variant와 함께 쓸 수 있다", () => {
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: no-preference\)\s*\{\s*\.motion-safe\\:duration-normal\s*\{\s*--tw-duration: var\(--tide-duration-normal\)/,
    );
  });

  it.each(zIndices)("z-%s가 --tide-* 공개 계약을 가리킨다", (name) => {
    expect(ruleBody(css, `z-${name}`)).toContain(`z-index: var(--tide-z-${name})`);
  });

  it("숫자 해석(duration-150, z-0, z-10)은 그대로 남는다", () => {
    expect(ruleBody(css, "duration-150")).toContain("transition-duration: 150ms");
    expect(ruleBody(css, "z-0")).toContain("z-index: 0");
    expect(ruleBody(css, "z-10")).toContain("z-index: 10");
  });
});
