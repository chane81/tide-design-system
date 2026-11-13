"use client";
// 목록 오버레이를 Tab에 닫는 hook(티켓 27에서 Menu 안에 두었다가 티켓 28에서 공통 모듈로 옮겼다).
// 오버레이를 짜는 순서는 components/OverlayPortal.tsx 머리 주석을 본다.

import { useEffect, type RefObject } from "react";

/**
 * 오버레이 안에서 Tab을 누르면 기본 동작을 막고 닫는다(포커스는 `OverlayPortal`의 FocusScope가 트리거로 돌린다).
 * 목록 오버레이(Menu, Select)가 쓴다(WAI-ARIA APG Menu Button·Select-Only Combobox: Tab은 목록을 닫는다).
 *
 * React Aria 목록 hook(useMenu·useListBox)은 Tab으로 닫지 않고, 항목의 keydown 처리가 전파를 멈추며 FocusScope가
 * document capture에서 Tab을 먼저 다룬다. 열린 동안 바깥은 inert라 브라우저 기본 Tab은 갈 곳이 없다. 그래서 그보다
 * 앞인 window capture에서 받는다.
 * 전파도 멈춘다. listbox(useListBox 안의 useSelectableCollection)는 Tab에서 포커스를 목록 안 요소로 옮기는데, 그러면
 * 닫힌 뒤 포커스가 트리거로 돌아오지 않았다(Select 테스트로 확인).
 */
export function useCloseOnTab(overlayRef: RefObject<HTMLElement | null>, close: () => void): void {
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key !== "Tab" || !overlayRef.current?.contains(event.target as Node)) return;
      event.preventDefault();
      event.stopPropagation();
      close();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [close, overlayRef]);
}
