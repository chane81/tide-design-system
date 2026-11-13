"use client";
// 잠깐 떠서 알리는 Toast(tide-v0-impl 티켓 34). React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useToastRegion, useToast, mergeProps, mergeRefs), react-stately 3.51.0
// (ToastQueue, useToastQueue). context7 `/websites/react-aria_adobe`(Toast·useToast)와 설치본 dist 소스로 확인했다.
// portal·DOM에서 빼는 시점·motion은 오버레이 공통 부분(_internal/components/OverlayPortal.tsx, _internal/constants/overlayClass.ts, ADR 0018)을, 배치·아이콘·글자는
// Alert와 같은 내부 모듈(_internal/constants/alertClass.ts, _internal/libs/alertStatusIcon.ts)을 쓴다.
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
// 포커스 이동(`[role="alertdialog"]` 순서로 옆 Toast를 찾는다)과 스크린 리더에서 빠진다. 또 `inert`를 붙여 안의
// 버튼(액션·닫기)에 Tab·누름이 닿지 않게 한다(티켓 43). 보이는 수(`maxVisible`)를 넘어 밀려난 Toast는 앞의 것이 닫히면
// 같은 key로 다시 보이므로, 그때는 `open`이 다시 참이 되어 `inert`가 풀린다.

import { useCallback, useState, type ComponentProps, type ReactElement } from "react";
import { useToastQueue } from "react-stately";

import { OverlayPortal } from "../_internal/components/OverlayPortal.tsx";
import { Region } from "./components/Region.tsx";
import { mergeEntries } from "./libs/mergeEntries.ts";
import { queueOf, type ToastQueue } from "./libs/toastQueue.ts";
import type { Entry } from "./types.ts";

export interface ToastRegionProps extends Omit<ComponentProps<"div">, "children" | "role"> {
  /** 그릴 큐(`new ToastQueue()`) */
  queue: ToastQueue;
  /**
   * 영역(랜드마크) 이름. 기본값은 React Aria 번역 「N개 알림.」(locale을 따른다)이다.
   */
  "aria-label"?: string;
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
