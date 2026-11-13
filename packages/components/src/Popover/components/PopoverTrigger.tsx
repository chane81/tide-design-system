"use client";
import {
  createElement,
  useLayoutEffect,
  useMemo,
  type ComponentProps,
  type ReactElement,
} from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { mergeProps, mergeRefs, usePress } from "react-aria";

import { renderElement } from "../../_internal/libs/renderElement.ts";
import { usePopoverContext } from "../hooks/usePopoverContext.ts";

export interface PopoverTriggerProps extends ComponentProps<"button"> {
  /**
   * 다른 요소로 렌더한다. 예: `render={<Button variant="outline" />}`, `render={<IconButton aria-label="설정" />}`.
   * props, ref, className, 이벤트 핸들러를 그 요소에 병합한다. 기본은 class 없는 `<button type="button">`이다.
   */
  render?: ReactElement;
}

/**
 * Popover를 여닫는 버튼. 누르면(마우스, 터치, Enter, Space) 열림 상태를 뒤집는다.
 * `aria-expanded`, 열렸을 때 `aria-controls`, 열렸을 때 `data-open`이 붙는다.
 */
export function PopoverTrigger({
  render,
  ref,
  id,
  className,
  ...props
}: PopoverTriggerProps): ReactElement {
  const { state, triggerRef, triggerProps, triggerId, setTriggerId } =
    usePopoverContext("PopoverTrigger");
  const { onPress, ...ariaProps } = triggerProps;
  // useOverlayTrigger의 onPress는 React Aria press 이벤트다. 트리거는 render로 Tide Button 등 다른 요소가 되므로
  // useButton 대신 press 동작만 usePress로 붙인다(type·disabled는 요소가 정한다).
  // 열린 동안 트리거는 바깥(inert)이므로, 다시 누르면 바깥 누름으로 닫힌다.
  const { pressProps } = usePress({ onPress, ref: triggerRef });
  const mergedRef = useMemo(() => mergeRefs(ref, triggerRef), [ref, triggerRef]);
  const resolvedId = id ?? triggerId;
  useLayoutEffect(() => {
    if (resolvedId !== triggerId) setTriggerId(resolvedId);
  }, [resolvedId, triggerId, setTriggerId]);

  const merged = {
    ...mergeProps(props, ariaProps, pressProps),
    id: resolvedId,
    ref: mergedRef,
    "data-open": state.isOpen ? "" : undefined,
  };
  if (!render) {
    // 기본 요소는 class가 없다. className을 주면 그대로 붙는다.
    return createElement("button", { type: "button", ...merged, className });
  }

  return renderElement({
    defaultElement: "button",
    render,
    baseClassName: "",
    props: { ...merged, className },
  });
}
