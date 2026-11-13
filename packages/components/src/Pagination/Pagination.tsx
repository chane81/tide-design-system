import type { ComponentProps, ReactElement } from "react";

import { listClass } from "./constants/paginationClass";

// 이 파일은 hook·state·이벤트를 쓰지 않으므로 "use client"가 없다. 서버 컴포넌트에서 쓸 수 있다.
// 누르는 항목은 Button·IconButton(client 경계)에 맡기고, 이 파일은 함수를 만들지 않고 props만 넘긴다.
//
// 구현 방식(tide-v0-impl 티켓 24):
// - `<nav>` 탐색 랜드마크에 이름(기본 `aria-label="페이지 이동"`)을 붙이고, 안에 `<ul>`을 둔다. 항목은 `PaginationItem`(`<li>`)이다.
//   React Aria는 쓰지 않는다(ADR 0004 「네이티브」 단계).
// - 페이지 번호(`PaginationLink`)는 Button 규칙을 따르는 링크다. 기본 요소는 `<a>`이고 Button(ghost, sm 32px)에
//   `render`로 넘겨 포커스 표시·커서·hover·누름 규칙을 Button과 같게 한다. 현재 페이지는 `aria-current="page"`와
//   subtle 채움(primary)으로 보인다.
// - 이전/다음은 IconButton(ghost, sm 32px)과 화살표 아이콘이고 이름이 기본으로 붙는다(`"이전 페이지"`·`"다음 페이지"`).
//   첫·마지막 페이지에서는 `disabled`를 준다. 기본 `<button>`이면 네이티브 disabled, 링크로 렌더하면
//   `aria-disabled="true"`와 이동 차단이다(IconButton 규칙).
// - 어떤 번호를 보일지(앞뒤 몇 개, 생략 위치)는 앱이 정한다. 페이지 범위 계산 함수는 두지 않는다.

export interface PaginationProps extends ComponentProps<"nav"> {
  /** 탐색 영역 이름. 기본값은 `"페이지 이동"`이다. 한 화면에 목록이 여럿이면 `"댓글 페이지"`처럼 구분한다. */
  "aria-label"?: string;
}

/**
 * 페이지 이동 탐색 영역. `<nav>` 안의 `<ul>`이다.
 * 자식은 `PaginationItem`이고, 그 안에 `PaginationPrevious`·`PaginationLink`·`PaginationEllipsis`·`PaginationNext`를 둔다.
 * `ref`·`className`은 `<nav>`에 붙는다.
 */
export function Pagination({
  "aria-label": ariaLabel = "페이지 이동",
  children,
  ...props
}: PaginationProps): ReactElement {
  return (
    <nav {...props} aria-label={ariaLabel}>
      <ul className={listClass}>{children}</ul>
    </nav>
  );
}
