"use client";
// 화면 가운데에 뜨는 모달 Dialog(tide-v0-impl 티켓 30). React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useOverlayTrigger, usePress, useModalOverlay, useDialog, useFocusManager, mergeProps,
// mergeRefs), react-stately 3.51.0(useOverlayTriggerState). portal·DOM에서 빼는 시점·Theme은 오버레이 공통 부분
// (_internal/components/OverlayPortal.tsx, _internal/constants/overlayClass.ts, ADR 0018)을 쓴다. 접근성 동작은 WAI-ARIA APG Dialog(Modal)·Alert Dialog 패턴을 따른다.
//
// 구조:
// - `Dialog`: 열림 상태만 갖는다(DOM 없음). `open`/`defaultOpen`/`onOpenChange(open)`. AlertDialog.tsx의 `AlertDialog`는
//   같은 상태에 「alert」 표시만 더한 얇은 변형이다.
// - `DialogTrigger`: 기본 `<button type="button">`. 누르면 연다. `render={<Button />}`로 Tide Button 모양을 쓴다.
// - `DialogContent`: `document.body`로 portal한 바깥 막(`bg-overlay`, `z-modal`) 안의 `role="dialog"` 요소.
//   열리면 포커스가 안으로 오고 Tab은 안에서 돌며, Esc·바깥 막 누름·닫기 버튼으로 닫히면 포커스가 열기 전 요소로 돌아온다.
//   열린 동안 바깥은 `inert`이고 페이지 스크롤이 잠긴다(useModalOverlay).
// - `DialogTitle`(`<h2>`)·`DialogDescription`(`<p>`): 있으면 dialog의 `aria-labelledby`·`aria-describedby`가 가리킨다.
// - `DialogFooter`: 동작 버튼 줄. `DialogClose`: 누르면 닫는 버튼(`render`로 Button 모양).

