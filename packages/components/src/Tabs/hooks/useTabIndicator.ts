"use client";
import { useLayoutEffect, useRef, type RefObject } from "react";

interface Placement {
  readonly tab: string;
  readonly geometry: string;
}

const tabSelector = ':scope > [role="tab"]';

/**
 * 고른 탭의 위치·크기를 재어 `indicatorRef`에 CSS 변수(`--tab-indicator-x·y·width·height`)로 적는다.
 * 고른 탭이 바뀔 때만 미끄러지고, 첫 자리·크기 변화·숨었다 보일 때는 transition 없이 놓는다.
 */
export function useTabIndicator(
  listRef: RefObject<HTMLElement | null>,
  indicatorRef: RefObject<HTMLElement | null>,
): void {
  const placed = useRef<Placement | null>(null);

  // 탭 추가·글자 변경·고른 탭 변경이 모두 렌더를 거치므로 렌더마다 다시 잰다.
  useLayoutEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;

    const place = (): void => {
      const tab = list.querySelector<HTMLElement>(`${tabSelector}[aria-selected="true"]`);
      // display:none 조상 아래에서는 잴 수 없다. 보이게 되면 ResizeObserver가 다시 부른다.
      if (!tab || list.getClientRects().length === 0) {
        delete list.dataset["measured"];
        placed.current = null;

        return;
      }
      const listRect = list.getBoundingClientRect();
      const rect = tab.getBoundingClientRect();
      // absolute 기준은 padding box라 테두리를 빼고 스크롤을 더한다.
      const x = rect.left - listRect.left - list.clientLeft + list.scrollLeft;
      const y = rect.top - listRect.top - list.clientTop + list.scrollTop;
      const geometry = `${x} ${y} ${rect.width} ${rect.height}`;
      const previous = placed.current;
      if (previous?.tab === tab.id && previous.geometry === geometry) return;

      const slide = previous !== null && previous.tab !== tab.id;
      if (!slide) indicator.style.transition = "none";
      indicator.style.setProperty("--tab-indicator-x", `${x}px`);
      indicator.style.setProperty("--tab-indicator-y", `${y}px`);
      indicator.style.setProperty("--tab-indicator-width", `${rect.width}px`);
      indicator.style.setProperty("--tab-indicator-height", `${rect.height}px`);
      if (!slide) {
        // 스타일을 한 번 계산시켜 새 자리를 transition 없이 확정한 뒤 되돌린다.
        indicator.getBoundingClientRect();
        indicator.style.removeProperty("transition");
      }
      list.dataset["measured"] = "";
      placed.current = { tab: tab.id, geometry };
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(list);
    for (const tab of list.querySelectorAll(tabSelector)) observer.observe(tab);

    return () => observer.disconnect();
  });
}
