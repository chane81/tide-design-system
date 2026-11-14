import type { ComponentProps, ReactElement } from "react";

import { listClass } from "./constants/paginationClass";

// 서버 컴포넌트에서 쓰도록 "use client"를 두지 않는다. 함수를 만들지 않고 Button·IconButton(client)에 props만 넘긴다.

export interface PaginationOwnProps {
  /** 탐색 영역 이름. 기본값 `"페이지 이동"`. 한 화면에 여럿이면 `"댓글 페이지"`처럼 구분한다. */
  "aria-label"?: string;
}

export interface PaginationProps
  extends PaginationOwnProps, Omit<ComponentProps<"nav">, keyof PaginationOwnProps> {}

/**
 * 페이지 이동 탐색 영역(`<nav>` 안의 `<ul>`). 자식은 `PaginationItem`이다.
 * 보일 번호 범위는 앱이 정한다. `ref`·`className`은 `<nav>`에 붙는다.
 * Tide props: `aria-label` ({@link PaginationOwnProps}). 나머지는 `<nav>` 속성.
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
