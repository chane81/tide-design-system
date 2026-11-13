"use client";
import type { ListBoxOptionProps } from "../../_internal/components/ListBoxNodes/types.ts";
import {
  asCollectionComponent,
  valueItemCollectionNode,
} from "../../_internal/libs/listCollection.ts";

export interface SelectItemProps extends ListBoxOptionProps {}

/**
 * Select의 옵션(`role="option"`). `Select`나 `SelectSection` 바로 안에 둔다. `value`가 고른 값이고 폼에 제출된다.
 * 내용(아이콘과 글자)은 고르면 트리거에도 보인다. 키보드 위치와 마우스를 올린 옵션은 highlight(primary subtle 배경,
 * primary 글자), 고른 옵션은 neutral subtle-active 배경과 끝의 체크 아이콘이다.
 * 상태는 `data-highlighted`, `data-selected`, `data-disabled`로 노출한다.
 */
export function SelectItem(_props: SelectItemProps): null {
  // 렌더하지 않는다. Select가 컬렉션으로 모아 그린다(_internal/components/ListBoxNodes/ListBoxNodes.tsx).
  return null;
}
asCollectionComponent(SelectItem, valueItemCollectionNode);
