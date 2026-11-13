"use client";
import { useLayoutEffect, type ReactElement } from "react";
// 서브패스 말고 루트 entry에서 import한다. Vite 사전 번들 목록이 바뀌지 않게 한다.
import { useListBox } from "react-aria";

import { ListBoxNodes } from "../../_internal/components/ListBoxNodes/ListBoxNodes";
import { listPopupClass } from "../../_internal/constants/listClass";
import { useOverlayTheme } from "../../_internal/hooks/useOverlayTheme";
import { usePopoverOverlay } from "../../_internal/hooks/usePopoverOverlay";
import { emptyClass } from "../constants/comboboxClass";
import type { ComboboxPopoverProps } from "./ComboboxPopover";

export function ComboboxPopoverInner({
  state,
  inputRef,
  popoverRef,
  listBoxRef,
  listBoxProps,
  emptyMessage,
}: ComboboxPopoverProps): ReactElement {
  useOverlayTheme(inputRef, popoverRef);
  // 위치 hook보다 먼저 붙인다. 화면 폭 − 24px을 넘으면 옵션 스크롤이 문서를 움직여 목록이 닫힌다(react-aria 3.53.1
  // useCloseOnScroll).
  useLayoutEffect(() => {
    const popover = popoverRef.current;
    const width = inputRef.current?.offsetWidth;
    if (popover && width) popover.style.minWidth = `min(${width}px, 100vw - 24px)`;
  }, [inputRef, popoverRef]);
  // 입력이 목록 바깥이라 non-modal이다. 포커스가 입력을 떠나면 useComboBox가 닫는다.
  const { overlayProps } = usePopoverOverlay(
    { triggerRef: inputRef, popoverRef, placement: "bottom start", offset: 4, nonModal: true },
    state,
  );
  const { listBoxProps: listProps } = useListBox(listBoxProps, state, listBoxRef);
  const empty = state.collection.size === 0;

  return (
    <div
      {...overlayProps}
      ref={popoverRef}
      data-open={state.isOpen ? "" : undefined}
      className={listPopupClass}
    >
      <div {...listProps} ref={listBoxRef} className="outline-none">
        <ListBoxNodes state={state} />
      </div>
      {empty && <div className={emptyClass}>{emptyMessage}</div>}
    </div>
  );
}
