"use client";
// 차단 상태의 클릭을 막는 핸들러를 만들어서 client 경계다. 서버 컴포넌트는 DOM에 함수를 넘길 수 없다.

import type { ComponentProps, ReactElement, ReactNode } from "react";

import { pressableBaseClass } from "../_internal/constants/pressableClass";
import { pressableState } from "../_internal/libs/pressableState";
import { renderElement } from "../_internal/libs/renderElement";
import { Spinner } from "../Spinner/Spinner";
import type { Role } from "../types";
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden";
import { Icon } from "./components/Icon";
import { sizeClass } from "./constants/buttonClass";
import type { ButtonSize, ButtonVariant } from "./types";

export interface ButtonOwnProps {
  /** 채움 방식. 기본값은 `solid`다. */
  variant?: ButtonVariant;
  /** Role(Tide Role + 앱 Role). 기본값 `primary`. 색 계열 이름은 받지 않는다. */
  color?: Role;
  /** 높이 `xs` 24px, `sm` 32px, `md` 40px, `lg` 48px. 기본값은 `md`다. */
  size?: ButtonSize;
  /** 텍스트 앞 아이콘. 장식용으로 숨겨지고 size에 맞는 크기가 된다. */
  startIcon?: ReactNode;
  /** 텍스트 뒤 아이콘. 장식용으로 숨겨지고 size에 맞는 크기가 된다. */
  endIcon?: ReactNode;
  /** 로딩 중. Spinner를 보이고 클릭을 막는다. 포커스는 유지하고 `aria-disabled="true"`를 붙인다. */
  loading?: boolean;
  /** 로딩 중 버튼 이름 뒤에 붙는 숨김 텍스트. 기본값 `"로딩 중"`. */
  loadingLabel?: string;
  /** 누를 때 줄어드는 반응(scale 0.96)을 끈다. 움직임 줄이기 설정에서는 항상 꺼진다. */
  noPressScale?: boolean;
  /** 다른 요소로 렌더한다. 예: `render={<Link href="/x" />}`. 그 요소의 `disabled`는 `aria-disabled`로 바뀐다. */
  render?: ReactElement;
}

export interface ButtonProps
  extends ButtonOwnProps, Omit<ComponentProps<"button">, keyof ButtonOwnProps> {}

/**
 * 누르면 동작을 실행하는 버튼. 링크로 렌더하려면 `render={<Link href="/x" />}`를 쓴다.
 * Tide props: `variant`, `color`, `size`, `startIcon`, `endIcon`, `loading`, `loadingLabel`, `noPressScale`, `render` ({@link ButtonOwnProps}). 나머지는 `<button>` 속성.
 */
export function Button({
  variant = "solid",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  loading = false,
  loadingLabel = "로딩 중",
  noPressScale = false,
  render,
  disabled = false,
  type,
  children,
  onClick,
  ...props
}: ButtonProps): ReactElement {
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
  const label = children ?? (render?.props as { children?: ReactNode } | undefined)?.children;

  const rootProps: ComponentProps<"button"> & Record<`data-${string}`, string | undefined> = {
    ...props,
    ...state.rootProps,
    children: (
      <>
        {showSpinner ? (
          <Spinner size={size} aria-hidden="true" />
        ) : startIcon != null ? (
          <Icon size={size}>{startIcon}</Icon>
        ) : null}
        {label}
        {endIcon != null ? <Icon size={size}>{endIcon}</Icon> : null}
        {showSpinner ? <VisuallyHidden>{loadingLabel}</VisuallyHidden> : null}
      </>
    ),
  };

  return renderElement({
    defaultElement: "button",
    render,
    baseClassName: `${pressableBaseClass} ${sizeClass[size]} ${state.className}`,
    props: rootProps,
  });
}
