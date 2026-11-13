"use client";
import type { ComponentProps, ReactNode } from "react";

import {
  asCollectionComponent,
  valueItemCollectionNode,
  type CollectionValueItemProps,
} from "../_internal/libs/listCollection";
import type { ColorFamilyName } from "../types";

export interface TagProps
  extends
    Omit<ComponentProps<"div">, "color" | "role" | "id" | "tabIndex" | "children">,
    CollectionValueItemProps {
  /** 태그 글자. 필수다. 아이콘(장식용)을 앞에 함께 둘 수 있다. */
  children: ReactNode;
  /** 색 계열 이름(Tide 8개 + 앱 장식 계열). 기본값 `gray`. 분류용 뜻 없는 색이라 Role은 받지 않는다. */
  color?: ColorFamilyName;
}

/**
 * 태그 하나(`role="row"`). `TagGroup` 바로 안에 둔다. `value`가 묶음 안의 key이고 `onRemove`에 넘어오는 값이다.
 * `disabled`면 지울 수 없고 키보드 이동도 건너뛴다(`aria-disabled`).
 */
export function Tag(_props: TagProps): null {
  // 렌더하지 않는다. TagGroup이 컬렉션으로 모아 그린다(ADR 0019).
  return null;
}
asCollectionComponent(Tag, valueItemCollectionNode);
