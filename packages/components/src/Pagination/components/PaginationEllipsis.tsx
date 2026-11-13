import { EllipsisIcon } from "@tide-design/icons";
import type { ComponentProps, ReactElement, ReactNode } from "react";

import { cn } from "../../_internal/libs/cn.ts";
import { VisuallyHidden } from "../../VisuallyHidden/VisuallyHidden.tsx";
import { ellipsisClass } from "../constants/paginationClass.ts";

export interface PaginationEllipsisProps extends Omit<ComponentProps<"span">, "children"> {
  /** 스크린리더가 읽는 텍스트. 화면에는 「…」 아이콘만 보인다. 기본값은 `"페이지 생략"`이다. */
  children?: ReactNode;
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
