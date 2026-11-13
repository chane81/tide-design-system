"use client";
// 트리거 옆에 내용을 띄우는 Popover(tide-v0-impl 티켓 25). React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useOverlayTrigger, usePress, useDialog, DismissButton, mergeProps, mergeRefs),
// react-stately 3.51.0(useOverlayTriggerState). 위치·portal·motion은 오버레이 공통 부분(_internal/components/OverlayPortal.tsx, _internal/constants/overlayClass.ts)을 쓴다.
//
// 구조:
// - `Popover`: 열림 상태만 갖는다(DOM 없음). `open`/`defaultOpen`/`onOpenChange(open)`.
// - `PopoverTrigger`: 기본 `<button type="button">`. 누르면 열고 닫는다. `render={<Button />}`로 Tide Button 모양을 쓴다.
//   `aria-expanded`, 열렸을 때 `aria-controls`, `data-open`이 붙는다.
// - `PopoverContent`: `document.body`로 portal한 `role="dialog"` 요소. 열리면 자기에게 포커스가 오고(안의 요소가
//   autoFocus면 그 요소), Esc·바깥 누름·트리거 다시 누름으로 닫히며 포커스는 트리거로 돌아온다. 열려 있는 동안 바깥은
//   `inert`라 Tab은 안에서 돈다. 이름은 `aria-label`/`aria-labelledby`, 둘 다 없으면 트리거 글자다.

import { useId, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
// 루트 entry에서 import한다. 서브패스(`react-aria/usePopover`)도 있지만, 루트 하나면 Vite 사전 번들 목록
// (vitest·storybook의 optimizeDeps.include)이 hook을 더해도 바뀌지 않는다. 패키지가 sideEffects: false라 앱 번들에서는 쓰는 것만 남는다.
import { useOverlayTrigger } from "react-aria";
import { useOverlayTriggerState } from "react-stately";

import { PopoverContext, type PopoverContextValue } from "./hooks/usePopoverContext";

export interface PopoverProps {
  /** 열림 상태(제어). 주면 `onOpenChange`로 바꾼다. */
  open?: boolean;
  /** 처음 열림 상태(비제어). 기본값은 `false`다. */
  defaultOpen?: boolean;
  /** 열림 상태가 바뀌려 할 때 새 값으로 부른다. */
  onOpenChange?: (open: boolean) => void;
  /** `PopoverTrigger`와 `PopoverContent` */
  children: ReactNode;
}

/**
 * 트리거와 내용을 잇는 열림 상태. DOM 요소를 만들지 않는다.
 * 안에 `PopoverTrigger` 하나와 `PopoverContent` 하나를 둔다.
 */
export function Popover({ open, defaultOpen, onOpenChange, children }: PopoverProps): ReactElement {
  const state = useOverlayTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerProps, overlayProps } = useOverlayTrigger({ type: "dialog" }, state, triggerRef);
  const generatedTriggerId = useId();
  const [triggerId, setTriggerId] = useState(generatedTriggerId);
  const value = useMemo<PopoverContextValue>(
    () => ({
      state,
      triggerRef,
      triggerProps,
      contentId: overlayProps.id,
      triggerId,
      setTriggerId,
    }),
    [state, triggerProps, overlayProps.id, triggerId],
  );

  return <PopoverContext value={value}>{children}</PopoverContext>;
}
