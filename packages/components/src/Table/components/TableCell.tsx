import type { ComponentProps, ReactElement } from "react";

import { cn } from "../../_internal/libs/cn.ts";
import { cellClass } from "../constants/tableClass.ts";

export interface TableCellProps extends ComponentProps<"td"> {}

/** 데이터 칸 `<td>`. 숫자 열은 `className="tabular-nums text-end"`로 자릿수를 맞춘다. */
export function TableCell({ className, ...props }: TableCellProps): ReactElement {
  return <td {...props} className={cn(cellClass, className)} />;
}
