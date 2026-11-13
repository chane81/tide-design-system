"use client";
// 트리거 옆에 내용을 띄우는 Popover(tide-v0-impl 티켓 25). React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useOverlayTrigger, usePress, useDialog, DismissButton, mergeProps, mergeRefs),
// react-stately 3.51.0(useOverlayTriggerState). 위치·portal·motion은 오버레이 공통 부분(components/OverlayPortal.tsx, constants/overlayClass.ts)을 쓴다.
//
// 구조:
// - `Popover`: 열림 상태만 갖는다(DOM 없음). `open`/`defaultOpen`/`onOpenChange(open)`.
// - `PopoverTrigger`: 기본 `<button type="button">`. 누르면 열고 닫는다. `render={<Button />}`로 Tide Button 모양을 쓴다.
//   `aria-expanded`, 열렸을 때 `aria-controls`, `data-open`이 붙는다.
// - `PopoverContent`: `document.body`로 portal한 `role="dialog"` 요소. 열리면 자기에게 포커스가 오고(안의 요소가
//   autoFocus면 그 요소), Esc·바깥 누름·트리거 다시 누름으로 닫히며 포커스는 트리거로 돌아온다. 열려 있는 동안 바깥은
//   `inert`라 Tab은 안에서 돈다. 이름은 `aria-label`/`aria-labelledby`, 둘 다 없으면 트리거 글자다.

