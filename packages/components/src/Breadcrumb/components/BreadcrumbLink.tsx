import type { ComponentProps, ReactElement } from "react";

import { renderElement } from "../../_internal/libs/renderElement";
import { linkClass } from "../constants/breadcrumbClass";

export interface BreadcrumbLinkProps extends Omit<ComponentProps<"a">, "color"> {
  /**
   * 다른 요소로 렌더한다. 예: `render={<NextLink href="/docs" />}`.
   * props, ref, className을 그 요소에 병합한다.
   */
  render?: ReactElement;
}

/** 상위 페이지 링크 `<a>`. 밑줄이 있고 hover에 짙어진다. Next.js에서는 `render={<NextLink href="/x" />}`를 쓴다. */
export function BreadcrumbLink({ render, ...props }: BreadcrumbLinkProps): ReactElement {
  return renderElement({ defaultElement: "a", render, baseClassName: linkClass, props });
}
