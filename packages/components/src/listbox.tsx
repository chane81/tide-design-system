"use client";
// 값을 고르는 목록(listbox)의 옵션·묶음을 그리는 공통 부분(tide-v0-impl 티켓 28). Select가 처음 쓰고 Combobox(29)가
// 다시 쓴다. React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useOption, useListBoxSection, mergeProps, mergeRefs), react-stately 3.51.0(ListState).
//
// - 옵션 Component(`SelectItem` 등)는 렌더하지 않는 표시 요소이고 `valueItemCollectionNode`(list-collection.ts)로
//   `value`를 key로 모은다. 여기 `ListBoxNodes`가 목록 상태의 컬렉션을 돌며 옵션·묶음·구분선을 그린다.
// - 옵션 상태: `data-highlighted`(React Aria `isFocused`. 실제 포커스든 Combobox의 가상 포커스든 같다),
//   `data-selected`(고른 옵션, 끝에 장식용 체크 아이콘), `data-disabled`. class는 Menu 항목과 같은 `listItemClass`다.
// - 목록 루트(`role="listbox"`)와 위치·portal은 부르는 쪽이 정한다(useListBox, overlay.tsx).

import { CheckIcon } from "@tide-design/icons";
import { useMemo, useRef, type ComponentProps, type ReactElement, type ReactNode } from "react";
import { mergeProps, mergeRefs, useListBoxSection, useOption } from "react-aria";
import type { ListState } from "react-stately";

import { cn } from "./cn.ts";
import type { CollectionSectionProps, CollectionValueItemProps } from "./list-collection.ts";
import { listHeadingClass, listItemClass, listSeparatorClass } from "./list-style.ts";

/** 목록 상태 컬렉션의 node */
type ListNode = ListState<object>["collection"] extends Iterable<infer N> ? N : never;

/** 옵션 Component(Select·Combobox 옵션)의 props. 옵션 요소는 `<div role="option">`이다. */
export interface ListBoxOptionProps
  extends Omit<ComponentProps<"div">, "role" | "children">, CollectionValueItemProps {
  /** 옵션 내용. 아이콘(장식용)과 글자를 함께 둘 수 있다. Select 트리거에도 이 내용이 보인다. */
  children?: ReactNode;
}

/** 옵션 묶음 Component의 props */
export interface ListBoxSectionProps extends CollectionSectionProps {
  /** 묶음 감싸개(`<div role="presentation">`)에 붙는 class */
  className?: string;
  /** 옵션. 바로 아래(또는 Fragment·배열 안)에 둔다. */
  children?: ReactNode;
}

/**
 * 고른 옵션 끝의 체크 아이콘. 장식용이다(선택은 `aria-selected`가 알린다). 배경(subtle-active)이 지워지는 고대비
 * 모드에서도 고른 옵션이 보이게 한다. 글자와의 간격은 항목의 gap(8px)이고 `ms-auto`로 오른쪽 끝에 붙는다.
 */
const checkClass = "ms-auto";

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

interface ViewProps {
  readonly node: ListNode;
  readonly state: ListState<object>;
}

/** 옵션 하나를 그린다. node.props는 앱이 옵션에 준 props(와 컬렉션이 더한 isDisabled)다. */
function ListBoxOptionView({ node, state }: ViewProps): ReactElement {
  const optionRef = useRef<HTMLDivElement>(null);
  const {
    ref,
    className,
    value: _value,
    disabled: _disabled,
    textValue: _textValue,
    isDisabled: _isDisabled,
    children: _children,
    id: _id,
    ...props
  } = node.props as ListBoxOptionProps & { isDisabled?: boolean };
  const { optionProps, isFocused, isSelected, isDisabled } = useOption(
    { key: node.key, "aria-label": props["aria-label"] },
    state,
    optionRef,
  );
  const mergedRef = useMemo(() => mergeRefs(ref, optionRef), [ref, optionRef]);
  // useOption은 글자·설명 자리의 id를 aria-labelledby·describedby로 건다. Tide 옵션은 내용 전체가 이름이므로 그 id를
  // 빼고 앱이 준 값만 남긴다(없는 id를 가리키지 않게, Menu 항목과 같다). 옵션 id는 React Aria가 정한다
  // (목록의 aria-activedescendant·스크롤에 쓴다).
  const merged = mergeProps(props, optionProps);
  return (
    <div
      {...merged}
      ref={mergedRef}
      aria-labelledby={props["aria-labelledby"]}
      aria-describedby={props["aria-describedby"]}
      data-highlighted={isFocused ? "" : undefined}
      data-selected={isSelected ? "" : undefined}
      data-disabled={isDisabled ? "" : undefined}
      className={cn(listItemClass, className)}
    >
      {node.rendered}
      {isSelected ? <CheckIcon size={16} className={checkClass} /> : null}
    </div>
  );
}

/** 묶음 하나를 그린다. 제목은 보조기술에서 숨기고(`presentation`) 묶음의 이름으로만 쓴다(useListBoxSection). */
function ListBoxSectionView({ node, state }: ViewProps): ReactElement {
  const { className } = node.props as ListBoxSectionProps;
  const { itemProps, headingProps, groupProps } = useListBoxSection({
    heading: node.rendered,
    "aria-label": node["aria-label"],
  });
  return (
    <div {...itemProps} className={className}>
      {node.rendered != null && (
        <div {...headingProps} className={listHeadingClass}>
          {node.rendered}
        </div>
      )}
      <div {...groupProps}>
        {[...node.childNodes].map((child) => (
          <ListBoxOptionView key={child.key} node={child} state={state} />
        ))}
      </div>
    </div>
  );
}
