// Button과 IconButton이 함께 쓰는 내부 모듈(tide-v0-impl 티켓 14). 루트에서 export하지 않는다.
// 채움 방식 맵, 누름 축소, 상태(disabled·loading·render 요소의 disabled) 처리를 한 곳에 둔다.
// 두 Component의 모양·커서·차단 규칙이 어긋나지 않게 하려는 것이다.
// 이 파일은 JSX를 렌더하지 않는다. 핸들러는 만들기만 하고 DOM에 넘기는 쪽(Button.tsx, IconButton.tsx)이 client 경계다.

import type { AriaAttributes, ComponentProps, MouseEvent, ReactElement } from "react";

import type { Color, FillVariant } from "./types.ts";

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// 모든 variant에 border 1px를 둔다. 색이 없는 variant는 투명 border라 forced-colors에서 경계로 보인다.

// 색 축은 맵에 두지 않는다. 루트의 data-color가 accent 슬롯(--tide-accent-*)을 고르고, 맵은 accent class만 쓴다(ADR 0011).
// 그래서 Tide가 색 계열을 더하거나 앱이 브랜드 계열을 더해도 이 파일은 바뀌지 않는다.

/** 기본 색(배경, 글자, 경계). 색 이름마다 Foundation이 같은 대비 규칙으로 검사한다. */
const colorClass: Record<FillVariant, string> = {
  solid: "border-transparent bg-accent-solid text-accent-on-solid",
  subtle: "border-transparent bg-accent-subtle text-accent",
  outline: "border-accent text-accent",
  ghost: "border-transparent text-accent",
};

/** hover·누름 색. 활성 상태일 때만 붙인다(비활성·로딩에는 붙이지 않아 CSS 순서에 기대지 않는다). */
const interactionClass: Record<FillVariant, string> = {
  solid: "hover:bg-accent-solid-hover active:bg-accent-solid-active",
  subtle: "hover:bg-accent-subtle-hover active:bg-accent-subtle-active",
  // outline·ghost는 raised 위 항목과 같은 ghost 규칙이다(기본 투명, hover subtle-hover, 누름 subtle-active).
  outline: "hover:bg-accent-subtle-hover active:bg-accent-subtle-active",
  ghost: "hover:bg-accent-subtle-hover active:bg-accent-subtle-active",
};

/** 비활성 색. 색 이름과 관계없이 같다. disabled Token은 대비 검사 대상이 아니다. */
const disabledClass: Record<FillVariant, string> = {
  solid: "cursor-not-allowed border-transparent bg-disabled text-disabled",
  subtle: "cursor-not-allowed border-transparent bg-disabled text-disabled",
  outline: "cursor-not-allowed border-default text-disabled",
  ghost: "cursor-not-allowed border-transparent text-disabled",
};

/** 모양의 공통 부분. radius는 모든 size에서 `md`다. 높이·폭·padding은 Component가 정한다. */
export const pressableBaseClass =
  "inline-flex shrink-0 items-center justify-center rounded-md border whitespace-nowrap select-none transition-colors focus-visible:focus-ring";

// 누름 축소. motion-safe:일 때만 줄이고, 그때만 scale도 전환 대상에 넣는다(fast, out은 Tide 기본값). ADR 0010.
const pressScaleClass =
  "motion-safe:transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,scale] motion-safe:active:scale-96";

/** `pressableState`의 인자. Component가 받은 props 중 상태와 관련된 것만 넘긴다. */
export interface PressableOptions {
  readonly variant: FillVariant;
  readonly color: Color;
  readonly disabled: boolean;
  readonly loading: boolean;
  readonly noPressScale: boolean;
  readonly render: ReactElement | undefined;
  readonly type: ComponentProps<"button">["type"];
  readonly onClick: ComponentProps<"button">["onClick"];
  /** 사용자가 직접 준 `aria-disabled`. 차단 상태가 아니면 그대로 둔다. */
  readonly ariaDisabled: AriaAttributes["aria-disabled"];
}

/** 루트 요소에 얹을 상태 props. Component의 나머지 props와 합쳐 `renderElement`에 넘긴다. */
export interface PressableRootProps extends Record<`data-${string}`, string | undefined> {
  type: ComponentProps<"button">["type"];
  disabled: true | undefined;
  "aria-disabled": AriaAttributes["aria-disabled"];
  onClick: ComponentProps<"button">["onClick"];
}

/** `pressableState`의 결과 */
export interface PressableState {
  /** 색·상태·커서 class. 기본 class와 size class 뒤에 둔다. */
  readonly className: string;
  /** Spinner를 보일지(로딩이고 disabled가 아님) */
  readonly showSpinner: boolean;
  readonly rootProps: PressableRootProps;
}

/** `disabled`를 네이티브로 지원하는 요소인지. Button류가 렌더할 만한 요소 중에서는 `button`뿐이다. */
const supportsNativeDisabled = (render: ReactElement | undefined): boolean =>
  render === undefined || render.type === "button";

/**
 * 채움 방식·색·상태에서 class와 루트 props를 정한다.
 * - disabled: 기본 요소와 `render={<button />}`는 네이티브 `disabled`, 그 밖의 요소는 `aria-disabled`·`data-disabled`와 클릭 차단
 * - loading: 포커스를 남긴 채 `aria-disabled`·`data-loading`과 클릭 차단. disabled와 함께 오면 disabled가 이긴다
 * - 커서: 활성 pointer, 로딩 wait, 비활성 not-allowed
 * - hover·누름 색과 누름 축소는 활성 상태에서만 붙인다
 */
export function pressableState({
  variant,
  color,
  disabled,
  loading,
  noPressScale,
  render,
  type,
  onClick,
  ariaDisabled,
}: PressableOptions): PressableState {
  const native = supportsNativeDisabled(render);
  // 네이티브 disabled가 안 되는 요소의 disabled와 로딩은 포커스를 남긴 채 클릭만 막는다.
  const softDisabled = disabled && !native;
  const blocked = softDisabled || (loading && !disabled);
  const interactive = !disabled && !loading;
  const showSpinner = loading && !disabled;

  const className = [
    disabled ? disabledClass[variant] : colorClass[variant],
    interactive ? interactionClass[variant] : undefined,
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

  return {
    className,
    showSpinner,
    rootProps: {
      // 기본 요소가 button이면 폼 안에서 뜻하지 않게 제출하지 않도록 type 기본값을 button으로 둔다.
      type: render === undefined ? (type ?? "button") : type,
      disabled: native && disabled ? true : undefined,
      // 색은 항상 붙인다(기본 primary). 바깥 data-color를 물려받지 않게 한다(ADR 0011).
      "data-color": color,
      "aria-disabled": blocked ? true : ariaDisabled,
      "data-disabled": softDisabled ? "" : undefined,
      "data-loading": showSpinner ? "" : undefined,
      onClick: handleClick,
    },
  };
}
