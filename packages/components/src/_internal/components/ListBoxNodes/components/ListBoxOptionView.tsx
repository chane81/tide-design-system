"use client";
import { CheckIcon } from "@tide-design/icons";
import { useMemo, useRef, type ReactElement } from "react";
import { mergeProps, mergeRefs, useOption } from "react-aria";

import { listItemClass } from "../../../constants/listClass.ts";
import { cn } from "../../../libs/cn.ts";
import type { ListBoxOptionProps, ViewProps } from "../types.ts";

/**
 * 고른 옵션 끝의 체크 아이콘. 장식용이다(선택은 `aria-selected`가 알린다). 배경(subtle-active)이 지워지는 고대비
 * 모드에서도 고른 옵션이 보이게 한다. 글자와의 간격은 항목의 gap(8px)이고 `ms-auto`로 오른쪽 끝에 붙는다.
 */
const checkClass = "ms-auto";

/** 옵션 하나를 그린다. node.props는 앱이 옵션에 준 props(와 컬렉션이 더한 isDisabled)다. */
export function ListBoxOptionView({ node, state }: ViewProps): ReactElement {
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
