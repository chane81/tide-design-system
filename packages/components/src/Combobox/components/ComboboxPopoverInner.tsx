"use client";
import { useLayoutEffect, type ReactElement } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { useListBox } from "react-aria";

import { ListBoxNodes } from "../../_internal/components/ListBoxNodes/ListBoxNodes";
import { listPopupClass } from "../../_internal/constants/listClass";
import { useOverlayTheme } from "../../_internal/hooks/useOverlayTheme";
import { usePopoverOverlay } from "../../_internal/hooks/usePopoverOverlay";
import { emptyClass } from "../constants/comboboxClass";
import type { ComboboxPopoverProps } from "./ComboboxPopover";

/**
 * 목록 표면(`listPopupClass`)과 그 안의 `role="listbox"`. 입력 아래 시작 끝에 4px 떨어져 붙고(Select와 같다),
 * 폭은 입력보다 좁지 않다. 거른 결과가 없으면 listbox 뒤에 `emptyMessage`를 보인다.
 */
export function ComboboxPopoverInner({
  state,
  inputRef,
  popoverRef,
  listBoxRef,
  listBoxProps,
  emptyMessage,
}: ComboboxPopoverProps): ReactElement {
  useOverlayTheme(inputRef, popoverRef);
  // 목록 폭이 입력보다 좁지 않게 한다. 위치를 계산하기 전(위치 hook보다 먼저)에 붙인다(Select와 같다).
  // 다만 화면 폭에서 위치 여백(React Aria containerPadding 12px, 양쪽)을 뺀 것보다 넓지 않게 한다. 입력이 화면을 꽉
  // 채우면(모바일) 목록이 화면 밖으로 넘치고, 옵션을 화면에 보이려는 스크롤이 문서를 움직여 non-modal 목록이 닫힌다
  // (react-aria 3.53.1 useCloseOnScroll, 테스트로 확인).
  useLayoutEffect(() => {
    const popover = popoverRef.current;
    const width = inputRef.current?.offsetWidth;
    if (popover && width) popover.style.minWidth = `min(${width}px, 100vw - 24px)`;
  }, [inputRef, popoverRef]);
  // 입력이 목록 바깥이라 non-modal이다. 바깥을 inert로 막거나 바깥 누름으로 닫지 않고, 포커스가 입력을 떠나면
  // useComboBox가 닫는다. 보조기술에서는 useComboBox가 입력과 목록 밖을 숨긴다(aria-hidden).
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
