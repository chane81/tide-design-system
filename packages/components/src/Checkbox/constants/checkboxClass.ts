// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.

/** 체크 전에는 hover·누름에도 바탕을 칠하지 않는다. 체크·indeterminate 채움은 채움 레이어가 맡고, forced-colors에서만 input이 칠한다. */
export const checkboxInputStateClass =
  "checked:border-accent indeterminate:border-accent forced-colors:enabled:checked:bg-accent-solid forced-colors:enabled:indeterminate:bg-accent-solid";

/**
 * 체크·indeterminate 채움. input과 같은 크기라 테두리까지 덮는다. opacity와 scale이 함께 fast로 바뀐다.
 * 비활성·forced-colors에서는 숨고 input 바탕이 그 색을 맡는다. 오류 색은 input의 변수가 닿지 않아 다시 적는다(ADR 0035).
 */
export const checkboxFillClass =
  "pointer-events-none col-start-1 row-start-1 bg-accent-solid opacity-0 transition-[opacity,background-color] group-hover/choice:bg-accent-solid-hover group-active/choice:bg-accent-solid-active peer-checked:opacity-100 peer-indeterminate:opacity-100 motion-safe:scale-70 motion-safe:transition-[opacity,scale,background-color] motion-safe:peer-checked:scale-100 motion-safe:peer-indeterminate:scale-100 peer-aria-invalid:[--tide-accent-solid:var(--tide-bg-danger-solid)] peer-aria-invalid:[--tide-accent-solid-hover:var(--tide-bg-danger-solid-hover)] peer-aria-invalid:[--tide-accent-solid-active:var(--tide-bg-danger-solid-active)] peer-disabled:hidden forced-colors:hidden";

/** solid 위 흰 표시. 숨을 때는 지연 없이 fast로 거꾸로 지워지며 사라진다. dash는 svg에 두고 path가 물려받는다. */
// relative가 없으면 scale이 걸린 채움 레이어가 나중 순서로 그려져 표시를 덮는다.
export const checkboxMarkClass =
  "relative text-accent-on-solid forced-colors:[--tide-accent-on-solid:HighlightText] motion-safe:[stroke-dasharray:1] motion-safe:[stroke-dashoffset:1] motion-safe:transition-[opacity,stroke-dashoffset]";

/** 보이는 조건과 그리기. 채움이 찬 뒤(fast 지연) opacity와 dash가 fast로 함께 바뀐다. */
export const checkboxMarkShownClass = {
  check:
    "peer-checked:peer-not-indeterminate:opacity-100 motion-safe:peer-checked:peer-not-indeterminate:[stroke-dashoffset:0] motion-safe:peer-checked:peer-not-indeterminate:duration-fast motion-safe:peer-checked:peer-not-indeterminate:delay-(--tide-duration-fast)",
  indeterminate:
    "peer-indeterminate:opacity-100 motion-safe:peer-indeterminate:[stroke-dashoffset:0] motion-safe:peer-indeterminate:duration-fast motion-safe:peer-indeterminate:delay-(--tide-duration-fast)",
} as const;
