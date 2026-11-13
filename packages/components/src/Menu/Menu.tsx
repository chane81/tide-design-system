"use client";
import { useId, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
// 서브패스 말고 루트 entry에서 import한다. Vite 사전 번들 목록이 바뀌지 않게 한다.
import { useMenuTrigger } from "react-aria";
import { useMenuTriggerState } from "react-stately";

import { MenuContext, type MenuContextValue } from "./hooks/useMenuContext";

export interface MenuProps {
  /** 열림 상태(제어). 주면 `onOpenChange`로 바꾼다. */
  open?: boolean;
  /** 처음 열림 상태(비제어). 기본값은 `false`다. */
  defaultOpen?: boolean;
  /** 열림 상태가 바뀌려 할 때 새 값으로 부른다. 항목을 실행해 닫힐 때도 부른다. */
  onOpenChange?: (open: boolean) => void;
  /** `MenuTrigger`와 `MenuContent` */
  children: ReactNode;
}

/** 트리거와 동작 목록을 잇는 열림 상태(DOM 없음). 안에 `MenuTrigger` 하나와 `MenuContent` 하나를 둔다. */
export function Menu({ open, defaultOpen, onOpenChange, children }: MenuProps): ReactElement {
  const state = useMenuTriggerState({
    isOpen: open,
    defaultOpen,
    onOpenChange,
  });
  const triggerRef = useRef<HTMLElement>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger<unknown>({}, state, triggerRef);
  const generatedTriggerId = useId();
  const [triggerId, setTriggerId] = useState(generatedTriggerId);
  const value = useMemo<MenuContextValue>(
    () => ({
      state,
      triggerRef,
      menuTriggerProps,
      menuProps,
      triggerId,
      setTriggerId,
    }),
    [state, menuTriggerProps, menuProps, triggerId],
  );

  return <MenuContext value={value}>{children}</MenuContext>;
}
