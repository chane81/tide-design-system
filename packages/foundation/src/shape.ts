/** radius 5단계. `rounded-<이름>` class와 공개 계약 `--tide-rounded-<이름>`이 쓴다. */
export const radius = {
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  full: "9999px",
} as const;

/** radius 단계 이름 */
export type RadiusName = keyof typeof radius;

/** 그림자 레이어 하나. 길이는 px, `mix`는 `--tide-shadow-color`를 남기는 비율(%)이다. */
export interface ShadowLayer {
  readonly x: number;
  readonly y: number;
  readonly blur: number;
  readonly spread: number;
  readonly mix: number;
}

/**
 * Elevation 3단계. 각 단계는 [가까운 레이어, 먼 레이어]다.
 * `shadow-<이름>` class와 공개 계약 `--tide-shadow-<이름>`이 쓴다. Theme에 따라 `--tide-shadow-color`만 바뀐다.
 */
export const shadow = {
  sm: [
    { x: 0, y: 1, blur: 1, spread: 0, mix: 60 },
    { x: 0, y: 1, blur: 2, spread: 0, mix: 100 },
  ],
  md: [
    { x: 0, y: 1, blur: 3, spread: 0, mix: 50 },
    { x: 0, y: 4, blur: 12, spread: -2, mix: 100 },
  ],
  lg: [
    { x: 0, y: 2, blur: 6, spread: -1, mix: 50 },
    { x: 0, y: 12, blur: 24, spread: -6, mix: 100 },
  ],
} as const;

// isolatedDeclarations(oxc d.ts)가 `as const satisfies`를 추론하지 못해서 검사는 따로 둔다.
shadow satisfies Record<string, readonly [ShadowLayer, ShadowLayer]>;

/** Elevation 단계 이름 */
export type ShadowName = keyof typeof shadow;

/**
 * 포커스 표시 ring의 두께와 offset. 공개 계약은 `--tide-focus-ring-width`, `--tide-focus-ring-offset`이다.
 * `focus-ring` utility가 쓰고, `focus-field`의 투명 outline(forced-colors 전용) 두께도 같은 값을 쓴다.
 */
export const focusRing = {
  width: "2px",
  offset: "2px",
} as const;

/** 길이 하나를 CSS로 쓴다. 0은 단위 없이 쓴다. */
const length = (px: number): string => (px === 0 ? "0" : `${px}px`);

/**
 * Elevation 단계를 CSS `box-shadow` 값으로 만든다. 두 레이어 모두 `color-mix()`로 `--tide-shadow-color`를 낮춘다.
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export function shadowCss(name: ShadowName): string {
  return shadow[name]
    .map((layer) => {
      const lengths = [layer.x, layer.y, layer.blur, ...(layer.spread === 0 ? [] : [layer.spread])];
      const color = `color-mix(in srgb, var(--tide-shadow-color) ${layer.mix}%, transparent)`;

      return `${lengths.map(length).join(" ")} ${color}`;
    })
    .join(", ");
}
