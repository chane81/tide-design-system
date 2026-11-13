// main의 Storybook 버전을 아직 릴리스하지 않았는지 `version=`·`tag=`·`release=` 줄로 찍는다(ADR 0020).
// checkout은 tag를 받지 않아 원격에서 본다. `git ls-remote --exit-code`는 맞는 ref가 없으면 2로 끝난다.
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
