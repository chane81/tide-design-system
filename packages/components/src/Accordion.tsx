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

import { ChevronDownIcon } from "@tide-design/icons";
import {
  createContext,
  use,
  useMemo,
  useRef,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { mergeProps, mergeRefs, useButton, useDisclosure, type AriaButtonProps } from "react-aria";
import {
  useDisclosureGroupState,
  useDisclosureState,
  type DisclosureGroupState,
} from "react-stately";

import { cn } from "./cn.ts";

/** 트리거를 감싸는 제목 요소의 단계 */
export type AccordionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const AccordionContext = createContext<DisclosureGroupState | null>(null);

interface AccordionItemContextValue {
  readonly expanded: boolean;
  readonly disabled: boolean;
  readonly buttonProps: AriaButtonProps;
  readonly panelProps: ComponentProps<"div">;
  readonly panelRef: RefObject<HTMLDivElement | null>;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

function useAccordionItemContext(part: string): AccordionItemContextValue {
  const context = use(AccordionItemContext);
  if (!context) throw new Error(`${part}는 AccordionItem 안에 둔다.`);
  return context;
}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// - 루트: 담는 요소라 radius `lg`, 장식용 `border-default` 경계(Card와 같다). 배경은 두지 않아 놓인 표면 층을 그대로 쓴다.
// - 항목 사이: 장식용 `border-default` 1px 선.
const accordionClass = "rounded-lg border border-default text-default";
const itemClass = "not-first:border-t not-first:border-default";

// 트리거(spec 「포커스 표시」·「motion 적용」):
// - 글자 `text-label-lg`(16/20, medium), 여백 세로 12px·가로 16px, 글자와 chevron 사이 12px. 조작 요소 radius `md`.
// - hover는 반복 항목이라 전환 없이 바로 색 없이 덮는 `bg-hover` 배경이다(ADR 0022 §3). 비활성은 `text-disabled` + `cursor-not-allowed`.
// - 포커스: `focus-visible:focus-ring`(ring 2px, offset 2px).
const triggerClass = [
  "group flex flex-1 cursor-pointer items-center gap-3 rounded-md px-4 py-3 text-start text-label-lg outline-none select-none",
  "enabled:hover:bg-hover focus-visible:focus-ring",
  "disabled:cursor-not-allowed disabled:text-disabled",
].join(" ");

// chevron(장식용, 16px `text-muted`): hover 배경 위에서는 `text-default`다(text-default × bg-hover 대비 쌍).
// 펼치면 180° 돈다. 회전은 움직임이라 `motion-safe`일 때만 `fast`(150ms, out)로 전환하고,
// 움직임 줄이기에서는 바로 돈다(Switch thumb 이동과 같은 규칙). 회전만이 신호가 아니다(`aria-expanded`와 패널이 함께 바뀐다).
// 패널 높이 애니메이션은 없다(motion 결정 「넣지 않는 것」). 패널은 펼치면 바로 보인다.
// forced-colors: 브라우저는 svg의 `color`를 시스템 색으로 덮지 않는다. 버튼 글자색(ButtonText, 비활성이면 GrayText)을
// 그대로 따르도록 `currentColor`로 둔다.
const chevronClass =
  "ms-auto shrink-0 text-muted group-hover:group-enabled:text-default group-disabled:text-disabled group-aria-expanded:rotate-180 motion-safe:transition-[rotate] forced-colors:text-current forced-colors:group-disabled:text-current";

// 패널: 글자 `text-body-md`, 여백 가로 16px·아래 16px(위는 트리거 여백이 띄운다).
// 닫힌 패널은 hydration 뒤 `hidden="until-found"`라 display: none이 아니라 content-visibility: hidden으로 숨는다
// (Tailwind preflight는 until-found를 display: none에서 뺀다). 상자는 남으므로 그때는 여백을 0으로 둔다.
const panelClass = "px-4 pb-4 text-body-md [&[hidden]]:p-0";

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

export interface AccordionPanelProps extends Omit<
  ComponentProps<"div">,
  "id" | "role" | "hidden" | "aria-labelledby"
> {
  /**
   * 패널 역할. 기본값은 `region`(트리거 이름이 붙은 영역, APG 예시)이다.
   * 함께 펼칠 수 있는 패널이 많으면(대략 6개 넘음) 영역 랜드마크가 너무 늘지 않게 `group`으로 둔다(APG).
   */
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
