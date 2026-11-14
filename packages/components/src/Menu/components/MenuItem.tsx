"use client";
import type { ComponentProps, ReactNode } from "react";

import {
  asCollectionComponent,
  itemCollectionNode,
  type CollectionItemProps,
} from "../../_internal/libs/listCollection";

export interface MenuItemOwnProps extends CollectionItemProps {
  /** 항목 내용. 아이콘(장식용)과 글자를 함께 둘 수 있다. */
  children?: ReactNode;
  /** 항목을 실행할 때 부른다(누름·Enter·Space). 실행하면 메뉴가 닫힌다. `disabled`면 부르지 않는다. */
  onClick?: ComponentProps<"div">["onClick"];
}

export interface MenuItemProps
  extends MenuItemOwnProps, Omit<ComponentProps<"div">, keyof MenuItemOwnProps | "role"> {}

/**
 * Menu의 동작 항목(`role="menuitem"`). `MenuContent`나 `MenuSection` 바로 안에 둔다.
 * 상태는 `data-highlighted`(키보드 위치·hover), `data-disabled`(비활성)로 노출한다.
 * Tide props: `disabled`, `textValue`, `aria-label`, `children`, `onClick` ({@link MenuItemOwnProps}). 나머지는 `<div>` 속성.
 */
export function MenuItem(_props: MenuItemProps): null {
  // 렌더하지 않는다. MenuContent가 컬렉션으로 모아 그린다(ADR 0019).
  return null;
}
asCollectionComponent(MenuItem, itemCollectionNode);
