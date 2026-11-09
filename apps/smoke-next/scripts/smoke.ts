// 배포 tarball 소비 검사(seam ④). workspace 밖 임시 폴더에 실제 npm 사용자와 같은 구조로 설치한다.
// 순서: pnpm pack → publint → 앱 설치 → next build → tsc(bundler) → tsc(nodenext) → 출력 CSS 확인.
// workspace symlink로 연결하면 transpilePackages가 필요해져 사용자 구조와 달라진다(tide-v0 티켓 19).
import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = fileURLToPath(new URL("../", import.meta.url));
const repoRoot = join(appDir, "../..");

/** tarball로 만들 배포 패키지. 의존 순서와 무관하다. */
const tidePackages = ["foundation", "desktop"] as const;

/** 임시 앱에 설치할 외부 패키지. 버전은 workspace에 설치된 것(catalog)을 그대로 쓴다. */
const appDependencies = ["next", "react", "react-dom"];
const appDevDependencies = [
  "@tailwindcss/postcss",
  "@types/node",
  "@types/react",
  "@types/react-dom",
  "tailwindcss",
  "typescript",
];

function run(command: string, args: string[], cwd: string): void {
  console.log(`\n$ ${command} ${args.join(" ")}  (${cwd})`);
  const result = spawnSync(command, args, { cwd, stdio: "inherit", env: cleanEnv() });
  if (result.status !== 0) {
    throw new Error(`실패: ${command} ${args.join(" ")} (exit ${result.status})`);
  }
}

/** 부모 pnpm 실행에서 넘어온 설정이 임시 앱 설치에 섞이지 않게 한다. */
function cleanEnv(): NodeJS.ProcessEnv {
  return Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !/^(npm|pnpm)_(config|package|lifecycle)_/i.test(key),
    ),
  );
}

async function installedVersion(name: string): Promise<string> {
  const manifest = JSON.parse(
    await readFile(join(appDir, "node_modules", name, "package.json"), "utf8"),
  ) as {
    version: string;
  };
  return manifest.version;
}

async function filesUnder(dir: string, extension: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => join(entry.parentPath, entry.name));
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`CSS 확인 실패: ${message}`);
  }
}

const workDir = await mkdtemp(join(tmpdir(), "tide-smoke-"));
const tarballDir = join(workDir, "tarballs");
const consumerDir = join(workDir, "app");

try {
  // 1. tarball을 만들고 publint로 검사한다.
  await mkdir(tarballDir);
  const tarballs: Record<string, string> = {};
  for (const name of tidePackages) {
    const before = new Set(await readdir(tarballDir));
    run("pnpm", ["pack", "--pack-destination", tarballDir], join(repoRoot, "packages", name));
    const created = (await readdir(tarballDir)).find((file) => !before.has(file));
    if (!created) {
      throw new Error(`${name} tarball을 찾지 못했다.`);
    }
    tarballs[`@tide-tds/${name}`] = `file:${join(tarballDir, created)}`;
    run(
      join(appDir, "node_modules/.bin/publint"),
      ["run", join(tarballDir, created), "--strict"],
      appDir,
    );
  }

  // 2. workspace 밖에 앱을 만든다.
  await cp(join(appDir, "template"), consumerDir, { recursive: true });
  const versions = async (names: string[]): Promise<Record<string, string>> =>
    Object.fromEntries(
      await Promise.all(names.map(async (name) => [name, await installedVersion(name)] as const)),
    );
  const rootManifest = JSON.parse(await readFile(join(repoRoot, "package.json"), "utf8")) as {
    packageManager: string;
  };
  const manifest = {
    name: "tide-smoke-consumer",
    // 저장소와 같은 pnpm 버전으로 설치한다.
    packageManager: rootManifest.packageManager,
    private: true,
    type: "module",
    dependencies: { ...tarballs, ...(await versions(appDependencies)) },
    devDependencies: await versions(appDevDependencies),
  };
  await writeFile(join(consumerDir, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  // desktop tarball이 foundation을 정확한 버전으로 의존하므로, registry 대신 tarball로 연결한다.
  const overrides = Object.entries(tarballs)
    .map(([name, spec]) => `  "${name}": "${spec}"`)
    .join("\n");
  await writeFile(
    join(consumerDir, "pnpm-workspace.yaml"),
    `packages: []\noverrides:\n${overrides}\n`,
  );

  run("pnpm", ["install"], consumerDir);

  // 3. "use client" 경계와 prerender, d.ts 해석을 확인한다.
  run("pnpm", ["exec", "next", "build"], consumerDir);
  run("pnpm", ["exec", "tsc", "-p", "tsconfig.json"], consumerDir);
  run("pnpm", ["exec", "tsc", "-p", "tsconfig.nodenext.json"], consumerDir);

  // 4. 출력 CSS: 패키지 CSS의 @import와 @source가 동작했는지 본다.
  const cssFiles = await filesUnder(join(consumerDir, ".next/static"), ".css");
  const css = (await Promise.all(cssFiles.map((file) => readFile(file, "utf8")))).join("\n");
  assert(css.includes(".bg-primary-solid"), "앱이 쓴 Tide class(bg-primary-solid)가 없다");
  assert(css.includes("--tide-bg-primary-solid"), "foundation의 --tide-* 변수가 없다");
  assert(
    css.includes(".sr-only"),
    "desktop 내부 class(sr-only)가 없다. 패키지 CSS의 @source가 동작하지 않았다",
  );
  assert(!css.includes("--color-red-500"), "Tailwind 기본 팔레트가 남아 있다");

  console.log("\nsmoke 통과");
  await rm(workDir, { recursive: true, force: true });
} catch (error) {
  console.error(`\nsmoke 실패. 작업 폴더를 남겨 둔다: ${workDir}`);
  throw error;
}
