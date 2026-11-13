"use client";
// 지울 수 있는 라벨 묶음 Tag(tide-v0-impl 티켓 33). React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useTagGroup, useTag, mergeProps, mergeRefs), react-stately 3.51.0(useListState).
// 태그는 목록 공통 부분(_internal/libs/listCollection.ts, ADR 0019)으로 모은다. 태그의 `value`가 컬렉션 key다(`valueItemCollectionNode`).
//
// 구조(react-aria 3.53.1 useTagGroup·useTag 설치본 소스로 확인):
// - `TagGroup`: `role="grid"`(태그가 없으면 `group`). 안의 `Tag`를 컬렉션으로 모아 `useListState`·`useTagGroup`에 넘긴다.
//   ←→(끝에서 처음으로 돈다, RTL이면 반대)·Home/End로 태그를 옮기고 비활성 태그는 건너뛴다. Tab 순서에는 태그 하나만 든다.
// - `Tag`: `role="row"` 안의 `role="gridcell"`. 렌더하지 않는 표시 요소이고 `TagGroup`이 node로 그린다.
//   `onRemove`가 있으면 Delete·Backspace로 지우고, 끝에 지우기 IconButton이 붙는다.
// - 지운 뒤 포커스: useListState가 지운 태그의 다음(없으면 앞) 태그로 focusedKey를 옮기고, React Aria가 그 태그에
//   포커스를 준다. 마지막 태그까지 지우면 useTagGroup이 묶음에 포커스를 준다.
//
// 선택(켜고 끄기)은 받지 않는다. Tag는 고르거나 입력한 값을 보여 주는 라벨이고, 눌러서 켜고 끄는 칩과 다르다(GLOSSARY).
// 상호작용이 없는 상태 표시는 Badge(서버 컴포넌트)다. Tag는 키보드 탐색에 hook·state가 필요해 client Component다.

import type { ComponentProps, ReactNode } from "react";

import {
  asCollectionComponent,
  valueItemCollectionNode,
  type CollectionValueItemProps,
} from "../_internal/libs/listCollection.ts";
import type { ColorFamilyName } from "../types.ts";

export interface TagProps
  extends
    Omit<ComponentProps<"div">, "color" | "role" | "id" | "tabIndex" | "children">,
    CollectionValueItemProps {
  /** 태그 글자. 필수다. 아이콘(장식용)을 앞에 함께 둘 수 있다. */
  children: ReactNode;
  /**
   * 색 계열 이름. Tide 색 계열 8개(장식 계열 purple·mint 포함)와 앱이 `ColorFamilyRegistry`에 더한 계열을 받는다. 기본값은 `gray`다.
   * 분류를 구분하는 뜻 없는 색이라 Role(`primary`·`danger` 등)은 받지 않는다(ADR 0016·0017 후속).
   * 루트에 `data-color`로 붙고 바깥 요소의 색을 물려받지 않는다.
   */
  color?: ColorFamilyName;
}

/**
 * 태그 하나(`role="row"`). `TagGroup` 바로 안에 둔다. `value`가 묶음 안의 key이고 `onRemove`에 넘어오는 값이다.
 * `disabled`면 지울 수 없고 키보드 이동도 건너뛴다(`aria-disabled`).
 */
export function Tag(_props: TagProps): null {
  // 렌더하지 않는다. TagGroup이 컬렉션으로 모아 TagView로 그린다.
  return null;
}
asCollectionComponent(Tag, valueItemCollectionNode);
