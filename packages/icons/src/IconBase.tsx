import type { ComponentProps, ReactElement } from "react";

export interface IconOwnProps {
  /** 가로·세로 크기(px). 기본 16. */
  size?: number;
  /** 선 두께. 기본 2. 렌더된 두께 기준이라 `size`를 바꿔도 화면에서 같은 두께로 그려진다. */
  strokeWidth?: number;
}

export interface IconProps extends IconOwnProps, Omit<ComponentProps<"svg">, keyof IconOwnProps> {}

/**
 * 모든 아이콘의 공통 틀. `aria-label`이 있으면 이미지(`role="img"`)로 읽히고, 없으면 장식용으로 숨긴다.
 * hook이 없어야 서버 컴포넌트로 쓸 수 있다.
 * Tide props: `size`, `strokeWidth` ({@link IconOwnProps}). 나머지는 `<svg>` 속성.
 */
export function IconBase({
  size = 16,
  strokeWidth = 2,
  children,
  ...props
}: IconProps): ReactElement {
  const named = props["aria-label"] !== undefined && props["aria-label"] !== "";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...(named ? { role: "img" } : { "aria-hidden": true, focusable: false })}
      {...props}
    >
      {children}
    </svg>
  );
}
