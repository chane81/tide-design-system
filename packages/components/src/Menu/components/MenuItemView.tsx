"use client";
import { useMemo, useRef, type ReactElement } from "react";
// 서브패스 말고 루트 entry에서 import한다. Vite 사전 번들 목록이 바뀌지 않게 한다.
import { mergeProps, mergeRefs, useMenuItem } from "react-aria";

import { listItemClass } from "../../_internal/constants/listClass";
import { cn } from "../../_internal/libs/cn";
import type { ViewProps } from "../types";
import type { MenuItemProps } from "./MenuItem";

// node.props는 앱이 MenuItem에 준 props에 컬렉션이 더한 isDisabled다.
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
  const { menuItemProps, isFocused, isDisabled } = useMenuItem(
    {
      key: node.key,
      id,
      onClick: onClick as Parameters<typeof useMenuItem>[0]["onClick"],
      "aria-label": props["aria-label"],
    },
    tree,
    itemRef,
  );
  const mergedRef = useMemo(() => mergeRefs(ref, itemRef), [ref, itemRef]);
  // useMenuItem은 그리지 않는 글자·설명 자리의 id를 aria-labelledby·describedby로 걸므로, 앱이 준 값만 남긴다.
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
