"use client";
import type { ReactElement, ReactNode, RefObject } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import type { useComboBox } from "react-aria";
import type { ComboBoxState } from "react-stately";

import { OverlayPortal } from "../../_internal/components/OverlayPortal.tsx";
import { useOverlayPresence } from "../../_internal/hooks/useOverlayPresence.ts";
import { ComboboxPopoverInner } from "./ComboboxPopoverInner.tsx";

/** 목록 상태. Combobox가 고른 값의 node key는 옵션의 `value`(문자열)다. */
type ComboboxListState = ComboBoxState<object>;

type ComboboxListBoxProps = ReturnType<typeof useComboBox<object>>["listBoxProps"];

export interface ComboboxPopoverProps {
  readonly state: ComboboxListState;
  readonly inputRef: RefObject<HTMLInputElement | null>;
  readonly popoverRef: RefObject<HTMLDivElement | null>;
  readonly listBoxRef: RefObject<HTMLDivElement | null>;
  readonly listBoxProps: ComboboxListBoxProps;
  readonly emptyMessage: ReactNode;
}

/**
 * 목록을 DOM에 둘지 정하고 portal한다. 닫혀도 퇴장 전환이 끝날 때까지 남긴다(ADR 0018).
 * 포커스는 입력에 머물므로 FocusScope로 감싸지 않는다(`focusManagement={false}`). 감싸면 바깥 빈 곳을 눌러 포커스가
 * body로 간 뒤 목록이 빠질 때 FocusScope가 입력으로 포커스를 되돌린다(react-aria 3.53.1 FocusScope restoreFocus).
 */
export function ComboboxPopover(props: ComboboxPopoverProps): ReactElement | null {
  const present = useOverlayPresence(props.state.isOpen, props.popoverRef);
  if (!present) return null;

  return (
    <OverlayPortal isExiting={!props.state.isOpen} focusManagement={false}>
      <ComboboxPopoverInner {...props} />
    </OverlayPortal>
  );
}
