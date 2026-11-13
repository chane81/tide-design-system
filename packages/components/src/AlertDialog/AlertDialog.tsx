"use client";
// 위험한 동작을 확인받는 AlertDialog(tide-v0-impl 티켓 30). Dialog 위의 얇은 변형이다(Dialog.tsx).
// 근거: WAI-ARIA APG Alert and Message Dialogs 패턴, react-aria 3.53.1 `useDialog`의 `role: "alertdialog"`.
//
// Dialog와 다른 점은 셋이고 나머지(트리거, 바깥 inert, 스크롤 잠금, 포커스 가두기·복귀, Esc 닫기, motion)는 같다.
// - 역할이 `alertdialog`다. `DialogDescription`(알릴 내용)을 `aria-describedby`로 잇는다.
// - 응답을 받아야 하므로 바깥 막을 눌러도 닫히지 않고 끝 위쪽 닫기 버튼이 없다. 취소 버튼이나 Esc로 닫는다.
// - 열리면 첫 조작 요소에 포커스가 온다. 그래서 가장 덜 위험한 동작(취소)을 앞에 둔다(APG Alert Dialog 예시).
// 부분 Component는 Dialog의 것(`DialogTrigger`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogFooter`,
// `DialogClose`)을 그대로 쓴다.

import type { ReactElement } from "react";

import { DialogRoot, type DialogProps } from "../Dialog/Dialog.tsx";

export type AlertDialogProps = DialogProps;

/**
 * 삭제 확인처럼 응답이 꼭 필요한 모달의 열림 상태. DOM 요소를 만들지 않는다.
 * 안에 `DialogTrigger`와 `DialogContent`를 두면 내용이 `role="alertdialog"`가 된다.
 */
export function AlertDialog(props: AlertDialogProps): ReactElement {
  return <DialogRoot {...props} alert />;
}
