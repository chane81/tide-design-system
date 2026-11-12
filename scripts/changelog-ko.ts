// `changeset version`이 새로 쓴 CHANGELOG 항목의 고정 영어 문구를 한글로 바꾼다(spec 「CHANGELOG는 한글로 쓴다」).
//
//   pnpm release:version   (= changeset version && node scripts/changelog-ko.ts)
//
// 본문(changeset 요약)은 기여자가 한글로 쓴다. 이 스크립트는 도구가 넣는 문구만 바꾼다.
// - 제목 `### Minor Changes` 등: @changesets/apply-release-plan 8.1.1이 `### ${Type} Changes`로 고정해 넣고 설정이 없다.
//   changesets/action v2.1.2가 Version PR 본문을 만들 때 제목의 major/minor/patch 낱말로 변경 수준을 읽으므로
//   그 낱말은 괄호 안에 남긴다.
// - `No changes in this release.`: 같은 패키지가 fixed 묶음 때문에 변경 없이 버전만 오를 때 넣는다.
// - `Thanks [@user](…)!`, `Updated dependencies`: @changesets/changelog-github 1.0.1이 넣는다.
// - Storybook(`apps/docs/CHANGELOG.md`, ADR 0020)도 같이 고친다. 문서 앱에는 호환성 계약이 없으므로
//   0.x 여부와 상관없이 minor는 「추가와 개편」, patch는 「수정」으로 쓴다.
// 맨 위 버전 항목만 고치므로 이미 나간 항목은 건드리지 않는다. 두 번 돌려도 결과가 같다.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/** 0.x에서는 minor가 breaking이고 patch가 기능 추가와 수정이다(spec 릴리스 절). */
function headings(major: number): Record<string, string> {
  return major === 0
    ? {
        Major: "호환되지 않는 변경 (major)",
        Minor: "호환되지 않는 변경 (minor)",
        Patch: "기능 추가와 수정 (patch)",
      }
    : {
        Major: "호환되지 않는 변경 (major)",
        Minor: "기능 추가 (minor)",
        Patch: "수정 (patch)",
      };
}

/** Storybook 문서 앱의 제목. 버전 규칙은 CONTRIBUTING.md 「버전 규칙」. */
const STORYBOOK_HEADINGS: Record<string, string> = {
  Major: "큰 개편 (major)",
  Minor: "추가와 개편 (minor)",
  Patch: "수정 (patch)",
};

function localizeLatestEntry(changelog: string, storybook: boolean): string {
  const start = changelog.search(/^## /m);
  if (start === -1) return changelog;
  const rest = changelog.slice(start + 3);
  const nextOffset = rest.search(/^## /m);
  const end = nextOffset === -1 ? changelog.length : start + 3 + nextOffset;
  const entry = changelog.slice(start, end);

  const version = /^## (\d+)\./.exec(entry);
  const names = storybook ? STORYBOOK_HEADINGS : headings(version ? Number(version[1]) : 0);
  const localized = entry
    .replace(/^### (Major|Minor|Patch) Changes$/gm, (_, type: string) => `### ${names[type]}`)
    .replace(
      /^No changes in this release\.$/m,
      "변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.",
    )
    .replace(/^- Updated dependencies/gm, "- 의존성 업데이트")
    .replace(/^(- .*?) Thanks (\[@.+?)! - /gm, "$1 $2 - ");
  return changelog.slice(0, start) + localized + changelog.slice(end);
}

const targets = [
  ...readdirSync("packages").map((dir) => ({ dir: join("packages", dir), storybook: false })),
  { dir: join("apps", "docs"), storybook: true },
];
for (const { dir, storybook } of targets) {
  const path = join(dir, "CHANGELOG.md");
  if (!existsSync(path)) continue;
  const before = readFileSync(path, "utf8");
  const after = localizeLatestEntry(before, storybook);
  if (after !== before) {
    writeFileSync(path, after);
    console.log(`${path}: 한글 문구로 바꿨다`);
  }
}
