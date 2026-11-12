/**
 * `@tide-tds/foundation/color-family`: 앱이 자기 브랜드 색 계열을 더하는 API.
 *
 * 앱은 `defineColorFamily`로 11단계 스케일을 정의하고, `tide-color build <파일>`로 CSS를 만든다.
 * CSS는 Tide 계열과 같은 매핑 규칙으로 light·dark 계열 변수와 `[data-color="<이름>"]` 규칙을 담는다.
 * @packageDocumentation
 */
import { color, type ColorStep } from "./color.ts";
import { tideColorNames } from "./color-name.ts";
import { dataColorRule, familyThemeDeclarations, primitiveVar } from "./color-css.ts";
import {
  colorSlots,
  resolveSlotSteps,
  slotPrimitive,
  slotValueHex,
  type ColorSlot,
  type SlotOverrides,
  type SlotRule,
  type SlotStep,
  type SlotValue,
} from "./color-slot.ts";
import { checkColorContrast, type ColorContrastResult } from "./contrast.ts";
import type { ThemeName } from "./semantic.ts";

export type {
  ColorSlot,
  SlotColorRef,
  SlotMix,
  SlotOverlay,
  SlotOverrides,
  SlotRule,
  SlotStep,
  SlotValue,
} from "./color-slot.ts";
export type { ColorContrastResult, ColorContrastRule } from "./contrast.ts";

/** 50~950의 11단계 스케일. 값은 `#rrggbb` hex다. */
export type ColorScale = Readonly<Record<ColorStep, string>>;

/** `defineColorFamily`에 넘기는 값 */
export interface ColorFamilyInput<Name extends string> {
  /** 색 이름. `data-color`와 변수 이름(`--tide-<이름>-solid`)에 쓴다. 소문자, 숫자, `-`만 쓴다. */
  readonly name: Name;
  /** 11단계 스케일 전체 */
  readonly scale: ColorScale;
  /**
   * 매핑 규칙에서 덮어쓸 슬롯 값. 예: 밝은 계열의 `on-solid`를 `{ light: 950, dark: 950 }`으로.
   * 단계 대신 덮기(`{ step: 100, overlay: "gray-950", amount: 0.04 }`)나 섞기(`{ mix: ["gray-950", 950] }`)도 쓸 수 있다.
   */
  readonly overrides?: SlotOverrides;
}

/** 검증을 마친 앱 색 계열 */
export interface ColorFamilyDefinition<Name extends string = string> {
  readonly name: Name;
  readonly scale: ColorScale;
  readonly overrides: SlotOverrides;
}

const steps = Object.keys(color.blue).map(Number) as ColorStep[];

// Tide 색 이름과 다른 `--tide-*` 변수 이름 공간(bg, text 등)은 앱 계열 이름으로 쓸 수 없다.
const reservedNames = new Set<string>([
  ...tideColorNames,
  "accent",
  "white",
  "black",
  "color",
  "bg",
  "text",
  "border",
  "outline",
  "font",
  "rounded",
  "shadow",
  "duration",
  "ease",
  "z",
  "focus",
]);

function isSlotStep(value: unknown): value is SlotStep {
  return value === "white" || value === "black" || steps.includes(value as ColorStep);
}

/** 덮기·섞기가 참조할 수 있는 색: 그 계열 단계, 또는 Tide Primitive 이름 */
function isColorRef(value: unknown): boolean {
  return steps.includes(value as ColorStep) || Object.hasOwn(primitiveNames, value as string);
}

const primitiveNames: Record<string, true> = Object.fromEntries(
  Object.entries(color).flatMap(([name, scale]) =>
    typeof scale === "string"
      ? [[name, true]]
      : Object.keys(scale).map((step) => [`${name}-${step}`, true]),
  ),
);

/** 슬롯 값: 단계, 덮기(`{ step, overlay, amount }`), 섞기(`{ mix: [a, b] }`) */
function isSlotValue(value: unknown): value is SlotValue {
  if (isSlotStep(value)) return true;
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  if ("mix" in record) {
    return (
      Object.keys(record).length === 1 &&
      Array.isArray(record.mix) &&
      record.mix.length === 2 &&
      record.mix.every(isColorRef)
    );
  }
  return (
    Object.keys(record).length === 3 &&
    steps.includes(record.step as ColorStep) &&
    typeof record.overlay === "string" &&
    Object.hasOwn(primitiveNames, record.overlay) &&
    typeof record.amount === "number" &&
    record.amount > 0 &&
    record.amount < 1
  );
}

