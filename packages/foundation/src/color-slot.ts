import type { ColorFamily, ColorStep } from "./color.ts";

// 색 계열 하나가 Theme마다 내는 변수 묶음의 자리(슬롯)와 매핑 규칙(tide-v0-impl 티켓 40, ADR 0011).
// 규칙은 이 파일 한 곳에 둔다. Tide 계열, Role, 앱 브랜드 계열(defineColorFamily)이 모두 이 규칙을 따른다.
// 값은 tide-v0 티켓 09(컬러 Foundation 결정)의 Role 매핑과 같다.

/**
 * 색 계열 변수 묶음의 슬롯. CSS에서는 `--tide-<색 이름>-<슬롯>`과 `--tide-accent-<슬롯>`으로 나간다.
 */
export const colorSlots = [
  "solid",
  "solid-hover",
  "solid-active",
  "subtle",
  "subtle-hover",
  "subtle-active",
  "text",
  "border",
  "on-solid",
] as const;

/** 색 계열 변수 묶음의 슬롯 이름. 예: `solid`, `subtle-hover`, `on-solid` */
export type ColorSlot = (typeof colorSlots)[number];

/** 배경 슬롯(solid 3단계, subtle 3단계) */
export type BackgroundSlot = Exclude<ColorSlot, "text" | "border" | "on-solid">;

/** 슬롯이 가리키는 값: 그 계열 스케일의 단계, 또는 `white`·`black` */
export type SlotStep = ColorStep | "white" | "black";

/** Theme별 슬롯 값 */
export interface SlotRule {
  readonly light: SlotStep;
  readonly dark: SlotStep;
}

/** 계열마다 덮어쓸 슬롯 값. Theme 하나만 덮어써도 된다. */
export type SlotOverrides = {
  readonly [Slot in ColorSlot]?: Partial<SlotRule>;
};

// - solid / hover / active: 두 Theme 모두 600 / 700 / 800(흰 글자 대비를 지키려고 dark도 진해지는 방향)
// - subtle / hover / active: light 50 / 100 / 200, dark 950 / 900 / 800
// - text: light 800, dark 200. border: light 600, dark 400. on-solid: 흰색
/**
 * 슬롯 매핑 규칙.
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export const slotRule = {
  solid: { light: 600, dark: 600 },
  "solid-hover": { light: 700, dark: 700 },
  "solid-active": { light: 800, dark: 800 },
  subtle: { light: 50, dark: 950 },
  "subtle-hover": { light: 100, dark: 900 },
  "subtle-active": { light: 200, dark: 800 },
  text: { light: 800, dark: 200 },
  border: { light: 600, dark: 400 },
  "on-solid": { light: "white", dark: "white" },
} as const;

slotRule satisfies Record<ColorSlot, SlotRule>;

// Tide 계열마다 덮어쓸 값. 지금은 없다. 예: 노란 계열을 더해 흰 글자 대비가 모자라면 on-solid를 진한 단계로 덮어쓴다.
// 덮어쓴 값도 대비 쌍 검사(contrast.ts의 colorContrastRules)를 통과해야 한다.
/**
 * Tide 계열별 덮어쓸 값.
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export const familyOverrides = {} as const;

familyOverrides satisfies { readonly [Family in ColorFamily]?: SlotOverrides };

/**
 * 규칙에 덮어쓸 값을 얹은 슬롯별 단계.
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function resolveSlotSteps(
  ...overrides: (SlotOverrides | undefined)[]
): Record<ColorSlot, SlotRule> {
  return Object.fromEntries(
    colorSlots.map((slot) => {
      const steps: SlotRule = overrides.reduce<SlotRule>(
        (current, override) => ({ ...current, ...override?.[slot] }),
        slotRule[slot],
      );
      return [slot, steps];
    }),
  ) as Record<ColorSlot, SlotRule>;
}

/**
 * 슬롯 값을 Primitive 이름으로 바꾼다. 예: (`blue`, 600) → `blue-600`, (`blue`, `white`) → `white`
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function slotPrimitive(family: string, step: SlotStep): string {
  return typeof step === "number" ? `${family}-${step}` : step;
}

/**
 * Tide 계열 하나의 슬롯별 단계(규칙 + 그 계열의 덮어쓸 값).
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function familySlotSteps(family: ColorFamily): Record<ColorSlot, SlotRule> {
  return resolveSlotSteps((familyOverrides as { [Family in ColorFamily]?: SlotOverrides })[family]);
}
