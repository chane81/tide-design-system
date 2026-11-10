// Checkbox·Radio가 함께 쓰는 class(tide-v0-impl 티켓 16). Switch처럼 label을 품은 선택 컨트롤도 같은 틀을 쓸 수 있다.
// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
//
// 구조: <label 루트> <span 조작 영역 24×24 grid> <input peer 상자> <아이콘들> </span> <span 글자> </label>
// - 조작 영역: 상자는 16·20px이지만 감싼 span이 24×24라 글자 없이 써도 누르는 영역이 24×24 이상이다(WCAG 2.5.8).
//   label 안이라 이 영역 어디를 눌러도 input이 바뀐다.
// - 상자: 네이티브 input에 appearance-none을 주고 직접 그린다. 상태는 네이티브 pseudo-class(:checked,
//   :indeterminate, :disabled)와 aria-invalid로 고른다. 아이콘은 peer-* variant로 보인다.
// - 경계: 선택 전 border-strong(표면 층 위 3:1). 선택 후에도 border-accent를 둔다. solid는 dark 표면 위 3:1에
//   못 미치는 색이 있어(dark primary 2.88:1) 등록된 대비 쌍인 border-accent(× 표면 층 3:1)가 상자 경계를 맡는다.
// - 표시: 체크·indeterminate·점 아이콘은 text-accent-on-solid(× solid 4.5:1).
// - forced-colors: 기본 동작은 상자 배경을 Canvas로 덮는데, svg는 UA 스타일 `forced-color-adjust: preserve-parent-color`라
//   흰 표시가 흰 Canvas 위에 남아 사라진다(Chromium에서 확인). Switch(티켓 17, ADR 0015)와 같이 상자와 표시만
//   forced-color-adjust를 끄고, 쓰는 Token 변수를 시스템 색으로 바꾼다(@theme inline이라 요소에서 바꾼 변수를 바로 쓴다).
//   선택한 상자는 Highlight, 표시는 HighlightText, 선택 전 경계는 CanvasText, 비활성은 GrayText다.
// - 포커스: focus-visible:focus-ring(ring, 상자 둘레). 입력창용 focus-field가 아니다(GLOSSARY 포커스 표시).
// - 오류: aria-invalid:border-danger. tailwindcss 4.3.5에서 aria-* variant가 checked·indeterminate보다 뒤에
//   만들어져 선택 상태에서도 오류 경계가 이긴다. 비활성은 disabled:가 그보다 뒤라 모두를 이긴다.
// - hover: label 전체(group/choice)에 올리면 활성 상태에서만 바뀐다. 체크됨·indeterminate는 bg-accent-solid-hover
//   (on-solid × solid-hover 4.5:1 등록), 체크 전은 bg-accent-subtle 배경만 옅게 깐다(경계 border-strong은 그대로라
//   오류 경계도 가리지 않는다). group-hover는 `:is(:where(.group\/choice):hover *)`라 checked:보다 우선순위가 높아
//   체크 전 규칙에 not-checked·not-indeterminate를 붙인다.
// - motion: 혼자 있는 조작 요소라 transition-colors(fast)다.

/** 상자의 forced-colors 시스템 색 */
const choiceInputForcedClass =
  "forced-colors:forced-color-adjust-none forced-colors:[--tide-bg-canvas:Canvas] forced-colors:[--tide-border-strong:CanvasText] forced-colors:[--tide-border-danger:CanvasText] forced-colors:[--tide-accent-border:Highlight] forced-colors:[--tide-accent-solid:Highlight] forced-colors:[--tide-accent-solid-hover:Highlight] forced-colors:[--tide-accent-subtle:Canvas] forced-colors:[--tide-border-default:GrayText] forced-colors:[--tide-bg-disabled:Canvas] forced-colors:[--tide-outline-focus:Highlight]";

/** 루트 label. 글자 크기 class와 사용자 className은 뒤에 붙인다. */
export const choiceRootClass =
  "group/choice inline-flex items-start gap-2 align-top text-default cursor-pointer has-disabled:cursor-not-allowed has-disabled:text-disabled";

/** 상자와 아이콘을 겹쳐 두는 24×24 조작 영역 */
export const choiceAreaClass = "grid size-6 shrink-0 place-items-center";

/** 네이티브 input을 상자로 그린다. 모양(rounded)과 크기 class는 Component가 앞에 붙인다. */
export const choiceInputClass =
  "peer col-start-1 row-start-1 m-0 appearance-none border border-strong bg-canvas cursor-pointer transition-colors checked:border-accent checked:bg-accent-solid enabled:not-checked:not-indeterminate:group-hover/choice:bg-accent-subtle enabled:checked:group-hover/choice:bg-accent-solid-hover indeterminate:border-accent indeterminate:bg-accent-solid enabled:indeterminate:group-hover/choice:bg-accent-solid-hover aria-invalid:border-danger focus-visible:focus-ring disabled:cursor-not-allowed disabled:border-default disabled:bg-disabled " +
  choiceInputForcedClass;

/** 상자 위에 겹치는 표시 아이콘. 누름은 input이 받는다. 보이는 조건 class는 Component가 붙인다. */
export const choiceMarkClass =
  "pointer-events-none col-start-1 row-start-1 hidden text-accent-on-solid peer-disabled:text-disabled forced-colors:forced-color-adjust-none forced-colors:[--tide-accent-on-solid:HighlightText] forced-colors:[--tide-text-disabled:GrayText]";

/** Checkbox·Radio의 size. 상자 크기와 글자 크기만 바뀌고 조작 영역은 24×24로 같다. */
export type ChoiceSize = "sm" | "md";

/** 글자 스타일. md 행간 24px은 조작 영역과 같고, sm 행간 20px은 위아래 2px을 둬 첫 줄을 상자 가운데에 맞춘다. */
export const choiceTextClass: Record<ChoiceSize, string> = {
  sm: "py-0.5 text-body-sm",
  md: "text-body-md",
};
