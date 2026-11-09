// 아이콘 페이지의 검색 메타데이터. 문서 앱 빌드 때 만들고 `@tide-tds/icons` 공개 API로 내보내지 않는다.
// - 이름: 이름표(packages/icons/icon-names.json, Tide 이름의 정본)
// - 태그: 업스트림 원본 패키지의 tags.json(원본 SVG 이름 → 영어 태그). lucide-static 1.70.0 설치본 확인.
import tags from "lucide-static/tags.json" with { type: "json" };

import names from "../../../../packages/icons/icon-names.json" with { type: "json" };

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
 * 공백으로 나눈 검색어가 모두 이름이나 태그 중 하나에 들어 있는 아이콘만 남긴다.
 * 대소문자와 낱말 사이 공백·하이픈은 무시한다(`arrow down`, `arrow-down`이 `ArrowDownIcon`을 찾는다).
 */
export function searchIcons(index: readonly IconEntry[], query: string): IconEntry[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/-/g, ""))
    .filter(Boolean);
  if (terms.length === 0) return [...index];
  const joined = terms.join("");
  return index.filter(
    ({ keywords }) =>
      keywords[0]?.includes(joined) ||
      terms.every((term) =>
        keywords.some((keyword) => keyword.replace(/[\s-]/g, "").includes(term)),
      ),
  );
}

/** 아이콘 하나를 가져오는 import 문. 복사 버튼이 클립보드에 넣는다. */
export function importStatement(name: string): string {
  return `import { ${name} } from "@tide-tds/icons";`;
}

/** 실제 이름표와 태그로 만든 검색 목록. */
export const iconIndex: IconEntry[] = buildIconIndex(names, tags);