import { XIcon } from "@tide-design/icons";
import {
  createContext,
  createElement,
  use,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
// 루트 entry에서 import한다(Popover.tsx 참고: Vite 사전 번들 목록이 바뀌지 않는다).
import {
  mergeProps,
  mergeRefs,
  useDialog,
  useFocusManager,
  useModalOverlay,
  useOverlayTrigger,
  usePress,
} from "react-aria";
import { useOverlayTriggerState, type OverlayTriggerState } from "react-stately";

import { cn } from "../_internal/libs/cn.ts";
import { IconButton } from "../IconButton/IconButton.tsx";
import { OverlayPortal } from "../_internal/components/OverlayPortal.tsx";
import { useOverlayPresence } from "../_internal/hooks/useOverlayPresence.ts";
import { useOverlayTheme } from "../_internal/hooks/useOverlayTheme.ts";
import {
  backdropMotionClass,
  dialogMotionClass,
  dialogSurfaceClass,
} from "../_internal/constants/overlayClass.ts";
import { renderElement } from "../_internal/libs/renderElement.ts";

interface DialogContextValue {
  readonly state: OverlayTriggerState;
  readonly triggerRef: RefObject<HTMLElement | null>;
  /** useOverlayTrigger가 만든 트리거 props(onPress 포함) */
  readonly triggerProps: ReturnType<typeof useOverlayTrigger>["triggerProps"];
  /** 내용 요소 id. 트리거의 aria-controls가 가리킨다. */
  readonly contentId: string | undefined;
  /** 놓인 트리거의 id. 트리거가 없으면(열림을 제어만 하는 경우) `null`이다. */
  readonly triggerId: string | null;
  readonly setTriggerId: (id: string | null) => void;
  /** AlertDialog면 `true`. 역할이 alertdialog가 되고 바깥 막 누름으로 닫히지 않으며 닫기 버튼이 없다. */
  readonly alert: boolean;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext(part: string): DialogContextValue {
  const context = use(DialogContext);
  if (!context) throw new Error(`${part}는 Dialog나 AlertDialog 안에 둔다.`);
  return context;
}

/** 열린 내용 안의 제목·설명 id를 dialog 요소에 잇는다. */
interface DialogPartsContextValue {
  readonly alert: boolean;
  readonly setTitleId: (id: string | null) => void;
  readonly setDescriptionId: (id: string | null) => void;
}

const DialogPartsContext = createContext<DialogPartsContextValue | null>(null);

function useDialogPartsContext(part: string): DialogPartsContextValue {
  const context = use(DialogPartsContext);
  if (!context) throw new Error(`${part}는 DialogContent 안에 둔다.`);
  return context;
}

export interface DialogProps {
  /** 열림 상태(제어). 주면 `onOpenChange`로 바꾼다. */
  open?: boolean;
  /** 처음 열림 상태(비제어). 기본값은 `false`다. */
  defaultOpen?: boolean;
  /** 열림 상태가 바뀌려 할 때 새 값으로 부른다. */
  onOpenChange?: (open: boolean) => void;
  /** `DialogTrigger`와 `DialogContent` */
  children: ReactNode;
}

/** Dialog·AlertDialog가 같이 쓰는 열림 상태. 공개 API가 아니다(AlertDialog.tsx가 쓴다). */
export function DialogRoot({
  open,
  defaultOpen,
  onOpenChange,
  alert,
  children,
}: DialogProps & { readonly alert: boolean }): ReactElement {
  const state = useOverlayTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerProps, overlayProps } = useOverlayTrigger({ type: "dialog" }, state, triggerRef);
  const [triggerId, setTriggerId] = useState<string | null>(null);
  const value = useMemo<DialogContextValue>(
    () => ({
      state,
      triggerRef,
      triggerProps,
      contentId: overlayProps.id,
      triggerId,
      setTriggerId,
      alert,
    }),
    [state, triggerProps, overlayProps.id, triggerId, alert],
  );
  return <DialogContext value={value}>{children}</DialogContext>;
}

/**
 * 트리거와 내용을 잇는 열림 상태. DOM 요소를 만들지 않는다.
 * 안에 `DialogTrigger`(없어도 된다. `open`으로 제어해 Menu 항목 등에서 열 수 있다)와 `DialogContent`를 둔다.
 */
export function Dialog(props: DialogProps): ReactElement {
  return <DialogRoot {...props} alert={false} />;
}

export interface DialogTriggerProps extends ComponentProps<"button"> {
  /**
   * 다른 요소로 렌더한다. 예: `render={<Button variant="outline" />}`, `render={<IconButton aria-label="삭제" />}`.
   * props, ref, className, 이벤트 핸들러를 그 요소에 병합한다. 기본은 class 없는 `<button type="button">`이다.
   */
  render?: ReactElement;
}

/**
 * Dialog를 여는 버튼. 누르면(마우스, 터치, Enter, Space) 연다. 열린 동안은 바깥이 inert라 다시 누를 수 없다.
 * `aria-haspopup="dialog"`, `aria-expanded`, 열렸을 때 `aria-controls`와 `data-open`이 붙는다.
 */
export function DialogTrigger({
  render,
  ref,
  id,
  className,
  ...props
}: DialogTriggerProps): ReactElement {
  const { state, triggerRef, triggerProps, setTriggerId } = useDialogContext("DialogTrigger");
  const { onPress, ...ariaProps } = triggerProps;
  // Popover 트리거와 같다. 트리거가 render로 Tide Button 등이 되므로 useButton 대신 press 동작만 붙인다.
  const { pressProps } = usePress({ onPress, ref: triggerRef });
  const mergedRef = useMemo(() => mergeRefs(ref, triggerRef), [ref, triggerRef]);
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  // 내용에 이름이 없을 때 트리거 글자를 이름으로 쓰려고 id를 알린다. 트리거가 빠지면 지운다.
  useLayoutEffect(() => {
    setTriggerId(resolvedId);
    return () => setTriggerId(null);
  }, [resolvedId, setTriggerId]);

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

/** Dialog 최대 폭. `sm` 24rem(384px), `md` 32rem(512px), `lg` 40rem(640px)이다. */
export type DialogSize = "sm" | "md" | "lg";

export interface DialogContentProps extends Omit<ComponentProps<"div">, "id" | "role"> {
  /** 최대 폭. 기본값은 `md`(32rem)다. 화면이 좁으면 화면 폭 − 32px까지 줄어든다. */
  size?: DialogSize;
  /** 닫기 버튼(IconButton)의 이름. 기본값은 `"닫기"`다. AlertDialog에는 닫기 버튼이 없어 쓰지 않는다. */
  closeLabel?: string;
}

// class는 문자열 그대로 적는다(_internal/constants/overlayClass.ts 참고).
// - 바깥 막: 화면 전체(fixed inset-0)를 bg-overlay로 덮고 쌓임은 z-modal(200)이다. 안의 Select·Menu 목록(z-popover 300)과
//   Tooltip(z-tooltip 500)은 그 위에 뜬다. Dialog를 가운데 두고 화면 끝과 16px을 띄운다. 루트 isolate(spec 「오버레이」).
// - 표면: raised + shadow-lg + radius xl + border-raised(dialogSurfaceClass), 여백 24px, 부분 사이 16px.
// - 높이: 화면보다 길면 Dialog 안에서 스크롤한다(max-h-full + overflow-y-auto). 페이지 스크롤은 잠긴다.
// - 포커스: 열릴 때 Dialog 요소 자신에 포커스가 올 수 있다(useDialog). 표면 전체가 포커스 위치라 outline은 그리지 않는다.
const backdropClass = `fixed inset-0 isolate z-modal flex items-center justify-center bg-overlay p-4 ${backdropMotionClass}`;
const contentClass = `relative flex max-h-full w-full flex-col gap-4 overflow-y-auto p-6 text-body-md outline-none ${dialogSurfaceClass} ${dialogMotionClass}`;
const sizeClass: Record<DialogSize, string> = {
  sm: "max-w-96",
  md: "max-w-128",
  lg: "max-w-160",
};

/**
 * 화면 가운데 뜨는 모달 내용(`role="dialog"`, AlertDialog 안에서는 `role="alertdialog"`).
 * 열릴 때만 `document.body`에 portal하고, 반투명 막(`bg-overlay`)과 함께 `z-modal`로 쌓는다.
 * 등장은 opacity + scale 0.96 → 1(`normal`), 퇴장은 opacity + scale 0.98(`fast`)이다. 움직임 줄이기에서는 opacity만 바뀐다.
 * Dialog에는 끝 위쪽에 닫기 버튼(IconButton)이 있고 바깥 막을 누르면 닫힌다. AlertDialog는 둘 다 없다(Esc는 닫는다).
 */
export function DialogContent(props: DialogContentProps): ReactElement | null {
  const context = useDialogContext("DialogContent");
  const backdropRef = useRef<HTMLDivElement>(null);
  // 바깥 막이 화면에서 빠지는(display) 전환을 기다린다. 안의 Dialog 전환도 같은 duration이다.
  const present = useOverlayPresence(context.state.isOpen, backdropRef);
  if (!present) return null;
  // 역할 hook(useDialog)·useModalOverlay가 포커스 가두기를 Overlay context로 요청하므로 portal 안에서 부른다.
  return (
    <OverlayPortal isExiting={!context.state.isOpen}>
      <DialogContentInner {...props} context={context} backdropRef={backdropRef} />
    </OverlayPortal>
  );
}

interface DialogContentInnerProps extends DialogContentProps {
  readonly context: DialogContextValue;
  readonly backdropRef: RefObject<HTMLDivElement | null>;
}

/** DOM에 있는 동안만 portal 안에서 렌더한다. React Aria 오버레이 hook은 요소가 있다고 보고 동작한다. */
function DialogContentInner({
  context,
  backdropRef,
  size = "md",
  closeLabel = "닫기",
  ref,
  className,
  children,
  ...props
}: DialogContentInnerProps): ReactElement {
  const { state, triggerRef, contentId, triggerId, alert } = context;
  const dialogRef = useRef<HTMLDivElement>(null);
  const [titleId, setTitleId] = useState<string | null>(null);
  const [descriptionId, setDescriptionId] = useState<string | null>(null);
  useOverlayTheme(triggerRef, backdropRef);
  // Esc로 닫기, 바깥(막) 누름으로 닫기(AlertDialog는 아님), 바깥 inert, 스크롤 잠금, 포커스 가두기 요청.
  const { modalProps, underlayProps } = useModalOverlay(
    { isDismissable: !alert },
    state,
    dialogRef,
  );
  // 이름: aria-labelledby > aria-label > DialogTitle > 트리거 글자(react-aria-components Dialog의 fallback과 같다).
  const labelledBy =
    props["aria-labelledby"] ??
    (props["aria-label"] ? undefined : (titleId ?? triggerId ?? undefined));
  const describedBy = props["aria-describedby"] ?? descriptionId ?? undefined;
  const { dialogProps } = useDialog(
    {
      role: alert ? "alertdialog" : "dialog",
      "aria-label": props["aria-label"],
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
    },
    dialogRef,
  );
  // AlertDialog는 열릴 때 첫 조작 요소(가장 덜 위험한 동작을 앞에 둔다)로 포커스를 옮긴다(APG Alert Dialog).
  // useDialog가 먼저(위 effect) Dialog 요소에 포커스를 주므로, 그대로 Dialog 요소에 있을 때만 옮긴다(autoFocus 요소가 있으면 둔다).
  const focusManager = useFocusManager();
  useEffect(() => {
    if (alert && document.activeElement === dialogRef.current) {
      focusManager?.focusFirst({ tabbable: true });
    }
    // 열릴 때 한 번만 옮긴다.
  }, []);
  const mergedRef = useMemo(() => mergeRefs(ref, dialogRef), [ref]);
  const parts = useMemo<DialogPartsContextValue>(
    () => ({ alert, setTitleId, setDescriptionId }),
    [alert],
  );
  const open = state.isOpen ? "" : undefined;

  return (
    <div {...underlayProps} ref={backdropRef} data-open={open} className={backdropClass}>
      <div
        {...mergeProps(props, modalProps, dialogProps)}
        id={contentId}
        ref={mergedRef}
        data-open={open}
        className={cn(contentClass, sizeClass[size], className)}
      >
        <DialogPartsContext value={parts}>{children}</DialogPartsContext>
        {!alert && (
          <IconButton
            aria-label={closeLabel}
            variant="ghost"
            color="neutral"
            size="sm"
            onClick={state.close}
            className="absolute end-5 top-5"
          >
            <XIcon />
          </IconButton>
        )}
      </div>
    </div>
  );
}

/** 부분 요소의 id를 정하고 열린 동안 dialog에 알린다. */
function usePartId(id: string | undefined, register: (id: string | null) => void): string {
  const generated = useId();
  const resolved = id ?? generated;
  useLayoutEffect(() => {
    register(resolved);
    return () => register(null);
  }, [resolved, register]);
  return resolved;
}

export type DialogTitleProps = ComponentProps<"h2">;

/**
 * Dialog 제목(`<h2>`, `text-heading-sm`). 있으면 dialog의 `aria-labelledby`가 가리켜 이름이 된다.
 * Dialog에서는 끝쪽 닫기 버튼과 겹치지 않게 끝 여백(36px)을 둔다.
 */
export function DialogTitle({ id, className, ...props }: DialogTitleProps): ReactElement {
  const { alert, setTitleId } = useDialogPartsContext("DialogTitle");
  const resolvedId = usePartId(id, setTitleId);
  return (
    <h2
      {...props}
      id={resolvedId}
      className={cn("text-heading-sm text-default", !alert && "pe-9", className)}
    />
  );
}

export type DialogDescriptionProps = ComponentProps<"p">;

/**
 * Dialog 설명(`<p>`, `text-muted`). 있으면 dialog의 `aria-describedby`가 가리킨다. AlertDialog에서는 알릴 내용을 여기에 쓴다.
 * 목록·여러 문단처럼 구조가 있는 내용은 한 줄로 읽히므로 이 요소 밖에 둔다(APG Dialog).
 */
export function DialogDescription({
  id,
  className,
  ...props
}: DialogDescriptionProps): ReactElement {
  const { setDescriptionId } = useDialogPartsContext("DialogDescription");
  const resolvedId = usePartId(id, setDescriptionId);
  return <p {...props} id={resolvedId} className={cn("text-body-md text-muted", className)} />;
}

export type DialogFooterProps = ComponentProps<"div">;

/** 동작 버튼 줄. 끝쪽에 맞추고 버튼 사이는 8px이다. 앞에 덜 위험한 동작(취소)을, 끝에 주 동작을 둔다. */
export function DialogFooter({ className, ...props }: DialogFooterProps): ReactElement {
  return <div {...props} className={cn("mt-2 flex flex-wrap justify-end gap-2", className)} />;
}

export interface DialogCloseProps extends ComponentProps<"button"> {
  /**
   * 다른 요소로 렌더한다. 예: `render={<Button variant="ghost" color="neutral" />}`.
   * 기본은 class 없는 `<button type="button">`이다.
   */
  render?: ReactElement;
}

/**
 * 누르면 Dialog를 닫는 버튼. `onClick`을 먼저 부르고, 그 안에서 `event.preventDefault()`를 부르면 닫지 않는다.
 * 닫히면 포커스는 열기 전 요소로 돌아간다.
 */
export function DialogClose({
  render,
  onClick,
  className,
  ...props
}: DialogCloseProps): ReactElement {
  const { state } = useDialogContext("DialogClose");
  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    onClick?.(event);
    if (!event.defaultPrevented) state.close();
  };
  const merged = { ...props, onClick: handleClick, className };
  if (!render) return createElement("button", { type: "button", ...merged });
  return renderElement({ defaultElement: "button", render, baseClassName: "", props: merged });
}
