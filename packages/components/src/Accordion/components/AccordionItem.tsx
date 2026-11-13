"use client";
import {
  use,
  useMemo,
  useRef,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { useDisclosure } from "react-aria";
import { useDisclosureState } from "react-stately";

import { cn } from "../../_internal/libs/cn.ts";
import { itemClass } from "../constants/accordionClass.ts";
import { AccordionContext } from "../hooks/useAccordionContext.ts";
import {
  AccordionItemContext,
  type AccordionItemContextValue,
} from "../hooks/useAccordionItemContext.ts";

export interface AccordionItemProps extends Omit<ComponentProps<"div">, "value"> {
  /** 항목을 가리키는 값. `Accordion`의 `value`·`defaultValue` 목록에 이 값을 넣으면 펼친다. */
  value: string;
  /** 펼치거나 접을 수 없게 한다. 트리거가 네이티브 `disabled`가 된다. 펼친 채 비활성이면 펼친 채로 남는다. */
  disabled?: boolean;
  /** `AccordionTrigger` 하나와 `AccordionPanel` 하나 */
  children?: ReactNode;
}

/**
 * 항목 하나. 안에 `AccordionTrigger`와 `AccordionPanel`을 둔다.
 * 펼쳐 있으면 `data-open`, 비활성이면 `data-disabled`가 붙는다.
 */
export function AccordionItem({
  value,
  disabled = false,
  ref,
  className,
  children,
  ...props
}: AccordionItemProps): ReactElement {
  const group = use(AccordionContext);
  if (!group) throw new Error("AccordionItem는 Accordion 안에 둔다.");
  const panelRef = useRef<HTMLDivElement>(null);
  // 펼침 상태는 늘 그룹 값으로 제어한다. 바꾸려 하면 그룹 key를 뒤집는다(react-aria-components Disclosure와 같은 방식).
  const state = useDisclosureState({
    isExpanded: group.expandedKeys.has(value),
    onExpandedChange: () => group.toggleKey(value),
  });
  const { buttonProps, panelProps } = useDisclosure({ isDisabled: disabled }, state, panelRef);
  const context = useMemo<AccordionItemContextValue>(
    () => ({
      expanded: state.isExpanded,
      disabled,
      buttonProps,
      panelProps: panelProps as ComponentProps<"div">,
      panelRef,
    }),
    [state.isExpanded, disabled, buttonProps, panelProps],
  );
  return (
    <div
      {...props}
      ref={ref}
      data-open={state.isExpanded ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn(itemClass, className)}
    >
      <AccordionItemContext value={context}>{children}</AccordionItemContext>
    </div>
  );
}
