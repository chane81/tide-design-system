import type { ComponentProps, ReactElement } from "react";

import { Button, type ButtonProps } from "../../Button/Button";
import { cn } from "../../_internal/libs/cn";
import { itemSize, linkClass } from "../constants/paginationClass";

export interface PaginationLinkProps extends Omit<ComponentProps<"a">, "color"> {
  /** 현재 페이지인지. `aria-current="page"`를 붙이고 subtle 채움으로 보인다. 기본값은 `false`다. */
  current?: boolean;
  /**
   * 다른 요소로 렌더한다. 예: `render={<NextLink href="?page=2" />}`.
   * 상태로 페이지를 바꾸면 `render={<button type="button" onClick={...} />}`를 쓴다. props, ref, className을 병합한다.
   */
  render?: ReactElement;
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
