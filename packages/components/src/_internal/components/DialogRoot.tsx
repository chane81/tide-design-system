"use client";
import { useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
// 루트 entry에서 import해야 Vite 사전 번들 목록이 바뀌지 않는다.
import { useOverlayTrigger } from "react-aria";
import { useOverlayTriggerState } from "react-stately";

import { DialogContext, type DialogContextValue } from "../hooks/useDialogContext";

export interface DialogProps {
  /** 열림 상태(제어). 주면 `onOpenChange`로 바꾼다. */
  open?: boolean;
  /** 처음 열림 상태(비제어). 기본값은 `false`다. */
  defaultOpen?: boolean;
  /** 열림 상태가 바뀌려 할 때 새 값으로 부른다. */
  onOpenChange?: (open: boolean) => void;
  /** `DialogTrigger`와 `DialogContent` */
  children: ReactNode;
}

/** Dialog·AlertDialog가 같이 쓰는 열림 상태. `alert`만 다르다. */
export function DialogRoot({
  open,
  defaultOpen,
  onOpenChange,
  alert,
  children,
}: DialogProps & { readonly alert: boolean }): ReactElement {
  const state = useOverlayTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerProps, overlayProps } = useOverlayTrigger({ type: "dialog" }, state, triggerRef);
  const [triggerId, setTriggerId] = useState<string | null>(null);
  const value = useMemo<DialogContextValue>(
    () => ({
      state,
      triggerRef,
      triggerProps,
      contentId: overlayProps.id,
      triggerId,
      setTriggerId,
      alert,
    }),
    [state, triggerProps, overlayProps.id, triggerId, alert],
  );

  return <DialogContext value={value}>{children}</DialogContext>;
}
