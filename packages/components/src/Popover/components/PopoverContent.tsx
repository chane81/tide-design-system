"use client";
import { useRef, type ComponentProps, type ReactElement } from "react";

import { OverlayPortal } from "../../_internal/components/OverlayPortal.tsx";
import { useOverlayPresence } from "../../_internal/hooks/useOverlayPresence.ts";
import { usePopoverContext } from "../hooks/usePopoverContext.ts";
import type { PopoverPlacement } from "../types.ts";
import { PopoverContentInner } from "./PopoverContentInner.tsx";

export interface PopoverContentProps extends Omit<ComponentProps<"div">, "id" | "role"> {
  /** 트리거 기준 위치. 기본값은 `bottom`(아래, 가운데 맞춤)이다. 공간이 모자라면 반대쪽으로 뒤집힌다. */
  placement?: PopoverPlacement;
  /** 트리거와의 간격(px). 기본값은 `8`이다. */
  offset?: number;
}

/**
 * 트리거 옆에 뜨는 내용(`role="dialog"`). 열릴 때만 `document.body`에 portal로 렌더하고 `z-popover`로 쌓는다.
 * 등장은 opacity + blur 4px + 4px 이동(`normal`), 퇴장은 그 절반(`fast`)이다. 움직임 줄이기에서는 opacity만 바뀐다.
 * 열려 있으면 `data-open`이, 트리거 기준 방향이 `data-placement`(`top`/`bottom`/`left`/`right`)로 붙는다.
 */
export function PopoverContent(props: PopoverContentProps): ReactElement | null {
  const context = usePopoverContext("PopoverContent");
  const popoverRef = useRef<HTMLDivElement>(null);
  const present = useOverlayPresence(context.state.isOpen, popoverRef);
  if (!present) return null;
  // 역할 hook(useDialog)이 포커스 가두기를 Overlay context로 요청하므로 hook을 부르는 쪽이 portal 안에 있어야 한다.
  return (
    <OverlayPortal isExiting={!context.state.isOpen}>
      <PopoverContentInner {...props} context={context} popoverRef={popoverRef} />
    </OverlayPortal>
  );
}
