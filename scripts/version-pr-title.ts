// Version PR 제목을 계산해 찍는다. 액션의 pr-title에 버전 자리 표시자가 없어 release.yml이 미리 넘긴다(ADR 0020).
// `changeset version` 전에 셈하므로 storybook-follow.ts가 더할 bump(ADR 0021)를 미리 반영한다.
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
