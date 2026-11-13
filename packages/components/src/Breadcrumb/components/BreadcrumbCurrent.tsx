import type { ComponentProps, ReactElement } from "react";

import { cn } from "../../_internal/libs/cn";
import { currentClass } from "../constants/breadcrumbClass";

export interface BreadcrumbCurrentProps extends ComponentProps<"span"> {}

/** 현재 페이지 `<span aria-current="page">`. 링크가 아니다. 경로의 마지막 항목에 둔다. */
export function BreadcrumbCurrent({ className, ...props }: BreadcrumbCurrentProps): ReactElement {
  return <span aria-current="page" {...props} className={cn(currentClass, className)} />;
}
