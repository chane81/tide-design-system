import type { ComponentProps, ReactElement, ReactNode } from "react";

import { cn } from "../_internal/libs/cn";
import type { Color, FillVariant, Size } from "../types";

// faint는 Badge에만 있는 강도라 공통 FillVariant에 넣지 않는다(ADR 0022).
type BadgeVariant = Extract<FillVariant, "subtle" | "solid"> | "faint";

// 조작 요소가 아니라 높이가 size 표보다 한 단계 작다.
type BadgeSize = Extract<Size, "sm" | "md">;

export interface BadgeOwnProps {
  /** 상태를 말하는 텍스트. 색만으로 상태를 전하지 않도록 필수다(WCAG 1.4.1). */
  children: ReactNode;
  /** `subtle`(파스텔 배경+테두리, 기본값), `faint`(가장 옅은 배경), `solid`(진한 배경). 한 화면에서는 하나로 맞춘다. */
  variant?: BadgeVariant;
  /** `sm` 높이 20px, `md` 24px. 기본값 `md`. */
  size?: BadgeSize;
  /** 색 이름. 상태는 Role, 뜻 없는 분류는 색 계열 이름(앱 등록 포함). 기본값 `neutral`. */
  color?: Color;
}

export interface BadgeProps
  extends BadgeOwnProps, Omit<ComponentProps<"span">, keyof BadgeOwnProps> {}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
// 글자×바탕은 모두 등록된 대비 쌍이고, subtle 테두리는 꾸밈이라 대비 검사에서 뺐다(ADR 0022·0023).
const variantClass: Record<BadgeVariant, string> = {
  subtle: "border-accent-subtle bg-accent-subtle text-accent-on-subtle",
  faint: "bg-accent-faint text-accent-on-subtle",
  solid: "bg-accent-solid text-accent-on-solid",
};

// 높이는 border 1px를 포함한다.
const sizeClass: Record<BadgeSize, string> = {
  sm: "h-5 gap-1 px-1.5 text-label-sm",
  md: "h-6 gap-1 px-2 text-label-md",
};

// 투명 border는 forced-colors에서 CanvasText로 그려져 배경 없이도 모양이 남는다.
const baseClass =
  "inline-flex max-w-full shrink-0 items-center rounded-sm border border-transparent align-middle whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0";

/**
 * 상태나 분류를 짧은 텍스트로 보여 주는 라벨. 뜻은 반드시 텍스트로 적는다. 서버 컴포넌트로 쓸 수 있다.
 * Tide props: `children`, `variant`, `size`, `color` ({@link BadgeOwnProps}). 나머지는 `<span>` 속성.
 */
export function Badge({
  variant = "subtle",
  size = "md",
  color = "neutral",
  className,
  ...props
}: BadgeProps): ReactElement {
  return (
    <span
      {...props}
      // 바깥 data-color를 물려받지 않게 항상 붙인다(ADR 0011).
      data-color={color}
      className={cn(baseClass, variantClass[variant], sizeClass[size], className)}
    />
  );
}
