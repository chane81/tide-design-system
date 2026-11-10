// 앱 브랜드 색 계열(tide-v0-impl 티켓 40): defineColorFamily 검증과 tide-color CLI(빌드한 bin)를 확인한다.
// CLI는 앱처럼 `node dist/cli.js build <파일>`로 실행한다. 픽스처는 패키지 이름으로 color-family를 import한다.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { checkColorFamily, colorFamilyCss, defineColorFamily } from "../dist/color-family.js";
import brand from "./fixtures/brand.ts";
import { yellowScale } from "./fixtures/yellow.ts";

const packageDir = fileURLToPath(new URL("../", import.meta.url));

function cli(...args: string[]): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(process.execPath, ["dist/cli.js", ...args], {
    cwd: packageDir,
    encoding: "utf8",
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

describe("defineColorFamily", () => {
  it("검증한 계열을 그대로 돌려주고 hex는 소문자로 맞춘다", () => {
    const family = defineColorFamily({
      name: "brand-sub",
      scale: { ...yellowScale, 500: "#EAB308" },
    });
    expect(family.name).toBe("brand-sub");
    expect(family.scale[500]).toBe("#eab308");
    expect(family.overrides).toEqual({});
  });

  it.each(["primary", "blue", "gray", "accent", "text", "white"])(
    "Tide가 쓰는 이름(%s)은 쓸 수 없다",
    (name) => {
      expect(() => defineColorFamily({ name, scale: yellowScale })).toThrow(/Tide가 쓰는 이름/);
    },
  );

  it("kebab-case가 아닌 이름은 쓸 수 없다", () => {
    expect(() => defineColorFamily({ name: "Brand", scale: yellowScale })).toThrow(/kebab-case/);
    expect(() => defineColorFamily({ name: "my brand", scale: yellowScale })).toThrow();
  });

  it("스케일은 11단계 전체가 #rrggbb여야 한다", () => {
    const { 950: _missing, ...partial } = yellowScale;
    expect(() =>
      defineColorFamily({ name: "brand", scale: partial as unknown as typeof yellowScale }),
    ).toThrow(/brand-950/);
    expect(() =>
      defineColorFamily({ name: "brand", scale: { ...yellowScale, 600: "#ca8a0480" } }),
    ).toThrow(/brand-600/);
  });

  it("덮어쓸 값은 있는 슬롯과 단계만 받는다", () => {
    expect(() =>
      defineColorFamily({
        name: "brand",
        scale: yellowScale,
        overrides: { outline: { light: 600 } } as never,
      }),
    ).toThrow(/없는 슬롯/);
    expect(() =>
      defineColorFamily({
        name: "brand",
        scale: yellowScale,
        overrides: { solid: { light: 650 as never } },
      }),
    ).toThrow(/solid\.light/);
  });
});

describe("앱 계열 CSS와 대비 검사", () => {
  it("Tide 계열과 같은 매핑 규칙으로 light·dark 계열 변수와 [data-color] 규칙을 만든다", () => {
    const css = colorFamilyCss([brand]);
    expect(css).toContain("  --tide-color-brand-600: #7c3aed;");
    expect(css).toMatch(
      /:root,\n\[data-theme="light"\] \{\n {2}--tide-brand-solid: var\(--tide-color-brand-600\);/,
    );
    expect(css).toMatch(
      /\[data-theme="dark"\] \{\n {2}--tide-brand-solid: var\(--tide-color-brand-600\);/,
    );
    expect(css).toContain("  --tide-brand-subtle: var(--tide-color-brand-950);");
    expect(css).toContain("  --tide-brand-on-solid: var(--tide-color-white);");
    expect(css).toContain(
      '[data-color="brand"] {\n  --tide-accent-solid: var(--tide-brand-solid);',
    );
    expect(css).toContain("  --tide-accent-on-solid: var(--tide-brand-on-solid);");
  });

  it("대비 쌍 규칙 12개를 light·dark에서 검사한다", () => {
    const results = checkColorFamily(brand);
    expect(results).toHaveLength(24);
    expect(results.every((result) => result.pass)).toBe(true);
  });

  it("덮어쓴 슬롯은 CSS와 대비 검사에 함께 반영된다", () => {
    const yellow = defineColorFamily({
      name: "yellow",
      scale: yellowScale,
      overrides: { "on-solid": { light: 950, dark: 950 } },
    });
    expect(colorFamilyCss([yellow])).toContain(
      "  --tide-yellow-on-solid: var(--tide-color-yellow-950);",
    );
    const onSolid = checkColorFamily(yellow).find(
      (result) => result.foreground === "on-solid" && result.background === "solid",
    );
    expect(onSolid?.pass).toBe(true);
  });
});

describe("tide-color CLI", () => {
  it("build는 CSS를 stdout으로 내고 exit 0이다", () => {
    const result = cli("build", "test/fixtures/brand.ts");
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/^\/\* tide-color가 test\/fixtures\/brand\.ts에서 만들었다/);
    expect(result.stdout).toContain(colorFamilyCss([brand]));
    expect(result.stderr).toContain("brand: 대비 쌍 24개 중 24개 통과");
  });

  it("대비 미달이 있으면 CSS를 내지 않고 exit 1이다", () => {
    const result = cli("build", "test/fixtures/yellow.ts");
    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("대비 미달 yellow light: on-solid / solid 2.94:1 < 4.5:1");
    expect(result.stderr).toContain("대비 미달 yellow light: border / bg-canvas");
  });

  it("default export 배열로 계열 여러 개를 한 번에 만든다", () => {
    const result = cli("build", "test/fixtures/yellow-overrides.ts");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('[data-color="brand"]');
    expect(result.stdout).toContain('[data-color="yellow"]');
    expect(result.stdout).toContain("  --tide-yellow-solid: var(--tide-color-yellow-400);");
  });

  it("사용법이 틀리면 exit 2, 파일을 읽지 못하면 exit 1이다", () => {
    expect(cli().status).toBe(2);
    expect(cli("check", "test/fixtures/brand.ts").status).toBe(2);
    const missing = cli("build", "test/fixtures/none.ts");
    expect(missing.status).toBe(1);
    expect(missing.stderr).toMatch(/^tide-color: /);
  });
});
