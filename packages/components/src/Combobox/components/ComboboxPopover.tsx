"use client";
import type { ReactElement, ReactNode, RefObject } from "react";
// 서브패스 말고 루트 entry에서 import한다. Vite 사전 번들 목록이 바뀌지 않게 한다.
import type { useComboBox } from "react-aria";
import type { ComboBoxState } from "react-stately";

import { OverlayPortal } from "../../_internal/components/OverlayPortal";
import { useOverlayPresence } from "../../_internal/hooks/useOverlayPresence";
import { ComboboxPopoverInner } from "./ComboboxPopoverInner";

/** node key는 옵션의 `value`(문자열)다. */
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

// FocusScope로 감싸면 바깥을 눌러 포커스가 body로 간 뒤 목록이 빠질 때 입력으로 포커스를 되돌린다(react-aria 3.53.1).
export function ComboboxPopover(props: ComboboxPopoverProps): ReactElement | null {
  const present = useOverlayPresence(props.state.isOpen, props.popoverRef);
  if (!present) return null;

  return (
    <OverlayPortal isExiting={!props.state.isOpen} focusManagement={false}>
      <ComboboxPopoverInner {...props} />
    </OverlayPortal>
  );
}
