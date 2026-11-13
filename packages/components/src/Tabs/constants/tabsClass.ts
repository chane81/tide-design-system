import type { TabsOrientation } from "../types";

// 루트 class(ADR 0005 손으로 쓴 map). 탭 목록과 패널 사이는 가로 16px, 세로 24px다.
export const tabsOrientationClass: Record<TabsOrientation, string> = {
  horizontal: "flex flex-col gap-4",
  vertical: "flex flex-row gap-6",
};

// 탭 목록: 장식용 `border-default` 1px 선 위에 탭이 놓인다. 가로는 아래, 세로는 끝쪽 선이다.
export const tabListOrientationClass: Record<TabsOrientation, string> = {
  horizontal: "flex shrink-0 gap-1 border-b border-default",
  vertical: "flex shrink-0 flex-col gap-1 border-e border-default",
};

// 탭(spec 「포커스 표시」·「motion 적용」):
// - 글자 `text-label-md`(14/20), 여백 세로 8px·가로 12px라 높이 36px. 바로 안의 아이콘(장식용)은 16px, 글자와 8px.
// - 색: 기본 `text-muted`, hover `text-default`, 고른 탭 `text-primary`, 비활성 `text-disabled` + `cursor-not-allowed`.
//   글자색은 반복되는 항목이라 transition 없이 바로 바뀐다.
// - 고른 표시(indicator): 탭 목록 선 위에 겹친 2px `border-primary` 막대(`::after`). 색만이 아니라 모양으로도 고른 탭이
//   보인다. 고르지 않은 탭은 막대가 투명(opacity 0)이다.
// - 막대 motion: opacity `fast`(150ms, out). 움직임 줄이기가 아니면 막대가 가운데에서 펼쳐진다(scale 0 → 1). 움직임
//   줄이기에서는 확대 없이 opacity만 바뀐다(spec 「reduced-motion에서는 이동·확대·blur를 opacity로 바꾼다」).
// - forced-colors: 막대 경계색은 브라우저가 CanvasText로 덮는다. 고른 탭이 분명하도록 시스템 강조색(Highlight)으로 고정한다.
// - 포커스: `focus-visible:focus-ring`(ring 2px, offset 2px, 조작 요소 radius md).
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

// 패널: 탭 다음 Tab 순서에 들어가므로 포커스 표시가 있다. 세로 배치에서는 남은 폭을 채운다.
export const tabPanelClass = "min-w-0 flex-1 rounded-md outline-none focus-visible:focus-ring";
