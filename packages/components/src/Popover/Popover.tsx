"use client";
import { useId, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
// 서브패스 말고 루트 entry에서 import한다. 서브패스를 쓰면 vitest·storybook optimizeDeps.include를 함께 늘려야 한다.
// 패키지가 sideEffects: false라 앱 번들에는 쓰는 것만 남는다.
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
