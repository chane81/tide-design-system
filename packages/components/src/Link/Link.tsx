import type { ComponentProps, ReactElement } from "react";

import { renderElement } from "../_internal/libs/renderElement";
import type { Role } from "../types";

export interface LinkOwnProps {
  /** 글자색 Role(Tide Role + 앱 Role). 기본값 `primary`. 색 계열 이름은 받지 않는다. */
  color?: Role;
  /** 다른 요소로 렌더한다. 예: `render={<NextLink href="/x" />}`. props·ref·className을 병합한다. */
  render?: ReactElement;
}

export interface LinkProps extends LinkOwnProps, Omit<ComponentProps<"a">, keyof LinkOwnProps> {}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
// 색만으로 링크를 구분하지 않게 밑줄을 항상 둔다(WCAG 1.4.1). cursor는 render로 바꾼 요소용이다.
const baseClass =
  "cursor-pointer rounded-sm text-accent underline decoration-1 underline-offset-2 hover:decoration-2 focus-visible:focus-ring";

/**
 * 문장 안에서 다른 페이지나 위치로 이동하는 텍스트 링크. 글자 크기·굵기는 물려받는다. 서버 컴포넌트로 쓸 수 있다.
 * Tide props: `color`, `render` ({@link LinkOwnProps}). 나머지는 `<a>` 속성.
 */
export function Link({ color = "primary", render, ...props }: LinkProps): ReactElement {
  return renderElement({
    defaultElement: "a",
    render,
    baseClassName: baseClass,
    // 바깥 data-color를 물려받지 않게 항상 붙인다(ADR 0011).
    props: { ...props, "data-color": color } as LinkProps,
  });
}
