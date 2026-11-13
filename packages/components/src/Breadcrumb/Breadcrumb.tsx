import type { ComponentProps, ReactElement } from "react";

import { listClass } from "./constants/breadcrumbClass";

// 이 파일은 hook·state·이벤트를 쓰지 않으므로 "use client"가 없다. 서버 컴포넌트에서 쓸 수 있다.
//
// 구현 방식(tide-v0-impl 티켓 24, WAI-ARIA APG Breadcrumb Pattern):
// - `<nav>` 탐색 랜드마크에 이름(기본 `aria-label="이동 경로"`)을 붙이고, 안에 순서 있는 목록 `<ol>`을 둔다.
//   React Aria(useBreadcrumbs)는 쓰지 않는다. 네이티브 요소로 완결된다(ADR 0004 「네이티브」 단계).
// - 현재 페이지는 링크가 아닌 `BreadcrumbCurrent`(`<span aria-current="page">`)다. APG는 현재 페이지가 링크가 아니면
//   aria-current를 선택으로 두지만, 「현재 항목은 aria-current로 표시한다」(티켓 24)에 따라 항상 붙인다.
// - 구분자는 아이콘 패키지의 `ChevronRightIcon`이다. IconBase가 이름 없는 아이콘에 `aria-hidden`을 붙여
//   스크린리더가 읽지 않는다(APG: 구분자는 접근성 트리에 나오지 않게 한다). `BreadcrumbItem`이 자기 앞에 붙이고,
//   목록의 첫 항목에서는 숨긴다. 앱이 구분자를 따로 놓지 않아도 된다.
// - `render` prop은 루트가 링크 하나인 `BreadcrumbLink`에만 둔다(ADR 0005). Next `Link`는 `render={<NextLink href="/x" />}`.

export interface BreadcrumbProps extends ComponentProps<"nav"> {
  /** 탐색 영역 이름. 기본값은 `"이동 경로"`다. 한 화면에 같은 이름의 탐색 영역이 겹치지 않게 한다. */
  "aria-label"?: string;
}

/**
 * 현재 페이지까지의 경로를 보여 주는 탐색 영역. `<nav>` 안의 `<ol>`이다.
 * 자식은 `BreadcrumbItem`이고, 그 안에 `BreadcrumbLink`(상위 페이지)나 `BreadcrumbCurrent`(현재 페이지)를 둔다.
 * `ref`·`className`은 `<nav>`에 붙는다.
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
