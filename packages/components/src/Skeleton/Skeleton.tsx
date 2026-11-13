import type { ComponentProps, ReactElement } from "react";

import { cn } from "../libs/cn.ts";
import type { Size } from "../types.ts";

// 이 파일은 hook·state·이벤트를 쓰지 않으므로 "use client"가 없다. 서버 컴포넌트에서 쓸 수 있다.

/** Skeleton의 모양. 글 한 줄, 사각형 영역, 원(Avatar 자리). */
type SkeletonVariant = "text" | "rect" | "circle";

/** 원의 size. Avatar size와 같은 24·32·40·48px다(Avatar 자리를 그대로 채운다). */
type SkeletonCircleSize = Extract<Size, "xs" | "sm" | "md" | "lg">;

interface SkeletonBaseProps extends Omit<ComponentProps<"div">, "children" | "aria-hidden"> {}

/** `variant`에 따라 받는 props가 다르다. `size`는 원(`circle`)에만 있다. */
export type SkeletonProps = SkeletonBaseProps &
  (
    | {
        /**
         * 모양. `text`는 글 한 줄(높이 1em, 너비 100%), `rect`는 사각형 영역(너비 100%, 높이는 `className`으로 준다),
         * `circle`은 원(크기는 `size`). 기본값은 `text`다.
         */
        variant?: "text" | "rect";
        size?: never;
      }
    | {
        variant: "circle";
        /** 원 크기. `xs` 24px, `sm` 32px, `md` 40px, `lg` 48px(Avatar와 같다). 기본값은 `md`다. */
        size?: SkeletonCircleSize;
      }
  );

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
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

// - 색은 neutral subtle-active다. 장식용(aria-hidden)이라 대비 의무가 없지만, dark raised 위에서도 보이도록
//   subtle 3단계 중 가장 진한 값을 쓴다(티켓 22 Comments).
// - 깜빡임은 keyframe(`animate-pulse`, opacity 1 → 0.5 → 1, 2s)이고 motion-safe일 때만 돈다. 움직임 줄이기에서는 멈춘다.
// - border는 평소 투명이다. forced-colors에서는 브라우저가 배경을 Canvas로, 경계를 CanvasText로 덮어 모양이 남는다(Badge와 같다).
const baseClass =
  "block border border-transparent bg-neutral-subtle-active motion-safe:animate-pulse";

/**
 * 내용이 오기 전 자리를 표시한다. 스크린 리더에는 읽히지 않는다(`aria-hidden`).
 * 불러오는 중이라는 사실은 앱이 영역의 `aria-busy`나 보이는 문구로 알린다. 서버 컴포넌트로 쓸 수 있다.
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
