"use client";
import type { ListBoxSectionProps } from "../../_internal/components/ListBoxNodes/types.ts";
import {
  asCollectionComponent,
  sectionCollectionNode,
} from "../../_internal/libs/listCollection.ts";

export interface ComboboxSectionProps extends ListBoxSectionProps {}

/**
 * 옵션 묶음(`role="group"`). `heading`이 화면에 보이는 제목이자 묶음의 이름이고, 없으면 `aria-label`이 이름이다.
 * 거른 결과 묶음 안에 남은 옵션이 없으면 묶음도 빠진다.
 */
export function ComboboxSection(_props: ComboboxSectionProps): null {
  // 렌더하지 않는다. Combobox가 컬렉션으로 모아 그린다(_internal/components/ListBoxNodes/ListBoxNodes.tsx).
  return null;
}
asCollectionComponent(ComboboxSection, sectionCollectionNode);
