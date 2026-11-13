import type { ButtonProps } from "../../Button/Button";

/** 번호·이전/다음 항목의 고정 size(32px). */
export const itemSize = "sm" satisfies ButtonProps["size"];

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
export const listClass = "flex flex-wrap items-center gap-1";

export const linkClass = "min-w-8 px-2 tabular-nums";

export const ellipsisClass = "inline-flex size-8 items-center justify-center text-muted";
