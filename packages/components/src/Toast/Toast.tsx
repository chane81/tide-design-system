"use client";
// 큐는 닫힌 Toast를 바로 빼므로, 퇴장 전환이 끝날 때까지 `open: false`로 남겼다가 뺀다(ADR 0018).

import { useCallback, useState, type ComponentProps, type ReactElement } from "react";
import { useToastQueue } from "react-stately";

import { OverlayPortal } from "../_internal/components/OverlayPortal";
import { Region } from "./components/Region";
import { mergeEntries } from "./libs/mergeEntries";
import { queueOf, type ToastQueue } from "./libs/toastQueue";
import type { Entry } from "./types";

export interface ToastRegionOwnProps {
  /** 그릴 큐(`new ToastQueue()`) */
  queue: ToastQueue;
  /** 영역(랜드마크) 이름. 기본값은 React Aria 번역 「N개 알림.」(locale을 따른다). */
  "aria-label"?: string;
}

export interface ToastRegionProps
  extends
    ToastRegionOwnProps,
    Omit<ComponentProps<"div">, keyof ToastRegionOwnProps | "children" | "role"> {}

/**
 * `ToastQueue`의 Toast를 그리는 영역. 앱에 하나 둔다(보통 레이아웃의 client Component 안).
 * Toast가 있을 때만 `document.body`에 portal한다.
 * Tide props: `queue`, `aria-label` ({@link ToastRegionOwnProps}). 나머지는 `<div>` 속성.
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
