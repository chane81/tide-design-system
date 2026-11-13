"use client";
// 켜고 끄는 설정. 네이티브 `<input type="checkbox" role="switch">`이고 React Aria hook을 쓰지 않는다(ADR 0004).
// Field 안에서는 context로 id·aria-describedby·aria-invalid를 받으므로 client Component다(ADR 0013).
//
// 구조(ADR 0015): 루트 `<label>` 안에 track(네이티브 input, appearance-none), thumb(span), label 텍스트를 둔다.
// - `ref`와 HTML 속성은 input에 붙는다. form 라이브러리의 `register`가 input을 받아야 하기 때문이다.
// - `className`·`style`은 루트 label에 붙는다. track 크기와 thumb 위치를 깨지 않고 배치를 바꾸게 하려는 것이다.
// - 상태는 네이티브 pseudo-class(`:checked`, `:disabled`, `:focus-visible`)로 칠하고, thumb은 `peer-*`로 따라간다.

import type { ComponentProps, CSSProperties, ReactElement, ReactNode } from "react";

import { cn } from "../_internal/libs/cn";
import { useFieldControl } from "../_internal/hooks/useFieldControl";
import type { Role, Size } from "../types";

/** Switch의 size. `xs`는 track이 너무 작아 받지 않는다. */
type SwitchSize = Extract<Size, "sm" | "md" | "lg">;

export interface SwitchProps extends Omit<
  ComponentProps<"input">,
  "type" | "size" | "color" | "role" | "children"
> {
  /** 스위치 옆에 보이는 label. 스위치의 이름이 된다. Field 안에서는 Field의 `label`을 쓰고 비워 둔다. */
  children?: ReactNode;
  /** track 크기 `sm` 28×16px, `md` 36×20px, `lg` 44×24px. label 텍스트 스타일(Checkbox·Radio와 같은 `body-sm`/`body-md`/`body-lg`)도 함께 바뀐다. 기본값은 `md`다. */
  size?: SwitchSize;
  /**
   * 켜졌을 때 track 색. Role(Tide Role 6개와 앱이 `RoleRegistry`에 더한 Role)을 받는다. 기본값은 `primary`다.
   * 루트에 `data-color`로 붙어 accent 색을 정한다. 바깥 요소의 색을 물려받지 않는다.
   */
  // 행동·의미 Component의 color는 Role만 받는다(ADR 0016). 색 계열 이름은 장식·분류 Component용이다.
  color?: Role;
  /**
   * 오류 상태. `aria-invalid="true"`와 `data-invalid`가 붙고 꺼진 track 경계가 danger 색이 된다.
   * Field 안에서는 Field의 값을 따르고, 여기에 준 값이 이긴다.
   */
  invalid?: boolean;
  /** 루트 `<label>`의 class. 기본 class를 이긴다. track과 thumb 모양은 바꾸지 않는다. */
  className?: string;
  /** 루트 `<label>`의 style */
  style?: CSSProperties;
}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.

/** 루트 높이는 최소 24px라 track이 작아도 누르는 영역이 24×24px 이상이다. */
const rootSizeClass: Record<SwitchSize, string> = {
  sm: "gap-1.5 text-body-sm",
  md: "gap-2 text-body-md",
  lg: "gap-2.5 text-body-lg",
};

/** track 크기(border 1px 포함). thumb은 track 안쪽에서 2px 떨어진다. */
const trackSizeClass: Record<SwitchSize, string> = {
  sm: "h-4 w-7",
  md: "h-5 w-9",
  lg: "h-6 w-11",
};

/** thumb 크기와 켜졌을 때 이동 거리(track 폭 - border 2px - 여백 4px - thumb 크기). RTL에서는 반대로 움직인다. */
const thumbSizeClass: Record<SwitchSize, string> = {
  sm: "size-2.5 peer-checked:translate-x-3 rtl:peer-checked:-translate-x-3",
  md: "size-3.5 peer-checked:translate-x-4 rtl:peer-checked:-translate-x-4",
  lg: "size-4.5 peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5",
};

