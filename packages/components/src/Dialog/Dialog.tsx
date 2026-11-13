"use client";
// 화면 가운데에 뜨는 모달 Dialog(tide-v0-impl 티켓 30). React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useOverlayTrigger, usePress, useModalOverlay, useDialog, useFocusManager, mergeProps,
// mergeRefs), react-stately 3.51.0(useOverlayTriggerState). portal·DOM에서 빼는 시점·Theme은 오버레이 공통 부분
// (_internal/components/OverlayPortal.tsx, _internal/constants/overlayClass.ts, ADR 0018)을 쓴다. 접근성 동작은 WAI-ARIA APG Dialog(Modal)·Alert Dialog 패턴을 따른다.
//
// 구조:
// - `Dialog`: 열림 상태만 갖는다(DOM 없음). `open`/`defaultOpen`/`onOpenChange(open)`. AlertDialog.tsx의 `AlertDialog`는
//   같은 상태에 「alert」 표시만 더한 얇은 변형이다.
// - `DialogTrigger`: 기본 `<button type="button">`. 누르면 연다. `render={<Button />}`로 Tide Button 모양을 쓴다.
// - `DialogContent`: `document.body`로 portal한 바깥 막(`bg-overlay`, `z-modal`) 안의 `role="dialog"` 요소.
//   열리면 포커스가 안으로 오고 Tab은 안에서 돌며, Esc·바깥 막 누름·닫기 버튼으로 닫히면 포커스가 열기 전 요소로 돌아온다.
//   열린 동안 바깥은 `inert`이고 페이지 스크롤이 잠긴다(useModalOverlay).
// - `DialogTitle`(`<h2>`)·`DialogDescription`(`<p>`): 있으면 dialog의 `aria-labelledby`·`aria-describedby`가 가리킨다.
// - `DialogFooter`: 동작 버튼 줄. `DialogClose`: 누르면 닫는 버튼(`render`로 Button 모양).

import type { ReactElement } from "react";

import { DialogRoot, type DialogProps } from "../_internal/components/DialogRoot.tsx";

export type { DialogProps } from "../_internal/components/DialogRoot.tsx";

/**
 * 트리거와 내용을 잇는 열림 상태. DOM 요소를 만들지 않는다.
 * 안에 `DialogTrigger`(없어도 된다. `open`으로 제어해 Menu 항목 등에서 열 수 있다)와 `DialogContent`를 둔다.
 */
export function Dialog(props: DialogProps): ReactElement {
  return <DialogRoot {...props} alert={false} />;
}
