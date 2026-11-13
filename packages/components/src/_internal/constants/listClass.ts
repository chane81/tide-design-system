// Menu·Select·Combobox 목록이 함께 쓴다. class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.

import { frequentMotionClass, overlaySurfaceClass } from "./overlayClass";

/** 요소에 `data-open`이 있어야 한다. padding 3px는 radius 중첩 규칙(8 = 4 + 3 + 1)이다. */
export const listPopupClass = `isolate z-popover min-w-40 max-w-80 overflow-auto p-[3px] outline-none ${overlaySurfaceClass} ${frequentMotionClass}`;

/**
 * 상태는 boolean `data-*`로 받고 `not-data-highlighted:`로 서로 빼 CSS 순서에 기대지 않는다.
 * highlight의 투명 outline은 forced-colors에서 위치를 남긴다. `outline-none`이 모양을 none으로 두어 `outline-solid`를 함께 쓴다.
 */
export const listItemClass = [
  "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-body-sm text-default outline-none select-none [&>svg]:size-4 [&>svg]:shrink-0",
  "hover:not-data-highlighted:not-data-disabled:bg-hover",
  "data-selected:not-data-highlighted:bg-neutral-subtle-active",
  "data-highlighted:bg-primary-subtle data-highlighted:text-primary data-highlighted:outline-2 data-highlighted:outline-solid data-highlighted:-outline-offset-2 data-highlighted:outline-transparent",
  "data-disabled:cursor-not-allowed data-disabled:text-disabled",
].join(" ");

/** 항목과 같은 가로 여백이라 글자 시작이 맞는다. */
export const listHeadingClass = "px-2 pt-1.5 pb-1 text-label-sm text-muted select-none";

export const listSeparatorClass = "my-1 h-0 border-t border-default";
