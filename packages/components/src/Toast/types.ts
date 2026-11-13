import type { MouseEvent, ReactNode } from "react";
import type { QueuedToast } from "react-stately";

import type { Role } from "../types";

/** Toast의 액션 버튼 */
export interface ToastAction {
  /** 버튼 글자. 예: 「되돌리기」, 「다시 시도」 */
  label: ReactNode;
  /** 누르면 부른 뒤 Toast를 닫는다. `event.preventDefault()`를 부르면 닫지 않는다. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

/** `queue.add`에 넘기는 Toast 하나 */
export interface ToastOptions {
  /** 제목. Toast의 이름이 되고 굵은 글자로 보인다. */
  title: ReactNode;
  /** 본문. Toast의 설명이 된다. */
  description?: ReactNode;
  /**
   * Role(Tide Role + 앱 Role). 기본값 `info`. 상태 아이콘과 그 색을 정하고, 버튼은 neutral 고정이다.
   * `danger`는 자동으로 닫지 않는다. 색 계열 이름은 받지 않는다.
   */
  color?: Role;
  /** 액션 버튼. 있으면 자동으로 닫지 않는다. */
  action?: ToastAction;
  /**
   * 자동으로 닫을 시간(ms). 기본값 5000, 더 짧은 값은 5000으로 올린다. `null`이면 자동으로 닫지 않는다.
   * 액션이 있거나 `danger`면 닫지 않고, 영역에 hover·포커스가 있는 동안 멈춘다.
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
export type ToastContent = Omit<ToastOptions, "timeout" | "onClose">;

/** 그리는 Toast 하나. `open`이 `false`면 퇴장 중이다. */
export interface Entry {
  readonly toast: QueuedToast<ToastContent>;
  readonly open: boolean;
}
