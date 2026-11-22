// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
// 루트는 배경을 두지 않아 놓인 표면 층을 그대로 쓴다.
export const accordionClass = "rounded-lg border border-default text-default";
export const itemClass = "not-first:border-t not-first:border-default";

// 목록 항목처럼 글자·배경 색만 전환한다. focus halo(box-shadow)는 빼 번쩍이지 않는다(ADR 0040).
export const triggerClass = [
  "group flex flex-1 cursor-pointer items-center gap-3 rounded-md px-4 py-3 text-start text-label-lg outline-none select-none transition-[color,background-color]",
  "enabled:hover:bg-hover focus-visible:focus-ring",
  "disabled:cursor-not-allowed disabled:text-disabled",
].join(" ");

// hover 배경 위 chevron은 `text-muted`의 대비 쌍이 없어 `text-default`로 바꾼다.
// forced-colors는 svg `color`를 시스템 색으로 덮지 않아 `currentColor`로 버튼 글자색을 따른다.
// `motion-safe:`가 transition-property를 통째로 덮으므로 color를 거기에도 적는다.
export const chevronClass =
  "ms-auto shrink-0 text-muted group-hover:group-enabled:text-default group-disabled:text-disabled group-aria-expanded:rotate-180 transition-[color] motion-safe:transition-[color,rotate] forced-colors:text-current forced-colors:group-disabled:text-current";

// 닫힌 패널은 `hidden="until-found"`라 display: none이 아니어서 상자가 남는다. 여백을 0으로 둔다.
export const panelClass = "px-4 pb-4 text-body-md [&[hidden]]:p-0";
