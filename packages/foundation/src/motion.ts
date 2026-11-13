// reduced-motion 처리는 Component가 motion-safe:로 한다. Token은 그대로다.

/**
 * duration 2단계. `duration-<이름>` class와 공개 계약 `--tide-duration-<이름>`이 쓴다.
 * 나타날 때 normal, 사라질 때와 상태 변화는 fast다. fast는 시간을 적지 않은 transition의 기본값이다.
 */
export const duration = {
  fast: "150ms",
  normal: "300ms",
} as const;

/** duration 단계 이름 */
export type DurationName = keyof typeof duration;

/**
 * easing. `ease-<이름>` class와 공개 계약 `--tide-ease-<이름>`이 쓴다.
 * Tide Component는 out만 쓰고, out은 시간을 적지 않은 transition의 기본값이다.
 */
export const easing = {
  out: "cubic-bezier(0, 0, 0.2, 1)",
} as const;

/** easing 이름 */
export type EasingName = keyof typeof easing;
