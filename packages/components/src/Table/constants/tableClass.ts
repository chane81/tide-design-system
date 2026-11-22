// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
export const tableClass = "w-full border-collapse text-body-sm text-default";

// hover는 tbody 바로 아래 행에만 주고, 목록 항목처럼 글자·배경 색만 전환한다(ADR 0040).
// `:where`로 특이도를 낮춰 사용자 className의 `hover:bg-transparent`가 CSS 순서와 상관없이 이긴다.
export const rowClass =
  "border-b border-default transition-[color,background-color] [:where(tbody>&)]:hover:bg-hover";

// 머리 칸 글자색은 본문과 같은 text-default라 hover 행 안에서도 등록된 대비 쌍(× bg-hover) 안에 있다.
export const headerCellClass = "px-3 py-2.5 text-start align-middle text-label-md";
export const cellClass = "px-3 py-2.5 text-start align-middle";
