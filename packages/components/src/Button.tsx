"use client";
// 차단 상태(로딩, render로 바꾼 요소의 disabled)에서 클릭 이벤트를 막는 핸들러를 만든다.
// 서버 컴포넌트는 DOM 요소에 함수를 넘길 수 없으므로 이 파일은 client 경계다.

import type { ComponentProps, ReactElement, ReactNode } from "react";

import { pressableBaseClass } from "./constants/pressableClass.ts";
import { pressableState } from "./libs/pressableState.ts";
import { renderElement } from "./libs/renderElement.ts";
import { Spinner } from "./Spinner.tsx";
import type { FillVariant, Role, Size } from "./types.ts";
import { VisuallyHidden } from "./VisuallyHidden.tsx";

/** Button의 채움 방식. 4개를 모두 받는다. */
type ButtonVariant = Extract<FillVariant, "solid" | "subtle" | "outline" | "ghost">;

/** Button의 size. 공통 size 4개를 모두 받는다. */
type ButtonSize = Extract<Size, "xs" | "sm" | "md" | "lg">;

export interface ButtonProps extends Omit<ComponentProps<"button">, "color"> {
  /** 채움 방식. 기본값은 `solid`다. */
  variant?: ButtonVariant;
  /**
   * Role. Tide Role 6개와 앱이 `RoleRegistry`에 더한 Role을 받는다. 기본값은 `primary`다.
   * 색 계열 이름(`blue` 등)은 받지 않는다. 행동의 뜻을 색으로 전하기 때문이다(ADR 0016).
   * 루트에 `data-color`로 붙어 accent 색을 정한다. 바깥 요소의 색을 물려받지 않는다.
   */
  color?: Role;
  /** 높이 `xs` 24px, `sm` 32px, `md` 40px, `lg` 48px. 기본값은 `md`다. */
  size?: ButtonSize;
  /** 텍스트 앞 아이콘. 장식용으로 숨겨지고 size에 맞는 크기가 된다. 다른 라이브러리의 아이콘도 받는다. */
  startIcon?: ReactNode;
  /** 텍스트 뒤 아이콘. 장식용으로 숨겨지고 size에 맞는 크기가 된다. */
  endIcon?: ReactNode;
  /**
   * 로딩 중. 앞 아이콘 자리에 Spinner를 보이고 클릭을 막는다.
   * 포커스는 유지하고 `aria-disabled="true"`와 `data-loading`을 붙인다.
   */
  loading?: boolean;
  /** 로딩 중에 버튼 이름 뒤에 붙는 텍스트. 화면에는 보이지 않는다. 기본값은 `"로딩 중"`이다. */
  loadingLabel?: string;
  /** 누를 때 줄어드는 반응(scale 0.96)을 끈다. 움직임 줄이기 설정에서는 이 값과 관계없이 줄어들지 않는다. */
  noPressScale?: boolean;
  /**
   * 다른 요소로 렌더한다. 예: `render={<Link href="/x" />}`.
   * props, ref, className을 그 요소에 병합한다. `button`이 아닌 요소의 `disabled`는 `aria-disabled`로 바뀐다.
   */
  render?: ReactElement;
}

// 채움 방식 맵, 누름 축소, 상태 처리는 IconButton과 함께 쓰는 `constants/pressableClass.ts`·`libs/pressableState.ts`에 있다(티켓 14).

/** 높이, 좌우 padding, 아이콘과 텍스트 사이 간격, 텍스트 스타일(spec size 표). radius는 모든 size에서 `md`다. */
const sizeClass: Record<ButtonSize, string> = {
  xs: "h-6 gap-1 px-2 text-label-sm",
  sm: "h-8 gap-1.5 px-3 text-label-md",
  md: "h-10 gap-2 px-4 text-label-md",
  lg: "h-12 gap-2 px-5 text-label-lg",
};

/** 텍스트 옆 아이콘 크기(spec 아이콘 크기 규칙). 감싼 span의 크기이고 안의 요소가 꽉 채운다. */
const iconSizeClass: Record<ButtonSize, string> = {
  xs: "size-3.5",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

function Icon({ size, children }: { size: ButtonSize; children: ReactNode }): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center *:size-full ${iconSizeClass[size]}`}
    >
      {children}
    </span>
  );
}

/**
 * 누르면 동작을 실행하는 버튼. 채움 방식(`variant`) × Role(`color`) × `size`로 모양을 고른다.
 * 링크로 렌더해야 하면 `render={<Link href="/x" />}`를 쓴다.
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
