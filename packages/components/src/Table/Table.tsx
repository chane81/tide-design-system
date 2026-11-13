import type { ComponentProps, ReactElement } from "react";

import { cn } from "../_internal/libs/cn";
import { tableClass } from "./constants/tableClass";

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

/**
 * 시맨틱 `<table>`. 행·열로 된 데이터를 보여 준다. 정렬·행 선택·가상화는 없다. 서버 컴포넌트로 쓸 수 있다.
 * 표의 이름은 `<caption>`이나 `aria-label`·`aria-labelledby`로 준다.
 */
export function Table({ className, ...props }: TableProps): ReactElement {
  return <table {...props} className={cn(tableClass, className)} />;
}
