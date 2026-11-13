import type { ComponentProps, ReactElement } from "react";

import { cn } from "../libs/cn.ts";
import type { Size } from "../types.ts";

/** Spinner의 size. 공통 size 4개를 모두 받는다. */
type SpinnerSize = Extract<Size, "xs" | "sm" | "md" | "lg">;

export interface SpinnerProps extends Omit<ComponentProps<"svg">, "children"> {
  /**
   * 같은 size의 Component(Button 등) 안 텍스트 옆 아이콘과 같은 크기다.
   * `xs`·`sm` 14px, `md` 16px, `lg` 20px. 기본값은 `md`다.
   */
  size?: SpinnerSize;
  /** 접근 가능한 이름. 기본값은 `"로딩 중"`이다. 무엇을 불러오는지 적으면 더 좋다. */
  "aria-label"?: string;
}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// 크기는 spec 아이콘 크기 규칙의 「텍스트 옆 아이콘」 열이다(Button 로딩 상태에서 아이콘 자리에 들어간다).
const sizeClass: Record<SpinnerSize, string> = {
  xs: "size-3.5",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

/**
 * 로딩 중임을 알리는 회전 표시. 역할은 `status`이고 접근 가능한 이름이 기본으로 붙는다.
 * 회전은 keyframe(`animate-spin`)이고 움직임 줄이기에서도 멈추지 않는다(로딩 여부 자체가 정보다).
 * 색은 `currentColor`라 주변 글자색을 따른다. 서버 컴포넌트로 쓸 수 있다.
 */
export function Spinner({
  size = "md",
  className,
  "aria-label": ariaLabel = "로딩 중",
  ...props
}: SpinnerProps): ReactElement {
  return (
    <svg
      role="status"
      aria-label={ariaLabel}
      viewBox="0 0 24 24"
      fill="none"
      focusable="false"
      {...props}
      className={cn("shrink-0 animate-spin", sizeClass[size], className)}
    >
      {/* 12시에서 시계 방향으로 도는 3/4 원호. 선 두께는 size와 관계없이 2px다(label 옆 아이콘 규칙). */}
      <path
        d="M12 3a9 9 0 1 1-9 9"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
