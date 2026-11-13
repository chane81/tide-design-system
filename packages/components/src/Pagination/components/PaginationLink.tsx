import type { ComponentProps, ReactElement } from "react";

import { Button, type ButtonProps } from "../../Button/Button";
import { cn } from "../../_internal/libs/cn";
import { itemSize, linkClass } from "../constants/paginationClass";

export interface PaginationLinkProps extends Omit<ComponentProps<"a">, "color"> {
  /** 현재 페이지인지. `aria-current="page"`를 붙이고 subtle 채움으로 보인다. 기본값은 `false`다. */
  current?: boolean;
  /**
   * 다른 요소로 렌더한다. 예: `render={<NextLink href="?page=2" />}`.
   * 상태로 페이지를 바꾸면 `render={<button type="button" onClick={...} />}`를 쓴다.
   */
  render?: ReactElement;
}

/** 페이지 번호 링크. 기본은 `<a>`이고 Button(ghost, 32px) 모양이다. 현재 페이지는 `current`를 준다. */
export function PaginationLink({
  current = false,
  render,
  className,
  ...props
}: PaginationLinkProps): ReactElement {
  return (
    <Button
      // a의 props는 Button이 render 요소에 그대로 병합한다.
      {...(props as Omit<ButtonProps, "color">)}
      render={render ?? <a />}
      variant={current ? "subtle" : "ghost"}
      color={current ? "primary" : "neutral"}
      size={itemSize}
      aria-current={current ? "page" : props["aria-current"]}
      className={cn(linkClass, className)}
    />
  );
}
