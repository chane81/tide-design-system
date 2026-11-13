"use client";
// 트리거에 짧은 설명을 붙이는 Tooltip(tide-v0-impl 티켓 26). React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useTooltipTrigger, useTooltip, useOverlayPosition, mergeProps, mergeRefs),
// react-stately 3.51.0(useTooltipTriggerState). portal·위치 보정·Theme·motion은 오버레이 공통 부분(ADR 0018)을 쓴다.
//
// 구조:
// - `Tooltip`: 열림 상태만 갖는다(DOM 없음). `open`/`defaultOpen`/`onOpenChange(open)`, `delay`, `closeDelay`, `disabled`.
// - `TooltipTrigger`: 기본 `<button type="button">`. 마우스를 올리면 `delay` 뒤에, 키보드 포커스면 바로 연다.
//   열린 동안 `aria-describedby`가 설명을 가리킨다. `render={<IconButton />}`로 Tide 요소를 쓴다.
// - `TooltipContent`: `document.body`로 portal한 `role="tooltip"` 요소. `z-tooltip`으로 Dialog·Popover 위에 쌓인다.
//   포커스를 받지 않는다. Esc, 포인터가 떠남(`closeDelay` 뒤), 트리거 누름, 포커스가 떠남으로 닫힌다.
//   설명 위에 포인터를 올리면 닫히지 않는다(WCAG 1.4.13).

