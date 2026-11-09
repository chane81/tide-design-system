// 빌드한 CSS를 실제 Tailwind로 컴파일해 공개 표면(만들어지는 class)을 확인한다.
// 컴파일 API: @tailwindcss/node 4.3.5의 compile(css, { base, onDependency }).build(candidates).
// 공식 문서에는 없는 API라 설치 버전의 타입 선언(dist/index.d.ts)으로 확인했다.
import { readFile } from "node:fs/promises";
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
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\.${escaped}\\s*\\{([^}]*)\\}`).exec(css)?.[1];
}

describe("tailwind.css", () => {
  let css: string;

  beforeAll(async () => {
    css = await buildCss([
      "bg-primary-solid",
      "bg-blue-500",
      "bg-red-500",
      "bg-white",
      "text-bg-primary-solid",
      "text-primary-solid",
    ]);
  });

  it("Semantic class가 --tide-* 공개 계약을 가리킨다", () => {
    expect(ruleBody(css, "bg-primary-solid")).toContain(
      "background-color: var(--tide-bg-primary-solid)",
    );
  });

  it("Primitive class가 Tide 값을 쓴다", () => {
    expect(ruleBody(css, "bg-blue-500")).toContain("background-color: var(--tide-color-blue-500)");
  });

  it("Tailwind 기본 팔레트가 남지 않는다", () => {
    expect(ruleBody(css, "bg-red-500")).toBeUndefined();
    expect(ruleBody(css, "bg-white")).toBeUndefined();
    expect(css).not.toContain("--color-red-500");
  });

  it("의미 없는 조합은 class가 생기지 않는다", () => {
    expect(ruleBody(css, "text-bg-primary-solid")).toBeUndefined();
    expect(ruleBody(css, "text-primary-solid")).toBeUndefined();
  });
});

describe("tokens.css", () => {
  it("light와 dark에서 Semantic 변수를 정의한다", async () => {
    const tokens = await readFile(new URL("../dist/tokens.css", import.meta.url), "utf8");
    const darkBlock = tokens.slice(tokens.indexOf('[data-theme="dark"]'));

    expect(tokens).toContain("--tide-color-blue-500: #3183f5;");
    expect(tokens).toMatch(/:root,\s*\[data-theme="light"\]\s*\{[^}]*--tide-bg-primary-solid:/);
    expect(darkBlock).toContain("--tide-bg-primary-solid:");
    expect(tokens).not.toContain("@theme");
  });
});
