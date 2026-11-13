"use client";
import type { ComponentProps, ReactNode } from "react";

import {
  asCollectionComponent,
  valueItemCollectionNode,
  type CollectionValueItemProps,
} from "../../_internal/libs/listCollection.ts";

export interface TabProps
  extends
    Omit<ComponentProps<"button">, "value" | "type" | "role" | "id" | "disabled" | "children">,
    Omit<CollectionValueItemProps, "textValue"> {
  /** 탭 글자. 아이콘(장식용)과 글자를 함께 둘 수 있다. */
  children?: ReactNode;
}

/**
 * 탭 하나(`role="tab"`). `TabList` 바로 안에 두고, 같은 `value`의 `TabPanel`과 이어진다.
 * 고른 탭은 `data-selected`와 `aria-selected="true"`이고 primary 글자와 아래(세로면 끝쪽) 막대로 보인다.
 * `disabled`면 네이티브 `disabled`라 고를 수 없고 키보드 이동도 건너뛴다.
 */
export function Tab(_props: TabProps): null {
  // 렌더하지 않는다. TabList가 컬렉션으로 모아 TabView로 그린다.
  return null;
}
asCollectionComponent(Tab, valueItemCollectionNode);
