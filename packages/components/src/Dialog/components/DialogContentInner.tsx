"use client";
import { XIcon } from "@tide-design/icons";
import { useEffect, useMemo, useRef, useState, type ReactElement, type RefObject } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고: Vite 사전 번들 목록이 바뀌지 않는다).
import { mergeProps, mergeRefs, useDialog, useFocusManager, useModalOverlay } from "react-aria";

import type { DialogContextValue } from "../../_internal/hooks/useDialogContext.ts";
import { useOverlayTheme } from "../../_internal/hooks/useOverlayTheme.ts";
import { cn } from "../../_internal/libs/cn.ts";
import { IconButton } from "../../IconButton/IconButton.tsx";
import { backdropClass, contentClass, sizeClass } from "../constants/dialogClass.ts";
import {
  DialogPartsContext,
  type DialogPartsContextValue,
} from "../hooks/useDialogPartsContext.ts";
import type { DialogContentProps } from "./DialogContent.tsx";

export interface DialogContentInnerProps extends DialogContentProps {
  readonly context: DialogContextValue;
  readonly backdropRef: RefObject<HTMLDivElement | null>;
}

/** DOM에 있는 동안만 portal 안에서 렌더한다. React Aria 오버레이 hook은 요소가 있다고 보고 동작한다. */
export function DialogContentInner({
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
