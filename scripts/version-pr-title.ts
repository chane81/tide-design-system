// Version PR 제목을 계산해 표준 출력에 찍는다(ADR 0020).
//
//   node scripts/version-pr-title.ts <changeset status --output JSON 파일>
//
// changesets/action v2.1.2의 `pr-title`에는 버전 자리 표시자가 없어서(version/action.yml, src/run.ts)
// release.yml version job이 미리 계산해 넘긴다. 규칙은 scripts/release-scope.ts에 있다.
import { readFileSync } from "node:fs";

import { bundleVersions, type StatusRelease, versionPrTitle } from "./release-scope.ts";

const statusPath = process.argv[2];
if (!statusPath) {
  console.error("사용법: node scripts/version-pr-title.ts <changeset status --output JSON 파일>");
  process.exit(2);
}

const status = JSON.parse(readFileSync(statusPath, "utf8")) as { releases: StatusRelease[] };
try {
  console.log(versionPrTitle(bundleVersions(status.releases)));
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
