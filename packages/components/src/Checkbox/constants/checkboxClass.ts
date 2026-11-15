// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
// group-hover가 checked:보다 우선순위가 높아 체크 전 규칙에 not-checked를 붙인다(tailwindcss 4.3.5).

/** 체크·indeterminate는 accent solid로 채운다. */
export const checkboxInputStateClass =
  "checked:border-accent checked:bg-accent-solid enabled:not-checked:not-indeterminate:group-hover/choice:bg-accent-subtle enabled:checked:group-hover/choice:bg-accent-solid-hover indeterminate:border-accent indeterminate:bg-accent-solid enabled:indeterminate:group-hover/choice:bg-accent-solid-hover enabled:not-checked:not-indeterminate:group-active/choice:bg-accent-subtle-active enabled:checked:group-active/choice:bg-accent-solid-active enabled:indeterminate:group-active/choice:bg-accent-solid-active";

/** solid 위 흰 표시 */
export const checkboxMarkClass =
  "text-accent-on-solid forced-colors:[--tide-accent-on-solid:HighlightText]";
