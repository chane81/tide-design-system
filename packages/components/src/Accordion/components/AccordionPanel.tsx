"use client";
import { useMemo, type ComponentProps, type ReactElement } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { mergeProps, mergeRefs } from "react-aria";

import { cn } from "../../_internal/libs/cn";
import { panelClass } from "../constants/accordionClass";
import { useAccordionItemContext } from "../hooks/useAccordionItemContext";

export interface AccordionPanelProps extends Omit<
  ComponentProps<"div">,
  "id" | "role" | "hidden" | "aria-labelledby"
> {
  /** 패널 역할. 기본값 `region`. 함께 펼칠 패널이 많으면(대략 6개 넘음) `group`으로 둔다(APG). */
  role?: "region" | "group";
}

/**
 * 항목 내용. 트리거가 `aria-controls`로 가리키고 트리거 글자가 이름이 된다(`aria-labelledby`).
 * 접혀 있으면 숨는다(`hidden`). 늘 렌더하므로 안의 입력 상태는 접어도 남는다.
 */
export function AccordionPanel({
  role = "region",
  ref,
  className,
  ...props
}: AccordionPanelProps): ReactElement {
  const item = useAccordionItemContext("AccordionPanel");
  const mergedRef = useMemo(() => mergeRefs(ref, item.panelRef), [ref, item.panelRef]);

  return (
    <div
      {...mergeProps(props, item.panelProps)}
      ref={mergedRef}
      role={role}
      data-open={item.expanded ? "" : undefined}
      className={cn(panelClass, className)}
    />
  );
}
