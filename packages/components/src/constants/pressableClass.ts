// Button과 IconButton이 함께 쓰는 class(tide-v0-impl 티켓 14). 루트에서 export하지 않는다.
// 채움 방식별 색·hover·누름·비활성 class와 모양의 공통 부분, 누름 축소를 둔다. 상태에 따라 고르는 일은
// libs/pressableState.ts가 한다. 이 파일은 class 문자열만 있으므로 "use client"가 없다.

import type { FillVariant } from "../types.ts";

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// 모든 variant에 border 1px를 둔다. 색이 없는 variant는 투명 border라 forced-colors에서 경계로 보인다.

// 색 축은 맵에 두지 않는다. 루트의 data-color가 accent 슬롯(--tide-accent-*)을 고르고, 맵은 accent class만 쓴다(ADR 0011).
// 그래서 앱이 Role(예: `brand`)을 더해도 이 파일은 바뀌지 않는다.

/**
 * 기본 색(배경, 글자, 경계). 색 이름마다 Foundation이 같은 대비 규칙으로 검사한다.
 * subtle 바탕 위 글자는 파스텔 글자 on-subtle이고(ADR 0022 §1), outline·ghost 글자는 바탕 없는 색 글자 text다.
 */
export const pressableColorClass: Record<FillVariant, string> = {
  solid: "border-transparent bg-accent-solid text-accent-on-solid",
  subtle: "border-transparent bg-accent-subtle text-accent-on-subtle",
  outline: "border-accent text-accent",
  ghost: "border-transparent text-accent",
};

/** outline·ghost의 hover·누름 색. 아래 `pressableInteractionClass` 주석 참고. */
const pressableTintClass =
  "[--pressable-hover:var(--tide-accent-faint)] [--pressable-active:var(--tide-accent-subtle)] data-[color=neutral]:[--pressable-hover:var(--tide-bg-hover)] data-[color=neutral]:[--pressable-active:var(--tide-bg-active)] hover:bg-(--pressable-hover) active:bg-(--pressable-active)";

/** hover·누름 색. 활성 상태일 때만 붙인다(비활성·로딩에는 붙이지 않아 CSS 순서에 기대지 않는다). */
export const pressableInteractionClass: Record<FillVariant, string> = {
  solid: "hover:bg-accent-solid-hover active:bg-accent-solid-active",
  subtle: "hover:bg-accent-subtle-hover active:bg-accent-subtle-active",
  // outline·ghost는 같은 색의 연한 파스텔로 채운다(ADR 0025). 기본 투명, hover faint(가장 연함), 누름 subtle.
  // text × faint·subtle이 4.5:1로 등록되어 있다(실제 최저 5.43·5.16:1). 불투명 색이라
  // 놓인 표면(canvas·raised)과 관계없이 대비가 같다.
  // neutral만 색 없이 덮는다(bg-hover·bg-active). dark neutral subtle이 raised 표면과 같은 색이라 Dialog·Toast 안
  // 닫기 버튼의 hover가 보이지 않기 때문이다. 회색 덮기가 곧 neutral의 색이다.
  // 색은 변수로 고른다. hover·누름 class가 하나라서 Component가 `hover:`·`active:` class로 덮어쓰면(Alert·Tag 닫기
  // 버튼) tailwind-merge가 그대로 바꾼다. 색 이름별 선택자를 hover class에 두면 우선순위가 높아 덮어쓰기를 이긴다.
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

/** 누름 축소. motion-safe:일 때만 줄이고, 그때만 scale도 전환 대상에 넣는다(fast, out은 Tide 기본값). ADR 0010. */
export const pressableScaleClass =
  "motion-safe:transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,scale] motion-safe:active:scale-96";
