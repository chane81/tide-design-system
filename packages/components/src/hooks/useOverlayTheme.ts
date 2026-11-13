"use client";
// 트리거의 Theme을 portal로 나간 오버레이에 옮기는 hook(tide-v0-impl 티켓 25).
// 오버레이를 짜는 순서는 components/OverlayPortal.tsx 머리 주석을 본다.

import { useLayoutEffect, type RefObject } from "react";

/**
 * 트리거가 놓인 Theme(`data-theme`)을 portal로 나간 오버레이에 옮긴다. Theme을 `<html>`이 아닌 일부 영역에
 * 붙인 앱에서도 오버레이가 같은 색이 된다. 오버레이에 이미 `data-theme`이 있으면 두고, 트리거 위에 Theme이 없으면
 * 붙이지 않는다(`:root` 기본값을 따른다). 위치를 계산하기 전(첫 스타일 계산 전)에 붙도록 위치 hook보다 먼저 부른다.
 */
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
