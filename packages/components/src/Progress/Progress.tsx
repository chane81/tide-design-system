import type { ComponentProps, ReactElement } from "react";

import { cn } from "../_internal/libs/cn.ts";
import type { Role, Size } from "../types.ts";

// 이 파일은 hook·state·이벤트를 쓰지 않으므로 "use client"가 없다. 서버 컴포넌트에서 쓸 수 있다.
//
// 구현 방식(tide-v0-impl 티켓 22):
// - 네이티브 `<progress>` 대신 `div role="progressbar"`와 `aria-valuenow`·`aria-valuemin`·`aria-valuemax`를 쓴다.
//   `<progress>`는 막대를 `::-webkit-progress-value`·`::-moz-progress-bar` 같은 브라우저별 pseudo-element로만 칠할 수 있고,
//   Chromium의 `getComputedStyle(el, "::-webkit-progress-value")`는 그 값을 돌려주지 않아 계산값으로 단언할 수 없다.
//   forced-colors에서는 두 방식 모두 배경이 Canvas로 덮여 막대가 사라지므로 어차피 직접 처리해야 한다(Chromium에서 확인).
// - 값을 모르는 진행(indeterminate)은 두지 않는다. keyframe은 Spinner·Skeleton에만 쓴다(spec motion 적용). 그때는 Spinner를 쓴다.
// - React Aria(useProgressBar)는 쓰지 않는다. 포커스·키보드 동작이 없어 속성만으로 완결된다(ADR 0004).

/** Progress의 size. 막대 굵기다. */
type ProgressSize = Extract<Size, "sm" | "md">;

/** 접근 가능한 이름. `aria-label`이나 `aria-labelledby` 중 하나는 꼭 준다(WAI-ARIA progressbar는 이름이 필요하다). */
type ProgressName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

interface ProgressOwnProps extends Omit<
  ComponentProps<"div">,
  | "color"
  | "children"
  | "role"
  | "aria-label"
  | "aria-labelledby"
  | "aria-valuenow"
  | "aria-valuemin"
  | "aria-valuemax"
> {
  /** 현재 값. 0 이상 `max` 이하로 잘라서 쓴다. 값을 모르는 진행은 Progress가 아니라 Spinner로 보여 준다. */
  value: number;
  /** 끝 값. 기본값은 `100`이다. 시작 값은 항상 0이다. */
  max?: number;
  /** 막대 굵기. `sm` 4px, `md` 8px. 기본값은 `md`다. */
  size?: ProgressSize;
  /**
   * 막대 색. 진행 상태는 뜻이 있는 표시라 Role만 받는다(Tide Role 6개와 앱이 `RoleRegistry`에 더한 Role, ADR 0016).
   * 기본값은 `primary`다. 루트에 `data-color`로 붙고 바깥 요소의 색을 물려받지 않는다.
   */
  color?: Role;
}

export type ProgressProps = ProgressOwnProps & ProgressName;

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
const sizeClass: Record<ProgressSize, string> = {
  sm: "h-1",
  md: "h-2",
};

// 트랙: 같은 Role의 subtle 배경(accent 슬롯). radius full.
// forced-colors: 기본 동작은 트랙과 막대 배경을 모두 Canvas로 덮어 막대가 사라진다(Chromium에서 확인).
// forced-color-adjust를 끄고 트랙은 Canvas + CanvasText 경계, 막대는 Highlight로 칠한다(Switch와 같은 시스템 색).
const trackClass =
  "relative block w-full overflow-hidden rounded-full bg-accent-subtle forced-colors:forced-color-adjust-none forced-colors:border forced-colors:border-[CanvasText] forced-colors:bg-[Canvas]";

// 막대: accent 슬롯의 text 색(bg-current + text-accent). text × 같은 색 subtle은 4.5:1 대비 쌍으로 등록되어 있어
// UI 경계 기준(3:1, WCAG 1.4.11)을 넘는다. solid는 dark에서 subtle과 3:1이 되지 않아 쓰지 않는다(티켓 22 Comments).
// 값이 바뀔 때 너비 전환은 motion-safe일 때만이다(시간을 적지 않은 transition의 기본값 fast, out).
// 움직임 줄이기에서는 막대가 바로 새 너비가 된다. 진행 표시 자체는 그대로 보인다.
const barClass =
  "block h-full rounded-full bg-current text-accent motion-safe:transition-[width] forced-colors:text-[Highlight]";

/** 0 이상 max 이하로 자른다. max가 0 이하이거나 숫자가 아니면 0으로 본다. */
function clamp(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(Math.max(value, 0), max);
}

/**
 * 작업이 얼마나 진행됐는지 막대로 보여 준다. 역할은 `progressbar`이고 값은 `aria-valuenow`로 나간다.
 * 움직임 줄이기에서도 진행 표시는 그대로다. 서버 컴포넌트로 쓸 수 있다.
 */
export function Progress({
  value,
  max = 100,
  size = "md",
  color = "primary",
  className,
  ...props
}: ProgressProps): ReactElement {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const now = clamp(value, safeMax);
  const percent = (now / safeMax) * 100;
  return (
    <div
      {...props}
      role="progressbar"
      aria-valuenow={now}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      // 색은 항상 붙인다(기본 primary). 바깥 data-color를 물려받지 않게 한다(ADR 0011).
      data-color={color}
      className={cn(trackClass, sizeClass[size], className)}
    >
      <span aria-hidden="true" className={barClass} style={{ width: `${percent}%` }} />
    </div>
  );
}
