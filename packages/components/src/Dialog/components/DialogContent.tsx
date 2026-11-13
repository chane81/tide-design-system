"use client";
import { useRef, type ComponentProps, type ReactElement } from "react";

import { OverlayPortal } from "../../_internal/components/OverlayPortal.tsx";
import { useDialogContext } from "../../_internal/hooks/useDialogContext.ts";
import { useOverlayPresence } from "../../_internal/hooks/useOverlayPresence.ts";
import type { DialogSize } from "../types.ts";
import { DialogContentInner } from "./DialogContentInner.tsx";

export interface DialogContentProps extends Omit<ComponentProps<"div">, "id" | "role"> {
  /** 최대 폭. 기본값은 `md`(32rem)다. 화면이 좁으면 화면 폭 − 32px까지 줄어든다. */
  size?: DialogSize;
  /** 닫기 버튼(IconButton)의 이름. 기본값은 `"닫기"`다. AlertDialog에는 닫기 버튼이 없어 쓰지 않는다. */
  closeLabel?: string;
}

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
