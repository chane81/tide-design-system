"use client";
// `ref`·HTML 속성은 input에, `className`·`style`은 루트 label에 붙는다(ADR 0015).

import type { ComponentProps, CSSProperties, ReactElement, ReactNode } from "react";

import { cn } from "../_internal/libs/cn";
import { useFieldControl } from "../_internal/hooks/useFieldControl";
import type { Role, Size } from "../types";

/** Switch의 size. `xs`는 track이 너무 작아 받지 않는다. */
type SwitchSize = Extract<Size, "sm" | "md" | "lg">;

export interface SwitchOwnProps {
  /** 스위치 옆에 보이는 label. 스위치의 이름이 된다. Field 안에서는 Field의 `label`을 쓰고 비워 둔다. */
  children?: ReactNode;
  /** track 크기 `sm` 28×16px, `md` 36×20px, `lg` 44×24px. label 글자 크기도 함께 바뀐다. 기본값 `md`. */
  size?: SwitchSize;
  /** 켜졌을 때 track 색. Role(Tide Role + 앱 Role). 기본값 `primary`. 색 계열 이름은 받지 않는다(ADR 0016). */
  color?: Role;
  /** 오류 상태. `aria-invalid="true"`와 `data-invalid`가 붙는다. Field 값보다 여기 준 값이 이긴다. */
  invalid?: boolean;
  /** 루트 `<label>`의 class. 기본 class를 이긴다. track과 thumb 모양은 바꾸지 않는다. */
  className?: string;
  /** 루트 `<label>`의 style */
  style?: CSSProperties;
}

export interface SwitchProps
  extends SwitchOwnProps, Omit<ComponentProps<"input">, keyof SwitchOwnProps | "type" | "role"> {}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.

const rootSizeClass: Record<SwitchSize, string> = {
  sm: "gap-1.5 text-body-sm",
  md: "gap-2 text-body-md",
  lg: "gap-2.5 text-body-lg",
};

const trackSizeClass: Record<SwitchSize, string> = {
  sm: "h-4 w-7",
  md: "h-5 w-9",
  lg: "h-6 w-11",
};

// 이동 거리 = track 폭 - border 2px - 여백 4px - thumb 크기.
const thumbSizeClass: Record<SwitchSize, string> = {
  sm: "size-2.5 peer-checked:translate-x-3 rtl:peer-checked:-translate-x-3",
  md: "size-3.5 peer-checked:translate-x-4 rtl:peer-checked:-translate-x-4",
  lg: "size-4.5 peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5",
};

// hover·누름은 루트 label(이름 붙인 group/switch)에서만 반응한다. label을 눌러도 토글되기 때문이다.
// 꺼짐 누름 thumb은 3:1 UI 대비 쌍으로 등록되어 있다(ADR 0023).
const trackClass =
  "peer m-0 shrink-0 cursor-pointer appearance-none rounded-full border border-strong bg-transparent transition-colors aria-invalid:border-danger focus-visible:focus-ring checked:enabled:border-accent checked:enabled:bg-accent-solid group-hover/switch:checked:enabled:bg-accent-solid-hover group-active/switch:checked:enabled:bg-accent-solid-active group-hover/switch:not-checked:enabled:bg-accent-subtle group-active/switch:not-checked:enabled:bg-accent-subtle-active disabled:cursor-not-allowed disabled:border-default disabled:bg-disabled";

// hover가 없는 터치 기기에서도 맞도록 thumb 색은 active에도 붙인다.
const thumbClass =
  "pointer-events-none absolute start-0.75 top-0.75 rounded-full bg-current text-muted shadow-sm transition-colors motion-safe:transition-[color,background-color,translate] peer-checked:peer-enabled:text-accent-on-solid group-hover/switch:peer-enabled:peer-not-checked:text-accent group-active/switch:peer-enabled:peer-not-checked:text-accent peer-disabled:text-disabled";

// forced-colors는 배경을 Canvas로 덮어 thumb·켜진 track이 사라진다. adjust를 끄고 쓰는 Token 변수를 시스템 색으로
// 바꾼다(@theme inline이라 바로 반영). 상태 class를 다시 적지 않아 CSS 순서에 기대지 않는다.
const trackForcedClass =
  "forced-colors:forced-color-adjust-none forced-colors:[--tide-border-strong:CanvasText] forced-colors:[--tide-border-danger:CanvasText] forced-colors:[--tide-accent-border:Highlight] forced-colors:[--tide-accent-solid:Highlight] forced-colors:[--tide-accent-solid-hover:Highlight] forced-colors:[--tide-accent-solid-active:Highlight] forced-colors:[--tide-accent-subtle:Canvas] forced-colors:[--tide-accent-subtle-active:Canvas] forced-colors:[--tide-border-default:GrayText] forced-colors:[--tide-bg-disabled:Canvas] forced-colors:[--tide-accent-subtle-border:Highlight]";
const thumbForcedClass =
  "forced-colors:forced-color-adjust-none forced-colors:[--tide-text-muted:CanvasText] forced-colors:[--tide-accent-text:CanvasText] forced-colors:[--tide-accent-on-solid:HighlightText] forced-colors:[--tide-text-disabled:GrayText]";

/**
 * 켜고 끄는 스위치. 네이티브 체크박스(`role="switch"`)라 form 제출이 그대로 된다.
 * `children`이 label이 된다. Field 안에 두면 Field의 label·설명·오류가 연결된다.
 * Tide props: `children`, `size`, `color`, `invalid`, `className`, `style` ({@link SwitchOwnProps}). 나머지는 `<input>` 속성.
 */
export function Switch({
  children,
  size = "md",
  color = "primary",
  invalid,
  id,
  disabled,
  required,
  className,
  style,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: SwitchProps): ReactElement {
  const control = useFieldControl({
    id,
    invalid,
    disabled,
    required,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
  });

  return (
    <label
      // 색은 항상 붙인다(기본 primary). 바깥 data-color를 물려받지 않게 한다(ADR 0011).
      data-color={color}
      data-disabled={control.disabled ? "" : undefined}
      data-invalid={control["data-invalid"]}
      style={style}
      className={cn(
        "group/switch inline-flex min-h-6 cursor-pointer items-center text-default select-none has-disabled:cursor-not-allowed has-disabled:text-disabled",
        rootSizeClass[size],
        className,
      )}
    >
      <span className="relative inline-flex shrink-0">
        <input
          {...props}
          {...control}
          type="checkbox"
          role="switch"
          className={cn(trackSizeClass[size], trackClass, trackForcedClass)}
        />
        <span
          aria-hidden="true"
          className={cn(thumbSizeClass[size], thumbClass, thumbForcedClass)}
        />
      </span>
      {children != null && children !== false ? <span>{children}</span> : null}
    </label>
  );
}
