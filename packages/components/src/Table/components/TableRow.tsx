import type { ComponentProps, ReactElement } from "react";

import { cn } from "../../_internal/libs/cn";
import { rowClass } from "../constants/tableClass";

export interface TableRowProps extends ComponentProps<"tr"> {}

/** 행 `<tr>`. 아래 경계가 있고, `TableBody` 안에서는 hover 배경이 transition 없이 바로 바뀐다. */
export function TableRow({ className, ...props }: TableRowProps): ReactElement {
  return <tr {...props} className={cn(rowClass, className)} />;
}
