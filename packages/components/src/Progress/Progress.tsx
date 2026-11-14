import type { ComponentProps, ReactElement } from "react";

import { cn } from "../_internal/libs/cn";
import type { Role, Size } from "../types";

// `<progress>`는 브라우저별 pseudo-element로만 칠할 수 있어 `div role="progressbar"`를 쓴다.

type ProgressSize = Extract<Size, "sm" | "md">;

// progressbar는 이름이 필요해 `aria-label`·`aria-labelledby` 중 하나를 강제한다.
type ProgressName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

export interface ProgressOwnProps {
  /** 현재 값. 0~`max`로 잘라 쓴다. 값을 모르는 진행은 Spinner를 쓴다. */
  value: number;
  /** 끝 값. 기본값 `100`. 시작 값은 항상 0이다. */
  max?: number;
  /** 막대 굵기. `sm` 4px, `md` 8px. 기본값 `md`. */
  size?: ProgressSize;
  /** 막대 색. Role(Tide Role + 앱 Role)만 받는다. 기본값 `primary`. */
  color?: Role;
}

export type ProgressProps = ProgressOwnProps &
  ProgressName &
  Omit<
    ComponentProps<"div">,
    | keyof ProgressOwnProps
    | "children"
    | "role"
    | "aria-label"
    | "aria-labelledby"
    | "aria-valuenow"
    | "aria-valuemin"
    | "aria-valuemax"
  >;

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
const sizeClass: Record<ProgressSize, string> = {
  sm: "h-1",
  md: "h-2",
};

// forced-colors는 트랙·막대 배경을 모두 Canvas로 덮어 막대가 사라지므로 시스템 색으로 직접 칠한다.
const trackClass =
  "relative block w-full overflow-hidden rounded-full bg-accent-subtle forced-colors:forced-color-adjust-none forced-colors:border forced-colors:border-[CanvasText] forced-colors:bg-[Canvas]";

// 막대는 text 슬롯이다. solid는 dark에서 subtle 트랙과 3:1이 되지 않는다.
const barClass =
  "block h-full rounded-full bg-current text-accent motion-safe:transition-[width] forced-colors:text-[Highlight]";

function clamp(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;

  return Math.min(Math.max(value, 0), max);
}

/**
 * 작업이 얼마나 진행됐는지 막대로 보여 준다(`role="progressbar"`). 서버 컴포넌트로 쓸 수 있다.
 * Tide props: `value`, `max`, `size`, `color` ({@link ProgressOwnProps}). 나머지는 `<div>` 속성(`aria-label`이나 `aria-labelledby` 필수).
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
      // 바깥 data-color를 물려받지 않게 항상 붙인다(ADR 0011).
      data-color={color}
      className={cn(trackClass, sizeClass[size], className)}
    >
      <span aria-hidden="true" className={barClass} style={{ width: `${percent}%` }} />
    </div>
  );
}
