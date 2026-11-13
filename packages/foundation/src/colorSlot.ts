import { primitiveHex, type ColorFamily, type ColorStep, type PrimitiveColorName } from "./color";

// 슬롯 규칙은 이 파일 한 곳에 둔다. Tide 계열, Role, 앱 브랜드 계열이 모두 따른다(ADR 0011).

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
  "faint",
  "text",
  "border",
  "subtle-border",
  "on-solid",
  "on-subtle",
] as const;

/** 색 계열 변수 묶음의 슬롯 이름. 예: `solid`, `subtle-hover`, `on-subtle` */
export type ColorSlot = (typeof colorSlots)[number];

/** 배경 슬롯(solid 3단계, subtle 3단계, faint) */
export type BackgroundSlot = Exclude<
  ColorSlot,
  "text" | "border" | "subtle-border" | "on-solid" | "on-subtle"
>;

/** 슬롯이 가리키는 단계: 그 계열 스케일의 단계, 또는 `white`·`black` */
export type SlotStep = ColorStep | "white" | "black";

/** 덮기·섞기가 참조하는 색: 숫자는 그 계열의 단계, 문자열은 Tide Primitive 이름(예: `gray-950`, `white`) */
export type SlotColorRef = ColorStep | PrimitiveColorName;

/** 덮기: 계열 단계 위에 색을 `amount`만큼 덮은 값. 예: 100 + gray-950 4% → `{ step: 100, overlay: "gray-950", amount: 0.04 }` */
export interface SlotOverlay {
  readonly step: ColorStep;
  readonly overlay: PrimitiveColorName;
  /** 덮는 비율. 0보다 크고 1보다 작다. */
  readonly amount: number;
}

/** 섞기: 두 색을 반씩 섞은 값. 예: gray-950과 950 → `{ mix: ["gray-950", 950] }` */
export interface SlotMix {
  readonly mix: readonly [SlotColorRef, SlotColorRef];
}

/** 슬롯 값: 단계 하나, 덮기, 섞기 */
export type SlotValue = SlotStep | SlotOverlay | SlotMix;

/** Theme별 슬롯 값 */
export interface SlotRule {
  readonly light: SlotValue;
  readonly dark: SlotValue;
}

/** 계열마다 덮어쓸 슬롯 값. Theme 하나만 덮어써도 된다. */
export type SlotOverrides = {
  readonly [Slot in ColorSlot]?: Partial<SlotRule>;
};

/**
 * 슬롯 매핑 규칙(ADR 0022 §2 표).
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export const slotRule = {
  solid: { light: 600, dark: 600 },
  "solid-hover": {
    light: { step: 600, overlay: "black", amount: 0.14 },
    dark: { step: 600, overlay: "black", amount: 0.14 },
  },
  "solid-active": {
    light: { step: 600, overlay: "black", amount: 0.2 },
    dark: { step: 600, overlay: "black", amount: 0.2 },
  },
  subtle: { light: 100, dark: 950 },
  "subtle-hover": {
    light: { step: 100, overlay: "gray-950", amount: 0.04 },
    dark: { step: 950, overlay: "white", amount: 0.06 },
  },
  "subtle-active": {
    light: { step: 100, overlay: "gray-950", amount: 0.08 },
    dark: { step: 950, overlay: "white", amount: 0.1 },
  },
  faint: { light: 50, dark: { mix: ["gray-950", 950] } },
  text: { light: 700, dark: 300 },
  border: { light: 600, dark: 400 },
  "subtle-border": { light: 200, dark: 800 },
  "on-solid": { light: "white", dark: "white" },
  "on-subtle": { light: 950, dark: 100 },
} as const;

slotRule satisfies Record<ColorSlot, SlotRule>;

// 덮어쓴 값도 colorContrastRules 대비 검사를 통과해야 한다.
/**
 * Tide 계열별 덮어쓸 값.
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export const familyOverrides = {} as const;

familyOverrides satisfies { readonly [Family in ColorFamily]?: SlotOverrides };

/**
 * 규칙에 덮어쓸 값을 얹은 슬롯별 값.
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
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
 * 슬롯 단계를 Primitive 이름으로 바꾼다. 예: (`blue`, 600) → `blue-600`, (`blue`, `white`) → `white`
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export function slotPrimitive(family: string, step: SlotColorRef): string {
  return typeof step === "number" ? `${family}-${step}` : step;
}

/**
 * 슬롯 값이 단계 하나인지(덮기·섞기가 아닌지) 확인한다.
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export function isSlotStep(value: SlotValue): value is SlotStep {
  return typeof value !== "object";
}

/**
 * 두 색을 섞은 값(`#rrggbb`). sRGB 채널마다 `a × (1 − amount) + b × amount`를 반올림한다.
 * 불투명한 색을 그 위에 `amount`만큼 덮은 값(브라우저의 알파 합성)과 같다.
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export function mixHex(a: string, b: string, amount: number): string {
  const channels = (hex: string): number[] => {
    const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
    if (!match) throw new Error(`불투명한 6자리 hex가 아니다: ${hex}`);

    return match.slice(1).map((channel) => Number.parseInt(channel, 16));
  };
  const from = channels(a);
  const to = channels(b);

  return `#${from
    .map((value, index) =>
      Math.round(value * (1 - amount) + to[index]! * amount)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/**
 * 슬롯 값의 hex. 덮기·섞기는 여기서 계산한다(빌드 시 hex로 넣는다. 런타임 `color-mix()`를 쓰지 않는다).
 * @param stepHex 계열 단계의 hex. Tide 계열은 `color`, 앱 계열은 그 스케일이다.
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export function slotValueHex(value: SlotValue, stepHex: (step: ColorStep) => string): string {
  const ref = (color: SlotColorRef): string =>
    typeof color === "number" ? stepHex(color) : primitiveHex(color);
  if (typeof value !== "object") return ref(value);
  if ("mix" in value) return mixHex(ref(value.mix[0]), ref(value.mix[1]), 0.5);

  return mixHex(stepHex(value.step), primitiveHex(value.overlay), value.amount);
}

/**
 * Tide 계열 하나의 슬롯별 값(규칙 + 그 계열의 덮어쓸 값).
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export function familySlotSteps(family: ColorFamily): Record<ColorSlot, SlotRule> {
  return resolveSlotSteps((familyOverrides as { [Family in ColorFamily]?: SlotOverrides })[family]);
}
