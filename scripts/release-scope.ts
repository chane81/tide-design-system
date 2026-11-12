// 릴리스 묶음(TDS, Storybook)을 가르는 규칙. ADR 0020, docs/research/changesets-split-version-prs.md 추천안 (a).
//
// - TDS: npm에 내는 세 패키지. `.changeset/config.json`의 `fixed`로 언제나 같은 버전이다(ADR 0008).
// - Storybook: private 앱 `@tide-tds/docs`(apps/docs). `privatePackages.version`으로 자기 changeset으로만 버전이 오른다.
//
// Version PR은 하나다. 제목만 들어간 묶음에 따라 정한다. 이 파일은 순수 함수만 두고,
// git·파일을 읽는 일은 `version-pr-title.ts`, `storybook-release.ts`, `check-changesets.ts`가 한다.

/** npm에 내는 TDS 패키지. 문서와 같은 순서(Token → 아이콘 → Component). */
export const TDS_PACKAGES = [
  "@tide-tds/foundation",
  "@tide-tds/icons",
  "@tide-tds/components",
] as const;

/** Storybook 문서 앱 패키지. */
export const STORYBOOK_PACKAGE = "@tide-tds/docs";

/** `changeset status --output` JSON의 releases 항목 하나(@changesets/cli 3.0.3, @changesets/types 7.0.0 `ComprehensiveRelease`). */
export type StatusRelease = { name: string; type: string; newVersion: string };

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
