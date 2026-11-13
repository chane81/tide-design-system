import type { ComponentProps, ReactElement } from "react";

import { renderElement } from "../_internal/libs/renderElement";

// hook·state·이벤트를 쓰지 않으므로 "use client"를 두지 않는다.

export interface CardProps extends ComponentProps<"div"> {
  /**
   * 다른 요소로 렌더한다. 예: `render={<article />}`, `render={<li />}`.
   * 묶음의 뜻이 있으면 그 요소를 고른다. props, ref, className을 그 요소에 병합한다.
   */
  render?: ReactElement;
}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
// 경계는 조작 요소가 아닌 장식용 구분선이라 대비 검사 대상이 아니다(WCAG 1.4.11).
const baseClass = "rounded-lg border border-default bg-surface p-4 text-default";

/**
 * 관련 내용을 한 덩어리로 묶는 surface 표면 컨테이너. 경계만 있고 그림자는 없다.
 * 기본 요소는 `div`이고, `render`로 `article`·`section`·`li` 등을 쓴다. 서버 컴포넌트로 쓸 수 있다.
 */
export function Card({ render, ...props }: CardProps): ReactElement {
  return renderElement({
    defaultElement: "div",
    render,
    baseClassName: baseClass,
    props,
  });
}
