"use client";
import { useRef, type ComponentProps, type ReactElement, type ReactNode } from "react";

import { OverlayPortal } from "../../_internal/components/OverlayPortal";
import { useOverlayPresence } from "../../_internal/hooks/useOverlayPresence";
import { useMenuContext } from "../hooks/useMenuContext";
import type { MenuPlacement } from "../types";
import { MenuContentInner } from "./MenuContentInner";

export interface MenuContentProps extends Omit<ComponentProps<"div">, "id" | "role"> {
  /** 트리거 기준 위치. 기본값은 `bottom start`(아래, 시작 끝 맞춤)다. 공간이 모자라면 반대쪽으로 뒤집힌다. */
  placement?: MenuPlacement;
  /** 트리거와의 간격(px). 기본값은 `4`다. */
  offset?: number;
  /** `MenuItem`과 `MenuSection`. 이 요소들을 바로 아래(또는 Fragment·배열 안)에 둔다. */
  children?: ReactNode;
}

/**
 * 트리거 옆에 뜨는 동작 목록(`role="menu"`). 열릴 때만 `document.body`에 portal로 렌더하고 `z-popover`로 쌓는다.
 * 바로 나타나고, 닫히면 opacity만 `fast`(150ms)로 사라진다.
 * 열려 있으면 `data-open`이, 트리거 기준 방향이 `data-placement`(`top`/`bottom`/`left`/`right`)로 붙는다.
 */
export function MenuContent(props: MenuContentProps): ReactElement | null {
  const context = useMenuContext("MenuContent");
  const popoverRef = useRef<HTMLDivElement>(null);
  const present = useOverlayPresence(context.state.isOpen, popoverRef);
  if (!present) return null;

  // Menu는 항목에 포커스가 오므로 FocusScope로 감싸(focusManagement 기본값) 닫힐 때 트리거로 포커스를 돌려준다.
  return (
    <OverlayPortal isExiting={!context.state.isOpen}>
      <MenuContentInner {...props} context={context} popoverRef={popoverRef} />
    </OverlayPortal>
  );
}
