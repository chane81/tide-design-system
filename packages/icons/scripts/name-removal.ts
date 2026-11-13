// 이름표에서 키가 빠졌을 때 minor changeset을 요구하는 규칙(spec 릴리스 절, ADR 0007 「정정」).
// 이름표 키(Tide 이름)는 공개 계약이다. 키를 지우거나 이름을 바꾸면(= 옛 키가 빠짐) 0.x에서 breaking이고,
// breaking은 minor로 낸다. 키를 더하거나 원본 SVG 쪽만 고치는 것은 patch라서 이 규칙과 상관없다.
// 저장소 CI 검사(`scripts/check-changesets.ts`)가 git과 `changeset status` 결과를 넣어 부른다.

/** 아이콘 패키지 이름. changeset의 release 이름과 비교한다. */
export const ICONS_PACKAGE = "@tide-design/icons";

/** `changeset status --output` JSON의 changeset 하나에서 이 규칙이 쓰는 부분(@changesets/types 7.0.0 `NewChangeset`). */
export type ChangesetSummary = {
  id: string;
  releases: ReadonlyArray<{ name: string; type: string }>;
};

/** base 이름표에 있었는데 head 이름표에 없는 키를 이름순으로 돌려준다. */
export function removedNameKeys(
  base: Readonly<Record<string, string>>,
  head: Readonly<Record<string, string>>,
): string[] {
  return Object.keys(base)
    .filter((key) => !Object.hasOwn(head, key))
    .sort();
}

/**
 * 빠진 키가 있는데 `@tide-design/icons`를 minor로 올리는 changeset이 없으면 실패 메시지를, 아니면 null을 돌려준다.
 * fixed 묶음이라 다른 패키지의 minor로도 버전은 같이 오르지만, CHANGELOG에 아이콘 변경이 남도록 icons에 직접 minor를 요구한다.
 */
export function nameRemovalProblem(
  removed: readonly string[],
  changesets: readonly ChangesetSummary[],
): string | null {
  if (removed.length === 0) return null;
  const hasIconsMinor = changesets.some((changeset) =>
    changeset.releases.some(
      (release) => release.name === ICONS_PACKAGE && release.type === "minor",
    ),
  );
  if (hasIconsMinor) return null;
  const shown = removed.slice(0, 20).join(", ");
  const more = removed.length > 20 ? ` 외 ${removed.length - 20}개` : "";

  return [
    `아이콘 이름표(packages/icons/icon-names.json)에서 키 ${removed.length}개가 빠졌다: ${shown}${more}`,
    `이름표 키를 지우거나 바꾸는 것은 breaking이다. "${ICONS_PACKAGE}": minor changeset을 더한다(CONTRIBUTING.md 「버전 규칙」).`,
  ].join("\n");
}
