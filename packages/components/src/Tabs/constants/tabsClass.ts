import type { TabsOrientation } from "../types";

// class는 문자열 그대로 적는다(ADR 0005). Tailwind가 빌드 결과를 스캔한다.
export const tabsOrientationClass: Record<TabsOrientation, string> = {
  horizontal: "flex flex-col gap-4",
  vertical: "flex flex-row gap-6",
};

export const tabListOrientationClass: Record<TabsOrientation, string> = {
  horizontal: "flex shrink-0 gap-1 border-b border-default",
  vertical: "flex shrink-0 flex-col gap-1 border-e border-default",
};

// 글자색은 반복 항목이라 전환 없이 바로 바뀐다. 고른 막대는 색만이 아니라 모양으로도 고른 탭을 보인다.
// forced-colors는 막대 경계색을 CanvasText로 덮으므로 Highlight로 고정한다.
export const tabBaseClass = [
  "relative flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-label-md whitespace-nowrap text-muted outline-none select-none [&>svg]:size-4 [&>svg]:shrink-0",
  "hover:not-data-selected:enabled:text-default data-selected:text-primary focus-visible:focus-ring",
  "disabled:cursor-not-allowed disabled:text-disabled",
  "after:pointer-events-none after:absolute after:border-primary after:opacity-0 after:transition-opacity data-selected:after:opacity-100",
  "forced-colors:after:forced-color-adjust-none forced-colors:after:border-[Highlight]",
].join(" ");

export const tabOrientationClass: Record<TabsOrientation, string> = {
  horizontal:
    "after:inset-x-0 after:-bottom-px after:border-b-2 motion-safe:after:scale-x-0 motion-safe:after:transition-[opacity,scale] motion-safe:data-selected:after:scale-x-100",
  vertical:
    "after:inset-y-0 after:-end-px after:border-e-2 motion-safe:after:scale-y-0 motion-safe:after:transition-[opacity,scale] motion-safe:data-selected:after:scale-y-100",
};

// 패널은 탭 다음 Tab 순서에 들어가므로 포커스 표시가 있다.
export const tabPanelClass = "min-w-0 flex-1 rounded-md outline-none focus-visible:focus-ring";
