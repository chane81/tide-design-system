import type { QueuedToast } from "react-stately";

import type { Entry, ToastContent } from "../types.ts";

/** 보이는 Toast 목록에 퇴장 중인 Toast를 원래 자리에 끼워 넣는다. */
export function mergeEntries(
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
