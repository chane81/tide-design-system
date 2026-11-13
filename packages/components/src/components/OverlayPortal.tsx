"use client";
// 오버레이 공통 동작(tide-v0-impl 티켓 25). Popover가 처음 쓰고 Tooltip·Menu·Select·Combobox·Dialog·Toast가 다시 쓴다.
// React Aria hooks만 쓰고 마크업은 부르는 쪽이 정한다(ADR 0004). 근거 버전: react-aria 3.53.1, react-stately 3.51.0
// (react-aria.adobe.com/Popover/usePopover, 설치본 dist 소스로 확인).
//
// 오버레이 하나는 이렇게 짠다(Popover.tsx가 예시다).
//   1. 바깥 Component: `useOverlayPresence(state.isOpen, ref)`(hooks/useOverlayPresence.ts)로 DOM에 둘지 정한다.
//      닫혀도 퇴장 전환이 끝날 때까지 남긴다.
//   2. 안쪽 Component(DOM에 있을 때만 렌더): 위치는 `usePopoverOverlay`(hooks/usePopoverOverlay.ts, dismiss·aria-hide·스크롤 잠금 포함) 또는
//      `useOverlayPosition`(Tooltip처럼 dismiss가 따로인 경우, Tooltip.tsx가 예시다)으로 구하고, 그 결과를
//      `overlayPositionProps`(libs/overlayPosition.ts)로 Tide 규칙에 맞춘다.
//      역할 hook(useDialog, useMenu, useListBox …)의 props를 같은 요소에 합친다.
//   3. 안쪽 Component를 `<OverlayPortal isExiting={!state.isOpen}>`(이 파일, React Aria `Overlay`)으로 감싸 `document.body`에 portal하고
//      포커스를 되돌린다. 역할 hook이 portal의 context로 포커스 가두기를 요청하므로 hook은 portal 안쪽에서 부른다.
//   4. class: 표면 `overlaySurfaceClass`, 쌓임 단계(`z-popover` 등), motion(`popoverMotionClass` 등, constants/overlayClass.ts).
//   5. 트리거가 있는 Theme을 portal에 옮기려면 `useOverlayTheme(triggerRef, overlayRef)`(hooks/useOverlayTheme.ts).
//   6. 목록 오버레이(Menu, Select)는 `useCloseOnTab(overlayRef, state.close)`(hooks/useCloseOnTab.ts)로 Tab에 닫는다.
//   7. 가운데 뜨는 모달(Dialog류)은 위치 hook 대신 React Aria `useModalOverlay`(Esc·바깥 누름·inert·스크롤 잠금)를 쓰고,
//      DOM에 둘지는 바깥 막(backdrop) 요소로 정한다(Dialog.tsx가 예시다, 티켓 30).

import type { ReactElement, ReactNode } from "react";
import { Overlay } from "react-aria";

/** `OverlayPortal`의 props */
export interface OverlayPortalProps {
  /** 퇴장 중이면 `true`. 포커스 가두기를 풀어 바깥으로 포커스가 돌아갈 수 있게 한다. */
  readonly isExiting: boolean;
  /**
   * `false`면 포커스를 다루지 않는다(`FocusScope`로 감싸지 않음). 포커스를 받지 않는 Tooltip이 쓴다.
   * 감싸면 Tooltip이 열린 Popover 안에서 FocusScope가 하나 더 생기고, 닫힐 때 포커스 복귀를 시도한다.
   * 기본값은 `true`다(티켓 26).
   */
  readonly focusManagement?: boolean;
  readonly children: ReactNode;
}

/**
 * 오버레이를 `document.body`에 portal한다(React Aria `Overlay`). top-layer(`<dialog>`, popover API)는 쓰지 않는다.
 * 안을 `FocusScope`(`restoreFocus`)로 감싸서, DOM에서 빠질 때 포커스가 열기 전 요소(보통 트리거)로 돌아간다.
 * 역할 hook이 포커스 가두기를 요청하면(`useDialog` 등) Tab이 안에서 돈다. 서버 렌더에서는 아무것도 그리지 않는다.
 * `focusManagement={false}`면 FocusScope 없이 portal만 한다(Tooltip).
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