/**
 * 앱 브랜드 색 계열을 정의한다. 이름, 스케일, 덮어쓸 값이 올바른지 확인하고 그대로 돌려준다.
 *
 * ```ts
 * // brand.ts
 * import { defineColorFamily } from "@tide-tds/foundation/color-family";
 *
 * export default defineColorFamily({
 *   name: "brand",
 *   scale: { 50: "#f5f3ff", 100: "#ede9fe", ... 950: "#2e1065" },
 * });
 * ```
 *
 * @throws 이름이 Tide 색 이름과 겹치거나, 스케일 단계가 빠졌거나, hex가 `#rrggbb`가 아니면
 */
export function defineColorFamily<const Name extends string>(
  input: ColorFamilyInput<Name>,
): ColorFamilyDefinition<Name> {
  const { name, scale, overrides = {} } = input;
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
    throw new Error(`색 이름은 소문자로 시작하는 kebab-case여야 한다: "${name}"`);
  }
  if (reservedNames.has(name)) {
    throw new Error(`"${name}"은 Tide가 쓰는 이름이라 앱 색 계열 이름으로 쓸 수 없다.`);
  }
  for (const step of steps) {
    const hex = (scale as Partial<Record<ColorStep, unknown>>)[step];
    if (typeof hex !== "string" || !/^#[0-9a-f]{6}$/i.test(hex)) {
      throw new Error(`${name}-${step}: #rrggbb hex가 아니다(${String(hex)})`);
    }
  }
  const extraSteps = Object.keys(scale).filter(
    (step) => !steps.includes(Number(step) as ColorStep),
  );
  if (extraSteps.length > 0) {
    throw new Error(`${name}: 스케일에 없는 단계가 있다(${extraSteps.join(", ")})`);
  }
  for (const [slot, rule] of Object.entries(overrides)) {
    if (!(colorSlots as readonly string[]).includes(slot)) {
      throw new Error(`${name}: 없는 슬롯을 덮어썼다(${slot})`);
    }
    for (const [theme, step] of Object.entries(rule ?? {})) {
      if ((theme !== "light" && theme !== "dark") || !isSlotValue(step)) {
        throw new Error(
          `${name}: ${slot}.${theme} 값이 단계(50~950, white, black), 덮기, 섞기가 아니다`,
        );
      }
    }
  }
  return {
    name,
    scale: Object.fromEntries(steps.map((step) => [step, scale[step].toLowerCase()])) as ColorScale,
    overrides,
  };
}

/** 앱 계열의 슬롯별 단계(규칙 + 덮어쓸 값) */
function slotSteps(family: ColorFamilyDefinition): Record<ColorSlot, SlotRule> {
  return resolveSlotSteps(family.overrides);
}

/** 앱 계열의 Theme별 슬롯 hex */
export function colorFamilySlotHex(
  family: ColorFamilyDefinition,
): Record<ThemeName, Record<ColorSlot, string>> {
  const resolved = slotSteps(family);
  const hex = (value: SlotValue): string => slotValueHex(value, (step) => family.scale[step]);
  return {
    light: Object.fromEntries(
      colorSlots.map((slot) => [slot, hex(resolved[slot].light)]),
    ) as Record<ColorSlot, string>,
    dark: Object.fromEntries(colorSlots.map((slot) => [slot, hex(resolved[slot].dark)])) as Record<
      ColorSlot,
      string
    >,
  };
}

/** 앱 계열을 Tide와 같은 대비 쌍 규칙으로 light·dark에서 검사한다. 미달이면 `pass`가 false다. */
export function checkColorFamily(family: ColorFamilyDefinition): ColorContrastResult[] {
  return checkColorContrast(colorFamilySlotHex(family));
}

/**
 * 앱 계열의 CSS. Primitive 변수, light·dark 계열 변수, `[data-color]` 규칙을 담는다.
 * Tide CSS(`@tide-tds/components/styles.css` 또는 foundation CSS) 다음에 불러온다.
 */
export function colorFamilyCss(families: readonly ColorFamilyDefinition[]): string {
  const themeBlock = (theme: ThemeName): string[] =>
    families.flatMap((family) =>
      familyThemeDeclarations(family.name, slotSteps(family), theme, (step) => family.scale[step]),
    );
  return [
    ":root {",
    ...families.flatMap((family) =>
      steps.map(
        (step) => `  ${primitiveVar(slotPrimitive(family.name, step))}: ${family.scale[step]};`,
      ),
    ),
    "}",
    "",
    ':root,\n[data-theme="light"] {',
    ...themeBlock("light"),
    "}",
    "",
    '[data-theme="dark"] {',
    ...themeBlock("dark"),
    "}",
    "",
    ...families.flatMap((family) => [dataColorRule(family.name), ""]),
  ].join("\n");
}
