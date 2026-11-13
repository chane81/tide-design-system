"use client";
import { useMemo, type ReactElement, type RefObject } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { mergeProps, mergeRefs, useMenu } from "react-aria";
import { useTreeState } from "react-stately";

import { listPopupClass, listSeparatorClass } from "../../_internal/constants/listClass.ts";
import { useCloseOnTab } from "../../_internal/hooks/useCloseOnTab.ts";
import { useOverlayTheme } from "../../_internal/hooks/useOverlayTheme.ts";
import { usePopoverOverlay } from "../../_internal/hooks/usePopoverOverlay.ts";
import { cn } from "../../_internal/libs/cn.ts";
import { resolveCollectionChildren } from "../../_internal/libs/listCollection.ts";
import type { MenuContextValue } from "../hooks/useMenuContext.ts";
import type { MenuContentProps } from "./MenuContent.tsx";
import { MenuItemView } from "./MenuItemView.tsx";
import { MenuSectionView } from "./MenuSectionView.tsx";

export interface MenuContentInnerProps extends MenuContentProps {
  readonly context: MenuContextValue;
  readonly popoverRef: RefObject<HTMLDivElement | null>;
}

/** DOM에 있는 동안만 portal 안에서 렌더한다. React Aria 오버레이·목록 hook은 요소가 있다고 보고 동작한다. */
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
  // useTreeState의 children 타입은 React Stately 요소(Item·Section)지만, 같은 방식으로 getCollectionNode를 붙인
  // Tide 항목 요소를 넘긴다(_internal/libs/listCollection.ts).
  const tree = useTreeState<object>({
    children: items as unknown as Parameters<typeof useTreeState<object>>[0]["children"],
  });
  // 이름이 없으면 트리거 글자를 이름으로 쓴다(useMenuTrigger 기본값과 같지만 앱이 트리거 id를 바꿀 수 있다).
  const labelledBy = props["aria-labelledby"] ?? (props["aria-label"] ? undefined : triggerId);
  const { menuProps: ariaMenuProps } = useMenu(
    { ...menuProps, "aria-label": props["aria-label"], "aria-labelledby": labelledBy },
    tree,
    popoverRef,
  );
  const mergedRef = useMemo(() => mergeRefs(ref, popoverRef), [ref, popoverRef]);
  // Tab은 메뉴를 닫고 포커스를 트리거로 돌린다(WAI-ARIA APG Menu Button). React Aria useMenu는 Tab을 다루지 않는다.
  useCloseOnTab(popoverRef, state.close);
  const { style: _style, ...rest } = mergeProps(props, overlayProps, ariaMenuProps);
  const nodes = [...tree.collection];

  return (
    <div
      {...rest}
      ref={mergedRef}
      data-open={state.isOpen ? "" : undefined}
      className={cn(listPopupClass, className)}
      // 위치 style(React Aria) 위에 사용자 style을 덮는다.
      style={{ ...overlayProps.style, ...props.style }}
    >
      {nodes.map((node, index) => {
        // 묶음 앞뒤에 구분선을 그린다. 목록 처음·끝과 이어진 구분선은 그리지 않는다.
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
