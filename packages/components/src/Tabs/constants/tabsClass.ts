import type { TabsOrientation, TabsShape } from "../types";

// class는 문자열 그대로 적는다(ADR 0005). Tailwind가 빌드 결과를 스캔한다.
export const tabsOrientationClass: Record<TabsOrientation, string> = {
  horizontal: "flex flex-col gap-4",
  vertical: "flex flex-row gap-6",
};

// 고른 표시를 재기 전(서버 렌더·숨은 채 마운트)에는 `data-measured`가 없어 고른 탭이 자기 표시로 보인다.
const unmeasuredFallback = "[&:not([data-measured])>[data-selected]]:after:opacity-100";

export const tabListClass: Record<TabsShape, Record<TabsOrientation, string>> = {
  underline: {
    horizontal: `relative flex shrink-0 gap-1 border-b border-default ${unmeasuredFallback}`,
    vertical: `relative flex shrink-0 flex-col gap-1 border-e border-default ${unmeasuredFallback}`,
  },
  rounded: {
    horizontal: `relative flex shrink-0 gap-1 self-start rounded-lg bg-neutral-subtle p-1 [&:not([data-measured])>[data-selected]]:bg-surface [&:not([data-measured])>[data-selected]]:shadow-sm ${unmeasuredFallback}`,
    vertical: `relative flex shrink-0 flex-col gap-1 self-start rounded-lg bg-neutral-subtle p-1 [&:not([data-measured])>[data-selected]]:bg-surface [&:not([data-measured])>[data-selected]]:shadow-sm ${unmeasuredFallback}`,
  },
};

// 글자색은 반복 항목이라 전환 없이 바로 바뀐다.
export const tabBaseClass = [
  "relative flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-label-md whitespace-nowrap text-muted outline-none select-none [&>svg]:size-4 [&>svg]:shrink-0",
  "hover:not-data-selected:enabled:text-default data-selected:text-primary focus-visible:focus-ring",
  "disabled:cursor-not-allowed disabled:text-disabled",
  "after:pointer-events-none after:absolute after:opacity-0",
].join(" ");

// 재기 전 고른 탭의 표시. 재고 나면 TabList의 TabIndicator가 맡는다.
// forced-colors는 경계색을 CanvasText로 덮으므로 Highlight로 고정한다.
export const tabFallbackClass: Record<TabsShape, Record<TabsOrientation, string>> = {
  underline: {
    horizontal:
      "after:inset-x-0 after:-bottom-px after:border-b-2 after:border-primary forced-colors:after:forced-color-adjust-none forced-colors:after:border-[Highlight]",
    vertical:
      "after:inset-y-0 after:-end-px after:border-e-2 after:border-primary forced-colors:after:forced-color-adjust-none forced-colors:after:border-[Highlight]",
  },
  // rounded는 바탕·그림자를 TabList가 붙이고, forced-colors에서는 바탕이 사라지므로 테두리로 보인다.
  rounded: {
    horizontal:
      "after:inset-0 after:hidden after:rounded-md after:border-2 forced-colors:after:block forced-colors:after:forced-color-adjust-none forced-colors:after:border-[Highlight]",
    vertical:
      "after:inset-0 after:hidden after:rounded-md after:border-2 forced-colors:after:block forced-colors:after:forced-color-adjust-none forced-colors:after:border-[Highlight]",
  },
};

// 재기 전에는 숨긴다. 첫 자리는 transition 없이 놓고(useTabIndicator), 고른 탭이 바뀔 때만 미끄러진다.
const indicatorBaseClass =
  "pointer-events-none invisible absolute [[data-measured]>&]:visible motion-safe:transition-[translate,width,height] motion-safe:duration-normal motion-safe:ease-out forced-colors:forced-color-adjust-none";

export const tabIndicatorClass: Record<TabsShape, Record<TabsOrientation, string>> = {
  underline: {
    horizontal: `${indicatorBaseClass} -bottom-px left-0 w-(--tab-indicator-width) translate-x-(--tab-indicator-x) border-b-2 border-primary forced-colors:border-[Highlight]`,
    vertical: `${indicatorBaseClass} top-0 -end-px h-(--tab-indicator-height) translate-y-(--tab-indicator-y) border-e-2 border-primary forced-colors:border-[Highlight]`,
  },
  // forced-colors에서 바탕을 남기면 시스템 글자색과 대비가 깨질 수 있어 바탕을 빼고 Highlight 테두리만 남긴다.
  rounded: {
    horizontal: `${indicatorBaseClass} top-0 left-0 h-(--tab-indicator-height) w-(--tab-indicator-width) translate-x-(--tab-indicator-x) translate-y-(--tab-indicator-y) rounded-md border border-raised bg-surface shadow-sm forced-colors:border-2 forced-colors:border-[Highlight] forced-colors:bg-transparent forced-colors:shadow-none`,
    vertical: `${indicatorBaseClass} top-0 left-0 h-(--tab-indicator-height) w-(--tab-indicator-width) translate-x-(--tab-indicator-x) translate-y-(--tab-indicator-y) rounded-md border border-raised bg-surface shadow-sm forced-colors:border-2 forced-colors:border-[Highlight] forced-colors:bg-transparent forced-colors:shadow-none`,
  },
};

// 패널은 탭 다음 Tab 순서에 들어가므로 포커스 표시가 있다.
export const tabPanelClass = "min-w-0 flex-1 rounded-md outline-none focus-visible:focus-ring";
