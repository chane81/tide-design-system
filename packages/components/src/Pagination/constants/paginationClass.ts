import type { ButtonProps } from "../../Button/Button";

/** 페이지 번호·이전/다음 항목의 고정 size. 둘 다 32×32px다(24×24 이상). */
export const itemSize = "sm" satisfies ButtonProps["size"];

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// - 목록은 가로로 늘어놓고 항목 사이는 4px다. 좁으면 줄을 바꾼다.
export const listClass = "flex flex-wrap items-center gap-1";

// - 번호는 정사각형부터 시작한다(최소 폭 32px). 두 자리 이상이면 가로 여백 8px로 늘어난다. 숫자 폭은 같게 둔다.
export const linkClass = "min-w-8 px-2 tabular-nums";

// - 생략 표시는 번호와 같은 32×32px 칸에 「…」 아이콘(16px)을 둔다. 글자색은 text-muted다(아이콘은 장식용).
export const ellipsisClass = "inline-flex size-8 items-center justify-center text-muted";
