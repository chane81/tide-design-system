import type { ComponentProps, ReactElement } from "react";

import { renderElement } from "./libs/renderElement.ts";
import type { Role } from "./types.ts";

// 이 파일은 hook·state·이벤트를 쓰지 않으므로 "use client"가 없다. 서버 컴포넌트에서 쓸 수 있다.
// 사용자가 준 onClick 등은 그대로 넘기기만 한다(서버 컴포넌트에서는 Next 규칙대로 함수를 넘길 수 없다).

export interface LinkProps extends Omit<ComponentProps<"a">, "color"> {
  /**
   * Role. Tide Role 6개와 앱이 `RoleRegistry`에 더한 Role을 받는다. 기본값은 `primary`다.
   * 색 계열 이름(`blue` 등)은 받지 않는다. 행동의 뜻을 색으로 전하기 때문이다(ADR 0016).
   * 루트에 `data-color`로 붙어 글자색(`text-accent`)을 정한다. 바깥 요소의 색을 물려받지 않는다.
   */
  color?: Role;
  /**
   * 다른 요소로 렌더한다. 예: `render={<NextLink href="/x" />}`.
   * props, ref, className을 그 요소에 병합한다.
   */
  render?: ReactElement;
}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// - 글자색은 accent 슬롯의 text다(ADR 0011). 색 이름마다 text × 표면 층 대비 쌍(4.5:1)이 등록되어 있다.
// - 밑줄을 항상 둔다. 문장 안 링크를 색만으로 구분하지 않기 위해서다(WCAG 1.4.1). hover에는 밑줄이 두꺼워진다.
// - 글자 크기와 굵기는 물려받는다. 문장 안에서 쓰기 때문이다.
// - 포커스 표시는 focus-ring이다. 여러 줄로 감긴 링크도 ring이 줄마다 그려진다(inline 요소의 outline).
// - 커서는 pointer다. `<a href>`는 이미 pointer지만 render로 바꾼 요소도 같게 한다.
const baseClass =
  "cursor-pointer rounded-sm text-accent underline decoration-1 underline-offset-2 hover:decoration-2 focus-visible:focus-ring";

/**
 * 문장 안에서 다른 페이지나 위치로 이동하는 텍스트 링크.
 * Next.js에서는 `render={<NextLink href="/x" />}`로 클라이언트 이동을 쓴다.
 */
export function Link({ color = "primary", render, ...props }: LinkProps): ReactElement {
  return renderElement({
    defaultElement: "a",
    render,
    baseClassName: baseClass,
    // 색은 항상 붙인다(기본 primary). 바깥 data-color를 물려받지 않게 한다(ADR 0011).
    props: { ...props, "data-color": color } as LinkProps,
  });
}
