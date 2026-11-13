"use client";
// 값을 고르는 목록(listbox)의 옵션·묶음을 그리는 공통 부분(tide-v0-impl 티켓 28). Select가 처음 쓰고 Combobox(29)가
// 다시 쓴다. React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useOption, useListBoxSection, mergeProps, mergeRefs), react-stately 3.51.0(ListState).
//
// - 옵션 Component(`SelectItem` 등)는 렌더하지 않는 표시 요소이고 `valueItemCollectionNode`(libs/listCollection.ts)로
//   `value`를 key로 모은다. 여기 `ListBoxNodes`가 목록 상태의 컬렉션을 돌며 옵션·묶음·구분선을 그린다.
// - 옵션 상태: `data-highlighted`(React Aria `isFocused`. 실제 포커스든 Combobox의 가상 포커스든 같다),
//   `data-selected`(고른 옵션, 끝에 장식용 체크 아이콘), `data-disabled`. class는 Menu 항목과 같은 `listItemClass`다.
// - 목록 루트(`role="listbox"`)와 위치·portal은 부르는 쪽이 정한다(useListBox, components/OverlayPortal.tsx).

import type { ReactNode } from "react";
import type { ListState } from "react-stately";

import { listSeparatorClass } from "../../constants/listClass.ts";
import { ListBoxOptionView } from "./components/ListBoxOptionView.tsx";
import { ListBoxSectionView } from "./components/ListBoxSectionView.tsx";

interface ListBoxNodesProps {
  readonly state: ListState<object>;
}

/**
 * 목록 상태의 옵션·묶음을 그린다. 묶음과 이웃한 옵션·묶음 사이에 장식용 구분선을 둔다. 목록의 처음·끝과 이어진
 * 구분선은 그리지 않는다(Menu와 같다). listbox의 자식은 option·group만 될 수 있어(WAI-ARIA, axe
 * aria-required-children) Menu와 달리 구분선은 `separator` 역할 없이 보조기술에서 숨긴다. 묶음 경계는 group이 알린다.
 */
export function ListBoxNodes({ state }: ListBoxNodesProps): ReactNode {
  const nodes = [...state.collection];

  return nodes.map((node, index) => {
    const previous = nodes[index - 1];
    const separator =
      previous !== undefined && (node.type === "section" || previous.type === "section");
    const element =
      node.type === "section" ? (
        <ListBoxSectionView key={node.key} node={node} state={state} />
      ) : (
        <ListBoxOptionView key={node.key} node={node} state={state} />
      );
    if (!separator) return element;

    return [
      <div
        key={`${String(node.key)}-separator`}
        role="presentation"
        aria-hidden="true"
        className={listSeparatorClass}
      />,
      element,
    ];
  });
}
