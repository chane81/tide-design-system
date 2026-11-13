"use client";
// 차단 상태(로딩, render로 바꾼 요소의 disabled)에서 클릭 이벤트를 막는 핸들러를 만든다.
// 서버 컴포넌트는 DOM 요소에 함수를 넘길 수 없으므로 이 파일은 client 경계다.

import type { ComponentProps, ReactElement, ReactNode } from "react";

import { pressableBaseClass } from "../_internal/constants/pressableClass";
import { pressableState } from "../_internal/libs/pressableState";
import { renderElement } from "../_internal/libs/renderElement";
import { Spinner } from "../Spinner/Spinner";
import type { FillVariant, Role, Size } from "../types";

/** IconButton의 채움 방식. Button과 같은 4개를 받는다. */
type IconButtonVariant = Extract<FillVariant, "solid" | "subtle" | "outline" | "ghost">;

/** IconButton의 size. 공통 size 4개를 모두 받는다. 가장 작은 `xs`도 24×24px다. */
type IconButtonSize = Extract<Size, "xs" | "sm" | "md" | "lg">;

export interface IconButtonProps extends Omit<
  ComponentProps<"button">,
  "color" | "aria-label" | "children"
> {
  /** 버튼 이름. 아이콘만 보이므로 반드시 적는다(예: `"설정"`). 스크린 리더가 읽는다. */
  "aria-label": string;
  /** 아이콘. 장식용으로 숨겨지고 size에 맞는 크기가 된다. 다른 라이브러리의 아이콘도 받는다. */
  children: ReactNode;
  /** 채움 방식. 기본값은 Button과 같은 `solid`다. 툴바·닫기 버튼처럼 약한 동작은 `ghost`를 쓴다. */
  variant?: IconButtonVariant;
  /**
   * Role. Tide Role 6개와 앱이 `RoleRegistry`에 더한 Role을 받는다. 기본값은 `primary`다.
   * 색 계열 이름(`blue` 등)은 받지 않는다. 행동의 뜻을 색으로 전하기 때문이다(ADR 0016).
   * 루트에 `data-color`로 붙어 accent 색을 정한다. 바깥 요소의 색을 물려받지 않는다.
   */
  color?: Role;
  /** 정사각형 크기 `xs` 24px, `sm` 32px, `md` 40px, `lg` 48px. 아이콘은 16/16/20/24px다. 기본값은 `md`다. */
  size?: IconButtonSize;
  /**
   * 로딩 중. 아이콘 자리에 Spinner를 보이고 클릭을 막는다.
   * 포커스는 유지하고 `aria-disabled="true"`와 `data-loading`을 붙인다.
   */
  loading?: boolean;
  /** 로딩 중에 `aria-label` 뒤에 붙는 텍스트. 기본값은 `"로딩 중"`이다. */
  loadingLabel?: string;
  /** 누를 때 줄어드는 반응(scale 0.96)을 끈다. 움직임 줄이기 설정에서는 이 값과 관계없이 줄어들지 않는다. */
  noPressScale?: boolean;
  /**
   * 다른 요소로 렌더한다. 예: `render={<Link href="/x" />}`.
   * props, ref, className을 그 요소에 병합한다. `button`이 아닌 요소의 `disabled`는 `aria-disabled`로 바뀐다.
   */
  render?: ReactElement;
}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// 채움 방식 맵, 누름 축소, 상태 처리는 Button과 함께 쓰는 `_internal/constants/pressableClass.ts`·`_internal/libs/pressableState.ts`에 있다.

/** 정사각형 크기(spec size 표의 높이). padding은 없고 아이콘을 가운데 둔다. 24×24px 밑으로 내려가지 않는다. */
const sizeClass: Record<IconButtonSize, string> = {
  xs: "size-6",
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
};

/** 아이콘 크기(spec 아이콘 크기 규칙 「IconButton 아이콘」 열). 감싼 span과 Spinner에 쓴다. */
const iconSizeClass: Record<IconButtonSize, string> = {
  xs: "size-4",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

/**
 * 아이콘만 있는 버튼. `aria-label`이 필수라 이름이 빠지지 않는다.
 * Button과 같은 채움 방식(`variant`) × Role(`color`) × `size` 축을 쓴다.
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
    // aria-label이 내용보다 먼저 이름이 되므로 로딩 상태도 이름에 붙여 알린다(Button의 「저장 로딩 중」과 같다).
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
