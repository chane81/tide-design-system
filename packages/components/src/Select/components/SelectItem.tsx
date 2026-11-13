"use client";
import type { ListBoxOptionProps } from "../../_internal/components/ListBoxNodes/types";
import {
  asCollectionComponent,
  valueItemCollectionNode,
} from "../../_internal/libs/listCollection";

export interface SelectItemProps extends ListBoxOptionProps {}

/**
 * Select의 옵션(`role="option"`). `Select`나 `SelectSection` 바로 안에 둔다. `value`가 고른 값이고 폼에 제출된다.
 * 내용(아이콘과 글자)은 고르면 트리거에도 보인다. 상태는 `data-highlighted`·`data-selected`·`data-disabled`다.
 */
export function SelectItem(_props: SelectItemProps): null {
  // 렌더하지 않는다. Select가 컬렉션으로 모아 그린다(ADR 0019).
  return null;
}
asCollectionComponent(SelectItem, valueItemCollectionNode);
