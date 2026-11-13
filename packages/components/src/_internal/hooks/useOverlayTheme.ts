"use client";

import { useLayoutEffect, type RefObject } from "react";

/** 트리거의 `data-theme`을 portal로 나간 오버레이에 옮긴다. 첫 스타일 계산 전에 붙도록 위치 hook보다 먼저 부른다. */
export function useOverlayTheme(
  triggerRef: RefObject<Element | null>,
  overlayRef: RefObject<HTMLElement | null>,
): void {
  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || overlay.hasAttribute("data-theme")) return;
    const theme = triggerRef.current?.closest("[data-theme]")?.getAttribute("data-theme");
    if (theme) overlay.setAttribute("data-theme", theme);
  }, [triggerRef, overlayRef]);
}
