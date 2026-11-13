"use client";
// 접고 펴는 영역 묶음 Accordion(tide-v0-impl 티켓 32). React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useDisclosure, useButton, mergeProps, mergeRefs),
// react-stately 3.51.0(useDisclosureGroupState, useDisclosureState).
// 접근성 패턴은 WAI-ARIA APG Accordion(제목 요소 안의 버튼, `aria-expanded`·`aria-controls`, 선택적 region)을 따른다.
//
// 구조:
// - `Accordion`: 루트 `<div>`. 펼친 항목 값 목록(`value`/`defaultValue`/`onValueChange`)과 여러 개 펼침(`multiple`)을
//   `useDisclosureGroupState`로 갖는다.
// - `AccordionItem`: 항목 `<div>`. 자기 펼침 상태(`useDisclosureState`, 그룹 값에 묶음)와 `useDisclosure`를 부르고
//   버튼·패널 props를 context로 아래에 넘긴다. 버튼 id와 패널 id는 useDisclosure가 React `useId`로 짓는다(서버
//   prerender와 hydration에서 같은 값).
// - `AccordionTrigger`: `<h3>`(`level`) 안의 `<button type="button">`과 끝의 장식용 chevron.
// - `AccordionPanel`: 패널 `<div role="region">`. 닫혀 있으면 `hidden`이다. hydration 뒤에는 React Aria가
//   `hidden="until-found"`로 바꿔 브라우저 페이지 찾기(Ctrl+F)가 닫힌 패널 안 글자를 찾으면 펼친다(`beforematch`).
//
// 네이티브 `<details>/<summary>`를 쓰지 않은 까닭은 ADR 0004 덧붙임(티켓 32)에 적었다. 요약: summary는 APG Accordion의
// 「제목 요소 안의 버튼」 구조가 아니고(제목을 summary 안에 넣으면 보조 기술에 따라 제목으로 읽히지 않는다), 제어
// 상태(`value`)를 막을 수 없으며(`toggle` 이벤트는 바뀐 뒤 온다), 단일 펼침(`name`)을 끄고 켜는 것도 속성 하나에 묶인다.

import type { ComponentProps, ReactElement, ReactNode } from "react";
import { useDisclosureGroupState } from "react-stately";

import { cn } from "../_internal/libs/cn";
import { accordionClass } from "./constants/accordionClass";
import { AccordionContext } from "./hooks/useAccordionContext";

export interface AccordionProps extends Omit<ComponentProps<"div">, "defaultValue" | "onChange"> {
  /**
   * 펼친 항목의 값 목록(제어). 주면 `onValueChange`로 바꾼다.
   * `multiple`이 아닌데 값이 둘 이상이면 첫 값만 남기며 `onValueChange`를 부른다.
   */
  value?: readonly string[];
  /** 처음 펼친 항목의 값 목록(비제어). 기본값은 빈 목록(모두 접힘)이다. */
  defaultValue?: readonly string[];
  /** 펼친 항목이 바뀌려 할 때 새 값 목록으로 부른다. 목록 순서는 펼친 순서다. */
  onValueChange?: (value: string[]) => void;
  /**
   * 여러 항목을 함께 펼칠지. 기본값은 `false`로, 한 항목을 펼치면 펼쳐 있던 항목이 접힌다.
   * 어느 쪽이든 펼친 항목을 다시 누르면 접힌다(모두 접을 수 있다).
   */
  multiple?: boolean;
  /** `AccordionItem`들 */
  children?: ReactNode;
}

/**
 * 접고 펴는 영역 묶음. 루트는 `<div>`(radius `lg`, 장식용 경계)이고 안에 `AccordionItem`을 둔다.
 * 기본은 한 번에 한 항목만 펼친다(`multiple`이면 여럿).
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
    // React Stately는 바뀐 Set을 넘긴다. 펼친 순서대로 문자열 배열로 바꾼다. 누름은 늘 값을 바꾸므로(펼침 ↔ 접힘)
    // 같은 값이 다시 오는 일은 없다.
    onExpandedChange: onValueChange && ((keys) => onValueChange([...keys].map(String))),
  });

  return (
    <div {...props} ref={ref} className={cn(accordionClass, className)}>
      <AccordionContext value={state}>{children}</AccordionContext>
    </div>
  );
}
