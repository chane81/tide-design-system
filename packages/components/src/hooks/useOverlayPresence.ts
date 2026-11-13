"use client";
// 오버레이를 퇴장 전환이 끝날 때까지 DOM에 남기는 hook(tide-v0-impl 티켓 25).
// 오버레이를 짜는 순서는 components/OverlayPortal.tsx 머리 주석을 본다.

import { useLayoutEffect, useState, type RefObject } from "react";

/**
 * 열림 상태가 꺼져도 퇴장 전환이 끝날 때까지 오버레이를 DOM에 남긴다. DOM에 둘지(`true`)를 돌려준다.
 *
 * 닫힌 뒤 요소의 `getAnimations()`(CSS transition 포함)가 모두 끝나면 뺀다. 전환이 없으면(지원하지 않는 브라우저,
 * 전환이 없는 오버레이) 바로 뺀다. 퇴장 중에 다시 열리면 빼지 않는다. React Aria hooks에는 퇴장을 기다리는 hook이
 * 없어서(react-aria-components의 `isExiting`은 Component 층에만 있다) 이 hook이 그 일을 한다.
 */
export function useOverlayPresence(isOpen: boolean, ref: RefObject<HTMLElement | null>): boolean {
  const [present, setPresent] = useState(isOpen);
  if (isOpen && !present) setPresent(true);

  useLayoutEffect(() => {
    if (isOpen || !present) return;
    const element = ref.current;
    // 요소가 없거나 getAnimations를 지원하지 않으면 바로 뺀다.
    if (!element || typeof element.getAnimations !== "function") {
      setPresent(false);
      return;
    }
    let cancelled = false;
    // getAnimations()는 스타일을 다시 계산하므로 data-open이 빠진 뒤의 퇴장 전환이 여기서 시작되어 잡힌다.
    // 등장 전환 중에 닫으면 전환이 바뀌며 앞의 것은 취소(finished reject)된다. 그래서 끝나든 취소되든 기다린 뒤
    // 도는 전환이 다시 없을 때까지 확인한다. 다시 열리면 effect가 정리되어(cancelled) 빼지 않는다.
    const waitForExit = (): void => {
      const animations = element.getAnimations();
      if (animations.length === 0) {
        setPresent(false);
        return;
      }
      void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
        if (!cancelled) waitForExit();
      });
    };
    waitForExit();
    return () => {
      cancelled = true;
    };
  }, [isOpen, present, ref]);

  return isOpen || present;
}
