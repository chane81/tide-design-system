// CLI는 앱처럼 빌드한 `dist/cli.js`로 실행하고, 픽스처는 패키지 이름으로 color-family를 import한다.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { checkColorFamily, colorFamilyCss, defineColorFamily } from "../dist/colorFamily.js";
import brand from "./fixtures/brand";
import { yellowScale } from "./fixtures/yellow";

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
      scale: { ...yellowScale, 500: "#D4BF3A" },
    });
    expect(family.name).toBe("brand-sub");
    expect(family.scale[500]).toBe("#d4bf3a");
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
      defineColorFamily({ name: "brand", scale: { ...yellowScale, 600: "#b49f0380" } }),
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
    expect(css).toContain("  --tide-color-brand-600: #a85c81;");
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

  it("새 슬롯(faint, on-subtle, subtle-border)과 덮기·섞기 값이 CSS에 나온다(ADR 0022)", () => {
    const css = colorFamilyCss([brand]);
    const mix = (a: string, b: string, amount: number): string =>
      `#${[1, 3, 5]
        .map((index) =>
          Math.round(
            Number.parseInt(a.slice(index, index + 2), 16) * (1 - amount) +
              Number.parseInt(b.slice(index, index + 2), 16) * amount,
          )
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")}`;
    const light = css.slice(
      css.indexOf('[data-theme="light"]'),
      css.indexOf('[data-theme="dark"]'),
    );
    const dark = css.slice(css.indexOf('[data-theme="dark"]'), css.indexOf("[data-color="));
    expect(light).toContain("  --tide-brand-faint: var(--tide-color-brand-50);");
    expect(light).toContain("  --tide-brand-on-subtle: var(--tide-color-brand-950);");
    expect(light).toContain("  --tide-brand-subtle-border: var(--tide-color-brand-200);");
    expect(light).toContain("  --tide-brand-text: var(--tide-color-brand-700);");
    expect(dark).toContain("  --tide-brand-text: var(--tide-color-brand-300);");
    // 덮기: light subtle-hover = 100 + gray-950(#28292c) 4%, solid-hover = 600 + black 14%
    expect(light).toContain(
      `  --tide-brand-subtle-hover: ${mix(brand.scale[100], "#28292c", 0.04)};`,
    );
    expect(light).toContain(
      `  --tide-brand-solid-hover: ${mix(brand.scale[600], "#000000", 0.14)};`,
    );
    // 섞기: dark faint = gray-950과 950을 반씩
    expect(dark).toContain(`  --tide-brand-faint: ${mix("#28292c", brand.scale[950], 0.5)};`);
    expect(dark).toContain(
      `  --tide-brand-subtle-hover: ${mix(brand.scale[950], "#ffffff", 0.06)};`,
    );
    expect(css).toContain("  --tide-accent-faint: var(--tide-brand-faint);");
    expect(css).toContain("  --tide-accent-on-subtle: var(--tide-brand-on-subtle);");
    expect(css).toContain("  --tide-accent-subtle-border: var(--tide-brand-subtle-border);");
  });

  it("앱 계열 대비 검사는 on-subtle × faint·subtle 3단계, text × faint(outline·ghost hover)를 돈다", () => {
    const pairs = checkColorFamily(brand).map(
      (result) => `${result.theme} ${result.foreground}/${result.background}`,
    );
    for (const theme of ["light", "dark"]) {
      for (const background of ["faint", "subtle", "subtle-hover", "subtle-active"]) {
        expect(pairs).toContain(`${theme} on-subtle/${background}`);
      }
      // outline·ghost는 hover faint, 누름 subtle로 채운다(ADR 0025). 무채색 덮기는 neutral만 쓴다.
      expect(pairs).toContain(`${theme} text/faint`);
      expect(pairs).toContain(`${theme} text/subtle`);
      expect(pairs).not.toContain(`${theme} text/subtle-hover`);
      expect(pairs).not.toContain(`${theme} text/bg-hover`);
      expect(pairs).not.toContain(`${theme} text/bg-active`);
      // subtle-border는 꾸밈이라 검사하지 않는다.
      expect(pairs.filter((pair) => pair.includes("subtle-border"))).toEqual([]);
    }
  });

  it("덮어쓸 값에 덮기·섞기를 쓸 수 있고 모양이 틀리면 거부한다", () => {
    const family = defineColorFamily({
      name: "brand-overlay",
      scale: brand.scale,
      overrides: {
        "subtle-hover": { light: { step: 100, overlay: "gray-950", amount: 0.06 } },
        faint: { dark: { mix: ["gray-950", 900] } },
      },
    });
    expect(colorFamilyCss([family])).toContain(`  --tide-brand-overlay-subtle-hover: #`);
    expect(() =>
      defineColorFamily({
        name: "brand",
        scale: brand.scale,
        overrides: { faint: { light: { step: 100, overlay: "gray-950", amount: 4 } } },
      }),
    ).toThrow(/faint\.light/);
    expect(() =>
      defineColorFamily({
        name: "brand",
        scale: brand.scale,
        overrides: { faint: { light: { mix: ["gray-950", "pink-50" as never] } } },
      }),
    ).toThrow(/faint\.light/);
  });

  it("대비 쌍 규칙 16개를 light·dark에서 검사한다", () => {
    const results = checkColorFamily(brand);
    expect(results).toHaveLength(32);
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
    // 새 슬롯이 계열 변수와 [data-color] 규칙에 나온다(ADR 0022).
    for (const slot of ["faint", "on-subtle", "subtle-border"]) {
      expect(result.stdout).toContain(`  --tide-brand-${slot}: `);
      expect(result.stdout).toContain(`  --tide-accent-${slot}: var(--tide-brand-${slot});`);
    }
    expect(result.stderr).toContain("brand: 대비 쌍 32개 중 32개 통과");
  });

  it("대비 미달이 있으면 CSS를 내지 않고 exit 1이다", () => {
    const result = cli("build", "test/fixtures/yellow.ts");
    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("대비 미달 yellow light: on-solid / solid 2.66:1 < 4:1");
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
