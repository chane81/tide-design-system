import type { ComponentProps, ReactElement } from "react";

import { cn } from "../libs/cn.ts";

// 이 파일은 hook·state·이벤트를 쓰지 않으므로 "use client"가 없다. 서버 컴포넌트에서 쓸 수 있다.
// 네이티브 `<hr>`이고 React Aria `useSeparator`를 쓰지 않는다(ADR 0004). `<hr>`은 암묵 역할이 separator(가로)라
// 네이티브만으로 패턴이 완결된다. 세로는 `aria-orientation="vertical"`, 장식용은 `role="none"`을 붙인다
// (HTML-ARIA: hr에 허용된 역할은 none·presentation·doc-pagebreak, separator는 aria-orientation을 받는다).

/** Separator의 방향 */
type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps extends Omit<ComponentProps<"hr">, "children" | "role"> {
  /** `horizontal`(기본값)은 위아래 내용을, `vertical`은 한 줄 안의 양옆 내용을 나눈다. */
  orientation?: SeparatorOrientation;
  /**
   * 보기만 나누는 선이면 `true`. `role="none"`이 붙어 보조 기술에서 빠진다. 기본값은 `false`(separator 역할)다.
   * 내용의 주제가 바뀌는 곳이면 `false`로 둔다.
   */
  decorative?: boolean;
}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// - 선은 border-default 1px다. 장식용 구분선이라 대비 검사에서 제외된 Token이다(foundation contrastExclusions).
//   의미 구분(separator 역할)이어도 선이 정보를 전하지 않는다. 구분은 역할과 주변 내용이 전한다.
// - preflight의 hr 기본값(height 0, border-top 1px)을 쓰지 않고 방향마다 한쪽 경계만 둔다. 바깥 여백은 0이고 className이 정한다.
// - 세로는 flex 안에서 줄 높이만큼 늘어난다(self-stretch). 논리 방향(border-s)이라 RTL에서도 같은 모양이다.
// - forced-colors에서는 브라우저가 경계를 CanvasText로 덮는다.
const orientationClass: Record<SeparatorOrientation, string> = {
  horizontal: "h-0 w-full border-t",
  vertical: "h-auto w-0 self-stretch border-s",
};

const baseClass = "m-0 shrink-0 border-0 border-default";

/**
 * 내용 묶음 사이를 선으로 나눈다. 기본은 의미 구분(separator 역할)이고, `decorative`면 보조 기술에서 빠진다.
 * 서버 컴포넌트로 쓸 수 있다.
 */
export function Separator({
  orientation = "horizontal",
  decorative = false,
  className,
  ...props
}: SeparatorProps): ReactElement {
  return (
    <hr
      {...props}
      // hr은 가로가 기본이라 세로일 때만 aria-orientation을 붙인다. 장식용은 역할 자체가 없어 붙이지 않는다.
      role={decorative ? "none" : undefined}
      aria-orientation={!decorative && orientation === "vertical" ? "vertical" : undefined}
      data-orientation={orientation}
      className={cn(baseClass, orientationClass[orientation], className)}
    />
  );
}
