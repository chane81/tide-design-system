"use client";
import type {
  ListBoxOptionOwnProps,
  ListBoxOptionProps,
} from "../../_internal/components/ListBoxNodes/types";
import {
  asCollectionComponent,
  valueItemCollectionNode,
} from "../../_internal/libs/listCollection";

export interface ComboboxItemOwnProps extends ListBoxOptionOwnProps {}

export interface ComboboxItemProps extends ListBoxOptionProps {}

/**
 * Combobox의 옵션(`role="option"`). `Combobox`나 `ComboboxSection` 바로 안에 둔다. `value`가 고른 값이고 제출된다.
 * 거르기와 고른 뒤 입력에 들어가는 글자는 `textValue`(기본은 내용의 글자)다.
 * Tide props: `value`, `disabled`, `textValue`, `aria-label`, `children` ({@link ComboboxItemOwnProps}). 나머지는 `<div>` 속성.
 */
export function ComboboxItem(_props: ComboboxItemProps): null {
  // 렌더하지 않는다. Combobox가 컬렉션으로 모아 그린다(ADR 0019).
  return null;
}
asCollectionComponent(ComboboxItem, valueItemCollectionNode);
