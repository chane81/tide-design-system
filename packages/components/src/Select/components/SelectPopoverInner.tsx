"use client";
import { useLayoutEffect, useRef, type ReactElement, type RefObject } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { DismissButton, useListBox } from "react-aria";

import { ListBoxNodes } from "../../_internal/components/ListBoxNodes/ListBoxNodes";
import { listPopupClass } from "../../_internal/constants/listClass";
import { useCloseOnTab } from "../../_internal/hooks/useCloseOnTab";
import { useOverlayTheme } from "../../_internal/hooks/useOverlayTheme";
import { usePopoverOverlay } from "../../_internal/hooks/usePopoverOverlay";
import type { SelectPopoverProps } from "./SelectPopover";

export interface SelectPopoverInnerProps extends SelectPopoverProps {
  readonly popoverRef: RefObject<HTMLDivElement | null>;
}

/** 목록 표면과 그 안의 `role="listbox"`. listbox 자식은 option·group만 되므로 닫기 버튼은 표면에 둔다. */
export function SelectPopoverInner({
  state,
  triggerRef,
  menuProps,
  popoverRef,
}: SelectPopoverInnerProps): ReactElement {
  const listRef = useRef<HTMLDivElement>(null);
  useOverlayTheme(triggerRef, popoverRef);
  // 목록 폭이 트리거보다 좁지 않게 한다. 위치 hook보다 먼저 붙여야 위치 계산에 반영된다.
  useLayoutEffect(() => {
    const popover = popoverRef.current;
    const width = triggerRef.current?.offsetWidth;
    if (popover && width) popover.style.minWidth = `${width}px`;
  }, [triggerRef, popoverRef]);
  const { overlayProps } = usePopoverOverlay(
    { triggerRef, popoverRef, placement: "bottom start", offset: 4 },
    state,
  );
  const { listBoxProps } = useListBox(menuProps, state, listRef);
  useCloseOnTab(popoverRef, state.close);

  return (
    <div
      {...overlayProps}
      ref={popoverRef}
      data-open={state.isOpen ? "" : undefined}
      className={listPopupClass}
    >
      {/* 스크린리더 사용자가 Esc 없이 닫을 수 있는 숨은 버튼. Tab 순서에는 없다. */}
      <DismissButton onDismiss={state.close} />
      <div {...listBoxProps} ref={listRef} className="outline-none">
        <ListBoxNodes state={state} />
      </div>
      <DismissButton onDismiss={state.close} />
    </div>
  );
}
