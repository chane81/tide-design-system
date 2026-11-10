import type { ComponentProps, ReactElement, ReactNode } from "react";

import { cn } from "./cn.ts";
import type { Color, FillVariant, Size } from "./types.ts";

// 이 파일은 hook·state·이벤트를 쓰지 않으므로 "use client"가 없다. 서버 컴포넌트에서 쓸 수 있다.

/** Badge의 채움 방식. 상호작용이 없어 테두리·투명 채움(`outline`·`ghost`)은 받지 않는다. */
type BadgeVariant = Extract<FillVariant, "subtle" | "solid">;

/** Badge의 size. 조작 요소가 아니라 높이가 size 표보다 한 단계 작다(`sm` 20px, `md` 24px). */
type BadgeSize = Extract<Size, "sm" | "md">;

export interface BadgeProps extends Omit<ComponentProps<"span">, "color" | "children"> {
  /** 상태를 말하는 텍스트. 필수다. 색만으로 상태를 전하지 않기 위해서다(WCAG 1.4.1). */
  children: ReactNode;
  /** `subtle`(옅은 배경, 기본값)과 `solid`(진한 배경). 같은 화면 안에서는 한 가지로 맞춘다. */
  variant?: BadgeVariant;
  /** `sm` 높이 20px·`label-sm`, `md` 높이 24px·`label-md`. 기본값은 `md`다. */
  size?: BadgeSize;
  /**
   * 색 이름. 상태는 Role(Tide Role 6개와 앱이 `RoleRegistry`에 더한 Role), 뜻 없는 분류는 색 계열 이름
   * (Tide 색 계열 6개와 앱이 `ColorFamilyRegistry`에 더한 계열)을 쓴다(ADR 0016·0017). 기본값은 `neutral`이다.
   * 루트에 `data-color`로 붙고 바깥 요소의 색을 물려받지 않는다.
   */
  // 장식·분류 Component라 색 계열 이름을 받고, 상태 라벨로도 쓰므로 Role도 함께 받는다(ADR 0017).
  color?: Color;
}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// 색은 accent 슬롯이다(ADR 0011). 둘 다 등록된 대비 쌍이다.
// - subtle: text-accent × bg-accent-subtle 4.5:1(Role 대비 쌍 `text-<role>` × `bg-<role>-subtle`, neutral은 text-default × bg-neutral-subtle,
//   색 계열·앱 Role·앱 계열은 색 이름 규칙 colorContrastRules의 text × subtle).
// - solid: text-accent-on-solid × bg-accent-solid 4.5:1(Role은 text-on-solid × solid, 색 계열·앱 이름은 on-solid × solid).
const variantClass: Record<BadgeVariant, string> = {
  subtle: "bg-accent-subtle text-accent",
  solid: "bg-accent-solid text-accent-on-solid",
};

/** 높이는 border 1px를 포함한다. 글자 줄 높이(label-sm 16px, label-md 20px) + border 2px + 세로 여백이다. */
const sizeClass: Record<BadgeSize, string> = {
  sm: "h-5 gap-1 px-1.5 text-label-sm",
  md: "h-6 gap-1 px-2 text-label-md",
};

// - radius는 작은 표시 요소의 sm이다(spec radius 「쓰는 곳」).
// - border는 평소 투명이다. forced-colors에서는 브라우저가 경계를 CanvasText로 덮어 배경 없이도 모양이 남는다.
// - 한 줄로만 쓴다(whitespace-nowrap). 짧은 라벨이라 줄바꿈하면 모양이 깨진다.
// - 아이콘을 함께 넣으면 텍스트 옆 아이콘 크기(12px)로 맞춘다.
const baseClass =
  "inline-flex max-w-full shrink-0 items-center rounded-sm border border-transparent align-middle whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0";

/**
 * 상태나 분류를 짧은 텍스트로 보여 주는 라벨. 누르거나 고르는 동작이 없다.
 * 상태는 Role, 분류는 색 계열 이름으로 색을 고르고, 뜻은 반드시 텍스트로 적는다. 서버 컴포넌트로 쓸 수 있다.
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
      // 색은 항상 붙인다(기본 neutral). 바깥 data-color를 물려받지 않게 한다(ADR 0011).
      data-color={color}
      className={cn(baseClass, variantClass[variant], sizeClass[size], className)}
    />
  );
}
