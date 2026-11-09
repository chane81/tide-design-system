import type { ComponentProps, ReactElement } from "react";

export type IconProps = Omit<ComponentProps<"svg">, "strokeWidth"> & {
  /** 가로·세로 크기(px). 기본 16. */
  size?: number;
  /**
   * 선 두께. 기본 2. 렌더된 두께 기준이라 `size`를 바꿔도 화면에서 같은 두께로 그려진다
   * (각 도형에 `vector-effect: non-scaling-stroke`).
   */
  strokeWidth?: number;
};

/**
 * 모든 아이콘의 공통 틀. 손으로 쓰는 유일한 아이콘 코드이고, 각 아이콘은 이 틀에 도형만 넣는다.
 * - 색은 `currentColor`라 글자색을 따른다.
 * - `aria-label`이 있으면 이미지(`role="img"`)로 읽히고, 없으면 장식용으로 숨긴다.
 * - 나머지 SVG 속성은 그대로 넘긴다(기본값보다 뒤에 펼쳐 덮어쓸 수 있다).
 * hook이 없어 서버 컴포넌트로 쓸 수 있다.
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
