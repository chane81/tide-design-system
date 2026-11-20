// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
// group-hover가 checked:보다 우선순위가 높아 체크 전 규칙에 not-checked를 붙인다(tailwindcss 4.3.5).

/** 체크·indeterminate는 accent solid로 채운다. */
export const checkboxInputStateClass =
  "checked:border-accent checked:bg-accent-solid enabled:not-checked:not-indeterminate:group-hover/choice:bg-accent-subtle enabled:checked:group-hover/choice:bg-accent-solid-hover indeterminate:border-accent indeterminate:bg-accent-solid enabled:indeterminate:group-hover/choice:bg-accent-solid-hover enabled:not-checked:not-indeterminate:group-active/choice:bg-accent-subtle-active enabled:checked:group-active/choice:bg-accent-solid-active enabled:indeterminate:group-active/choice:bg-accent-solid-active";

/**
 * solid 위 흰 표시. 숨은 상태는 opacity `fast`로 사라지고, 사라진 뒤에 dash를 되감아 거꾸로 지워지지 않는다.
 * dash는 svg에 두고 path가 물려받는다(stroke-dash 속성은 상속된다).
 */
export const checkboxMarkClass =
  "text-accent-on-solid forced-colors:[--tide-accent-on-solid:HighlightText] motion-safe:[stroke-dasharray:1] motion-safe:[stroke-dashoffset:1] motion-safe:transition-[opacity,stroke-dashoffset] motion-safe:[transition-delay:0s,var(--tide-duration-fast)]";

/** 보이는 조건과 그리기. 보일 때는 opacity를 바로 올리고 dash만 `normal`로 그린다. 첫 렌더는 전환이 없어 그려진 채로 나온다. */
export const checkboxMarkShownClass = {
  check:
    "peer-checked:peer-not-indeterminate:opacity-100 motion-safe:peer-checked:peer-not-indeterminate:[stroke-dashoffset:0] motion-safe:peer-checked:peer-not-indeterminate:transition-[stroke-dashoffset] motion-safe:peer-checked:peer-not-indeterminate:duration-normal motion-safe:peer-checked:peer-not-indeterminate:delay-0",
  indeterminate:
    "peer-indeterminate:opacity-100 motion-safe:peer-indeterminate:[stroke-dashoffset:0] motion-safe:peer-indeterminate:transition-[stroke-dashoffset] motion-safe:peer-indeterminate:duration-normal motion-safe:peer-indeterminate:delay-0",
} as const;
