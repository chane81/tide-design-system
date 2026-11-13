import { ToastQueue as StatelyToastQueue } from "react-stately";

import type { ToastContent, ToastOptions, ToastQueueOptions } from "../types";

/** 자동으로 닫히는 Toast가 보이는 가장 짧은 시간(ms). React Aria 문서가 권하는 최소값과 같다. */
const minTimeout = 5000;

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

/** Toast 큐. 모듈에서 `new ToastQueue()`로 만들어 `ToastRegion`에 넘기고, 어디서든 `add`로 띄운다. */
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

export function queueOf(queue: ToastQueue): StatelyToastQueue<ToastContent> {
  const stately = statelyQueues.get(queue);
  if (!stately) throw new Error("ToastRegion의 queue에는 new ToastQueue()로 만든 큐를 넘긴다.");

  return stately;
}
