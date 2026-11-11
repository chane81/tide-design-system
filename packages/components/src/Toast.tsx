"use client";
// 잠깐 떠서 알리는 Toast(tide-v0-impl 티켓 34). React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useToastRegion, useToast, mergeProps, mergeRefs), react-stately 3.51.0
// (ToastQueue, useToastQueue). context7 `/websites/react-aria_adobe`(Toast·useToast)와 설치본 dist 소스로 확인했다.
// portal·DOM에서 빼는 시점·motion은 오버레이 공통 부분(overlay.tsx, overlay-style.ts, ADR 0018)을, 배치·아이콘·글자는
// Alert와 같은 내부 모듈(alert-style.ts)을 쓴다.
//
// 구조:
// - `ToastQueue`: Toast를 쌓는 큐. React 밖에 두어 어디서든 `queue.add({...})`로 띄운다. 한 번에 보이는 수
//   (`maxVisible`, 기본 3)를 넘는 Toast는 앞의 것이 닫힐 때까지 기다린다(react-stately `ToastQueue`).
//   자동 닫힘 시간은 여기서 정한다: 기본 5초, 5초보다 짧은 값은 5초로 올린다. 액션이 있거나 `danger`(오류)면
//   자동으로 닫지 않는다(WCAG 2.2.1, 2.2.2).
// - `ToastRegion`: 큐를 그리는 영역. Toast가 있을 때만 `document.body`에 portal한 `role="region"` 랜드마크
//   (이름 기본 「N개 알림.」, F6·Shift+F6로 오간다)이고 아래 오른쪽(끝쪽)에 `z-toast`로 쌓인다. 영역에 마우스를
//   올리거나 포커스가 들어오면 모든 Toast의 시간을 멈춘다(useToastRegion).
// - Toast 하나: `role="alertdialog"`(제목이 이름, 본문이 설명, Tab으로 닿는다) 안의 `role="alert"` 글자.
//   닫기 IconButton, 선택 액션 Button. 닫힌 Toast에 포커스가 있었으면 포커스가 옆 Toast로, 마지막이면 영역에
//   들어오기 전 요소로 돌아간다(useToastRegion).
//
// 퇴장 motion: react-stately 큐는 닫힌 Toast를 바로 목록에서 뺀다. 영역은 빠진 Toast를 퇴장 전환이 끝날 때까지
// `data-open` 없이 남겼다가 뺀다(useOverlayPresence). 퇴장 중인 Toast는 역할·tabIndex를 붙이지 않아 useToastRegion의
// 포커스 이동(`[role="alertdialog"]` 순서로 옆 Toast를 찾는다)과 스크린 리더에서 빠진다.

import { XIcon } from "@tide-tds/icons";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
// 루트 entry에서 import한다(Popover.tsx 참고: Vite 사전 번들 목록이 바뀌지 않는다).
import { mergeProps, mergeRefs, useToast, useToastRegion } from "react-aria";
import {
  ToastQueue as StatelyToastQueue,
  useToastQueue,
  type QueuedToast,
  type ToastState,
} from "react-stately";

import {
  alertCloseClass,
  alertContentClass,
  alertDescriptionClass,
  alertIconClass,
  alertLayoutClass,
  alertStatusIcon,
  alertTitleClass,
} from "./alert-style.ts";
import { Button } from "./Button.tsx";
import { cn } from "./cn.ts";
import { IconButton } from "./IconButton.tsx";
import { OverlayPortal, useOverlayPresence } from "./overlay.tsx";
import { overlaySurfaceClass, popoverMotionClass } from "./overlay-style.ts";
import type { Role } from "./types.ts";

/** 자동으로 닫히는 Toast가 보이는 가장 짧은 시간(ms). React Aria 문서가 권하는 최소값과 같다. */
const minTimeout = 5000;

