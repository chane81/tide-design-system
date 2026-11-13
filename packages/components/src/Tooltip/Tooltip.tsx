"use client";
// 트리거에 짧은 설명을 붙이는 Tooltip(tide-v0-impl 티켓 26). React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useTooltipTrigger, useTooltip, useOverlayPosition, mergeProps, mergeRefs),
// react-stately 3.51.0(useTooltipTriggerState). portal·위치 보정·Theme·motion은 오버레이 공통 부분(ADR 0018)을 쓴다.
//
// 구조:
// - `Tooltip`: 열림 상태만 갖는다(DOM 없음). `open`/`defaultOpen`/`onOpenChange(open)`, `delay`, `closeDelay`, `disabled`.
// - `TooltipTrigger`: 기본 `<button type="button">`. 마우스를 올리면 `delay` 뒤에, 키보드 포커스면 바로 연다.
//   열린 동안 `aria-describedby`가 설명을 가리킨다. `render={<IconButton />}`로 Tide 요소를 쓴다.
// - `TooltipContent`: `document.body`로 portal한 `role="tooltip"` 요소. `z-tooltip`으로 Dialog·Popover 위에 쌓인다.
//   포커스를 받지 않는다. Esc, 포인터가 떠남(`closeDelay` 뒤), 트리거 누름, 포커스가 떠남으로 닫힌다.
//   설명 위에 포인터를 올리면 닫히지 않는다(WCAG 1.4.13).

import { useMemo, useRef, type ReactElement, type ReactNode } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { useTooltipTrigger } from "react-aria";
import { useTooltipTriggerState } from "react-stately";

import { TooltipContext, type TooltipContextValue } from "./hooks/useTooltipContext.ts";

export interface TooltipProps {
  /** 열림 상태(제어). 주면 `onOpenChange`로 바꾼다. */
  open?: boolean;
  /** 처음 열림 상태(비제어). 기본값은 `false`다. */
  defaultOpen?: boolean;
  /** 열림 상태가 바뀌려 할 때 새 값으로 부른다. */
  onOpenChange?: (open: boolean) => void;
  /**
   * 마우스를 올린 뒤 열릴 때까지 기다리는 시간(ms). 기본값은 `500`이다. 키보드 포커스는 기다리지 않는다.
   * 한 Tooltip이 열린 뒤 잠깐(0.5초) 안에 다른 트리거로 옮기면 기다리지 않고 바로 연다.
   */
  delay?: number;
  /** 포인터가 트리거·설명을 떠난 뒤 닫힐 때까지 기다리는 시간(ms). 기본값은 `300`이다. 설명으로 옮겨 갈 틈이다. */
  closeDelay?: number;
  /** `true`면 열리지 않는다. 트리거는 그대로 동작한다. */
  disabled?: boolean;
  /** `TooltipTrigger`와 `TooltipContent` */
  children: ReactNode;
}

/**
 * 트리거와 설명을 잇는 열림 상태. DOM 요소를 만들지 않는다.
 * 안에 `TooltipTrigger` 하나와 `TooltipContent` 하나를 둔다.
 */
export function Tooltip({
  open,
  defaultOpen,
  onOpenChange,
  delay = 500,
  closeDelay = 300,
  disabled,
  children,
}: TooltipProps): ReactElement {
  const options = {
    isOpen: open,
    defaultOpen,
    onOpenChange,
    delay,
    closeDelay,
    isDisabled: disabled,
  };
  const state = useTooltipTriggerState(options);
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerProps, tooltipProps } = useTooltipTrigger(options, state, triggerRef);
  const value = useMemo<TooltipContextValue>(
    () => ({ state, triggerRef, triggerProps, tooltipId: tooltipProps.id }),
    [state, triggerProps, tooltipProps.id],
  );

  return <TooltipContext value={value}>{children}</TooltipContext>;
}
