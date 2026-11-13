"use client";
import { useLayoutEffect, useRef, type ReactElement, type RefObject } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { DismissButton, useListBox } from "react-aria";

import { ListBoxNodes } from "../../_internal/components/ListBoxNodes/ListBoxNodes.tsx";
import { listPopupClass } from "../../_internal/constants/listClass.ts";
import { useCloseOnTab } from "../../_internal/hooks/useCloseOnTab.ts";
import { useOverlayTheme } from "../../_internal/hooks/useOverlayTheme.ts";
import { usePopoverOverlay } from "../../_internal/hooks/usePopoverOverlay.ts";
import type { SelectPopoverProps } from "./SelectPopover.tsx";

export interface SelectPopoverInnerProps extends SelectPopoverProps {
  readonly popoverRef: RefObject<HTMLDivElement | null>;
}

/**
 * 목록 표면(`listPopupClass`)과 그 안의 `role="listbox"`. 트리거 아래 시작 끝에 4px 떨어져 붙고(Menu와 같다),
 * 폭은 트리거보다 좁지 않다.
 */
export function SelectPopoverInner({
  state,
  triggerRef,
  menuProps,
  popoverRef,
}: SelectPopoverInnerProps): ReactElement {
  const listRef = useRef<HTMLDivElement>(null);
  useOverlayTheme(triggerRef, popoverRef);
  // 목록 폭이 트리거보다 좁지 않게 한다. 위치를 계산하기 전(위치 hook보다 먼저)에 붙인다(useOverlayTheme과 같다).
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
  // Tab은 목록을 닫고 포커스를 트리거로 돌린다(Menu와 같다, _internal/hooks/useCloseOnTab.ts).
  useCloseOnTab(popoverRef, state.close);

  return (
    <div
      {...overlayProps}
      ref={popoverRef}
      data-open={state.isOpen ? "" : undefined}
      className={listPopupClass}
    >
      {/* 스크린리더 사용자가 Esc 없이 닫을 수 있는 숨은 버튼(Popover와 같다). Tab 순서에는 없다. */}
      <DismissButton onDismiss={state.close} />
      <div {...listBoxProps} ref={listRef} className="outline-none">
        <ListBoxNodes state={state} />
      </div>
      <DismissButton onDismiss={state.close} />
    </div>
  );
}