/** Toast의 액션 버튼 */
export interface ToastAction {
  /** 버튼 글자. 예: 「되돌리기」, 「다시 시도」 */
  label: ReactNode;
  /**
   * 누르면 부른다. 부른 뒤 Toast를 닫는다. `event.preventDefault()`를 부르면 닫지 않는다.
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

/** `queue.add`에 넘기는 Toast 하나 */
export interface ToastOptions {
  /** 제목. Toast의 이름이 되고 굵은 글자로 보인다. */
  title: ReactNode;
  /** 본문. Toast의 설명이 된다. */
  description?: ReactNode;
  /**
   * Role. Tide Role 6개와 앱이 `RoleRegistry`에 더한 Role을 받는다. 기본값은 `info`다(Alert와 같다).
   * 상태 아이콘과 그 색, 닫기·액션 버튼 색을 정한다. `danger`(오류)는 자동으로 닫지 않는다.
   * 색 계열 이름(`blue` 등)은 받지 않는다(ADR 0016).
   */
  color?: Role;
  /** 액션 버튼. 있으면 자동으로 닫지 않는다. */
  action?: ToastAction;
  /**
   * 자동으로 닫을 시간(ms). 기본값은 5000이고, 더 짧은 값은 5000으로 올린다. `null`이면 자동으로 닫지 않는다.
   * 액션이 있거나 `color="danger"`면 이 값과 관계없이 자동으로 닫지 않는다.
   * 시간은 영역에 마우스를 올리거나 포커스가 있는 동안 멈춘다.
   */
  timeout?: number | null;
  /** 닫힐 때(닫기 버튼, 액션, 자동 닫힘, `queue.close`) 부른다. */
  onClose?: () => void;
  /** 닫기 버튼 이름. 기본값은 `"닫기"`다. */
  closeLabel?: string;
}

/** `new ToastQueue(options)`의 인자 */
export interface ToastQueueOptions {
  /** 한 번에 보이는 Toast 수. 넘는 Toast는 앞의 것이 닫힐 때까지 기다린다. 기본값은 3이다. */
  maxVisible?: number;
}

/** 큐 안에 저장하는 내용. 자동 닫힘 시간은 react-stately 큐가 따로 갖는다. */
type ToastContent = Omit<ToastOptions, "timeout" | "onClose">;

// 공개 클래스에 react-stately 큐를 드러내지 않으려고 모듈 안에서만 꺼낸다.
const statelyQueues = new WeakMap<ToastQueue, StatelyToastQueue<ToastContent>>();

/** 자동 닫힘 시간. `undefined`면 자동으로 닫지 않는다. */
function resolveTimeout(options: ToastOptions): number | undefined {
  if (options.action !== undefined || options.color === "danger") return undefined;
  const timeout = options.timeout === undefined ? minTimeout : options.timeout;
  // Infinity·NaN은 setTimeout에서 바로 끝나므로 자동 닫힘 없음으로 본다.
  if (timeout === null || !Number.isFinite(timeout)) return undefined;
  return Math.max(timeout, minTimeout);
}

/**
 * Toast 큐. React 밖(모듈)에서 만들어 `ToastRegion`에 넘기고, 어디서든 `add`로 띄운다.
 *
 * ```tsx
 * export const toasts = new ToastQueue();
 * toasts.add({ title: "저장했습니다" });
 * ```
 */
export class ToastQueue {
  constructor({ maxVisible = 3 }: ToastQueueOptions = {}) {
    statelyQueues.set(this, new StatelyToastQueue<ToastContent>({ maxVisibleToasts: maxVisible }));
  }

  /** Toast를 띄우고 key를 돌려준다. 새 Toast가 맨 앞(영역의 아래)에 온다. */
  add(options: ToastOptions): string {
    const { timeout: _timeout, onClose, ...content } = options;
    return queueOf(this).add(content, { timeout: resolveTimeout(options), onClose });
  }

