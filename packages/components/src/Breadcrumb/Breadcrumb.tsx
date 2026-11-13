import { ChevronRightIcon } from "@tide-design/icons";
import type { ComponentProps, ReactElement } from "react";

import { cn } from "../_internal/libs/cn.ts";
import { renderElement } from "../_internal/libs/renderElement.ts";

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
export interface BreadcrumbItemProps extends ComponentProps<"li"> {}
export interface BreadcrumbLinkProps extends Omit<ComponentProps<"a">, "color"> {
  /**
   * 다른 요소로 렌더한다. 예: `render={<NextLink href="/docs" />}`.
   * props, ref, className을 그 요소에 병합한다.
   */
  render?: ReactElement;
}
export interface BreadcrumbCurrentProps extends ComponentProps<"span"> {}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// - 목록은 가로로 늘어놓고 좁으면 줄을 바꾼다. 글자는 body-sm(14/20), 기본 색은 text-muted다.
//   text-default·text-muted × 표면 층 3개 4.5:1이 등록되어 있다.
const listClass = "flex flex-wrap items-center gap-1.5 text-body-sm text-muted";

// - 항목은 구분자와 내용을 가로로 둔다. 구분자는 16px이고 글자색(text-muted)을 따른다. 장식용이라 대비 검사 대상이 아니다.
// - 첫 항목의 구분자는 숨긴다. 선택자는 `li:first-child > 구분자`다(Tailwind 임의 변형의 `&` 자리 표시자).
const itemClass = "inline-flex items-center gap-1.5";
const separatorClass = "size-4 shrink-0 [li:first-child>&]:hidden";

// - 링크는 Link와 같은 밑줄 규칙이다(항상 밑줄, hover에 두꺼워짐). 탐색 영역 안이지만 현재 페이지와 색·굵기에 더해
//   밑줄로도 구분한다(WCAG 1.4.1, 원칙 ① 접근성 우선). 색은 text-muted이고 hover에 text-default로 짙어진다.
//   Link처럼 transition은 없다.
// - 포커스 표시는 focus-ring, 커서는 pointer다(render로 바꾼 요소도 같게 한다).
const linkClass =
  "cursor-pointer rounded-sm underline decoration-1 underline-offset-2 hover:text-default hover:decoration-2 focus-visible:focus-ring";

// - 현재 페이지는 text-default에 label-md(14/20, 500)로 링크보다 짙고 굵다. 밑줄이 없다.
const currentClass = "text-label-md text-default";

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

/** 경로의 한 항목 `<li>`. 앞에 장식용 구분자(›)를 붙이고, 목록의 첫 항목에서는 숨긴다. */
export function BreadcrumbItem({
  className,
  children,
  ...props
}: BreadcrumbItemProps): ReactElement {
  return (
    <li {...props} className={cn(itemClass, className)}>
      <ChevronRightIcon className={separatorClass} />
      {children}
    </li>
  );
}

/** 상위 페이지 링크 `<a>`. 밑줄이 있고 hover에 짙어진다. Next.js에서는 `render={<NextLink href="/x" />}`를 쓴다. */
export function BreadcrumbLink({ render, ...props }: BreadcrumbLinkProps): ReactElement {
  return renderElement({ defaultElement: "a", render, baseClassName: linkClass, props });
}

/** 현재 페이지 `<span aria-current="page">`. 링크가 아니다. 경로의 마지막 항목에 둔다. */
export function BreadcrumbCurrent({ className, ...props }: BreadcrumbCurrentProps): ReactElement {
  return <span aria-current="page" {...props} className={cn(currentClass, className)} />;
}
