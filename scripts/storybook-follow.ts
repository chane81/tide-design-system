// TDS 릴리스에 Storybook changeset이 없으면 Storybook을 같은 단계로 올리는 changeset을 더한다(ADR 0021).
// 이 파일은 Version PR 브랜치에서 바로 소비되어 main에 커밋되지 않으므로 섞인 changeset 검사에 걸리지 않는다.
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  bundleVersions,
  type ChangesetSummary,
  STORYBOOK_FOLLOW_ID,
  type StatusRelease,
  storybookFollowChangeset,
  storybookFollowType,
} from "./release-scope.ts";

const target = join(".changeset", `${STORYBOOK_FOLLOW_ID}.md`);
if (existsSync(target)) {
  console.log(`${target}: 이미 있다. 그대로 둔다`);
  process.exit(0);
}

// CHANGESETS_OUTPUT이 있으면 changesets CLI가 그 경로를 --output으로 쓰므로(3.0.3 index.mjs) 지운다.
const outDir = mkdtempSync(join(tmpdir(), "tide-storybook-follow-"));
const outFile = join(outDir, "status.json");
const { CHANGESETS_OUTPUT: _ignored, ...env } = process.env;
const status = spawnSync("pnpm", ["exec", "changeset", "status", "--output", outFile], {
  stdio: ["ignore", "ignore", "inherit"],
  env,
});
if (status.status !== 0) {
  rmSync(outDir, { recursive: true, force: true });
  console.error(`changeset status가 실패했다(exit ${status.status})`);
  process.exit(1);
}
const plan = JSON.parse(readFileSync(outFile, "utf8")) as {
  releases: StatusRelease[];
  changesets: ChangesetSummary[];
};
rmSync(outDir, { recursive: true, force: true });

const type = storybookFollowType(plan.changesets);
const { tds } = bundleVersions(plan.releases);
if (!type || !tds) {
  console.log("Storybook을 TDS 따라 올리지 않는다(TDS 릴리스가 없거나 Storybook changeset이 있다)");
  process.exit(0);
}
writeFileSync(target, storybookFollowChangeset(type, tds));
console.log(`${target}: Storybook ${type}(TDS ${tds} 반영)를 더했다`);
