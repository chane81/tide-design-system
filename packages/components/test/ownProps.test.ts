import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const packageDir = fileURLToPath(new URL("..", import.meta.url));
const srcDir = join(packageDir, "src");

interface Documented {
  component: string;
  file: string;
  names: string[];
  link: string;
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "_internal" ? [] : sourceFiles(path);

    return /\.tsx?$/.test(entry.name) && !entry.name.includes(".test.") ? [path] : [];
  });
}

/** 공개 Component JSDoc의 `Tide props: \`a\`, \`b\` ({@link XOwnProps})` 줄을 모은다. */
function documentedComponents(): Documented[] {
  return sourceFiles(srcDir).flatMap((path) => {
    const source = readFileSync(path, "utf8");

    return [...source.matchAll(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*export function (\w+)/g)].flatMap(
      ([, doc = "", component = ""]) => {
        const line = /Tide props: (.+?) \(\{@link (\w+)\}\)/.exec(doc);
        if (!line?.[1] || !line[2]) return [];

        return [
          {
            component,
            file: relative(srcDir, path),
            names: [...line[1].matchAll(/`([^`]+)`/g)].map((name) => name[1] ?? ""),
            link: line[2],
          },
        ];
      },
    );
  });
}

/** check 소스를 이 패키지 tsconfig로 타입 검사한다. 오류는 `변수 이름: 메시지`로 돌려준다. */
function typeErrors(checkSource: string): string[] {
  const dir = mkdtempSync(join(tmpdir(), "tide-components-own-props-"));
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
  const documented = documentedComponents();
  const exported = [
    ...readFileSync(join(srcDir, "index.ts"), "utf8").matchAll(/type (\w+OwnProps)\b/g),
  ].map((match) => match[1]);

  it("Component마다 자기 이름의 OwnProps를 잇는다", () => {
    expect(documented.filter((entry) => entry.link !== `${entry.component}OwnProps`)).toEqual([]);
  });

  it("진입점이 내보내는 OwnProps마다 목록을 적은 Component가 있다", () => {
    expect(documented.map((entry) => entry.link).sort()).toEqual([...exported].sort());
  });

  it("목록이 OwnProps의 키와 같다", { timeout: 60_000 }, () => {
    const checks = documented.map(({ component, link, names }) => {
      const doc = names.map((name) => JSON.stringify(name)).join(" | ") || "never";

      // 오류 메시지에 빠진 이름이 그대로 나온다.
      return `export const ${component}_notDocumented: never = null as unknown as Exclude<keyof Tide.${link}, ${doc}>;
export const ${component}_notOwnProps: never = null as unknown as Exclude<${doc}, keyof Tide.${link}>;`;
    });
    const errors = typeErrors(
      `import type * as Tide from ${JSON.stringify(join(srcDir, "index"))};\n${checks.join("\n")}\n`,
    );
    expect(errors).toEqual([]);
  });
});
