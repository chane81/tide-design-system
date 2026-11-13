// motion Token(tide-v0 티켓 21·24, spec 「`@tide-design/foundation`」 motion).
// - duration은 2단계다. 들어올 때는 길게(normal), 나갈 때와 상태 변화는 짧게(fast) 구분한다.
// - easing은 out 하나다. 값은 Tailwind 기본 `--ease-out`과 같다. Tailwind의 ease-in, ease-in-out은 지우지 않는다.
// - 시간을 적지 않은 transition class(transition-colors 등)의 기본값은 fast와 out이다.
// - reduced-motion 처리(이동·확대·blur를 opacity로 바꿈)는 Component가 motion-safe:로 한다. Token은 그대로다.

/**
 * duration 2단계. `duration-<이름>` class와 공개 계약 `--tide-duration-<이름>`이 쓴다.
 * - fast: hover·press, 색 전환, Switch thumb, 오버레이가 사라질 때. 시간을 적지 않은 transition의 기본값이다.
 * - normal: 가끔 쓰는 오버레이(Popover, Toast, Dialog류)가 나타날 때
 */
export const duration = {
  fast: "150ms",
  normal: "300ms",
} as const;

/** duration 단계 이름 */
export type DurationName = keyof typeof duration;

/**
 * easing. `ease-<이름>` class와 공개 계약 `--tide-ease-<이름>`이 쓴다.
 * - out: Tide Component 전부. 나타날 때와 사라질 때 모두. 시간을 적지 않은 transition의 기본값이다.
 */
export const easing = {
  out: "cubic-bezier(0, 0, 0.2, 1)",
} as const;

/** easing 이름 */
export type EasingName = keyof typeof easing;
