// 아이콘 페이지의 검색 메타데이터. 문서 앱 빌드 때 만들고 `@tide-design/icons` 공개 API로 내보내지 않는다.
// - 이름: 이름표(packages/icons/icon-names.json, Tide 이름의 정본)
// - 태그: 업스트림 원본 패키지의 tags.json(원본 SVG 이름 → 영어 태그). lucide-static 1.70.0 설치본 확인.
import tags from "lucide-static/tags.json" with { type: "json" };

import names from "../../../../../../packages/icons/icon-names.json" with { type: "json" };

export interface IconEntry {
  /** Tide export 이름(예: `HouseIcon`). */
  name: string;
  /** 검색어와 비교할 소문자 낱말들. 이름(접미사 제외)과 태그. */
  keywords: string[];
}

/** 이름표와 태그를 합쳐 검색 목록을 만든다. 순서는 Tide 이름순이다. */
export function buildIconIndex(
  table: Record<string, string>,
  tagTable: Record<string, readonly string[]>,
): IconEntry[] {
  return Object.entries(table)
    .map(([name, source]) => ({
      name,
      keywords: [
        name.replace(/Icon$/, "").toLowerCase(),
        ...(tagTable[source] ?? []).map((tag) => tag.toLowerCase()),
      ],
    }))
    .sort((a, b) => (a.name < b.name ? -1 : 1));
}

/**
 * 검색어와 얼마나 가까운지. 작을수록 앞에 둔다.
 * 0: 이름이 정확히 같다, 1: 이름이 검색어로 시작한다, 2: 이름에 들어 있다, 3: 태그가 정확히 같다, 4: 그 밖.
 */
function rank(keywords: readonly string[], joined: string): number {
  const [name = "", ...tagList] = keywords;
  if (name === joined) return 0;
  if (name.startsWith(joined)) return 1;
  if (name.includes(joined)) return 2;
  if (tagList.some((tag) => tag.replace(/[\s-]/g, "") === joined)) return 3;

  return 4;
}

/**
 * 공백으로 나눈 검색어가 모두 이름이나 태그 중 하나에 들어 있는 아이콘만 남긴다.
 * 대소문자와 낱말 사이 공백·하이픈은 무시한다(`arrow down`, `arrow-down`이 `ArrowDownIcon`을 찾는다).
 * 이름이 같은 것, 이름이 검색어로 시작하는 것, 이름에 든 것, 태그가 같은 것 순서로 앞에 두고, 같은 순위는 이름순이다.
 */
export function searchIcons(index: readonly IconEntry[], query: string): IconEntry[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/-/g, ""))
    .filter(Boolean);
  if (terms.length === 0) return [...index];
  const joined = terms.join("");

  return index
    .filter(
      ({ keywords }) =>
        keywords[0]?.includes(joined) ||
        terms.every((term) =>
          keywords.some((keyword) => keyword.replace(/[\s-]/g, "").includes(term)),
        ),
    )
    .map((entry) => ({ entry, score: rank(entry.keywords, joined) }))
    .sort((a, b) => a.score - b.score)
    .map(({ entry }) => entry);
}

/** 아이콘 하나를 가져오는 import 문. 복사 버튼이 클립보드에 넣는다. */
export function importStatement(name: string): string {
  return `import { ${name} } from "@tide-design/icons";`;
}

/** 실제 이름표와 태그로 만든 검색 목록. */
export const iconIndex: IconEntry[] = buildIconIndex(names, tags);
