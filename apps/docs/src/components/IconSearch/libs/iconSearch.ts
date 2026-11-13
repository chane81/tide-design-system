// 검색 메타데이터는 문서 앱 빌드 때 만들고 `@tide-design/icons` 공개 API로 내보내지 않는다.
// 태그는 lucide-static의 tags.json(원본 SVG 이름 → 영어 태그)에서 읽는다.
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

/** 검색어와 가까운 정도. 0 이름 일치, 1 이름 접두, 2 이름 포함, 3 태그 일치, 4 그 밖. 작을수록 앞이다. */
function rank(keywords: readonly string[], joined: string): number {
  const [name = "", ...tagList] = keywords;
  if (name === joined) return 0;
  if (name.startsWith(joined)) return 1;
  if (name.includes(joined)) return 2;
  if (tagList.some((tag) => tag.replace(/[\s-]/g, "") === joined)) return 3;

  return 4;
}

/**
 * 공백으로 나눈 낱말이 모두 이름이나 태그에 든 아이콘만 남긴다. 대소문자와 공백·하이픈은 무시한다.
 * 정렬은 순위(`rank`) 다음 이름순이다.
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
