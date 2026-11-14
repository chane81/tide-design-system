"use client";
import { useRef, type ComponentProps, type ReactElement } from "react";

import { OverlayPortal } from "../../_internal/components/OverlayPortal";
import { useOverlayPresence } from "../../_internal/hooks/useOverlayPresence";
import { useTooltipContext } from "../hooks/useTooltipContext";
import type { TooltipPlacement } from "../types";
import { TooltipContentInner } from "./TooltipContentInner";

export interface TooltipContentOwnProps {
  /** 트리거 기준 위치. 기본값은 `top`(위, 가운데 맞춤)이다. 공간이 모자라면 반대쪽으로 뒤집힌다. */
  placement?: TooltipPlacement;
  /** 트리거와의 간격(px). 기본값은 `4`다. */
  offset?: number;
}

export interface TooltipContentProps
  extends
    TooltipContentOwnProps,
    Omit<ComponentProps<"div">, keyof TooltipContentOwnProps | "id" | "role"> {}

/**
 * 트리거에 붙는 설명(`role="tooltip"`). 열릴 때만 `document.body`에 portal한다. 조작 요소(버튼, 링크)는 넣지 않는다.
 * 열려 있으면 `data-open`이, 트리거 기준 방향이 `data-placement`(`top`/`bottom`/`left`/`right`)로 붙는다.
 * Tide props: `placement`, `offset` ({@link TooltipContentOwnProps}). 나머지는 `<div>` 속성.
 */
export function TooltipContent(props: TooltipContentProps): ReactElement | null {
  const context = useTooltipContext("TooltipContent");
  const tooltipRef = useRef<HTMLDivElement>(null);
  const present = useOverlayPresence(context.state.isOpen, tooltipRef);
  if (!present) return null;

  // Tooltip은 포커스를 받지 않으므로 FocusScope 없이 portal만 한다.
  return (
    <OverlayPortal isExiting={!context.state.isOpen} focusManagement={false}>
      <TooltipContentInner {...props} context={context} tooltipRef={tooltipRef} />
    </OverlayPortal>
  );
}
