// main의 Storybook(`@tide-tds/docs`) 버전을 아직 릴리스하지 않았는지 본다(ADR 0020).
//
//   node scripts/storybook-release.ts   → 표준 출력에 `version=0.1.0`, `tag=@tide-tds/docs@0.1.0`, `release=true|false`
//
// release.yml이 이 출력을 그대로 $GITHUB_OUTPUT에 붙인다. tag 유무는 원격(origin)에서 본다.
// actions/checkout은 기본으로 tag를 받지 않으므로(fetch-depth 1) 로컬 tag 목록에 기대지 않는다.
// `git ls-remote --exit-code`는 맞는 ref가 없으면 2로 끝난다(git-ls-remote 문서).
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { shouldReleaseStorybook, storybookTag } from "./release-scope.ts";

const { version } = JSON.parse(readFileSync("apps/docs/package.json", "utf8")) as {
  version: string;
};
const tag = storybookTag(version);

const remote = spawnSync(
  "git",
  ["ls-remote", "--exit-code", "--tags", "origin", `refs/tags/${tag}`],
  {
    encoding: "utf8",
  },
);
if (remote.status !== 0 && remote.status !== 2) {
  console.error(
    `원격 tag를 확인하지 못했다(git ls-remote exit ${remote.status}): ${remote.stderr}`,
  );
  process.exit(1);
}

console.log(`version=${version}`);
console.log(`tag=${tag}`);
console.log(`release=${shouldReleaseStorybook(version, remote.status === 0)}`);
