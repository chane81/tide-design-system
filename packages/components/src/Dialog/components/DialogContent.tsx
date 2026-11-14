"use client";
import { useRef, type ComponentProps, type ReactElement } from "react";

import { OverlayPortal } from "../../_internal/components/OverlayPortal";
import { useDialogContext } from "../../_internal/hooks/useDialogContext";
import { useOverlayPresence } from "../../_internal/hooks/useOverlayPresence";
import type { DialogSize } from "../types";
import { DialogContentInner } from "./DialogContentInner";

export interface DialogContentOwnProps {
  /** 최대 폭. 기본값은 `md`(32rem)다. 화면이 좁으면 화면 폭 − 32px까지 줄어든다. */
  size?: DialogSize;
  /** 닫기 버튼(IconButton)의 이름. 기본값은 `"닫기"`다. AlertDialog에는 닫기 버튼이 없어 쓰지 않는다. */
  closeLabel?: string;
}

export interface DialogContentProps
  extends
    DialogContentOwnProps,
    Omit<ComponentProps<"div">, keyof DialogContentOwnProps | "id" | "role"> {}

/**
 * 화면 가운데 뜨는 모달 내용(`role="dialog"`, AlertDialog 안에서는 `alertdialog`). 열릴 때만 `document.body`에 portal한다.
 * Dialog는 끝 위쪽 닫기 버튼과 바깥 막 누름으로 닫히고, AlertDialog는 둘 다 없다(Esc는 닫는다).
 * Tide props: `size`, `closeLabel` ({@link DialogContentOwnProps}). 나머지는 `<div>` 속성.
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
