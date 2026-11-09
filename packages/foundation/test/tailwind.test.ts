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

// spec 「`@tide-tds/foundation`」 Semantic 색. [class, CSS 속성]
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
  ...["default", "strong", ...accentRoles].map(
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
  "purple",
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
      ...meaninglessClasses,
      ...defaultOnlyFamilies.flatMap((family) => [`bg-${family}-500`, `text-${family}-50`]),
      "bg-blue-500",
      "bg-red-500",
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
    expect(css).not.toMatch(/--color-(red|blue|gray|green|amber|cyan)-\d+:\s*oklch/);
  });

  it("dark variant는 data-theme=dark를 따른다", () => {
    expect(css).toMatch(
      /\.dark\\:bg-canvas:where\(\[data-theme=dark\], \[data-theme=dark\] \*\)\s*\{\s*background-color: var\(--tide-bg-canvas\)/,
    );
    expect(css).not.toContain("prefers-color-scheme: dark");
  });
});
