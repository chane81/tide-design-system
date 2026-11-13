"use client";

import { useEffect, type RefObject } from "react";

/**
 * Tab을 누르면 기본 동작을 막고 닫는다. FocusScope가 document capture에서 Tab을 먼저 다뤄 window capture에서 받는다.
 * 전파도 멈춘다. listbox가 Tab에 포커스를 옮기면 닫힌 뒤 트리거로 돌아오지 않는다(ADR 0018).
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
