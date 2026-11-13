"use client";
// 트리거에 동작 목록을 띄우는 Menu(tide-v0-impl 티켓 27). React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useMenuTrigger, useMenu, useMenuItem, useMenuSection, usePress, mergeProps, mergeRefs),
// react-stately 3.51.0(useMenuTriggerState, useTreeState). 위치·portal·motion은 오버레이 공통 부분(ADR 0018),
// 목록·항목 class와 항목 모으기는 목록 공통 부분(_internal/constants/listClass.ts, _internal/libs/listCollection.ts, ADR 0019)을 쓴다.
//
// 구조:
// - `Menu`: 열림 상태만 갖는다(DOM 없음). `open`/`defaultOpen`/`onOpenChange(open)`.
// - `MenuTrigger`: 기본 `<button type="button">`. 마우스는 누르는 순간, 키보드는 Enter·Space·↓(첫 항목)·↑(마지막 항목)로
//   연다. `aria-haspopup`, `aria-expanded`, 열렸을 때 `aria-controls`, `data-open`이 붙는다.
// - `MenuContent`: `document.body`로 portal한 `role="menu"` 요소. 화살표·Home/End·글자로 항목을 옮겨 다니고,
//   Esc·바깥 누름·Tab으로 닫히며 포커스는 트리거로 돌아온다.
// - `MenuItem`: `role="menuitem"`. Enter·Space·누름으로 실행(`onClick`)하고 메뉴를 닫는다.
// - `MenuSection`: 항목 묶음(`role="group"`). 제목(`heading`)이 이름이 되고, 묶음 앞뒤에 구분선이 그려진다.

import { useId, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
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

/**
 * 트리거와 동작 목록을 잇는 열림 상태. DOM 요소를 만들지 않는다.
 * 안에 `MenuTrigger` 하나와 `MenuContent` 하나를 둔다.
 */
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
