"use client";
import type { ListBoxSectionProps } from "../../_internal/components/ListBoxNodes/types.ts";
import {
  asCollectionComponent,
  sectionCollectionNode,
} from "../../_internal/libs/listCollection.ts";

export interface SelectSectionProps extends ListBoxSectionProps {}

/**
 * 옵션 묶음(`role="group"`). `heading`이 화면에 보이는 제목이자 묶음의 이름이고, 없으면 `aria-label`이 이름이다.
 * 앞뒤 다른 옵션·묶음과의 사이에 구분선이 그려진다.
 */
export function SelectSection(_props: SelectSectionProps): null {
  // 렌더하지 않는다. Select가 컬렉션으로 모아 그린다(_internal/components/ListBoxNodes/ListBoxNodes.tsx).
  return null;
}
asCollectionComponent(SelectSection, sectionCollectionNode);
