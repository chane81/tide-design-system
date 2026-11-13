"use client";
import { createElement, useMemo, type ComponentProps, type ReactElement } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { mergeProps, mergeRefs } from "react-aria";

import { renderElement } from "../../_internal/libs/renderElement.ts";
import { useTooltipContext } from "../hooks/useTooltipContext.ts";

export interface TooltipTriggerProps extends ComponentProps<"button"> {
  /**
   * 다른 요소로 렌더한다. 예: `render={<IconButton aria-label="복사" />}`, `render={<Button variant="ghost" />}`.
   * props, ref, className, 이벤트 핸들러를 그 요소에 병합한다. 기본은 class 없는 `<button type="button">`이다.
   * 포커스를 받을 수 있는 요소여야 키보드 사용자도 설명을 본다.
   */
  render?: ReactElement;
}

/**
 * Tooltip을 여는 요소. 마우스를 올리면 `delay` 뒤에, 키보드로 포커스하면 바로 열린다.
 * 누르면(마우스, 터치, 키) 닫힌다. 열린 동안 `aria-describedby`에 설명 id가 더해진다.
 */
export function TooltipTrigger({
  render,
  ref,
  className,
  "aria-describedby": describedBy,
  ...props
}: TooltipTriggerProps): ReactElement {
  const { triggerRef, triggerProps } = useTooltipContext("TooltipTrigger");
  // tabIndex는 요소가 정한다(useTooltipTrigger도 undefined로 둔다). 설명 id는 앱의 aria-describedby 뒤에 더한다.
  const {
    tabIndex: _tabIndex,
    "aria-describedby": tooltipDescribedBy,
    ...ariaProps
  } = triggerProps;
  const mergedRef = useMemo(() => mergeRefs(ref, triggerRef), [ref, triggerRef]);
  const merged = {
    ...mergeProps(props, ariaProps),
    "aria-describedby": [describedBy, tooltipDescribedBy].filter(Boolean).join(" ") || undefined,
    ref: mergedRef,
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
