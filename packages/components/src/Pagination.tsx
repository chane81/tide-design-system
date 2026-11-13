import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from "@tide-design/icons";
import type { ComponentProps, ReactElement, ReactNode } from "react";

import { Button, type ButtonProps } from "./Button.tsx";
import { cn } from "./cn.ts";
import { IconButton, type IconButtonProps } from "./IconButton.tsx";
import { VisuallyHidden } from "./VisuallyHidden.tsx";

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

/** 페이지 번호·이전/다음 항목의 고정 size. 둘 다 32×32px다(24×24 이상). */
const itemSize = "sm" satisfies ButtonProps["size"];

export interface PaginationProps extends ComponentProps<"nav"> {
  /** 탐색 영역 이름. 기본값은 `"페이지 이동"`이다. 한 화면에 목록이 여럿이면 `"댓글 페이지"`처럼 구분한다. */
  "aria-label"?: string;
}
export interface PaginationItemProps extends ComponentProps<"li"> {}
export interface PaginationLinkProps extends Omit<ComponentProps<"a">, "color"> {
  /** 현재 페이지인지. `aria-current="page"`를 붙이고 subtle 채움으로 보인다. 기본값은 `false`다. */
  current?: boolean;
  /**
   * 다른 요소로 렌더한다. 예: `render={<NextLink href="?page=2" />}`.
   * 상태로 페이지를 바꾸면 `render={<button type="button" onClick={...} />}`를 쓴다. props, ref, className을 병합한다.
   */
  render?: ReactElement;
}

/** 이전/다음 항목 props. IconButton의 props에서 모양(variant·color·size)과 아이콘·로딩을 고정했다. */
export interface PaginationArrowProps extends Omit<
  IconButtonProps,
  "aria-label" | "children" | "variant" | "color" | "size" | "loading" | "loadingLabel"
> {
  /** 버튼 이름. 기본값은 이전 `"이전 페이지"`, 다음 `"다음 페이지"`다. */
  "aria-label"?: string;
}
export interface PaginationPreviousProps extends PaginationArrowProps {}
export interface PaginationNextProps extends PaginationArrowProps {}
export interface PaginationEllipsisProps extends Omit<ComponentProps<"span">, "children"> {
  /** 스크린리더가 읽는 텍스트. 화면에는 「…」 아이콘만 보인다. 기본값은 `"페이지 생략"`이다. */
  children?: ReactNode;
}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// - 목록은 가로로 늘어놓고 항목 사이는 4px다. 좁으면 줄을 바꾼다.
const listClass = "flex flex-wrap items-center gap-1";

// - 번호는 정사각형부터 시작한다(최소 폭 32px). 두 자리 이상이면 가로 여백 8px로 늘어난다. 숫자 폭은 같게 둔다.
const linkClass = "min-w-8 px-2 tabular-nums";

// - 생략 표시는 번호와 같은 32×32px 칸에 「…」 아이콘(16px)을 둔다. 글자색은 text-muted다(아이콘은 장식용).
const ellipsisClass = "inline-flex size-8 items-center justify-center text-muted";

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

/** 목록의 한 항목 `<li>`. 기본 class가 없다. */
export function PaginationItem(props: PaginationItemProps): ReactElement {
  // 기본 class가 없어 className을 그대로 넘긴다(빈 class 속성을 만들지 않는다).
  return <li {...props} />;
}

/**
 * 페이지 번호 링크. 기본은 `<a>`이고 Button(ghost, 32px) 모양이다. 현재 페이지는 `current`를 준다.
 * Next.js에서는 `render={<NextLink href="?page=2" />}`를 쓴다.
 */
export function PaginationLink({
  current = false,
  render,
  className,
  ...props
}: PaginationLinkProps): ReactElement {
  return (
    <Button
      // a의 props를 Button에 넘긴다. Button은 render 요소(기본 `<a />`)에 그대로 병합한다.
      {...(props as Omit<ButtonProps, "color">)}
      render={render ?? <a />}
      // 현재 페이지는 primary subtle(bg-accent-subtle + text-accent-on-subtle), 나머지는 neutral ghost(text-default)다.
      variant={current ? "subtle" : "ghost"}
      color={current ? "primary" : "neutral"}
      size={itemSize}
      aria-current={current ? "page" : props["aria-current"]}
      className={cn(linkClass, className)}
    />
  );
}

/** 이전 페이지로 가는 IconButton(ghost, 32px, ‹). 첫 페이지에서는 `disabled`를 준다. */
export function PaginationPrevious({
  "aria-label": ariaLabel = "이전 페이지",
  ...props
}: PaginationPreviousProps): ReactElement {
  return (
    <IconButton {...props} aria-label={ariaLabel} variant="ghost" color="neutral" size={itemSize}>
      <ChevronLeftIcon />
    </IconButton>
  );
}

/** 다음 페이지로 가는 IconButton(ghost, 32px, ›). 마지막 페이지에서는 `disabled`를 준다. */
export function PaginationNext({
  "aria-label": ariaLabel = "다음 페이지",
  ...props
}: PaginationNextProps): ReactElement {
  return (
    <IconButton {...props} aria-label={ariaLabel} variant="ghost" color="neutral" size={itemSize}>
      <ChevronRightIcon />
    </IconButton>
  );
}

/** 생략된 번호 자리 `<span>`. 화면에는 「…」 아이콘, 스크린리더에는 텍스트(기본 `"페이지 생략"`)를 보인다. */
export function PaginationEllipsis({
  className,
  children = "페이지 생략",
  ...props
}: PaginationEllipsisProps): ReactElement {
  return (
    <span {...props} className={cn(ellipsisClass, className)}>
      <EllipsisIcon />
      <VisuallyHidden>{children}</VisuallyHidden>
    </span>
  );
}
