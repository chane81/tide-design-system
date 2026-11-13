import { color, type ColorFamily } from "./color";
import { colorSlots, familySlotSteps, type ColorSlot } from "./colorSlot";
import {
  colorValueHex,
  roleFamily,
  roleSharedSlots,
  semanticEntries,
  slotColorValue,
  type SemanticColorName,
  type ThemedColor,
  type ThemeName,
  type TideRole,
} from "./semantic";

// Role 슬롯은 Semantic Token을, Tide 색 계열 슬롯은 계열 규칙으로 고른 Primitive를 가리킨다(ADR 0011).

/** Tide에 들어 있는 색 이름. 앱이 augmentation으로 더한 이름은 들어 있지 않다. */
export type TideColor = TideRole | ColorFamily;

/**
 * Role 이름 목록(neutral, primary, success, warning, danger, info 순서).
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export const roleNames: readonly TideRole[] = Object.keys(roleFamily) as TideRole[];

/**
 * Tide 색 계열 목록(`color`의 11단계 계열 순서).
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export const colorFamilyNames: readonly ColorFamily[] = (
  Object.keys(color) as (keyof typeof color)[]
).filter((name): name is ColorFamily => typeof color[name] !== "string");

/**
 * Tide 색 이름 목록. Role 다음에 색 계열이 온다.
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export const tideColorNames: readonly TideColor[] = [...roleNames, ...colorFamilyNames];

/**
 * Tide Role인지 확인한다. 앱 Role은 Role Token이 없어서 false다.
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export function isRole(name: string): name is TideRole {
  return Object.hasOwn(roleFamily, name);
}

/**
 * Role 슬롯이 가리키는 Semantic Token. 예: (`primary`, `solid`) → `bg-primary-solid`, (`neutral`, `text`) → `text-default`
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export function roleSlotToken(role: TideRole, slot: ColorSlot): SemanticColorName {
  if (slot === "on-solid") return "text-on-solid";
  const shared = (
    roleSharedSlots as { [Name in TideRole]?: Partial<Record<ColorSlot, SemanticColorName>> }
  )[role]?.[slot];
  if (shared) return shared;
  switch (slot) {
    case "text":
    case "border":
      return `${slot}-${role}` as SemanticColorName;
    case "on-subtle":
      return `text-${role}-on-subtle` as SemanticColorName;
    case "subtle-border":
      return `border-${role}-subtle` as SemanticColorName;
    default:
      return `bg-${role}-${slot}`;
  }
}

/**
 * Tide 색 이름 하나의 슬롯별 값(Theme별 Primitive).
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export function colorSlotValues(name: TideColor): Record<ColorSlot, ThemedColor> {
  if (isRole(name)) {
    const entries = new Map(semanticEntries().map((entry) => [entry.className, entry.value]));

    return Object.fromEntries(
      colorSlots.map((slot) => [slot, entries.get(roleSlotToken(name, slot))!]),
    ) as Record<ColorSlot, ThemedColor>;
  }
  const steps = familySlotSteps(name);

  return Object.fromEntries(
    colorSlots.map((slot) => [
      slot,
      {
        light: slotColorValue(name, steps[slot].light),
        dark: slotColorValue(name, steps[slot].dark),
      },
    ]),
  ) as Record<ColorSlot, ThemedColor>;
}

/**
 * Tide 색 이름 하나의 슬롯별 hex(Theme 하나).
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export function colorSlotHex(name: TideColor, theme: ThemeName): Record<ColorSlot, string> {
  const values = colorSlotValues(name);

  return Object.fromEntries(
    colorSlots.map((slot) => [slot, colorValueHex(values[slot][theme])]),
  ) as Record<ColorSlot, string>;
}
