import { EllipsisIcon } from "@tide-design/icons";
import type { ComponentProps, ReactElement, ReactNode } from "react";

import { cn } from "../../_internal/libs/cn";
import { VisuallyHidden } from "../../VisuallyHidden/VisuallyHidden";
import { ellipsisClass } from "../constants/paginationClass";

export interface PaginationEllipsisOwnProps {
  /** 스크린리더가 읽는 텍스트(화면에는 「…」만 보인다). 기본값 `"페이지 생략"`. */
  children?: ReactNode;
}

export interface PaginationEllipsisProps
  extends
    PaginationEllipsisOwnProps,
    Omit<ComponentProps<"span">, keyof PaginationEllipsisOwnProps> {}

/**
 * 생략된 번호 자리. 화면에는 「…」 아이콘, 스크린리더에는 텍스트를 보인다.
 * Tide props: `children` ({@link PaginationEllipsisOwnProps}). 나머지는 `<span>` 속성.
 */
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
