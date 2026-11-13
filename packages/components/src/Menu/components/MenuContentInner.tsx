"use client";
import { useMemo, type ReactElement, type RefObject } from "react";
// 서브패스 말고 루트 entry에서 import한다. Vite 사전 번들 목록이 바뀌지 않게 한다.
import { mergeProps, mergeRefs, useMenu } from "react-aria";
import { useTreeState } from "react-stately";

import { listPopupClass, listSeparatorClass } from "../../_internal/constants/listClass";
import { useCloseOnTab } from "../../_internal/hooks/useCloseOnTab";
import { useOverlayTheme } from "../../_internal/hooks/useOverlayTheme";
import { usePopoverOverlay } from "../../_internal/hooks/usePopoverOverlay";
import { cn } from "../../_internal/libs/cn";
import { resolveCollectionChildren } from "../../_internal/libs/listCollection";
import type { MenuContextValue } from "../hooks/useMenuContext";
import type { MenuContentProps } from "./MenuContent";
import { MenuItemView } from "./MenuItemView";
import { MenuSectionView } from "./MenuSectionView";

export interface MenuContentInnerProps extends MenuContentProps {
  readonly context: MenuContextValue;
  readonly popoverRef: RefObject<HTMLDivElement | null>;
}

// React Aria 오버레이·목록 hook은 요소가 있다고 보므로 DOM에 있는 동안만 렌더한다.
export function MenuContentInner({
  context,
  popoverRef,
  placement = "bottom start",
  offset = 4,
  ref,
  className,
  children,
  ...props
}: MenuContentInnerProps): ReactElement {
  const { state, triggerRef, menuProps, triggerId } = context;
  useOverlayTheme(triggerRef, popoverRef);
  const { overlayProps } = usePopoverOverlay({ triggerRef, popoverRef, placement, offset }, state);
  const items = useMemo(() => resolveCollectionChildren(children), [children]);
  // 타입은 React Stately Item·Section이지만, getCollectionNode를 붙인 Tide 항목 요소를 넘긴다(ADR 0019).
  const tree = useTreeState<object>({
    children: items as unknown as Parameters<typeof useTreeState<object>>[0]["children"],
  });
  // useMenuTrigger 기본값과 같지만 앱이 트리거 id를 바꿀 수 있어 직접 정한다.
  const labelledBy = props["aria-labelledby"] ?? (props["aria-label"] ? undefined : triggerId);
  const { menuProps: ariaMenuProps } = useMenu(
    { ...menuProps, "aria-label": props["aria-label"], "aria-labelledby": labelledBy },
    tree,
    popoverRef,
  );
  const mergedRef = useMemo(() => mergeRefs(ref, popoverRef), [ref, popoverRef]);
  // React Aria useMenu는 Tab을 다루지 않는다. APG Menu Button대로 Tab이 메뉴를 닫게 한다.
  useCloseOnTab(popoverRef, state.close);
  const { style: _style, ...rest } = mergeProps(props, overlayProps, ariaMenuProps);
  const nodes = [...tree.collection];

  return (
    <div
      {...rest}
      ref={mergedRef}
      data-open={state.isOpen ? "" : undefined}
      className={cn(listPopupClass, className)}
      style={{ ...overlayProps.style, ...props.style }}
    >
      {nodes.map((node, index) => {
        const previous = nodes[index - 1];
        const separator =
          previous !== undefined && (node.type === "section" || previous.type === "section");
        const element =
          node.type === "section" ? (
            <MenuSectionView key={node.key} node={node} tree={tree} />
          ) : (
            <MenuItemView key={node.key} node={node} tree={tree} />
          );
        if (!separator) return element;

        return [
          <div
            key={`${String(node.key)}-separator`}
            role="separator"
            className={listSeparatorClass}
          />,
          element,
        ];
      })}
    </div>
  );
}
