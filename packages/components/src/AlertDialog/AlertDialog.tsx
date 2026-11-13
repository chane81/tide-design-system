"use client";
import type { ReactElement } from "react";

import { DialogRoot, type DialogProps } from "../_internal/components/DialogRoot";

export type AlertDialogProps = DialogProps;

/**
 * 삭제 확인처럼 응답이 꼭 필요한 모달의 열림 상태. DOM 요소를 만들지 않는다.
 * 안에 `DialogTrigger`와 `DialogContent`를 두면 내용이 `role="alertdialog"`가 된다.
 */
export function AlertDialog(props: AlertDialogProps): ReactElement {
  return <DialogRoot {...props} alert />;
}
