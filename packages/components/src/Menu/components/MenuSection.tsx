"use client";
import type { ReactNode } from "react";

import {
  asCollectionComponent,
  sectionCollectionNode,
  type CollectionSectionProps,
} from "../../_internal/libs/listCollection.ts";

export interface MenuSectionProps extends CollectionSectionProps {
  /** 묶음 감싸개(`<div role="presentation">`)에 붙는 class */
  className?: string;
  /** `MenuItem`. 바로 아래(또는 Fragment·배열 안)에 둔다. */
  children?: ReactNode;
}

/**
 * 항목 묶음(`role="group"`). `heading`이 화면에 보이는 제목이자 묶음의 이름이고, 없으면 `aria-label`이 이름이다.
 * 앞뒤 다른 항목·묶음과의 사이에 구분선(`role="separator"`)이 그려진다.
 */
export function MenuSection(_props: MenuSectionProps): null {
  // 렌더하지 않는다. MenuContent가 컬렉션으로 모아 MenuSectionView로 그린다.
  return null;
}
asCollectionComponent(MenuSection, sectionCollectionNode);
