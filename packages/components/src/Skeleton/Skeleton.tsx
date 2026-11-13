import type { ComponentProps, ReactElement } from "react";

import { cn } from "../_internal/libs/cn";
import type { Size } from "../types";

type SkeletonVariant = "text" | "rect" | "circle";

// Avatar 자리를 그대로 채우도록 Avatar size와 같다.
type SkeletonCircleSize = Extract<Size, "xs" | "sm" | "md" | "lg">;

interface SkeletonBaseProps extends Omit<ComponentProps<"div">, "children" | "aria-hidden"> {}

/** `size`는 원(`circle`)에만 있다. */
export type SkeletonProps = SkeletonBaseProps &
  (
    | {
        /** 모양. `text`는 글 한 줄, `rect`는 사각형(높이는 `className`으로), `circle`은 원. 기본값 `text`. */
        variant?: "text" | "rect";
        size?: never;
      }
    | {
        variant: "circle";
        /** 원 크기. `xs` 24px, `sm` 32px, `md` 40px, `lg` 48px(Avatar와 같다). 기본값 `md`. */
        size?: SkeletonCircleSize;
      }
  );

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
const variantClass: Record<SkeletonVariant, string> = {
  text: "h-[1em] w-full rounded-sm",
  rect: "w-full rounded-md",
  circle: "shrink-0 rounded-full",
};

const circleSizeClass: Record<SkeletonCircleSize, string> = {
  xs: "size-6",
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
};

// dark raised 위에서도 보이도록 subtle 중 가장 진한 subtle-active를 쓴다.
// 투명 border는 forced-colors에서 CanvasText로 그려져 모양이 남는다.
const baseClass =
  "block border border-transparent bg-neutral-subtle-active motion-safe:animate-pulse";

/**
 * 내용이 오기 전 자리를 표시한다. 스크린 리더에는 읽히지 않는다(`aria-hidden`).
 * 불러오는 중이라는 사실은 앱이 `aria-busy`나 보이는 문구로 알린다. 서버 컴포넌트로 쓸 수 있다.
 */
export function Skeleton({
  variant = "text",
  size,
  className,
  ...props
}: SkeletonProps): ReactElement {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={cn(
        baseClass,
        variantClass[variant],
        variant === "circle" ? circleSizeClass[size ?? "md"] : undefined,
        className,
      )}
    />
  );
}
