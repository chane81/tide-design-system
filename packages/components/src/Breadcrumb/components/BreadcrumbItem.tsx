import { ChevronRightIcon } from "@tide-design/icons";
import type { ComponentProps, ReactElement } from "react";

import { cn } from "../../_internal/libs/cn";
import { itemClass, separatorClass } from "../constants/breadcrumbClass";

export interface BreadcrumbItemProps extends ComponentProps<"li"> {}

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
