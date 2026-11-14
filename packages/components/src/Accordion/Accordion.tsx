"use client";
// 네이티브 `<details>/<summary>` 대신 React Aria `useDisclosure`를 쓴다(ADR 0004).

import type { ComponentProps, ReactElement, ReactNode } from "react";
import { useDisclosureGroupState } from "react-stately";

import { cn } from "../_internal/libs/cn";
import { accordionClass } from "./constants/accordionClass";
import { AccordionContext } from "./hooks/useAccordionContext";

export interface AccordionOwnProps {
  /** 펼친 항목의 값 목록(제어). `multiple`이 아닌데 값이 둘 이상이면 첫 값만 남긴다. */
  value?: readonly string[];
  /** 처음 펼친 항목의 값 목록(비제어). 기본값은 빈 목록(모두 접힘)이다. */
  defaultValue?: readonly string[];
  /** 펼친 항목이 바뀌려 할 때 새 값 목록으로 부른다. 목록 순서는 펼친 순서다. */
  onValueChange?: (value: string[]) => void;
  /** 여러 항목을 함께 펼칠지. 기본값 `false`(하나를 펼치면 나머지가 접힌다). 다시 누르면 접힌다. */
  multiple?: boolean;
  /** `AccordionItem`들 */
  children?: ReactNode;
}

export interface AccordionProps
  extends AccordionOwnProps, Omit<ComponentProps<"div">, keyof AccordionOwnProps | "onChange"> {}

/**
 * 접고 펴는 영역 묶음. 안에 `AccordionItem`을 둔다. 기본은 한 번에 한 항목만 펼친다.
 * Tide props: `value`, `defaultValue`, `onValueChange`, `multiple`, `children` ({@link AccordionOwnProps}). 나머지는 `<div>` 속성.
 */
export function Accordion({
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  ref,
  className,
  children,
  ...props
}: AccordionProps): ReactElement {
  const state = useDisclosureGroupState({
    allowsMultipleExpanded: multiple,
    expandedKeys: value,
    defaultExpandedKeys: defaultValue,
    // React Stately는 Set을 넘긴다. 펼친 순서를 지켜 문자열 배열로 바꾼다.
    onExpandedChange: onValueChange && ((keys) => onValueChange([...keys].map(String))),
  });

  return (
    <div {...props} ref={ref} className={cn(accordionClass, className)}>
      <AccordionContext value={state}>{children}</AccordionContext>
    </div>
  );
}
