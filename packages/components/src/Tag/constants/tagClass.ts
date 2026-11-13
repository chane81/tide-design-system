// 묶음: 태그를 줄바꿈하며 늘어놓는다. 가로·세로 간격 8px.
export const tagGroupClass = "flex flex-wrap items-center gap-2 outline-none";

// 태그(spec radius 「작은 표시 요소는 sm」):
// - 높이 32px(지우기 버튼 24px + 위아래 3px + border 1px). 글자 `text-label-md`, 시작쪽 여백 10px.
//   지우기 버튼이 있으면 끝쪽 여백 3px(버튼이 끝을 채운다), 없으면 10px.
// - 색: accent 슬롯의 subtle 배경 + on-subtle 글자 + subtle-border 테두리(ADR 0022). 색 이름 규칙(colorContrastRules)의
//   on-subtle × subtle 4.5:1이다. 파스텔 테두리는 꾸밈이라 대비 검사에서 뺐다.
// - forced-colors에서는 브라우저가 테두리를 CanvasText로 덮어 배경 없이도 모양이 남는다.
// - 지우기 버튼 hover·누름 배경에 쓸 태그 색을 변수로 남긴다. IconButton은 루트에 자기 `data-color`(Role)를 붙여
//   accent 슬롯을 바꾸므로, 태그 요소에서 계산한 값(custom property는 계산값으로 상속된다)을 넘겨야 태그 색을 따른다.
// - 비활성: `aria-disabled`(React Aria가 붙인다)면 `bg-disabled`·`text-disabled`.
// - 포커스: `focus-visible:focus-ring`(ring 2px, offset 2px). 태그 radius sm을 따른다.
export const tagClass = [
  "inline-flex h-8 max-w-full min-w-0 shrink-0 items-center rounded-sm border border-accent-subtle bg-accent-subtle ps-2.5 align-middle text-label-md whitespace-nowrap text-accent-on-subtle outline-none select-none",
  "[--tag-remove-hover:var(--tide-accent-subtle-hover)] [--tag-remove-active:var(--tide-accent-subtle-active)]",
  "aria-disabled:bg-disabled aria-disabled:text-disabled focus-visible:focus-ring",
].join(" ");

// 칸: 글자와 지우기 버튼을 한 줄로 둔다. 글자 앞 아이콘(장식용)은 텍스트 옆 아이콘 크기 16px, 글자와 4px.
export const tagCellClass = "flex min-w-0 items-center gap-1";
export const tagLabelClass =
  "inline-flex min-w-0 items-center gap-1 [&>svg]:size-4 [&>svg]:shrink-0";

// 지우기 버튼: IconButton ghost `xs`(24×24). 글자색은 태그 글자(on-subtle)를 따르고(`text-current`), hover·누름 배경은 태그 색의
// subtle-hover·subtle-active다(덮기로 계산된 값. 색 이름 규칙 on-subtle × subtle-hover·subtle-active 4:1, ADR 0023). radius는 태그와 같은 sm이다.
export const removeClass = "rounded-sm text-current";
export const removeInteractionClass =
  "hover:bg-(--tag-remove-hover) active:bg-(--tag-remove-active)";