import {
  createContext,
  createElement,
  use,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
// 루트 entry에서 import한다. 서브패스(`react-aria/usePopover`)도 있지만, 루트 하나면 Vite 사전 번들 목록
// (vitest·storybook의 optimizeDeps.include)이 hook을 더해도 바뀌지 않는다. 패키지가 sideEffects: false라 앱 번들에서는 쓰는 것만 남는다.
import {
  DismissButton,
  mergeProps,
  mergeRefs,
  useDialog,
  useOverlayTrigger,
  usePress,
} from "react-aria";
import { useOverlayTriggerState, type OverlayTriggerState } from "react-stately";

import { cn } from "../libs/cn.ts";
import { OverlayPortal } from "../components/OverlayPortal.tsx";
import { useOverlayPresence } from "../hooks/useOverlayPresence.ts";
import { useOverlayTheme } from "../hooks/useOverlayTheme.ts";
import { usePopoverOverlay } from "../hooks/usePopoverOverlay.ts";
import type { OverlayPlacement } from "../libs/overlayPosition.ts";
import { overlaySurfaceClass, popoverMotionClass } from "../constants/overlayClass.ts";
import { renderElement } from "../libs/renderElement.ts";

/** Popover 내용의 위치. 앞은 트리거의 어느 쪽, 뒤는 그 변에서 맞출 끝이다. 공간이 모자라면 반대쪽으로 뒤집힌다. */
export type PopoverPlacement = OverlayPlacement;

interface PopoverContextValue {
  readonly state: OverlayTriggerState;
  readonly triggerRef: RefObject<HTMLElement | null>;
  /** useOverlayTrigger가 만든 트리거 props(onPress 포함) */
  readonly triggerProps: ReturnType<typeof useOverlayTrigger>["triggerProps"];
  /** 내용 요소 id. 트리거의 aria-controls가 가리킨다. */
  readonly contentId: string | undefined;
  /** 트리거 요소 id. 내용에 이름이 없을 때 aria-labelledby로 쓴다. */
  readonly triggerId: string;
  readonly setTriggerId: (id: string) => void;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext(part: string): PopoverContextValue {
  const context = use(PopoverContext);
  if (!context) throw new Error(`${part}는 Popover 안에 둔다.`);
  return context;
}

export interface PopoverProps {
  /** 열림 상태(제어). 주면 `onOpenChange`로 바꾼다. */
  open?: boolean;
  /** 처음 열림 상태(비제어). 기본값은 `false`다. */
  defaultOpen?: boolean;
  /** 열림 상태가 바뀌려 할 때 새 값으로 부른다. */
  onOpenChange?: (open: boolean) => void;
  /** `PopoverTrigger`와 `PopoverContent` */
  children: ReactNode;
}

/**
 * 트리거와 내용을 잇는 열림 상태. DOM 요소를 만들지 않는다.
 * 안에 `PopoverTrigger` 하나와 `PopoverContent` 하나를 둔다.
 */
export function Popover({ open, defaultOpen, onOpenChange, children }: PopoverProps): ReactElement {
  const state = useOverlayTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerProps, overlayProps } = useOverlayTrigger({ type: "dialog" }, state, triggerRef);
  const generatedTriggerId = useId();
  const [triggerId, setTriggerId] = useState(generatedTriggerId);
  const value = useMemo<PopoverContextValue>(
    () => ({
      state,
      triggerRef,
      triggerProps,
      contentId: overlayProps.id,
      triggerId,
      setTriggerId,
    }),
    [state, triggerProps, overlayProps.id, triggerId],
  );
  return <PopoverContext value={value}>{children}</PopoverContext>;
}

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

export interface PopoverContentProps extends Omit<ComponentProps<"div">, "id" | "role"> {
  /** 트리거 기준 위치. 기본값은 `bottom`(아래, 가운데 맞춤)이다. 공간이 모자라면 반대쪽으로 뒤집힌다. */
  placement?: PopoverPlacement;
  /** 트리거와의 간격(px). 기본값은 `8`이다. */
  offset?: number;
}

// class는 문자열 그대로 적는다(constants/overlayClass.ts 참고).
// - 표면: raised + shadow-md + radius lg + border-raised(overlaySurfaceClass). 쌓임은 z-popover(300)다.
// - 크기: 안쪽 여백 16px(Card와 같음), 폭은 내용에 맞추되 20rem(max-w-80)을 넘지 않는다. 높이는 React Aria가
//   max-height로 화면 안에 맞추고 넘치면 스크롤한다(overflow-auto).
// - 포커스: 열릴 때 내용 요소 자신에 포커스가 온다(useDialog). 표면 전체가 포커스 위치라 outline은 그리지 않는다.
//   안의 조작 요소는 각자 focus-ring을 쓴다.
// - 루트 `isolate`: 안의 겹침(z-0/z-1)이 바깥 쌓임 단계와 섞이지 않게 쌓임 맥락을 만든다(spec 「오버레이」).
const contentClass = `isolate z-popover max-w-80 overflow-auto p-4 text-body-md outline-none ${overlaySurfaceClass} ${popoverMotionClass}`;

/**
 * 트리거 옆에 뜨는 내용(`role="dialog"`). 열릴 때만 `document.body`에 portal로 렌더하고 `z-popover`로 쌓는다.
 * 등장은 opacity + blur 4px + 4px 이동(`normal`), 퇴장은 그 절반(`fast`)이다. 움직임 줄이기에서는 opacity만 바뀐다.
 * 열려 있으면 `data-open`이, 트리거 기준 방향이 `data-placement`(`top`/`bottom`/`left`/`right`)로 붙는다.
 */
export function PopoverContent(props: PopoverContentProps): ReactElement | null {
  const context = usePopoverContext("PopoverContent");
  const popoverRef = useRef<HTMLDivElement>(null);
  const present = useOverlayPresence(context.state.isOpen, popoverRef);
  if (!present) return null;
  // 역할 hook(useDialog)이 포커스 가두기를 Overlay context로 요청하므로 hook을 부르는 쪽이 portal 안에 있어야 한다.
  return (
    <OverlayPortal isExiting={!context.state.isOpen}>
      <PopoverContentInner {...props} context={context} popoverRef={popoverRef} />
    </OverlayPortal>
  );
}

interface PopoverContentInnerProps extends PopoverContentProps {
  readonly context: PopoverContextValue;
  readonly popoverRef: RefObject<HTMLDivElement | null>;
}

/** DOM에 있는 동안만 portal 안에서 렌더한다. React Aria 오버레이 hook은 요소가 있다고 보고 동작한다. */
function PopoverContentInner({
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
