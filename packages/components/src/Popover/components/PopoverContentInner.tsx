"use client";
import { useMemo, type ReactElement, type RefObject } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { DismissButton, mergeProps, mergeRefs, useDialog } from "react-aria";

import { useOverlayTheme } from "../../_internal/hooks/useOverlayTheme.ts";
import { usePopoverOverlay } from "../../_internal/hooks/usePopoverOverlay.ts";
import { cn } from "../../_internal/libs/cn.ts";
import { contentClass } from "../constants/popoverClass.ts";
import type { PopoverContextValue } from "../hooks/usePopoverContext.ts";
import type { PopoverContentProps } from "./PopoverContent.tsx";

export interface PopoverContentInnerProps extends PopoverContentProps {
  readonly context: PopoverContextValue;
  readonly popoverRef: RefObject<HTMLDivElement | null>;
}

/** DOM에 있는 동안만 portal 안에서 렌더한다. React Aria 오버레이 hook은 요소가 있다고 보고 동작한다. */
export function PopoverContentInner({
  context,
  popoverRef,
  placement = "bottom",
  offset = 8,
  ref,
  className,
  children,
  ...props
}: PopoverContentInnerProps): ReactElement {
  const { state, triggerRef, contentId, triggerId } = context;
  useOverlayTheme(triggerRef, popoverRef);
  const { overlayProps } = usePopoverOverlay({ triggerRef, popoverRef, placement, offset }, state);
  const { dialogProps } = useDialog(
    { "aria-label": props["aria-label"], "aria-labelledby": props["aria-labelledby"] },
    popoverRef,
  );
  // 이름이 없으면 트리거 글자를 이름으로 쓴다(react-aria-components Dialog의 fallback과 같은 방식).
  const labelledBy =
    dialogProps["aria-labelledby"] ?? (props["aria-label"] ? undefined : triggerId);
  const mergedRef = useMemo(() => mergeRefs(ref, popoverRef), [ref, popoverRef]);
  const { style: _style, ...rest } = mergeProps(props, overlayProps, dialogProps);

  return (
    <div
      {...rest}
      id={contentId}
      ref={mergedRef}
      aria-labelledby={labelledBy}
      data-open={state.isOpen ? "" : undefined}
      className={cn(contentClass, className)}
      // 위치 style(React Aria) 위에 사용자 style을 덮는다.
      style={{ ...overlayProps.style, ...props.style }}
    >
      {/* 스크린리더 사용자가 Esc 없이 닫을 수 있는 숨은 버튼(React Aria usePopover 예시). Tab 순서에는 없다. */}
      <DismissButton onDismiss={state.close} />
      {children}
      <DismissButton onDismiss={state.close} />
    </div>
  );
}
