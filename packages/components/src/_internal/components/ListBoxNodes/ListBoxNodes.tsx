"use client";
// 옵션 Component는 렌더하지 않는 표시 요소이고, 여기서 목록 상태의 컬렉션을 돌며 그린다.

import type { ReactNode } from "react";
import type { ListState } from "react-stately";

import { listSeparatorClass } from "../../constants/listClass";
import { ListBoxOptionView } from "./components/ListBoxOptionView";
import { ListBoxSectionView } from "./components/ListBoxSectionView";

interface ListBoxNodesProps {
  readonly state: ListState<object>;
}

/**
 * 구분선은 `separator` 역할 없이 보조기술에서 숨긴다. listbox의 자식은 option·group만 될 수 있다(axe aria-required-children).
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
