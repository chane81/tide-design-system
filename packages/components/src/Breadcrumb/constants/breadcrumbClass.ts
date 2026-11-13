// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// - 목록은 가로로 늘어놓고 좁으면 줄을 바꾼다. 글자는 body-sm(14/20), 기본 색은 text-muted다.
//   text-default·text-muted × 표면 층 3개 4.5:1이 등록되어 있다.
export const listClass = "flex flex-wrap items-center gap-1.5 text-body-sm text-muted";

// - 항목은 구분자와 내용을 가로로 둔다. 구분자는 16px이고 글자색(text-muted)을 따른다. 장식용이라 대비 검사 대상이 아니다.
// - 첫 항목의 구분자는 숨긴다. 선택자는 `li:first-child > 구분자`다(Tailwind 임의 변형의 `&` 자리 표시자).
export const itemClass = "inline-flex items-center gap-1.5";
export const separatorClass = "size-4 shrink-0 [li:first-child>&]:hidden";

// - 링크는 Link와 같은 밑줄 규칙이다(항상 밑줄, hover에 두꺼워짐). 탐색 영역 안이지만 현재 페이지와 색·굵기에 더해
//   밑줄로도 구분한다(WCAG 1.4.1, 원칙 ① 접근성 우선). 색은 text-muted이고 hover에 text-default로 짙어진다.
//   Link처럼 transition은 없다.
// - 포커스 표시는 focus-ring, 커서는 pointer다(render로 바꾼 요소도 같게 한다).
export const linkClass =
  "cursor-pointer rounded-sm underline decoration-1 underline-offset-2 hover:text-default hover:decoration-2 focus-visible:focus-ring";

// - 현재 페이지는 text-default에 label-md(14/20, 500)로 링크보다 짙고 굵다. 밑줄이 없다.
export const currentClass = "text-label-md text-default";
