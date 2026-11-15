// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
// indeterminate 규칙을 두지 않는다. 고른 것이 없는 라디오 묶음은 모두 :indeterminate라 Checkbox 규칙이 걸리면 원이 찬다.

/**
 * 고른 원은 canvas 바탕 + 2px accent 테두리. hover·누름은 고름과 상관없이 바탕만 subtle 계열이다.
 * 오류면 accent가 danger로 바뀐다(choiceInputClass).
 */
export const radioInputStateClass =
  "checked:border-2 checked:border-accent enabled:group-hover/choice:bg-accent-subtle enabled:group-active/choice:bg-accent-subtle-active";

/** 원 지름의 절반인 점(md 10px, sm 8px). forced-colors에서는 테두리와 같은 Highlight다. */
export const radioDotClass = {
  sm: "size-2",
  md: "size-2.5",
} as const;

/** 점은 테두리와 같은 색이다. 오류면 danger, 비활성이면 text-disabled(choiceMarkClass)가 이긴다. */
export const radioMarkClass =
  "rounded-full bg-current text-(--tide-accent-border) peer-enabled:peer-aria-invalid:text-(--tide-border-danger) forced-colors:[--tide-accent-border:Highlight] forced-colors:[--tide-border-danger:CanvasText]";
