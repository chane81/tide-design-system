import type { ComponentProps, ReactElement } from "react";

export interface TableHeadProps extends ComponentProps<"thead"> {}

/** 머리 행 묶음 `<thead>`. 안의 행은 hover로 바뀌지 않는다. */
export function TableHead(props: TableHeadProps): ReactElement {
  return <thead {...props} />;
}
