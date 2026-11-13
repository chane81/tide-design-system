"use client";
// Dialog·AlertDialog의 열림 상태를 부분 Component(DialogTrigger·DialogContent·DialogClose)에 넘기는 context.
// 값은 components/DialogRoot.tsx가 만들고, 부분 Component(Dialog/Dialog.tsx)가 읽는다.

import { createContext, use, type Context, type RefObject } from "react";
import type { useOverlayTrigger } from "react-aria";
import type { OverlayTriggerState } from "react-stately";

export interface DialogContextValue {
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

export const DialogContext: Context<DialogContextValue | null> =
  createContext<DialogContextValue | null>(null);

/** Dialog나 AlertDialog 밖에서 부르면 `part` 이름을 담아 던진다. */
export function useDialogContext(part: string): DialogContextValue {
  const context = use(DialogContext);
  if (!context) throw new Error(`${part}는 Dialog나 AlertDialog 안에 둔다.`);
  return context;
}
