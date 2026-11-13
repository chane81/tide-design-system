"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

/** 닫혀도 퇴장 전환(`getAnimations()`)이 끝날 때까지 DOM에 남긴다. DOM에 둘지를 돌려준다(ADR 0018). */
export function useOverlayPresence(isOpen: boolean, ref: RefObject<HTMLElement | null>): boolean {
  const [present, setPresent] = useState(isOpen);
  if (isOpen && !present) setPresent(true);

  useLayoutEffect(() => {
    if (isOpen || !present) return;
    const element = ref.current;
    if (!element || typeof element.getAnimations !== "function") {
      setPresent(false);

      return;
    }
    let cancelled = false;
    // 등장 중에 닫으면 앞 전환은 취소(reject)된다. 끝나든 취소되든 기다린 뒤 도는 전환이 없을 때까지 다시 확인한다.
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
