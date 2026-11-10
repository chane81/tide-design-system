"use client";
// 차단 상태(로딩, render로 바꾼 요소의 disabled)에서 클릭 이벤트를 막는 핸들러를 만든다.
// 서버 컴포넌트는 DOM 요소에 함수를 넘길 수 없으므로 이 파일은 client 경계다.

import type { ComponentProps, MouseEvent, ReactElement, ReactNode } from "react";

import { renderElement } from "./render.ts";
import { Spinner } from "./Spinner.tsx";
import type { FillVariant, Role, Size } from "./types.ts";
import { VisuallyHidden } from "./VisuallyHidden.tsx";

/** Button의 채움 방식. 4개를 모두 받는다. */
type ButtonVariant = Extract<FillVariant, "solid" | "subtle" | "outline" | "ghost">;

/** Button의 Role. 6개를 모두 받는다. */
type ButtonColor = Extract<Role, "neutral" | "primary" | "success" | "warning" | "danger" | "info">;

/** Button의 size. 공통 size 4개를 모두 받는다. */
type ButtonSize = Extract<Size, "xs" | "sm" | "md" | "lg">;

export interface ButtonProps extends Omit<ComponentProps<"button">, "color"> {
  /** 채움 방식. 기본값은 `solid`다. */
  variant?: ButtonVariant;
  /** Role. 기본값은 `primary`다. */
  color?: ButtonColor;
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

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// 모든 variant에 border 1px를 둔다. 색이 없는 variant는 투명 border라 forced-colors에서 경계로 보인다.

/** 기본 색(배경, 글자, 경계). 글자와 배경은 foundation 대비 쌍에 등록된 짝만 쓴다. */
const colorClass: Record<ButtonVariant, Record<ButtonColor, string>> = {
  solid: {
    neutral: "border-transparent bg-neutral-solid text-on-solid",
    primary: "border-transparent bg-primary-solid text-on-solid",
    success: "border-transparent bg-success-solid text-on-solid",
    warning: "border-transparent bg-warning-solid text-on-solid",
    danger: "border-transparent bg-danger-solid text-on-solid",
    info: "border-transparent bg-info-solid text-on-solid",
  },
  subtle: {
    neutral: "border-transparent bg-neutral-subtle text-default",
    primary: "border-transparent bg-primary-subtle text-primary",
    success: "border-transparent bg-success-subtle text-success",
    warning: "border-transparent bg-warning-subtle text-warning",
    danger: "border-transparent bg-danger-subtle text-danger",
    info: "border-transparent bg-info-subtle text-info",
  },
  outline: {
    neutral: "border-strong text-default",
    primary: "border-primary text-primary",
    success: "border-success text-success",
    warning: "border-warning text-warning",
    danger: "border-danger text-danger",
    info: "border-info text-info",
  },
  ghost: {
    neutral: "border-transparent text-default",
    primary: "border-transparent text-primary",
    success: "border-transparent text-success",
    warning: "border-transparent text-warning",
    danger: "border-transparent text-danger",
    info: "border-transparent text-info",
  },
};

/** hover·누름 색. 활성 상태일 때만 붙인다(비활성·로딩에는 붙이지 않아 CSS 순서에 기대지 않는다). */
const interactionClass: Record<ButtonVariant, Record<ButtonColor, string>> = {
  solid: {
    neutral: "hover:bg-neutral-solid-hover active:bg-neutral-solid-active",
    primary: "hover:bg-primary-solid-hover active:bg-primary-solid-active",
    success: "hover:bg-success-solid-hover active:bg-success-solid-active",
    warning: "hover:bg-warning-solid-hover active:bg-warning-solid-active",
    danger: "hover:bg-danger-solid-hover active:bg-danger-solid-active",
    info: "hover:bg-info-solid-hover active:bg-info-solid-active",
  },
  subtle: {
    neutral: "hover:bg-neutral-subtle-hover active:bg-neutral-subtle-active",
    primary: "hover:bg-primary-subtle-hover active:bg-primary-subtle-active",
    success: "hover:bg-success-subtle-hover active:bg-success-subtle-active",
    warning: "hover:bg-warning-subtle-hover active:bg-warning-subtle-active",
    danger: "hover:bg-danger-subtle-hover active:bg-danger-subtle-active",
    info: "hover:bg-info-subtle-hover active:bg-info-subtle-active",
  },
  // outline·ghost는 raised 위 항목과 같은 ghost 규칙이다(기본 투명, hover subtle-hover, 누름 subtle-active).
  outline: {
    neutral: "hover:bg-neutral-subtle-hover active:bg-neutral-subtle-active",
    primary: "hover:bg-primary-subtle-hover active:bg-primary-subtle-active",
    success: "hover:bg-success-subtle-hover active:bg-success-subtle-active",
    warning: "hover:bg-warning-subtle-hover active:bg-warning-subtle-active",
    danger: "hover:bg-danger-subtle-hover active:bg-danger-subtle-active",
    info: "hover:bg-info-subtle-hover active:bg-info-subtle-active",
  },
  ghost: {
    neutral: "hover:bg-neutral-subtle-hover active:bg-neutral-subtle-active",
    primary: "hover:bg-primary-subtle-hover active:bg-primary-subtle-active",
    success: "hover:bg-success-subtle-hover active:bg-success-subtle-active",
    warning: "hover:bg-warning-subtle-hover active:bg-warning-subtle-active",
    danger: "hover:bg-danger-subtle-hover active:bg-danger-subtle-active",
    info: "hover:bg-info-subtle-hover active:bg-info-subtle-active",
  },
};

/** 비활성 색. Role과 관계없이 같다. disabled Token은 대비 검사 대상이 아니다. */
const disabledClass: Record<ButtonVariant, string> = {
  solid: "cursor-not-allowed border-transparent bg-disabled text-disabled",
  subtle: "cursor-not-allowed border-transparent bg-disabled text-disabled",
  outline: "cursor-not-allowed border-default text-disabled",
  ghost: "cursor-not-allowed border-transparent text-disabled",
};

/** 높이, 좌우 padding, 아이콘과 텍스트 사이 간격, 텍스트 스타일(spec size 표). radius는 모든 size에서 `md`다. */
const sizeClass: Record<ButtonSize, string> = {
  xs: "h-6 gap-1 px-2 text-label-sm",
  sm: "h-8 gap-1.5 px-3 text-label-sm",
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

const baseClass =
  "inline-flex shrink-0 items-center justify-center rounded-md border whitespace-nowrap select-none transition-colors focus-visible:focus-ring";

// 누름 축소. motion-safe:일 때만 줄이고, 그때만 scale도 전환 대상에 넣는다(fast, out은 Tide 기본값).
const pressScaleClass =
  "motion-safe:transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,scale] motion-safe:active:scale-96";

/** `disabled`를 네이티브로 지원하는 요소인지. Button이 렌더할 만한 요소 중에서는 `button`뿐이다. */
const supportsNativeDisabled = (render: ReactElement | undefined): boolean =>
  render === undefined || render.type === "button";

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
  const native = supportsNativeDisabled(render);
  // 네이티브 disabled가 안 되는 요소의 disabled와 로딩은 포커스를 남긴 채 클릭만 막는다.
  const softDisabled = disabled && !native;
  const blocked = softDisabled || (loading && !disabled);
  const interactive = !disabled && !loading;

  const label = children ?? (render?.props as { children?: ReactNode } | undefined)?.children;
  const showSpinner = loading && !disabled;

  const className = [
    baseClass,
    sizeClass[size],
    disabled ? disabledClass[variant] : colorClass[variant][color],
    interactive ? interactionClass[variant][color] : undefined,
    interactive && !noPressScale ? pressScaleClass : undefined,
    // 커서: 활성 pointer, 로딩 wait, 비활성 not-allowed(disabledClass). Tailwind 4 preflight는 button 커서를
    // 브라우저 기본값(default)으로 두므로 직접 붙인다. 링크로 렌더해도 같은 규칙이다.
    interactive ? "cursor-pointer" : undefined,
    showSpinner ? "cursor-wait" : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = blocked
    ? (event: MouseEvent<HTMLButtonElement>) => {
        // 링크라면 이동도 막는다. 사용자가 준 onClick은 부르지 않는다.
        event.preventDefault();
        event.stopPropagation();
      }
    : onClick;

  const rootProps: ComponentProps<"button"> & Record<`data-${string}`, string | undefined> = {
    ...props,
    // 기본 요소가 button이면 폼 안에서 뜻하지 않게 제출하지 않도록 type 기본값을 button으로 둔다.
    type: render === undefined ? (type ?? "button") : type,
    disabled: native && disabled ? true : undefined,
    "aria-disabled": blocked ? true : props["aria-disabled"],
    "data-disabled": softDisabled ? "" : undefined,
    "data-loading": showSpinner ? "" : undefined,
    onClick: handleClick,
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
    baseClassName: className,
    props: rootProps,
  });
}
