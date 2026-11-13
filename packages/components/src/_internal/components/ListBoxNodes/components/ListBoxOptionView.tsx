"use client";
import { CheckIcon } from "@tide-design/icons";
import { useMemo, useRef, type ReactElement } from "react";
import { mergeProps, mergeRefs, useOption } from "react-aria";

import { listItemClass } from "../../../constants/listClass";
import { cn } from "../../../libs/cn";
import type { ListBoxOptionProps, ViewProps } from "../types";

/** 체크 아이콘은 장식용이지만, 배경이 지워지는 고대비 모드에서 고른 옵션을 보이게 한다. */
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
  // useOption이 거는 글자·설명 id는 Tide 옵션에 없으므로 빼고 앱이 준 값만 남긴다.
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
