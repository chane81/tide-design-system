"use client";
import type { ComponentProps, ReactNode } from "react";

import {
  asCollectionComponent,
  itemCollectionNode,
  type CollectionItemProps,
} from "../../_internal/libs/listCollection";

export interface MenuItemProps
  extends Omit<ComponentProps<"div">, "role" | "children">, CollectionItemProps {
  /** 항목 내용. 아이콘(장식용)과 글자를 함께 둘 수 있다. */
  children?: ReactNode;
  /**
   * 항목을 실행할 때 부른다. 마우스·터치 누름뿐 아니라 Enter·Space도 click으로 실행한다(네이티브 버튼과 같다).
   * 실행하면 메뉴가 닫힌다. `disabled`면 부르지 않는다.
   */
  onClick?: ComponentProps<"div">["onClick"];
}

/**
 * Menu의 동작 항목(`role="menuitem"`). `MenuContent`나 `MenuSection` 바로 안에 둔다.
 * 키보드 위치와 마우스를 올린 항목은 highlight(primary subtle 배경, primary 글자)로 바로 바뀐다.
 * 상태는 `data-highlighted`(키보드 위치·hover), `data-disabled`(비활성)로 노출한다.
 */
export function MenuItem(_props: MenuItemProps): null {
  // 렌더하지 않는다. MenuContent가 컬렉션으로 모아 MenuItemView로 그린다.
  return null;
}
asCollectionComponent(MenuItem, itemCollectionNode);
