"use client";
import { createContext, use, type RefObject } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import type { useOverlayTrigger } from "react-aria";
import type { OverlayTriggerState } from "react-stately";

export interface PopoverContextValue {
  readonly state: OverlayTriggerState;
  readonly triggerRef: RefObject<HTMLElement | null>;
  /** useOverlayTrigger가 만든 트리거 props(onPress 포함) */
  readonly triggerProps: ReturnType<typeof useOverlayTrigger>["triggerProps"];
  /** 내용 요소 id. 트리거의 aria-controls가 가리킨다. */
  readonly contentId: string | undefined;
  /** 트리거 요소 id. 내용에 이름이 없을 때 aria-labelledby로 쓴다. */
  readonly triggerId: string;
  readonly setTriggerId: (id: string) => void;
}

export const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext(part: string): PopoverContextValue {
  const context = use(PopoverContext);
  if (!context) throw new Error(`${part}는 Popover 안에 둔다.`);
  return context;
}
