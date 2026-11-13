// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// - 루트: 담는 요소라 radius `lg`, 장식용 `border-default` 경계(Card와 같다). 배경은 두지 않아 놓인 표면 층을 그대로 쓴다.
// - 항목 사이: 장식용 `border-default` 1px 선.
export const accordionClass = "rounded-lg border border-default text-default";
export const itemClass = "not-first:border-t not-first:border-default";

// 트리거(spec 「포커스 표시」·「motion 적용」):
// - 글자 `text-label-lg`(16/20, medium), 여백 세로 12px·가로 16px, 글자와 chevron 사이 12px. 조작 요소 radius `md`.
// - hover는 반복 항목이라 전환 없이 바로 색 없이 덮는 `bg-hover` 배경이다(ADR 0022 §3). 비활성은 `text-disabled` + `cursor-not-allowed`.
// - 포커스: `focus-visible:focus-ring`(ring 2px, offset 2px).
export const triggerClass = [
  "group flex flex-1 cursor-pointer items-center gap-3 rounded-md px-4 py-3 text-start text-label-lg outline-none select-none",
  "enabled:hover:bg-hover focus-visible:focus-ring",
  "disabled:cursor-not-allowed disabled:text-disabled",
].join(" ");

// chevron(장식용, 16px `text-muted`): hover 배경 위에서는 `text-default`다(text-default × bg-hover 대비 쌍).
// 펼치면 180° 돈다. 회전은 움직임이라 `motion-safe`일 때만 `fast`(150ms, out)로 전환하고,
// 움직임 줄이기에서는 바로 돈다(Switch thumb 이동과 같은 규칙). 회전만이 신호가 아니다(`aria-expanded`와 패널이 함께 바뀐다).
// 패널 높이 애니메이션은 없다(motion 결정 「넣지 않는 것」). 패널은 펼치면 바로 보인다.
// forced-colors: 브라우저는 svg의 `color`를 시스템 색으로 덮지 않는다. 버튼 글자색(ButtonText, 비활성이면 GrayText)을
// 그대로 따르도록 `currentColor`로 둔다.
export const chevronClass =
  "ms-auto shrink-0 text-muted group-hover:group-enabled:text-default group-disabled:text-disabled group-aria-expanded:rotate-180 motion-safe:transition-[rotate] forced-colors:text-current forced-colors:group-disabled:text-current";

// 패널: 글자 `text-body-md`, 여백 가로 16px·아래 16px(위는 트리거 여백이 띄운다).
// 닫힌 패널은 hydration 뒤 `hidden="until-found"`라 display: none이 아니라 content-visibility: hidden으로 숨는다
// (Tailwind preflight는 until-found를 display: none에서 뺀다). 상자는 남으므로 그때는 여백을 0으로 둔다.
export const panelClass = "px-4 pb-4 text-body-md [&[hidden]]:p-0";
