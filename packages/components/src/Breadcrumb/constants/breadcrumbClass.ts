// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
export const listClass = "flex flex-wrap items-center gap-1.5 text-body-sm text-muted";

// 첫 항목의 구분자는 `li:first-child > &` 선택자로 숨긴다.
export const itemClass = "inline-flex items-center gap-1.5";
export const separatorClass = "size-4 shrink-0 [li:first-child>&]:hidden";

// 탐색 영역 안이어도 색만으로 구분하지 않게 밑줄을 둔다(WCAG 1.4.1).
export const linkClass =
  "cursor-pointer rounded-sm underline decoration-1 underline-offset-2 hover:text-default hover:decoration-2 focus-visible:focus-ring";

export const currentClass = "text-label-md text-default";
