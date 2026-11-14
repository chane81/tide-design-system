"use client";
// 차단 상태의 클릭을 막는 핸들러를 만들어서 client 경계다. 서버 컴포넌트는 DOM에 함수를 넘길 수 없다.

import type { ComponentProps, ReactElement, ReactNode } from "react";

import { pressableBaseClass } from "../_internal/constants/pressableClass";
import { pressableState } from "../_internal/libs/pressableState";
import { renderElement } from "../_internal/libs/renderElement";
import { Spinner } from "../Spinner/Spinner";
import type { FillVariant, Role, Size } from "../types";

type IconButtonVariant = Extract<FillVariant, "solid" | "subtle" | "outline" | "ghost">;

type IconButtonSize = Extract<Size, "xs" | "sm" | "md" | "lg">;

export interface IconButtonOwnProps {
  /** 버튼 이름. 아이콘만 보이므로 필수다(예: `"설정"`). */
  "aria-label": string;
  /** 아이콘. 장식용으로 숨겨지고 size에 맞는 크기가 된다. */
  children: ReactNode;
  /** 채움 방식. 기본값 `solid`. 툴바·닫기처럼 약한 동작은 `ghost`를 쓴다. */
  variant?: IconButtonVariant;
  /** Role(Tide Role + 앱 Role). 기본값 `primary`. 색 계열 이름은 받지 않는다. */
  color?: Role;
  /** 정사각형 크기 `xs` 24px, `sm` 32px, `md` 40px, `lg` 48px. 기본값 `md`. */
  size?: IconButtonSize;
  /** 로딩 중. Spinner를 보이고 클릭을 막는다. 포커스는 유지하고 `aria-disabled="true"`를 붙인다. */
  loading?: boolean;
  /** 로딩 중 `aria-label` 뒤에 붙는 텍스트. 기본값 `"로딩 중"`. */
  loadingLabel?: string;
  /** 누를 때 줄어드는 반응(scale 0.96)을 끈다. 움직임 줄이기 설정에서는 항상 꺼진다. */
  noPressScale?: boolean;
  /** 다른 요소로 렌더한다. 예: `render={<Link href="/x" />}`. 그 요소의 `disabled`는 `aria-disabled`로 바뀐다. */
  render?: ReactElement;
}

export interface IconButtonProps
  extends IconButtonOwnProps, Omit<ComponentProps<"button">, keyof IconButtonOwnProps> {}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.

const sizeClass: Record<IconButtonSize, string> = {
  xs: "size-6",
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
};

const iconSizeClass: Record<IconButtonSize, string> = {
  xs: "size-4",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

/**
 * 아이콘만 있는 버튼. `aria-label`이 필수다. 모양 축은 Button과 같다.
 * Tide props: `aria-label`, `children`, `variant`, `color`, `size`, `loading`, `loadingLabel`, `noPressScale`, `render` ({@link IconButtonOwnProps}). 나머지는 `<button>` 속성.
 */
export function IconButton({
  variant = "solid",
  color = "primary",
  size = "md",
  loading = false,
  loadingLabel = "로딩 중",
  noPressScale = false,
  render,
  disabled = false,
  type,
  children,
  onClick,
  "aria-label": ariaLabel,
  ...props
}: IconButtonProps): ReactElement {
  const state = pressableState({
    variant,
    color,
    disabled,
    loading,
    noPressScale,
    render,
    type,
    onClick,
    ariaDisabled: props["aria-disabled"],
  });
  const { showSpinner } = state;
  const icon = children ?? (render?.props as { children?: ReactNode } | undefined)?.children;

  const rootProps: ComponentProps<"button"> & Record<`data-${string}`, string | undefined> = {
    ...props,
    ...state.rootProps,
    // aria-label이 내용보다 먼저 이름이 되므로 로딩 상태를 이름에 붙여 알린다.
    "aria-label": showSpinner ? `${ariaLabel} ${loadingLabel}` : ariaLabel,
    children: showSpinner ? (
      <Spinner size={size} aria-hidden="true" className={iconSizeClass[size]} />
    ) : (
      <span
        aria-hidden="true"
        className={`inline-flex shrink-0 items-center justify-center *:size-full ${iconSizeClass[size]}`}
      >
        {icon}
      </span>
    ),
  };

  return renderElement({
    defaultElement: "button",
    render,
    baseClassName: `${pressableBaseClass} p-0 ${sizeClass[size]} ${state.className}`,
    props: rootProps,
  });
}
