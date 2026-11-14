import type { ComponentProps, ReactElement } from "react";

import { listClass } from "./constants/breadcrumbClass";

export interface BreadcrumbOwnProps {
  /** 탐색 영역 이름. 기본값 `"이동 경로"`. 한 화면에 같은 이름의 탐색 영역이 겹치지 않게 한다. */
  "aria-label"?: string;
}

export interface BreadcrumbProps
  extends BreadcrumbOwnProps, Omit<ComponentProps<"nav">, keyof BreadcrumbOwnProps> {}

/**
 * 현재 페이지까지의 경로를 보여 주는 탐색 영역(`<nav>` 안의 `<ol>`). 자식은 `BreadcrumbItem`이다.
 * `ref`·`className`은 `<nav>`에 붙는다. 서버 컴포넌트로 쓸 수 있다.
 * Tide props: `aria-label` ({@link BreadcrumbOwnProps}). 나머지는 `<nav>` 속성.
 */
export function Breadcrumb({
  "aria-label": ariaLabel = "이동 경로",
  children,
  ...props
}: BreadcrumbProps): ReactElement {
  return (
    <nav {...props} aria-label={ariaLabel}>
      <ol className={listClass}>{children}</ol>
    </nav>
  );
}
