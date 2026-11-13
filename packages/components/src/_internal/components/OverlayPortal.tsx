"use client";
// 오버레이 조립 순서(presence → 위치 hook → OverlayPortal → class)는 Popover.tsx가 예시다(ADR 0018).
// 역할 hook(useDialog 등)은 portal context로 포커스 가두기를 요청하므로 portal 안쪽에서 부른다.

import type { ReactElement, ReactNode } from "react";
import { Overlay } from "react-aria";

/** `OverlayPortal`의 props */
export interface OverlayPortalProps {
  /** 퇴장 중이면 `true`. 포커스 가두기를 풀어 바깥으로 포커스가 돌아갈 수 있게 한다. */
  readonly isExiting: boolean;
  /** `false`면 FocusScope로 감싸지 않는다. 포커스를 받지 않는 Tooltip이 쓴다. 기본값 `true`. */
  readonly focusManagement?: boolean;
  readonly children: ReactNode;
}

/**
 * `document.body`에 portal하고 `FocusScope`(`restoreFocus`)로 감싸 닫힐 때 포커스를 트리거로 돌린다.
 * top-layer(`<dialog>`, popover API)는 쓰지 않는다.
 */
export function OverlayPortal({
  isExiting,
  focusManagement = true,
  children,
}: OverlayPortalProps): ReactElement | null {
  return (
    <Overlay isExiting={isExiting} disableFocusManagement={!focusManagement}>
      {children}
    </Overlay>
  );
}
