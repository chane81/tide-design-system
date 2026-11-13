"use client";
import type { ComponentProps, ReactElement } from "react";

import { cn } from "../../_internal/libs/cn.ts";
import { useDialogPartsContext } from "../hooks/useDialogPartsContext.ts";
import { usePartId } from "../hooks/usePartId.ts";

export type DialogTitleProps = ComponentProps<"h2">;

/**
 * Dialog 제목(`<h2>`, `text-heading-sm`). 있으면 dialog의 `aria-labelledby`가 가리켜 이름이 된다.
 * Dialog에서는 끝쪽 닫기 버튼과 겹치지 않게 끝 여백(36px)을 둔다.
 */
export function DialogTitle({ id, className, ...props }: DialogTitleProps): ReactElement {
  const { alert, setTitleId } = useDialogPartsContext("DialogTitle");
  const resolvedId = usePartId(id, setTitleId);
  return (
    <h2
      {...props}
      id={resolvedId}
      className={cn("text-heading-sm text-default", !alert && "pe-9", className)}
    />
  );
}
