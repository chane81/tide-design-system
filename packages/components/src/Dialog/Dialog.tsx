"use client";
import type { ReactElement } from "react";

import { DialogRoot, type DialogProps } from "../_internal/components/DialogRoot";

export type { DialogProps } from "../_internal/components/DialogRoot";

/**
 * 트리거와 내용을 잇는 열림 상태. DOM 요소를 만들지 않는다.
 * 안에 `DialogTrigger`와 `DialogContent`를 둔다. 트리거 없이 `open`으로 제어해 열어도 된다.
 */
export function Dialog(props: DialogProps): ReactElement {
  return <DialogRoot {...props} alert={false} />;
}
