"use client";
import { ChevronDownIcon } from "@tide-design/icons";
import { useMemo, useRef, type ComponentProps, type ReactElement, type ReactNode } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { mergeProps, mergeRefs, useButton } from "react-aria";

import { cn } from "../../_internal/libs/cn.ts";
import { chevronClass, triggerClass } from "../constants/accordionClass.ts";
import { useAccordionItemContext } from "../hooks/useAccordionItemContext.ts";
import type { AccordionHeadingLevel } from "../types.ts";

export interface AccordionTriggerProps extends Omit<
  ComponentProps<"button">,
  "type" | "id" | "disabled" | "aria-expanded" | "aria-controls"
> {
  /**
   * 트리거를 감싸는 제목 요소의 단계(`<h1>`~`<h6>`). 기본값은 `3`이다.
   * 페이지 제목 구조에 맞춘다(WAI-ARIA APG Accordion).
   */
  level?: AccordionHeadingLevel;
  /** 항목 제목. 제목 요소 안에는 버튼만 둔다(APG). */
  children?: ReactNode;
}

/**
 * 항목 제목 버튼. 제목 요소(`level`, 기본 `<h3>`) 안의 `<button type="button">`이고 끝에 장식용 chevron이 있다.
 * `ref`·`className`·나머지 props는 버튼에 간다. 펼침 상태는 `aria-expanded`와 `data-open`, 비활성은 `:disabled`다.
 * Enter·Space·누름으로 펼치고 접는다.
 */
export function AccordionTrigger({
  level = 3,
  ref,
  className,
  children,
  ...props
}: AccordionTriggerProps): ReactElement {
  const item = useAccordionItemContext("AccordionTrigger");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { buttonProps } = useButton(item.buttonProps, buttonRef);
  const mergedRef = useMemo(() => mergeRefs(ref, buttonRef), [ref, buttonRef]);
  const Heading = `h${level}` as const;
  return (
    <Heading className="flex">
      <button
        {...mergeProps(props, buttonProps)}
        ref={mergedRef}
        type="button"
        data-open={item.expanded ? "" : undefined}
        className={cn(triggerClass, className)}
      >
        {children}
        <ChevronDownIcon size={16} className={chevronClass} />
      </button>
    </Heading>
  );
}
