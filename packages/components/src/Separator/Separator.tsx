import type { ComponentProps, ReactElement } from "react";

import { cn } from "../_internal/libs/cn";

type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorOwnProps {
  /** `horizontal`(기본값)은 위아래 내용을, `vertical`은 한 줄 안의 양옆 내용을 나눈다. */
  orientation?: SeparatorOrientation;
  /** 보기만 나누는 선이면 `true`(`role="none"`, 보조 기술에서 빠진다). 기본값 `false`. 주제가 바뀌는 곳이면 `false`로 둔다. */
  decorative?: boolean;
}

export interface SeparatorProps
  extends
    SeparatorOwnProps,
    Omit<ComponentProps<"hr">, keyof SeparatorOwnProps | "children" | "role"> {}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
// border-default는 대비 검사 제외 Token이다. 선이 아니라 역할과 주변 내용이 구분을 전한다.
const orientationClass: Record<SeparatorOrientation, string> = {
  horizontal: "h-0 w-full border-t",
  vertical: "h-auto w-0 self-stretch border-s",
};

const baseClass = "m-0 shrink-0 border-0 border-default";

/**
 * 내용 묶음 사이를 선(`<hr>`)으로 나눈다. `decorative`면 보조 기술에서 빠진다. 서버 컴포넌트로 쓸 수 있다.
 * Tide props: `orientation`, `decorative` ({@link SeparatorOwnProps}). 나머지는 `<hr>` 속성.
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
      // hr은 암묵 역할이 가로 separator라 세로일 때만 aria-orientation을 붙인다.
      role={decorative ? "none" : undefined}
      aria-orientation={!decorative && orientation === "vertical" ? "vertical" : undefined}
      data-orientation={orientation}
      className={cn(baseClass, orientationClass[orientation], className)}
    />
  );
}
