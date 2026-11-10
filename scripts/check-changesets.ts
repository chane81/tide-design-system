// PR의 changeset 규칙을 검사한다(spec 릴리스 절 「CI 규칙」, CONTRIBUTING.md 「버전 규칙」).
//
//   node scripts/check-changesets.ts <base ref>   예: node scripts/check-changesets.ts origin/main
//
// 1. `packages/*`(private가 아닌 배포 패키지)를 바꿨는데 changeset이 없으면 실패한다.
//    `changeset status --since <base>`가 판단한다(@changesets/cli 3.0.3: 바뀐 패키지가 있는데
//    새 changeset이 없으면 exit 1. empty changeset도 changeset으로 센다. private 패키지는 세지 않는다).
// 2. 배포 패키지가 0.x인 동안 `major` changeset은 실패한다(1.0.0으로 올라가 버린다).
// 3. 아이콘 이름표에서 키가 빠졌는데 `@tide-tds/icons` minor changeset이 없으면 실패한다.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  type ChangesetSummary,
  nameRemovalProblem,
  removedNameKeys,
} from "../packages/icons/scripts/name-removal.ts";

const NAME_TABLE = "packages/icons/icon-names.json";
const PUBLISHED = ["foundation", "icons", "desktop"] as const;

const base = process.argv[2];
if (!base) {
  console.error("사용법: node scripts/check-changesets.ts <base ref>");
  process.exit(2);
}

function git(...args: string[]): { ok: boolean; stdout: string } {
  const result = spawnSync("git", args, { encoding: "utf8" });
  return { ok: result.status === 0, stdout: result.stdout };
}

const problems: string[] = [];

// 1. changeset 유무. 실패 메시지는 changesets가 직접 출력한다.
// CHANGESETS_OUTPUT이 있으면 changesets CLI가 그 경로를 --output으로 쓰므로(3.0.3 index.mjs) 지운다.
const outDir = mkdtempSync(join(tmpdir(), "tide-changeset-status-"));
const outFile = join(outDir, "status.json");
const { CHANGESETS_OUTPUT: _ignored, ...env } = process.env;
const status = spawnSync(
  "pnpm",
  ["exec", "changeset", "status", "--since", base, "--output", outFile],
  { stdio: "inherit", env },
);
if (status.status !== 0) {
  rmSync(outDir, { recursive: true, force: true });
  console.error(
    "\n배포 패키지(packages/*)를 바꿨다면 changeset을 더한다. 릴리스가 필요 없으면 `pnpm changeset --empty`.",
  );
  process.exit(1);
}
const plan = JSON.parse(readFileSync(outFile, "utf8")) as { changesets: ChangesetSummary[] };
rmSync(outDir, { recursive: true, force: true });
const ids = plan.changesets.map((changeset) => changeset.id);
console.log(`새 changeset ${ids.length}개${ids.length > 0 ? `: ${ids.join(", ")}` : ""}`);

// 2. 0.x 동안 major 금지.
const zeroMajor = PUBLISHED.some((dir) => {
  const { version } = JSON.parse(readFileSync(`packages/${dir}/package.json`, "utf8")) as {
    version: string;
  };
  return version.startsWith("0.");
});
if (zeroMajor) {
  const majors = plan.changesets.filter((changeset) =>
    changeset.releases.some((release) => release.type === "major"),
  );
  for (const changeset of majors) {
    problems.push(
      `.changeset/${changeset.id}.md: 0.x 동안 major는 쓰지 않는다. breaking은 minor, 그 밖은 patch다.`,
    );
  }
}

// 3. 이름표 키 삭제. 비교 기준은 changesets와 같게 base와 HEAD의 merge-base다.
const mergeBase = git("merge-base", base, "HEAD");
if (!mergeBase.ok) {
  console.error(`merge-base를 찾지 못했다: ${base} HEAD`);
  process.exit(2);
}
const before = git("show", `${mergeBase.stdout.trim()}:${NAME_TABLE}`);
if (before.ok) {
  const removed = removedNameKeys(
    JSON.parse(before.stdout) as Record<string, string>,
    JSON.parse(readFileSync(NAME_TABLE, "utf8")) as Record<string, string>,
  );
  const problem = nameRemovalProblem(removed, plan.changesets);
  if (problem) problems.push(problem);
}

if (problems.length > 0) {
  console.error(`\n${problems.join("\n\n")}`);
  process.exit(1);
}
console.log("changeset 규칙 통과");
