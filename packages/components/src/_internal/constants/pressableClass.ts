import type { FillVariant } from "../../types";

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
// 색은 맵에 두지 않고 루트의 data-color가 accent 슬롯을 고른다(ADR 0011). 앱 Role이 늘어도 이 파일은 그대로다.

/** 기본 색. 색이 없는 variant는 투명 border라 forced-colors에서 경계로 보인다. */
export const pressableColorClass: Record<FillVariant, string> = {
  solid: "border-transparent bg-accent-solid text-accent-on-solid",
  subtle: "border-transparent bg-accent-subtle text-accent-on-subtle",
  outline: "border-accent text-accent",
  ghost: "border-transparent text-accent",
};

/** outline·ghost hover·누름. 색을 변수로 골라 Component의 `hover:`·`active:` 덮어쓰기를 tailwind-merge가 바꿀 수 있다(ADR 0025). */
const pressableTintClass =
  "[--pressable-hover:var(--tide-accent-faint)] [--pressable-active:var(--tide-accent-subtle)] data-[color=neutral]:[--pressable-hover:var(--tide-bg-hover)] data-[color=neutral]:[--pressable-active:var(--tide-bg-active)] hover:bg-(--pressable-hover) active:bg-(--pressable-active)";

/** hover·누름 색. 활성 상태일 때만 붙인다(비활성·로딩에는 붙이지 않아 CSS 순서에 기대지 않는다). */
export const pressableInteractionClass: Record<FillVariant, string> = {
  solid: "hover:bg-accent-solid-hover active:bg-accent-solid-active",
  subtle: "hover:bg-accent-subtle-hover active:bg-accent-subtle-active",
  outline: pressableTintClass,
  ghost: pressableTintClass,
};

/** 비활성 색. 색 이름과 관계없이 같다. disabled Token은 대비 검사 대상이 아니다. */
export const pressableDisabledClass: Record<FillVariant, string> = {
  solid: "cursor-not-allowed border-transparent bg-disabled text-disabled",
  subtle: "cursor-not-allowed border-transparent bg-disabled text-disabled",
  outline: "cursor-not-allowed border-default text-disabled",
  ghost: "cursor-not-allowed border-transparent text-disabled",
};

/** 모양의 공통 부분. radius는 모든 size에서 `md`다. 높이·폭·padding은 Component가 정한다. */
export const pressableBaseClass =
  "inline-flex shrink-0 items-center justify-center rounded-md border whitespace-nowrap select-none transition-colors focus-visible:focus-ring";

/** 누름 축소. motion-safe:일 때만 줄이고 scale도 그때만 전환 대상에 넣는다(ADR 0010). */
export const pressableScaleClass =
  "motion-safe:transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,scale] motion-safe:active:scale-96";
