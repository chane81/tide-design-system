"use client";
import { createContext, use, type RefObject } from "react";
// 서브패스 말고 루트 entry에서 import한다. Vite 사전 번들 목록이 바뀌지 않게 한다.
import type { useMenuTrigger } from "react-aria";
import type { MenuTriggerState } from "react-stately";

type MenuTriggerAria = ReturnType<typeof useMenuTrigger<unknown>>;

export interface MenuContextValue {
  readonly state: MenuTriggerState;
  readonly triggerRef: RefObject<HTMLElement | null>;
  readonly menuTriggerProps: MenuTriggerAria["menuTriggerProps"];
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
