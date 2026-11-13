"use client";
import { useMemo, useRef, type ReactElement } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { mergeProps, mergeRefs, useMenuItem } from "react-aria";

import { listItemClass } from "../../_internal/constants/listClass.ts";
import { cn } from "../../_internal/libs/cn.ts";
import type { ViewProps } from "../types.ts";
import type { MenuItemProps } from "./MenuItem.tsx";

/** 항목 하나를 그린다. node.props는 앱이 MenuItem에 준 props(와 컬렉션이 더한 isDisabled)다. */
export function MenuItemView({ node, tree }: ViewProps): ReactElement {
  const itemRef = useRef<HTMLDivElement>(null);
  const {
    ref,
    className,
    onClick,
    disabled: _disabled,
    textValue: _textValue,
    isDisabled: _isDisabled,
    children: _children,
    id,
    ...props
  } = node.props as MenuItemProps & { isDisabled?: boolean };
  // 사용자 onClick은 useMenuItem에 넘긴다. 비활성 항목에는 click 처리가 붙지 않으므로 부르지 않는다.
  const { menuItemProps, isFocused, isDisabled } = useMenuItem(
    {
      key: node.key,
      id,
      // 항목 요소는 div다. React Aria는 focusable 요소 일반으로 적어 두었다.
      onClick: onClick as Parameters<typeof useMenuItem>[0]["onClick"],
      "aria-label": props["aria-label"],
    },
    tree,
    itemRef,
  );
  const mergedRef = useMemo(() => mergeRefs(ref, itemRef), [ref, itemRef]);
  // useMenuItem은 글자·설명·단축키를 따로 둘 자리의 id를 aria-labelledby·describedby로 건다. Tide 항목은 내용 전체가
  // 이름이므로 그 id를 빼고 앱이 준 값만 남긴다(없는 id를 가리키지 않게).
  const merged = mergeProps(props, menuItemProps);
  return (
    <div
      {...merged}
      ref={mergedRef}
      aria-labelledby={props["aria-labelledby"]}
      aria-describedby={props["aria-describedby"]}
      data-highlighted={isFocused ? "" : undefined}
      data-disabled={isDisabled ? "" : undefined}
      className={cn(listItemClass, className)}
    >
      {node.rendered}
    </div>
  );
}
