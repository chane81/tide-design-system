"use client";
import { XIcon } from "@tide-design/icons";
import { useEffect, useRef, type ReactElement } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고: Vite 사전 번들 목록이 바뀌지 않는다).
import { useToast } from "react-aria";
import type { QueuedToast, ToastState } from "react-stately";

import {
  alertCloseClass,
  alertContentClass,
  alertDescriptionClass,
  alertIconClass,
  alertTitleClass,
} from "../../_internal/constants/alertClass.ts";
import { useOverlayPresence } from "../../_internal/hooks/useOverlayPresence.ts";
import { alertStatusIcon } from "../../_internal/libs/alertStatusIcon.ts";
import { Button } from "../../Button/Button.tsx";
import { IconButton } from "../../IconButton/IconButton.tsx";
import { toastClass } from "../constants/toastClass.ts";
import type { ToastContent } from "../types.ts";

export interface ToastItemProps {
  readonly toast: QueuedToast<ToastContent>;
  readonly open: boolean;
  readonly state: ToastState<ToastContent>;
  readonly onExited: (key: string) => void;
}

export function ToastItem({ toast, open, state, onExited }: ToastItemProps): ReactElement {
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
      // 퇴장 중에는 상호작용을 막는다. React 19는 inert를 boolean 속성으로 다룬다(false면 속성을 뺀다).
      inert={!open}
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
            color="neutral"
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
        color="neutral"
        size="xs"
        onClick={close}
        className={alertCloseClass}
      >
        <XIcon />
      </IconButton>
    </div>
  );
}
