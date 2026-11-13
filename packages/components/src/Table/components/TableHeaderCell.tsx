import type { ComponentProps, ReactElement } from "react";

import { cn } from "../../_internal/libs/cn";
import { headerCellClass } from "../constants/tableClass";

export interface TableHeaderCellProps extends ComponentProps<"th"> {
  /**
   * 이 머리 칸이 맡는 범위. 기본값은 `"col"`(아래 열)이다. 본문 행의 첫 칸처럼 행을 맡으면 `"row"`를 준다.
   * 열 그룹·행 그룹 머리는 `"colgroup"`·`"rowgroup"`이다.
   */
  scope?: "col" | "row" | "colgroup" | "rowgroup";
}

/**
 * 머리 칸 `<th>`. 기본은 `scope="col"`(열 머리, columnheader)이다. 본문 행의 행 머리는 `scope="row"`(rowheader)를 준다.
 * 복잡한 표(여러 줄 머리)는 `id`와 칸의 `headers`로 직접 잇는다.
 */
export function TableHeaderCell({
  // scope가 없으면 브라우저·보조 기술·테스트 도구가 위치로 추측한 결과가 서로 달라 기본값을 둔다.
  scope = "col",
  className,
  ...props
}: TableHeaderCellProps): ReactElement {
  return <th {...props} scope={scope} className={cn(headerCellClass, className)} />;
}