import {
  createContext,
  createElement,
  use,
  useMemo,
  useRef,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import {
  mergeProps,
  mergeRefs,
  useOverlayPosition,
  useTooltip,
  useTooltipTrigger,
} from "react-aria";
import { useTooltipTriggerState, type TooltipTriggerState } from "react-stately";

import { cn } from "./libs/cn.ts";
import { OverlayPortal } from "./components/OverlayPortal.tsx";
import { overlayPositionProps, type OverlayPlacement } from "./libs/overlayPosition.ts";
import { useOverlayPresence } from "./hooks/useOverlayPresence.ts";
import { useOverlayTheme } from "./hooks/useOverlayTheme.ts";
import { frequentMotionClass, overlaySurfaceClass } from "./constants/overlayClass.ts";
import { renderElement } from "./libs/renderElement.ts";

/** Tooltip 설명의 위치. 앞은 트리거의 어느 쪽, 뒤는 그 변에서 맞출 끝이다. 공간이 모자라면 반대쪽으로 뒤집힌다. */
export type TooltipPlacement = OverlayPlacement;

interface TooltipContextValue {
  readonly state: TooltipTriggerState;
  readonly triggerRef: RefObject<HTMLElement | null>;
  /** useTooltipTrigger가 만든 트리거 props(hover·focus·누름 처리, 열렸을 때 aria-describedby) */
  readonly triggerProps: ReturnType<typeof useTooltipTrigger>["triggerProps"];
  /** 설명 요소 id. 트리거의 aria-describedby가 가리킨다. */
  readonly tooltipId: string | undefined;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext(part: string): TooltipContextValue {
  const context = use(TooltipContext);
  if (!context) throw new Error(`${part}는 Tooltip 안에 둔다.`);
  return context;
}

export interface TooltipProps {
  /** 열림 상태(제어). 주면 `onOpenChange`로 바꾼다. */
  open?: boolean;
  /** 처음 열림 상태(비제어). 기본값은 `false`다. */
  defaultOpen?: boolean;
  /** 열림 상태가 바뀌려 할 때 새 값으로 부른다. */
  onOpenChange?: (open: boolean) => void;
  /**
   * 마우스를 올린 뒤 열릴 때까지 기다리는 시간(ms). 기본값은 `500`이다. 키보드 포커스는 기다리지 않는다.
   * 한 Tooltip이 열린 뒤 잠깐(0.5초) 안에 다른 트리거로 옮기면 기다리지 않고 바로 연다.
   */
  delay?: number;
  /** 포인터가 트리거·설명을 떠난 뒤 닫힐 때까지 기다리는 시간(ms). 기본값은 `300`이다. 설명으로 옮겨 갈 틈이다. */
  closeDelay?: number;
  /** `true`면 열리지 않는다. 트리거는 그대로 동작한다. */
  disabled?: boolean;
  /** `TooltipTrigger`와 `TooltipContent` */
  children: ReactNode;
}

/**
 * 트리거와 설명을 잇는 열림 상태. DOM 요소를 만들지 않는다.
 * 안에 `TooltipTrigger` 하나와 `TooltipContent` 하나를 둔다.
 */
export function Tooltip({
  open,
  defaultOpen,
  onOpenChange,
  delay = 500,
  closeDelay = 300,
  disabled,
  children,
}: TooltipProps): ReactElement {
  const options = {
    isOpen: open,
    defaultOpen,
    onOpenChange,
    delay,
    closeDelay,
    isDisabled: disabled,
  };
  const state = useTooltipTriggerState(options);
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerProps, tooltipProps } = useTooltipTrigger(options, state, triggerRef);
  const value = useMemo<TooltipContextValue>(
    () => ({ state, triggerRef, triggerProps, tooltipId: tooltipProps.id }),
    [state, triggerProps, tooltipProps.id],
  );
  return <TooltipContext value={value}>{children}</TooltipContext>;
}

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

export interface TooltipContentProps extends Omit<ComponentProps<"div">, "id" | "role"> {
  /** 트리거 기준 위치. 기본값은 `top`(위, 가운데 맞춤)이다. 공간이 모자라면 반대쪽으로 뒤집힌다. */
  placement?: TooltipPlacement;
  /** 트리거와의 간격(px). 기본값은 `4`다. */
  offset?: number;
}

// class는 문자열 그대로 적는다(constants/overlayClass.ts 참고).
// - 표면: Popover와 같은 raised + shadow-md + radius lg + border-raised(overlaySurfaceClass). 쌓임은 z-tooltip(500)이라
//   Dialog(z-modal)·Popover(z-popover) 위에 그려진다.
// - 크기: 안쪽 여백 세로 4px·가로 8px, 글자 body-sm(14px), 폭은 내용에 맞추되 15rem(max-w-60)을 넘지 않는다.
// - motion: 「자주 씀」(frequentMotionClass). 바로 나타나고 opacity fast로 사라진다.
// - 루트 `isolate`: 안의 겹침이 바깥 쌓임 단계와 섞이지 않게 쌓임 맥락을 만든다(spec 「오버레이」).
const contentClass = `isolate z-tooltip max-w-60 px-2 py-1 text-body-sm ${overlaySurfaceClass} ${frequentMotionClass}`;

/**
 * 트리거에 붙는 설명(`role="tooltip"`). 열릴 때만 `document.body`에 portal로 렌더하고 `z-tooltip`으로 쌓는다.
 * 바로 나타나고, 닫히면 opacity만 `fast`(150ms)로 사라진다. 조작 요소(버튼, 링크)는 넣지 않는다.
 * 열려 있으면 `data-open`이, 트리거 기준 방향이 `data-placement`(`top`/`bottom`/`left`/`right`)로 붙는다.
 */
export function TooltipContent(props: TooltipContentProps): ReactElement | null {
  const context = useTooltipContext("TooltipContent");
  const tooltipRef = useRef<HTMLDivElement>(null);
  const present = useOverlayPresence(context.state.isOpen, tooltipRef);
  if (!present) return null;
  // Tooltip은 포커스를 받지 않으므로 FocusScope 없이 portal만 한다.
  return (
    <OverlayPortal isExiting={!context.state.isOpen} focusManagement={false}>
      <TooltipContentInner {...props} context={context} tooltipRef={tooltipRef} />
    </OverlayPortal>
  );
}

interface TooltipContentInnerProps extends TooltipContentProps {
  readonly context: TooltipContextValue;
  readonly tooltipRef: RefObject<HTMLDivElement | null>;
}

/** DOM에 있는 동안만 portal 안에서 렌더한다. 위치 hook은 요소가 있다고 보고 동작한다. */
function TooltipContentInner({
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
