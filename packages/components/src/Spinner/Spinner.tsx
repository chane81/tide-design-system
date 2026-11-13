import type { ComponentProps, ReactElement } from "react";

import { cn } from "../_internal/libs/cn";
import type { Size } from "../types";

type SpinnerSize = Extract<Size, "xs" | "sm" | "md" | "lg">;

export interface SpinnerProps extends Omit<ComponentProps<"svg">, "children"> {
  /** `xs`·`sm` 14px, `md` 16px, `lg` 20px(같은 size Component의 텍스트 옆 아이콘 크기). 기본값 `md`. */
  size?: SpinnerSize;
  /** 접근 가능한 이름. 기본값은 `"로딩 중"`이다. 무엇을 불러오는지 적으면 더 좋다. */
  "aria-label"?: string;
}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
const sizeClass: Record<SpinnerSize, string> = {
  xs: "size-3.5",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

/**
 * 로딩 중임을 알리는 회전 표시(`role="status"`). 색은 주변 글자색을 따르고, 움직임 줄이기에서도 멈추지 않는다.
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
      {/* 선 두께는 size와 관계없이 2px다. */}
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
