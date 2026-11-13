import type { ComponentProps, ReactElement } from "react";

import { cn } from "../_internal/libs/cn";
import { tableClass } from "./constants/tableClass";

// 시맨틱 표 요소를 그대로 쓰고 React Aria useTable은 쓰지 않는다(grid 위젯이 아니다, ADR 0004).
// 표 요소는 부모·자식 구조가 정해져 있어 다른 요소로 바꾸면 표 모델이 깨지므로 `render` prop은 두지 않는다.
export interface TableProps extends ComponentProps<"table"> {}

/**
 * 시맨틱 `<table>`. 행·열로 된 데이터를 보여 준다. 정렬·행 선택·가상화는 없다. 서버 컴포넌트로 쓸 수 있다.
 * 표의 이름은 `<caption>`이나 `aria-label`·`aria-labelledby`로 준다.
 */
export function Table({ className, ...props }: TableProps): ReactElement {
  return <table {...props} className={cn(tableClass, className)} />;
}
