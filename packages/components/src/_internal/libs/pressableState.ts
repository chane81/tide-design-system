import type { AriaAttributes, ComponentProps, MouseEvent, ReactElement } from "react";

import {
  pressableColorClass,
  pressableDisabledClass,
  pressableInteractionClass,
  pressableScaleClass,
} from "../constants/pressableClass";
import type { FillVariant, Role } from "../../types";

/** `pressableState`의 인자. Component가 받은 props 중 상태와 관련된 것만 넘긴다. */
export interface PressableOptions {
  readonly variant: FillVariant;
  readonly color: Role;
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
 * 네이티브 disabled가 안 되는 요소의 disabled와 loading은 포커스를 남긴 채 `aria-disabled`와 클릭 차단으로 막는다.
 * hover·누름 색과 누름 축소는 활성 상태에서만 붙인다.
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
    disabled ? pressableDisabledClass[variant] : pressableColorClass[variant],
    interactive ? pressableInteractionClass[variant] : undefined,
    interactive && !noPressScale ? pressableScaleClass : undefined,
    // Tailwind 4 preflight는 button 커서를 default로 두므로 직접 붙인다.
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
