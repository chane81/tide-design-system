import type { ComponentProps, ReactElement } from "react";

export interface TableBodyProps extends ComponentProps<"tbody"> {}

/** 본문 행 묶음 `<tbody>`. 바로 아래 `TableRow`에 마우스를 올리면 배경이 바로 바뀐다. */
export function TableBody(props: TableBodyProps): ReactElement {
  return <tbody {...props} />;
}
