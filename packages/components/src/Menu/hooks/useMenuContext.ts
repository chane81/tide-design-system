"use client";
import { createContext, use, type RefObject } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import type { useMenuTrigger } from "react-aria";
import type { MenuTriggerState } from "react-stately";

type MenuTriggerAria = ReturnType<typeof useMenuTrigger<unknown>>;

export interface MenuContextValue {
  readonly state: MenuTriggerState;
  readonly triggerRef: RefObject<HTMLElement | null>;
  /** useMenuTrigger가 만든 트리거 props(누름·키보드 열기, aria-haspopup·expanded·controls) */
  readonly menuTriggerProps: MenuTriggerAria["menuTriggerProps"];
  /** useMenuTrigger가 만든 목록 props(id, 처음 포커스 위치, 닫기) */
  readonly menuProps: MenuTriggerAria["menuProps"];
  /** 트리거 요소 id. 목록에 이름이 없을 때 aria-labelledby로 쓴다. */
  readonly triggerId: string;
  readonly setTriggerId: (id: string) => void;
}

export const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenuContext(part: string): MenuContextValue {
  const context = use(MenuContext);
  if (!context) throw new Error(`${part}는 Menu 안에 둔다.`);
  return context;
}
