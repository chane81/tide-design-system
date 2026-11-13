"use client";
import type { ListBoxOptionProps } from "../../_internal/components/ListBoxNodes/types";
import {
  asCollectionComponent,
  valueItemCollectionNode,
} from "../../_internal/libs/listCollection";

export interface ComboboxItemProps extends ListBoxOptionProps {}

/**
 * Combobox의 옵션(`role="option"`). `Combobox`나 `ComboboxSection` 바로 안에 둔다. `value`가 고른 값이고 폼에
 * 제출된다. 거르기와 고른 뒤 입력에 들어가는 글자는 `textValue`(기본은 내용의 글자)다. 키보드 위치와 마우스를 올린
 * 옵션은 highlight, 고른 옵션은 neutral subtle-active 배경과 끝의 체크 아이콘이다(Select 옵션과 같다).
 * 상태는 `data-highlighted`, `data-selected`, `data-disabled`로 노출한다.
 */
export function ComboboxItem(_props: ComboboxItemProps): null {
  // 렌더하지 않는다. Combobox가 컬렉션으로 모아 그린다(_internal/components/ListBoxNodes/ListBoxNodes.tsx).
  return null;
}
asCollectionComponent(ComboboxItem, valueItemCollectionNode);
