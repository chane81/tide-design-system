import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const packageDir = fileURLToPath(new URL("..", import.meta.url));
const srcDir = join(packageDir, "src");

/** Component JSDoc의 `Tide props: \`a\`, \`b\` ({@link XOwnProps})` 줄에서 이름과 링크를 꺼낸다. */
function tidePropsLine(source: string): { names: string[]; link: string } | undefined {
  const match = /Tide props: (.+?) \(\{@link (\w+)\}\)/.exec(source);
  if (!match?.[1] || !match[2]) return undefined;

  return {
    names: [...match[1].matchAll(/`([^`]+)`/g)].map((name) => name[1] ?? ""),
    link: match[2],
  };
}

/** check 소스를 이 패키지 tsconfig로 타입 검사한다. 오류는 `변수 이름: 메시지`로 돌려준다. */
function typeErrors(checkSource: string): string[] {
  const dir = mkdtempSync(join(tmpdir(), "tide-icons-own-props-"));
  try {
    writeFileSync(join(dir, "check.ts"), checkSource);
    writeFileSync(
      join(dir, "tsconfig.json"),
      JSON.stringify({
        extends: join(packageDir, "tsconfig.json"),
        compilerOptions: { noEmit: true, types: [] },
        include: [],
        files: [join(dir, "check.ts")],
      }),
    );
    const tsc = join(
      dirname(createRequire(import.meta.url).resolve("typescript/package.json")),
      "bin/tsc",
    );
    const result = spawnSync(process.execPath, [tsc, "-p", join(dir, "tsconfig.json")], {
      encoding: "utf8",
    });

    if (result.status === 0) return [];
    const lines = checkSource.split("\n");
    const errors = [...result.stdout.matchAll(/check\.ts\((\d+),\d+\): error TS\d+: (.*)/g)].map(
      ([, line = "", message]) =>
        `${/const (\w+)/.exec(lines[Number(line) - 1] ?? "")?.[1]}: ${message}`,
    );

    return errors.length > 0 ? errors : [result.stdout, result.stderr];
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("JSDoc의 Tide props 목록", () => {
  const base = tidePropsLine(readFileSync(join(srcDir, "IconBase.tsx"), "utf8"));

  it("IconBase JSDoc이 IconOwnProps를 잇는다", () => {
    expect(base?.link).toBe("IconOwnProps");
  });

  it("생성한 아이콘마다 IconBase와 같은 목록을 적는다", () => {
    const generatedDir = join(srcDir, "generated");
    const different = readdirSync(generatedDir)
      .filter((file) => file.endsWith(".tsx"))
      .filter((file) => {
        const line = tidePropsLine(readFileSync(join(generatedDir, file), "utf8"));

        return JSON.stringify(line) !== JSON.stringify(base);
      });
    expect(different).toEqual([]);
  });

  it("목록이 IconOwnProps의 키와 같다", { timeout: 60_000 }, () => {
    const documented =
      (base?.names ?? []).map((name) => JSON.stringify(name)).join(" | ") || "never";
    const errors =
      typeErrors(`import type { IconOwnProps } from ${JSON.stringify(join(srcDir, "IconBase"))};
type Documented = ${documented};
export const notDocumented: never = null as unknown as Exclude<keyof IconOwnProps, Documented>;
export const notOwnProps: never = null as unknown as Exclude<Documented, keyof IconOwnProps>;
`);
    expect(errors).toEqual([]);
  });
});
