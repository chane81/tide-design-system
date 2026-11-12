// Version PR 제목을 계산해 표준 출력에 찍는다(ADR 0020).
//
//   node scripts/version-pr-title.ts <changeset status --output JSON 파일>
//
// changesets/action v2.1.2의 `pr-title`에는 버전 자리 표시자가 없어서(version/action.yml, src/run.ts)
// release.yml version job이 미리 계산해 넘긴다. 규칙은 scripts/release-scope.ts에 있다.
// 제목은 `changeset version` 전에 셈하므로, 그때 `storybook-follow.ts`가 더할 Storybook bump(ADR 0021)를
// `withStorybookFollow`로 미리 반영한다.
import { readFileSync } from "node:fs";

import {
  bundleVersions,
  type ChangesetSummary,
  type StatusRelease,
  versionPrTitle,
  withStorybookFollow,
} from "./release-scope.ts";

const statusPath = process.argv[2];
if (!statusPath) {
  console.error("사용법: node scripts/version-pr-title.ts <changeset status --output JSON 파일>");
  process.exit(2);
}

const status = JSON.parse(readFileSync(statusPath, "utf8")) as {
  releases: StatusRelease[];
  changesets: ChangesetSummary[];
};
try {
  console.log(
    versionPrTitle(bundleVersions(withStorybookFollow(status.releases, status.changesets))),
  );
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
