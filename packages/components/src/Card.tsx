import type { ComponentProps, ReactElement } from "react";

import { renderElement } from "./render.ts";

// 이 파일은 hook·state·이벤트를 쓰지 않으므로 "use client"가 없다. 서버 컴포넌트에서 쓸 수 있다.

export interface CardProps extends ComponentProps<"div"> {
  /**
   * 다른 요소로 렌더한다. 예: `render={<article />}`, `render={<li />}`.
   * 묶음의 뜻이 있으면 그 요소를 고른다. props, ref, className을 그 요소에 병합한다.
   */
  render?: ReactElement;
}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// - 표면은 surface 층이다(canvas와 같은 색). 그림자는 없고 border-default 경계만 쓴다(spec 「Card」).
//   border-default는 장식용 구분선이라 대비 검사에서 제외된 Token이다. Card 경계는 조작 요소의 경계가 아니다(WCAG 1.4.11 대상 아님).
// - 글자는 text-default다. text-default × bg-surface 4.5:1이 등록되어 있다.
// - radius는 담는 요소의 lg다(spec radius 「쓰는 곳」). 안쪽 여백은 16px이고 className(`p-6`, `p-0` 등)이 이긴다.
// - forced-colors에서는 브라우저가 배경을 Canvas로, 경계를 CanvasText로 덮어 경계가 그대로 보인다.
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
