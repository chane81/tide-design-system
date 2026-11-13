// 릴리스 묶음(TDS, Storybook)을 가르는 규칙. ADR 0020, docs/research/changesets-split-version-prs.md 추천안 (a).
//
// - TDS: npm에 내는 세 패키지. `.changeset/config.json`의 `fixed`로 언제나 같은 버전이다(ADR 0008).
// - Storybook: private 앱 `@tide-design/docs`(apps/docs). `privatePackages.version`으로 자기 changeset으로만 버전이 오른다.
//
// Version PR은 하나다. 제목만 들어간 묶음에 따라 정한다. 이 파일은 순수 함수만 두고,
// git·파일을 읽는 일은 `version-pr-title.ts`, `storybook-release.ts`, `check-changesets.ts`가 한다.

/** npm에 내는 TDS 패키지. 문서와 같은 순서(Token → 아이콘 → Component). */
export const TDS_PACKAGES = [
  "@tide-design/foundation",
  "@tide-design/icons",
  "@tide-design/components",
] as const;

/** Storybook 문서 앱 패키지. */
export const STORYBOOK_PACKAGE = "@tide-design/docs";

/** `changeset status --output` JSON의 releases 항목 하나(@changesets/cli 3.0.3, @changesets/types 7.0.0 `ComprehensiveRelease`). */
export type StatusRelease = { name: string; type: string; oldVersion?: string; newVersion: string };

/** `changeset status --output` JSON의 changeset 하나에서 쓰는 부분(@changesets/types 7.0.0 `NewChangeset`). */
export type ChangesetSummary = {
  id: string;
  releases: ReadonlyArray<{ name: string; type: string }>;
};

/** 묶음마다 다음 버전. 그 묶음이 이번 Version PR에 없으면 null. */
export type BundleVersions = { tds: string | null; storybook: string | null };

function isTds(name: string): boolean {
  return (TDS_PACKAGES as readonly string[]).includes(name);
}

/**
 * releases에서 묶음별 다음 버전을 꺼낸다. 버전이 실제로 오르는 항목(`type !== "none"`)만 센다.
 * `none`은 버전 관리 대상이지만 이번에 오르지 않는 패키지다(changeset status가 계획에 넣는다).
 * TDS 세 패키지는 fixed라 버전이 하나여야 한다. 다르면 설정이 깨진 것이라 오류를 던진다.
 */
export function bundleVersions(releases: readonly StatusRelease[]): BundleVersions {
  const bumped = releases.filter((release) => release.type !== "none");
  const tdsVersions = [
    ...new Set(bumped.filter((release) => isTds(release.name)).map((r) => r.newVersion)),
  ];
  if (tdsVersions.length > 1) {
    throw new Error(`TDS 패키지는 fixed인데 다음 버전이 여러 개다: ${tdsVersions.join(", ")}`);
  }
  const storybook = bumped.find((release) => release.name === STORYBOOK_PACKAGE);
  return { tds: tdsVersions[0] ?? null, storybook: storybook?.newVersion ?? null };
}

/**
 * Version PR 제목. TDS만 `[TDS] Release <x>`, Storybook만 `[Storybook] Release <y>`,
 * 둘 다 `[TDS] Release <x> · [Storybook] Release <y>`. 둘 다 없으면 오류를 던진다
 * (version mode인데 오르는 묶음이 없으면 changeset이 잘못 쓰인 것이다).
 */
export function versionPrTitle(versions: BundleVersions): string {
  const parts: string[] = [];
  if (versions.tds) parts.push(`[TDS] Release ${versions.tds}`);
  if (versions.storybook) parts.push(`[Storybook] Release ${versions.storybook}`);
  if (parts.length === 0) throw new Error("이번 Version PR에서 버전이 오르는 묶음이 없다");
  return parts.join(" · ");
}

/**
 * 한 changeset 파일에 TDS 패키지와 Storybook이 함께 있으면 실패 메시지를 돌려준다.
 * 묶음을 나눠 `changeset version --ignore`로 따로 올리는 길(근거 문서 (b-2))을 열어 두려고 지금부터 막는다.
 * @changesets/assemble-release-plan 7.0.0은 `--ignore`를 쓸 때 섞인 changeset을 거부한다.
 */
export function mixedChangesetProblems(changesets: readonly ChangesetSummary[]): string[] {
  return changesets
    .filter(
      (changeset) =>
        changeset.releases.some((release) => isTds(release.name)) &&
        changeset.releases.some((release) => release.name === STORYBOOK_PACKAGE),
    )
    .map(
      (changeset) =>
        `.changeset/${changeset.id}.md: TDS 패키지와 ${STORYBOOK_PACKAGE}를 한 changeset에 섞지 않는다. 파일을 둘로 나눈다.`,
    );
}

