"use client";
import { useMemo, type ReactElement, type RefObject } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { mergeProps, mergeRefs, useOverlayPosition, useTooltip } from "react-aria";

import { useOverlayTheme } from "../../_internal/hooks/useOverlayTheme";
import { cn } from "../../_internal/libs/cn";
import { overlayPositionProps } from "../../_internal/libs/overlayPosition";
import { contentClass } from "../constants/tooltipClass";
import type { TooltipContextValue } from "../hooks/useTooltipContext";
import type { TooltipContentProps } from "./TooltipContent";

export interface TooltipContentInnerProps extends TooltipContentProps {
  readonly context: TooltipContextValue;
  readonly tooltipRef: RefObject<HTMLDivElement | null>;
}

/** DOM에 있는 동안만 portal 안에서 렌더한다. 위치 hook은 요소가 있다고 보고 동작한다. */
export function TooltipContentInner({
  context,
  tooltipRef,
  placement = "top",
  offset = 4,
  ref,
  className,
  children,
  ...props
}: TooltipContentInnerProps): ReactElement {
  const { state, triggerRef, tooltipId } = context;
  useOverlayTheme(triggerRef, tooltipRef);
  const position = useOverlayPosition({
    targetRef: triggerRef,
    overlayRef: tooltipRef,
    placement,
    offset,
    isOpen: state.isOpen,
    // 트리거가 스크롤로 움직이면 설명이 떨어져 남지 않게 바로 닫는다.
    onClose: () => state.close(true),
  });
  const overlayProps = overlayPositionProps(position.overlayProps, position.placement, placement);
  // role="tooltip", 그리고 설명 위에 포인터가 있는 동안 열린 채로 둔다(WCAG 1.4.13 「hover 가능」).
  const { tooltipProps } = useTooltip({}, state);
  const mergedRef = useMemo(() => mergeRefs(ref, tooltipRef), [ref, tooltipRef]);
  const { style: _style, ...rest } = mergeProps(props, overlayProps, tooltipProps);

  return (
    <div
      {...rest}
      id={tooltipId}
      ref={mergedRef}
      data-open={state.isOpen ? "" : undefined}
      // 열린 Popover·Dialog가 바깥을 inert로 막아도(React Aria ariaHideOutside) 설명은 막지 않는다.
      // React Aria가 「늘 보이는 요소」로 남기는 표시다(react-aria 3.53.1 ariaHideOutside·useInteractOutside 소스).
      data-react-aria-top-layer=""
      className={cn(
        contentClass,
        // 다른 Tooltip으로 빠르게 옮겨 갈 때(React Aria warmup) 앞의 것은 퇴장 없이 바로 사라진다.
        !state.isOpen && state.shouldSkipAnimation && "transition-none",
        className,
      )}
      // 위치 style(React Aria) 위에 사용자 style을 덮는다.
      style={{ ...overlayProps.style, ...props.style }}
    >
      {children}
    </div>
  );
}
