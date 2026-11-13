import type { ComponentProps, ReactElement } from "react";

import { cn } from "../_internal/libs/cn.ts";

// 이 파일은 hook·state·이벤트를 쓰지 않으므로 "use client"가 없다. 서버 컴포넌트에서 쓸 수 있다.
//
// 구현 방식(tide-v0-impl 티켓 23):
// - 시맨틱 `<table>`·`<thead>`·`<tbody>`·`<tr>`·`<th>`·`<td>`를 그대로 쓴다. 표 역할(table·rowgroup·row·columnheader·
//   rowheader·cell)과 헤더 연결은 브라우저가 표 구조에서 계산한다(HTML 표 모델, ADR 0004 「네이티브」 단계).
//   React Aria(useTable)는 쓰지 않는다. 정렬·행 선택·가상화·키보드 격자 탐색이 없어 grid 위젯이 아니다(spec 「Table」).
// - 부분마다 Component를 따로 두고 평평한 이름으로 낸다(spec 「여러 부분으로 된 Component」). 이름은 `Table` 접두사를 붙여
//   다른 Component(Dialog의 Header 등)와 겹치지 않게 한다. `TableHead`는 `<thead>`, `TableHeaderCell`은 `<th>`다.
// - 머리 칸(`<th>`)은 `scope`를 기본 `"col"`로 붙인다. scope가 없으면(auto) 브라우저·보조 기술·테스트 도구가 위치로
//   추측하는데 그 결과가 서로 다르다(vitest 5.1.0 aria snapshot은 scope 없는 thead의 th를 cell로 본다, 티켓 23에서 확인).
//   행 머리는 `scope="row"`를 직접 준다(W3C WAI Tables Tutorial 「Tables with Two Headers」는 머리 행에 col, 머리 열에 row를 명시한다).
// - `render` prop은 두지 않는다. 표 요소는 정해진 부모·자식 구조가 있어 다른 요소로 바꾸면 표 모델이 깨진다.

export interface TableProps extends ComponentProps<"table"> {}
export interface TableHeadProps extends ComponentProps<"thead"> {}
export interface TableBodyProps extends ComponentProps<"tbody"> {}
export interface TableRowProps extends ComponentProps<"tr"> {}
export interface TableHeaderCellProps extends ComponentProps<"th"> {
  /**
   * 이 머리 칸이 맡는 범위. 기본값은 `"col"`(아래 열)이다. 본문 행의 첫 칸처럼 행을 맡으면 `"row"`를 준다.
   * 열 그룹·행 그룹 머리는 `"colgroup"`·`"rowgroup"`이다.
   */
  scope?: "col" | "row" | "colgroup" | "rowgroup";
}
export interface TableCellProps extends ComponentProps<"td"> {}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// - 표는 부모 너비를 채우고 경계를 합친다(border-collapse). 글자는 body-sm(14/20) text-default다.
//   배경은 두지 않아 놓인 표면(canvas·surface·raised)을 그대로 보인다. text-default × 표면 층 3개 4.5:1이 등록되어 있다.
const tableClass = "w-full border-collapse text-body-sm text-default";

// - 행 사이 선은 장식용 border-default 1px다(대비 검사 제외 Token, Separator·Card와 같다). 구분은 표 구조가 전한다.
// - 행 hover는 transition 없이 바로 바뀐다(spec motion 「반복되는 목록 항목의 hover는 바로 바뀐다」). 그래서 transition class가 없다.
//   색은 색 없이 덮는 bg-hover다(ADR 0022 §3). text-default × bg-hover(표면 위 합성) 4:1(일시 상태, ADR 0023)이 등록되어 있다.
// - hover는 `<tbody>` 바로 아래 행에만 준다. 헤더 행(thead)과 바닥 행(tfoot)은 데이터 행이 아니라 바뀌지 않는다.
//   선택자를 `:where(tbody > 행)`로 감싸 특이도를 `hover:`와 같은 수준(0,1,0)보다 낮게 둔다. 그래서 사용자 className의
//   `hover:bg-transparent` 같은 값이 CSS 순서와 상관없이 이긴다(tailwind-merge는 서로 다른 변형이라 둘 다 남긴다).
// - forced-colors에서는 브라우저가 배경을 Canvas로 덮어 hover 색이 사라지고, 행 경계는 CanvasText로 남는다.
const rowClass = "border-b border-default [:where(tbody>&)]:hover:bg-hover";

// - 칸 높이는 40px다(세로 여백 10px × 2 + 줄 높이 20px, spec size `md` 높이와 같다). 가로 여백은 12px다.
// - 머리 칸은 label-md(14/20, 500)로 본문 칸과 구분한다. 색은 본문과 같은 text-default라 hover 행 안의 행 머리 칸도
//   등록된 대비 쌍(text-default × bg-hover) 안에 있다. 정렬은 브라우저 기본(가운데)을 쓰지 않고 시작 쪽이다.
// - 숫자 열은 칸 className에 `tabular-nums text-end`를 준다(Tailwind 기본 Utility class를 그대로 쓴다, spec 사용자 이야기 20).
const headerCellClass = "px-3 py-2.5 text-start align-middle text-label-md";
const cellClass = "px-3 py-2.5 text-start align-middle";

/**
 * 시맨틱 `<table>`. 행·열로 된 데이터를 보여 준다. 정렬·행 선택·가상화는 없다. 서버 컴포넌트로 쓸 수 있다.
 * 표의 이름은 `<caption>`이나 `aria-label`·`aria-labelledby`로 준다.
 */
export function Table({ className, ...props }: TableProps): ReactElement {
  return <table {...props} className={cn(tableClass, className)} />;
}

/** 머리 행 묶음 `<thead>`. 안의 행은 hover로 바뀌지 않는다. */
export function TableHead(props: TableHeadProps): ReactElement {
  // 기본 class가 없어 className을 그대로 넘긴다.
  return <thead {...props} />;
}

/** 본문 행 묶음 `<tbody>`. 바로 아래 `TableRow`에 마우스를 올리면 배경이 바로 바뀐다. */
export function TableBody(props: TableBodyProps): ReactElement {
  return <tbody {...props} />;
}

/** 행 `<tr>`. 아래 경계가 있고, `TableBody` 안에서는 hover 배경이 transition 없이 바로 바뀐다. */
export function TableRow({ className, ...props }: TableRowProps): ReactElement {
  return <tr {...props} className={cn(rowClass, className)} />;
}

/**
 * 머리 칸 `<th>`. 기본은 `scope="col"`(열 머리, columnheader)이다. 본문 행의 행 머리는 `scope="row"`(rowheader)를 준다.
 * 복잡한 표(여러 줄 머리)는 `id`와 칸의 `headers`로 직접 잇는다.
 */
export function TableHeaderCell({
  scope = "col",
  className,
  ...props
}: TableHeaderCellProps): ReactElement {
  return <th {...props} scope={scope} className={cn(headerCellClass, className)} />;
}

/** 데이터 칸 `<td>`. 숫자 열은 `className="tabular-nums text-end"`로 자릿수를 맞춘다. */
export function TableCell({ className, ...props }: TableCellProps): ReactElement {
  return <td {...props} className={cn(cellClass, className)} />;
}