/** Storybook 릴리스 git tag. changesets 모노레포 tag 형식 `<name>@<version>`(@changesets/cli 3.0.3 `buildGitTag`)을 따른다. */
export function storybookTag(version: string): string {
  return `${STORYBOOK_PACKAGE}@${version}`;
}

/**
 * main의 Storybook 버전을 릴리스해야 하는가. 0.0.0은 아직 한 번도 릴리스하지 않은 시작값이라 제외한다.
 * 그 밖에는 그 버전의 tag가 없으면 릴리스한다(배포 실패 뒤 다음 push에서 다시 시도된다).
 */
export function shouldReleaseStorybook(version: string, tagExists: boolean): boolean {
  return version !== "0.0.0" && !tagExists;
}

// ── Storybook이 TDS 릴리스를 따라 오르기(ADR 0021) ──
//
// TDS 릴리스가 든 Version PR에 Storybook changeset이 없으면, Storybook도 TDS와 같은 단계로 올린다.
// changesets 공식 기능(`___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH.updateInternalDependents: "always"`)은
// 쓰지 않는다. docs는 TDS를 devDependencies로 받는데, @changesets/assemble-release-plan 7.0.0
// `determineDependents`는 devDependencies 의존자를 `none`으로 두고, dependencies여도 patch만 준다.
// 그래서 `pnpm release:version`이 `changeset version` 전에 아래 파일을 만든다(`scripts/storybook-follow.ts`).

/** 자동으로 더하는 Storybook changeset의 id(파일 이름 `.changeset/<id>.md`). */
export const STORYBOOK_FOLLOW_ID = "storybook-follows-tds";

export type BumpType = "major" | "minor" | "patch";

const BUMP_RANK: Record<string, number> = { none: 0, patch: 1, minor: 2, major: 3 };

/**
 * Storybook을 TDS 따라 올릴 단계. changeset들의 TDS 항목 중 가장 큰 단계(fixed라 묶음 전체가 그 단계로 오른다).
 * Storybook 항목이 있는 changeset이 하나라도 있으면 사람이 쓴 것을 따르므로 null. TDS가 오르지 않아도 null.
 */
export function storybookFollowType(changesets: readonly ChangesetSummary[]): BumpType | null {
  const releases = changesets.flatMap((changeset) => changeset.releases);
  if (releases.some((release) => release.name === STORYBOOK_PACKAGE)) return null;
  let highest = 0;
  for (const release of releases) {
    if (isTds(release.name)) highest = Math.max(highest, BUMP_RANK[release.type] ?? 0);
  }
  if (highest === 0) return null;
  return (["patch", "minor", "major"] as const)[highest - 1];
}

/** `x.y.z`를 한 단계 올린다. prerelease는 쓰지 않으므로(CONTRIBUTING 「릴리스 흐름」) 다루지 않는다. */
export function incrementVersion(version: string, type: BumpType): string {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) throw new Error(`x.y.z 형식이 아닌 버전이다: ${version}`);
  const [major, minor, patch] = match.slice(1).map(Number);
  if (type === "major") return `${major + 1}.0.0`;
  if (type === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

/**
 * `changeset status` releases에 자동 Storybook bump를 반영한다. Version PR 제목은 `changeset version` 전에
 * 계산하므로 아직 없는 자동 changeset을 여기서 미리 셈한다. 따라 오르지 않으면 releases를 그대로 돌려준다.
 */
export function withStorybookFollow(
  releases: readonly StatusRelease[],
  changesets: readonly ChangesetSummary[],
): StatusRelease[] {
  const type = storybookFollowType(changesets);
  if (!type) return [...releases];
  const docs = releases.find((release) => release.name === STORYBOOK_PACKAGE);
  if (!docs) throw new Error(`changeset status releases에 ${STORYBOOK_PACKAGE}가 없다`);
  const oldVersion = docs.oldVersion ?? docs.newVersion;
  const followed = { ...docs, type, oldVersion, newVersion: incrementVersion(oldVersion, type) };
  return releases.map((release) => (release.name === STORYBOOK_PACKAGE ? followed : release));
}

/** 자동 Storybook changeset 파일 내용. 요약이 Storybook CHANGELOG 항목이 된다. */
export function storybookFollowChangeset(type: BumpType, tdsVersion: string): string {
  return `---
"${STORYBOOK_PACKAGE}": ${type}
---

TDS ${tdsVersion} 반영. 문서 사이트가 새 TDS 버전의 Component·Token으로 다시 배포된다.
`;
}