// track: 꺼짐은 투명 배경에 border-strong 경계(표면 층 위 3:1), 켜짐은 accent solid 배경에 border-accent 경계(표면 층 위 3:1).
// 켜짐·비활성은 :enabled/:disabled로 나눠 CSS 순서에 기대지 않는다.
// hover·누름은 루트 label(이름 붙인 group/switch)에서 반응한다. 바깥 요소의 group hover에는 반응하지 않는다. label을 눌러도 토글되기 때문이다. 활성(:enabled)일 때만 붙는다.
// Checkbox·Radio(_internal/constants/choiceClass.ts)와 같은 규칙이다. hover는 켜짐 solid-hover·꺼짐 subtle, 누름은 한 단계 진한 -active 슬롯이다.
// - 켜짐: solid-hover / solid-active(Button solid와 같은 규칙). thumb on-solid와 4:1(solid 위, ADR 0023) 대비 쌍이 등록되어 있다.
// - 꺼짐: accent subtle / subtle-active 배경. thumb은 text-accent가 된다. thumb은 글자가 아닌 UI 요소라 기준은 3:1이다.
//   hover(subtle)는 등록된 대비 쌍(text × 같은 색 subtle 4.5:1, neutral은 text-default × neutral subtle) 안에 있다.
//   누름(subtle-active) 위 thumb은 UI 요소 쌍 text × 같은 색 subtle-active 3:1로 등록되어 있다(티켓 46, 최저 4.31:1).
//   neutral은 text-default × neutral subtle-active 4.5:1 쌍 안에 있다. 경계는 바깥 표면과의 대비(border-strong 3:1)라 그대로다.
const trackClass =
  "peer m-0 shrink-0 cursor-pointer appearance-none rounded-full border border-strong bg-transparent transition-colors aria-invalid:border-danger focus-visible:focus-ring checked:enabled:border-accent checked:enabled:bg-accent-solid group-hover/switch:checked:enabled:bg-accent-solid-hover group-active/switch:checked:enabled:bg-accent-solid-active group-hover/switch:not-checked:enabled:bg-accent-subtle group-active/switch:not-checked:enabled:bg-accent-subtle-active disabled:cursor-not-allowed disabled:border-default disabled:bg-disabled";

// thumb: 색은 currentColor로 칠한다. 꺼짐 text-muted(표면 층 위 4.5:1), 켜짐 text-accent-on-solid(solid 위 4:1).
// 꺼짐 hover·누름은 track이 accent subtle이라 text-accent다. hover가 없는 터치 기기에서도 누르는 동안 맞도록 active에도 붙인다.
// 이동은 motion-safe일 때만 transition에 넣는다. 움직임 줄이기에서는 위치가 바로 바뀌고 색만 fast로 바뀐다.
const thumbClass =
  "pointer-events-none absolute start-0.75 top-0.75 rounded-full bg-current text-muted shadow-sm transition-colors motion-safe:transition-[color,background-color,translate] peer-checked:peer-enabled:text-accent-on-solid group-hover/switch:peer-enabled:peer-not-checked:text-accent group-active/switch:peer-enabled:peer-not-checked:text-accent peer-disabled:text-disabled";

// forced-colors: 기본 동작은 배경을 Canvas로 덮어 thumb과 켜진 track이 사라진다(Chromium에서 확인).
// track과 thumb만 forced-color-adjust를 끄고, 쓰는 Token 변수를 시스템 색으로 바꾼다(@theme inline이라 요소에서 바꾼 변수를 바로 쓴다).
// 켜짐은 Highlight로 채운 track과 HighlightText thumb, 꺼짐은 CanvasText 경계와 thumb, 비활성은 GrayText다.
// hover·누름 변수도 같은 시스템 색으로 바꿔 forced-colors 모양이 hover에서 바뀌지 않는다.
// 상태 class를 다시 적지 않아 선택자 우선순위와 CSS 순서에 기대지 않는다.
const trackForcedClass =
  "forced-colors:forced-color-adjust-none forced-colors:[--tide-border-strong:CanvasText] forced-colors:[--tide-border-danger:CanvasText] forced-colors:[--tide-accent-border:Highlight] forced-colors:[--tide-accent-solid:Highlight] forced-colors:[--tide-accent-solid-hover:Highlight] forced-colors:[--tide-accent-solid-active:Highlight] forced-colors:[--tide-accent-subtle:Canvas] forced-colors:[--tide-accent-subtle-active:Canvas] forced-colors:[--tide-border-default:GrayText] forced-colors:[--tide-bg-disabled:Canvas] forced-colors:[--tide-outline-focus:Highlight]";
const thumbForcedClass =
  "forced-colors:forced-color-adjust-none forced-colors:[--tide-text-muted:CanvasText] forced-colors:[--tide-accent-text:CanvasText] forced-colors:[--tide-accent-on-solid:HighlightText] forced-colors:[--tide-text-disabled:GrayText]";

/**
 * 켜고 끄는 설정을 바꾸는 스위치. 네이티브 체크박스라 form 제출이 그대로 되고, 스크린리더는 「스위치」로 읽는다.
 * `children`이 label이 된다. Field 안에 두면 Field의 label·설명·오류가 연결된다.
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
