"use client";
import { useRef, type ReactElement, type RefObject } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import type { useSelect } from "react-aria";
import type { SelectState } from "react-stately";

import { OverlayPortal } from "../../_internal/components/OverlayPortal.tsx";
import { useOverlayPresence } from "../../_internal/hooks/useOverlayPresence.ts";
import { SelectPopoverInner } from "./SelectPopoverInner.tsx";

/** 목록 상태. Select가 고른 값의 node key는 옵션의 `value`(문자열)다. */
type SelectListState = SelectState<object>;

type SelectMenuProps = ReturnType<typeof useSelect<object>>["menuProps"];

export interface SelectPopoverProps {
  readonly state: SelectListState;
  readonly triggerRef: RefObject<HTMLButtonElement | null>;
  readonly menuProps: SelectMenuProps;
}

/** 목록을 DOM에 둘지 정하고 portal한다. 닫혀도 퇴장 전환이 끝날 때까지 남긴다(ADR 0018). */
export function SelectPopover(props: SelectPopoverProps): ReactElement | null {
  const popoverRef = useRef<HTMLDivElement>(null);
  const present = useOverlayPresence(props.state.isOpen, popoverRef);
  if (!present) return null;
  // 옵션에 포커스가 오므로 FocusScope로 감싸(focusManagement 기본값) 닫힐 때 트리거로 포커스를 돌려준다.
  return (
    <OverlayPortal isExiting={!props.state.isOpen}>
      <SelectPopoverInner {...props} popoverRef={popoverRef} />
    </OverlayPortal>
  );
}
