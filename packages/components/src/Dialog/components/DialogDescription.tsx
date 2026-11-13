"use client";
import type { ComponentProps, ReactElement } from "react";

import { cn } from "../../_internal/libs/cn.ts";
import { useDialogPartsContext } from "../hooks/useDialogPartsContext.ts";
import { usePartId } from "../hooks/usePartId.ts";

export type DialogDescriptionProps = ComponentProps<"p">;

/**
 * Dialog 설명(`<p>`, `text-muted`). 있으면 dialog의 `aria-describedby`가 가리킨다. AlertDialog에서는 알릴 내용을 여기에 쓴다.
 * 목록·여러 문단처럼 구조가 있는 내용은 한 줄로 읽히므로 이 요소 밖에 둔다(APG Dialog).
 */
export function DialogDescription({
  id,
  className,
  ...props
}: DialogDescriptionProps): ReactElement {
  const { setDescriptionId } = useDialogPartsContext("DialogDescription");
  const resolvedId = usePartId(id, setDescriptionId);

  return <p {...props} id={resolvedId} className={cn("text-body-md text-muted", className)} />;
}
