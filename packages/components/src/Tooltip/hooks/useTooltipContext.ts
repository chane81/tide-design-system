"use client";
import { createContext, use, type RefObject } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import type { useTooltipTrigger } from "react-aria";
import type { TooltipTriggerState } from "react-stately";

export interface TooltipContextValue {
  readonly state: TooltipTriggerState;
  readonly triggerRef: RefObject<HTMLElement | null>;
  /** useTooltipTrigger가 만든 트리거 props(hover·focus·누름 처리, 열렸을 때 aria-describedby) */
  readonly triggerProps: ReturnType<typeof useTooltipTrigger>["triggerProps"];
  /** 설명 요소 id. 트리거의 aria-describedby가 가리킨다. */
  readonly tooltipId: string | undefined;
}

export const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useTooltipContext(part: string): TooltipContextValue {
  const context = use(TooltipContext);
  if (!context) throw new Error(`${part}는 Tooltip 안에 둔다.`);

  return context;
}
