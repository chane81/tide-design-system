import type { ComponentProps, ReactElement } from "react";

export interface PaginationItemProps extends ComponentProps<"li"> {}

/** 목록의 한 항목 `<li>`. 기본 class가 없다. */
export function PaginationItem(props: PaginationItemProps): ReactElement {
  // 빈 class 속성을 만들지 않게 cn을 거치지 않는다.
  return <li {...props} />;
}