  /** key의 Toast를 닫는다. */
  close(key: string): void {
    queueOf(this).close(key);
  }

  /** 모든 Toast를 닫는다. 기다리던 Toast도 빠진다. `onClose`는 부르지 않는다. */
  clear(): void {
    queueOf(this).clear();
  }
}

function queueOf(queue: ToastQueue): StatelyToastQueue<ToastContent> {
  const stately = statelyQueues.get(queue);
  if (!stately) throw new Error("ToastRegion의 queue에는 new ToastQueue()로 만든 큐를 넘긴다.");
  return stately;
}

export interface ToastRegionProps extends Omit<ComponentProps<"div">, "children" | "role"> {
  /** 그릴 큐(`new ToastQueue()`) */
  queue: ToastQueue;
  /**
   * 영역(랜드마크) 이름. 기본값은 React Aria 번역 「N개 알림.」(locale을 따른다)이다.
   */
  "aria-label"?: string;
}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// - 영역: 화면 아래 끝쪽(LTR이면 오른쪽)에서 16px 떨어져 고정한다. 폭은 화면 폭 − 32px, 최대 24rem(max-w-96)이다.
//   새 Toast가 아래(모서리 쪽)에 오도록 거꾸로 쌓는다(flex-col-reverse, DOM은 새것이 먼저라 Tab도 새것부터다).
//   쌓임은 z-toast(400)이고 isolate라 안의 겹침이 바깥 단계와 섞이지 않는다. F6로 영역에 포커스가 오면 focus-ring이다.
// - Toast: Alert 배치(아이콘·내용·닫기, 여백 16px, gap 12px)에 오버레이 표면(raised + shadow-md + radius lg +
//   border-raised)을 얹고 「가끔 씀」 motion(Popover와 같다)을 쓴다. 아래에서 떠오르므로 data-placement="top"이다
//   (트리거 위에 뜨는 Popover와 같은 방향: 4px 아래에서 올라오고, 퇴장은 2px 아래로).
//   글자는 text-default, 상태 아이콘만 역할 색(text-accent)이다.
const regionClass =
  "fixed end-4 bottom-4 isolate z-toast flex w-[calc(100%-2rem)] max-w-96 flex-col-reverse gap-2 rounded-lg outline-none focus-visible:focus-ring";
const toastClass = `${alertLayoutClass} ${overlaySurfaceClass} ${popoverMotionClass} outline-none focus-visible:focus-ring`;

/** 그리는 Toast 하나. `open`이 `false`면 퇴장 중이다. */
interface Entry {
  readonly toast: QueuedToast<ToastContent>;
  readonly open: boolean;
}

/** 보이는 Toast 목록에 퇴장 중인 Toast를 원래 자리에 끼워 넣는다. */
function mergeEntries(
  previous: readonly Entry[],
  visible: readonly QueuedToast<ToastContent>[],
): Entry[] {
  const visibleKeys = new Set(visible.map((toast) => toast.key));
  const next: Entry[] = visible.map((toast) => ({ toast, open: true }));
  previous.forEach((entry, index) => {
    if (visibleKeys.has(entry.toast.key)) return;
    next.splice(Math.min(index, next.length), 0, { toast: entry.toast, open: false });
  });
  return next;
}

/**
 * `ToastQueue`의 Toast를 그리는 영역. 앱에 하나 둔다(보통 레이아웃의 client Component 안).
 * Toast가 있을 때만 `document.body`에 portal하고, 없으면 아무것도 그리지 않는다.
 */
export function ToastRegion({ queue, ...props }: ToastRegionProps): ReactElement | null {
  const state = useToastQueue(queueOf(queue));
  const [entries, setEntries] = useState<Entry[]>(() =>
    state.visibleToasts.map((toast) => ({ toast, open: true })),
  );
  const [visible, setVisible] = useState(state.visibleToasts);
  // 렌더 중 상태 맞추기(React 문서 「Adjusting some state when a prop changes」).
  if (visible !== state.visibleToasts) {
    setVisible(state.visibleToasts);
    setEntries(mergeEntries(entries, state.visibleToasts));
  }

  const onExited = useCallback((key: string) => {
    setEntries((current) => current.filter((entry) => entry.open || entry.toast.key !== key));
  }, []);

  if (entries.length === 0) return null;
  return (
    <OverlayPortal isExiting={false} focusManagement={false}>
      <Region {...props} state={state} entries={entries} onExited={onExited} />
    </OverlayPortal>
  );
}

interface RegionProps extends Omit<ToastRegionProps, "queue"> {
  readonly state: ToastState<ToastContent>;
  readonly entries: readonly Entry[];
  readonly onExited: (key: string) => void;
}

function Region({
  state,
  entries,
  onExited,
  ref,
  className,
  "aria-label": ariaLabel,
  ...props
}: RegionProps): ReactElement {
  const regionRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMemo(() => mergeRefs(ref, regionRef), [ref]);
  // regionProps: role="region" 랜드마크·이름, hover·포커스 동안 시간 멈춤, 닫힌 Toast의 포커스 옮기기,
  // data-react-aria-top-layer(열린 모달 Popover·Dialog가 바깥을 inert로 막을 때 빠지고, 눌러도 그 오버레이를 닫지 않는다).
  const { regionProps } = useToastRegion({ "aria-label": ariaLabel }, state, regionRef);
  return (
    <div {...mergeProps(props, regionProps)} ref={mergedRef} className={cn(regionClass, className)}>
      {entries.map((entry) => (
        <ToastItem
          key={entry.toast.key}
          toast={entry.toast}
          open={entry.open}
          state={state}
          onExited={onExited}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  readonly toast: QueuedToast<ToastContent>;
  readonly open: boolean;
  readonly state: ToastState<ToastContent>;
  readonly onExited: (key: string) => void;
}

function ToastItem({ toast, open, state, onExited }: ToastItemProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const present = useOverlayPresence(open, ref);
  useEffect(() => {
    if (!present) onExited(toast.key);
  }, [present, onExited, toast.key]);

  // useToast: 자동 닫힘 타이머 시작(보일 때), alertdialog 역할·이름·설명, alert 역할 글자.
  const { toastProps, contentProps, titleProps, descriptionProps } = useToast(
    { toast },
    state,
    ref,
  );
  const { title, description, color = "info", action, closeLabel = "닫기" } = toast.content;
  const StatusIcon = alertStatusIcon(color);
  const close = (): void => state.close(toast.key);

  return (
    <div
      {...(open ? toastProps : {})}
      ref={ref}
      // 색은 항상 붙인다(기본 info). 바깥 data-color를 물려받지 않게 한다(ADR 0011).
      data-color={color}
      data-open={open ? "" : undefined}
      data-placement="top"
      className={toastClass}
    >
      {/* 아이콘은 장식용이다. 뜻은 제목·본문 글자가 전한다. */}
      <StatusIcon size={20} aria-hidden="true" className={`${alertIconClass} text-accent`} />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div {...(open ? contentProps : {})} className={alertContentClass}>
          <div {...titleProps} className={alertTitleClass}>
            {title}
          </div>
          {description !== undefined && (
            <div {...descriptionProps} className={alertDescriptionClass}>
              {description}
            </div>
          )}
        </div>
        {action !== undefined && (
          <Button
            variant="outline"
            color={color}
            size="sm"
            className="self-start"
            onClick={(event) => {
              action.onClick?.(event);
              if (!event.defaultPrevented) close();
            }}
          >
            {action.label}
          </Button>
        )}
      </div>
      <IconButton
        aria-label={closeLabel}
        variant="ghost"
        color={color}
        size="xs"
        onClick={close}
        className={alertCloseClass}
      >
        <XIcon />
      </IconButton>
    </div>
  );
}
