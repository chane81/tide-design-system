// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// - 표는 부모 너비를 채우고 경계를 합친다(border-collapse). 글자는 body-sm(14/20) text-default다.
//   배경은 두지 않아 놓인 표면(canvas·surface·raised)을 그대로 보인다. text-default × 표면 층 3개 4.5:1이 등록되어 있다.
export const tableClass = "w-full border-collapse text-body-sm text-default";

// - 행 사이 선은 장식용 border-default 1px다(대비 검사 제외 Token, Separator·Card와 같다). 구분은 표 구조가 전한다.
// - 행 hover는 transition 없이 바로 바뀐다(spec motion 「반복되는 목록 항목의 hover는 바로 바뀐다」). 그래서 transition class가 없다.
//   색은 색 없이 덮는 bg-hover다(ADR 0022 §3). text-default × bg-hover(표면 위 합성) 4:1(일시 상태, ADR 0023)이 등록되어 있다.
// - hover는 `<tbody>` 바로 아래 행에만 준다. 헤더 행(thead)과 바닥 행(tfoot)은 데이터 행이 아니라 바뀌지 않는다.
//   선택자를 `:where(tbody > 행)`로 감싸 특이도를 `hover:`와 같은 수준(0,1,0)보다 낮게 둔다. 그래서 사용자 className의
//   `hover:bg-transparent` 같은 값이 CSS 순서와 상관없이 이긴다(tailwind-merge는 서로 다른 변형이라 둘 다 남긴다).
// - forced-colors에서는 브라우저가 배경을 Canvas로 덮어 hover 색이 사라지고, 행 경계는 CanvasText로 남는다.
export const rowClass = "border-b border-default [:where(tbody>&)]:hover:bg-hover";

// - 칸 높이는 40px다(세로 여백 10px × 2 + 줄 높이 20px, spec size `md` 높이와 같다). 가로 여백은 12px다.
// - 머리 칸은 label-md(14/20, 500)로 본문 칸과 구분한다. 색은 본문과 같은 text-default라 hover 행 안의 행 머리 칸도
//   등록된 대비 쌍(text-default × bg-hover) 안에 있다. 정렬은 브라우저 기본(가운데)을 쓰지 않고 시작 쪽이다.
// - 숫자 열은 칸 className에 `tabular-nums text-end`를 준다(Tailwind 기본 Utility class를 그대로 쓴다, spec 사용자 이야기 20).
export const headerCellClass = "px-3 py-2.5 text-start align-middle text-label-md";
export const cellClass = "px-3 py-2.5 text-start align-middle";
