"use client";
import { createContext, use, type ComponentProps, type RefObject } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import type { AriaButtonProps } from "react-aria";

export interface AccordionItemContextValue {
  readonly expanded: boolean;
  readonly disabled: boolean;
  readonly buttonProps: AriaButtonProps;
  readonly panelProps: ComponentProps<"div">;
  readonly panelRef: RefObject<HTMLDivElement | null>;
}

export const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

export function useAccordionItemContext(part: string): AccordionItemContextValue {
  const context = use(AccordionItemContext);
  if (!context) throw new Error(`${part}는 AccordionItem 안에 둔다.`);
  return context;
}
