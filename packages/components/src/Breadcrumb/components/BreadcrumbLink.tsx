import type { ComponentProps, ReactElement } from "react";

import { renderElement } from "../../_internal/libs/renderElement";
import { linkClass } from "../constants/breadcrumbClass";

export interface BreadcrumbLinkOwnProps {
  /** 다른 요소로 렌더한다. 예: `render={<NextLink href="/docs" />}`. props·ref·className을 병합한다. */
  render?: ReactElement;
}

export interface BreadcrumbLinkProps
  extends
    BreadcrumbLinkOwnProps,
    Omit<ComponentProps<"a">, keyof BreadcrumbLinkOwnProps | "color"> {}

/**
 * 상위 페이지 링크 `<a>`. 밑줄이 있고 hover에 짙어진다.
 * Tide props: `render` ({@link BreadcrumbLinkOwnProps}). 나머지는 `<a>` 속성.
 */
export function BreadcrumbLink({ render, ...props }: BreadcrumbLinkProps): ReactElement {
  return renderElement({ defaultElement: "a", render, baseClassName: linkClass, props });
}
