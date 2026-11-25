// Checkbox·Radio가 함께 쓴다. class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
// variant 순서에 기댄다(tailwindcss 4.3.5): aria-invalid가 checked를, group-active가 group-hover를 이긴다.
// aria-invalid는 disabled보다 뒤라 오류 테두리를 enabled에만 둬 비활성 테두리가 이기게 한다.

/** svg가 preserve-parent-color라 흰 표시가 Canvas에 묻혀, 상자·표시만 adjust를 끄고 Token을 시스템 색으로 바꾼다. */
const choiceInputForcedClass =
  "forced-colors:forced-color-adjust-none forced-colors:[--tide-bg-canvas:Canvas] forced-colors:[--tide-border-strong:CanvasText] forced-colors:[--tide-border-danger:CanvasText] forced-colors:[--tide-accent-border:Highlight] forced-colors:[--tide-accent-solid:Highlight] forced-colors:[--tide-accent-solid-hover:Highlight] forced-colors:[--tide-accent-solid-active:Highlight] forced-colors:[--tide-accent-subtle:Canvas] forced-colors:[--tide-accent-subtle-active:Canvas] forced-colors:[--tide-border-default:GrayText] forced-colors:[--tide-bg-disabled:Canvas] forced-colors:[--tide-accent-subtle-border:Highlight] forced-colors:[--tide-border-danger-subtle:Highlight]";

/** 루트 label. 글자 크기 class와 사용자 className은 뒤에 붙인다. */
export const choiceRootClass =
  "group/choice inline-flex items-start gap-2 align-top text-default cursor-pointer select-none has-disabled:cursor-not-allowed has-disabled:text-disabled";

/** 상자보다 큰 24×24 조작 영역(WCAG 2.5.8). */
export const choiceAreaClass = "grid size-6 shrink-0 place-items-center";

/** 오류면 accent subtle·solid 슬롯을 danger로 바꿔 채움·hover·누름도 테두리와 같은 danger 계열이 된다(ADR 0035). forced-colors는 시스템 색 그대로다. */
const choiceInvalidClass =
  "not-forced-colors:aria-invalid:[--tide-accent-subtle:var(--tide-bg-danger-subtle)] not-forced-colors:aria-invalid:[--tide-accent-subtle-active:var(--tide-bg-danger-subtle-active)] not-forced-colors:aria-invalid:[--tide-accent-solid:var(--tide-bg-danger-solid)] not-forced-colors:aria-invalid:[--tide-accent-solid-hover:var(--tide-bg-danger-solid-hover)] not-forced-colors:aria-invalid:[--tide-accent-solid-active:var(--tide-bg-danger-solid-active)]";

/** 네이티브 input을 상자·원으로 그린다. 선택 상태 모양은 Checkbox·Radio가 각자 더한다. */
export const choiceInputClass: string =
  "peer col-start-1 row-start-1 m-0 appearance-none border border-strong bg-canvas cursor-pointer transition-colors enabled:aria-invalid:border-danger focus-visible:focus-field disabled:cursor-not-allowed disabled:border-default disabled:bg-disabled " +
  choiceInvalidClass +
  " " +
  choiceInputForcedClass;

/**
 * 상자 위에 겹치는 표시. 누름은 input이 받는다. 색과 보이는 조건 class는 Component가 붙인다.
 * display를 바꾸지 않고 opacity로 숨긴다. display가 바뀌면 전환이 시작되지 않는다(ADR 0037).
 */
export const choiceMarkClass =
  "pointer-events-none col-start-1 row-start-1 opacity-0 transition-opacity peer-disabled:text-disabled forced-colors:forced-color-adjust-none forced-colors:[--tide-text-disabled:GrayText]";

/** Checkbox·Radio의 size. 상자 크기와 글자 크기만 바뀌고 조작 영역은 24×24로 같다. */
export type ChoiceSize = "sm" | "md";

/** 글자 스타일. md 행간 24px은 조작 영역과 같고, sm 행간 20px은 위아래 2px을 둬 첫 줄을 상자 가운데에 맞춘다. */
export const choiceTextClass: Record<ChoiceSize, string> = {
  sm: "py-0.5 text-body-sm",
  md: "text-body-md",
};
