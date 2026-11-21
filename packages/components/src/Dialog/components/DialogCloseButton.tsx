"use client";
import { XIcon } from "@tide-design/icons";
import type { ReactElement } from "react";

import { useDialogContext } from "../../_internal/hooks/useDialogContext";
import { IconButton } from "../../IconButton/IconButton";

export interface DialogCloseButtonProps {
  readonly label: string;
  readonly className: string;
}

/** Dialog 끝 위쪽의 아이콘 닫기 버튼. */
export function DialogCloseButton({ label, className }: DialogCloseButtonProps): ReactElement {
  const { state } = useDialogContext("DialogCloseButton");

  return (
    <IconButton
      aria-label={label}
      variant="ghost"
      color="neutral"
      size="sm"
      onClick={state.close}
      className={className}
    >
      <XIcon />
    </IconButton>
  );
}
