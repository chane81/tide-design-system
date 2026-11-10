import { colorFamilyNames, isRole, roleNames, roleSlotToken } from "./color-name.ts";
import {
  colorSlots,
  familySlotSteps,
  slotPrimitive,
  type ColorSlot,
  type SlotRule,
} from "./color-slot.ts";
import {
  roleFamily,
  semanticEntries,
  type SemanticColorName,
  type SemanticNamespace,
  type ThemeName,
} from "./semantic.ts";

// 색 계열 변수 묶음과 `[data-color]` 규칙의 CSS 조각(tide-v0-impl 티켓 40, ADR 0011).
// 빌드 스크립트(tokens.css)와 tide-color CLI(앱 브랜드 계열 CSS)가 같은 함수로 만든다.
// - 계열 변수: `--tide-<계열>-<슬롯>`. Theme 블록이 정한다. 예: `--tide-blue-solid: var(--tide-color-blue-600)`
// - accent 슬롯: `--tide-accent-<슬롯>`. `[data-color="<색 이름>"]`가 그 색의 변수를 별칭으로 꽂는다.
//   Theme 블록은 기본값으로 primary를 꽂는다. 별칭은 그 요소에서 계산되므로 data-color는 data-theme과 같은 요소나
//   그 안쪽에 둔다(바깥 data-color 안의 요소 단위 data-theme은 primary로 돌아간다).

/** Primitive 변수 이름. 예: `--tide-color-blue-600` */
export function primitiveVar(name: string): string {
  return `--tide-color-${name}`;
}

/** 계열 변수 이름. 예: `--tide-blue-solid` */
export function familyVar(family: string, slot: ColorSlot): string {
  return `--tide-${family}-${slot}`;
}

/** accent 슬롯 변수 이름. 예: `--tide-accent-solid` */
export function accentVar(slot: ColorSlot): string {
  return `--tide-accent-${slot}`;
}

/** Semantic Token 변수 이름. 예: `--tide-bg-primary-solid` */
export function semanticVar(className: string): string {
  return `--tide-${className}`;
}

/** 슬롯 값의 CSS 표현. 계열 단계는 Primitive 변수를, white·black은 Tide Primitive 변수를 가리킨다. */
function slotCss(family: string, step: SlotRule[ThemeName]): string {
  return `var(${primitiveVar(slotPrimitive(family, step))})`;
}

/**
 * 계열 하나의 Theme 블록 선언(9줄).
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function familyThemeDeclarations(
  family: string,
  steps: Readonly<Record<ColorSlot, SlotRule>>,
  theme: ThemeName,
): string[] {
  return colorSlots.map(
    (slot) => `  ${familyVar(family, slot)}: ${slotCss(family, steps[slot][theme])};`,
  );
}

/** accent 슬롯에 변수를 꽂는 선언 */
function accentDeclarations(source: (slot: ColorSlot) => string): string[] {
  return colorSlots.map((slot) => `  ${accentVar(slot)}: var(${source(slot)});`);
}

/**
 * `[data-color="<색 이름>"]` 규칙 하나. Role은 Role Token을, 계열은 계열 변수를 꽂는다.
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function dataColorRule(name: string): string {
  const source = isRole(name)
    ? (slot: ColorSlot) => semanticVar(roleSlotToken(name, slot))
    : (slot: ColorSlot) => familyVar(name, slot);
  return [`[data-color="${name}"] {`, ...accentDeclarations(source), "}"].join("\n");
}

/**
 * Theme 블록의 accent 기본값(primary). data-color가 없는 요소도 그 Theme의 값을 읽는다.
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function accentDefaultDeclarations(): string[] {
  return accentDeclarations((slot) => semanticVar(roleSlotToken("primary", slot)));
}

/**
 * Tide 색 계열 전체의 Theme 블록 선언.
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function tideFamilyThemeDeclarations(theme: ThemeName): string[] {
  return colorFamilyNames.flatMap((family) =>
    familyThemeDeclarations(family, familySlotSteps(family), theme),
  );
}

// Role Token은 계열 변수의 별칭이다. 덮어쓴 슬롯(neutral dark subtle)만 Primitive를 직접 가리킨다.
const roleAliases = new Map<SemanticColorName, { family: string; slot: ColorSlot }>(
  roleNames.flatMap((role) =>
    colorSlots
      .map((slot) => [roleSlotToken(role, slot), slot] as const)
      // 공통 Token(text-default, border-strong, text-on-solid)은 Role 별칭이 아니다.
      .filter(([token]) => token.includes(`-${role}`))
      .map(([token, slot]) => [token, { family: roleFamily[role], slot }] as const),
  ),
);

/**
 * Role Token이 Theme에서 계열 변수의 별칭이면 그 변수 참조를 돌려준다. 덮어쓴 슬롯이거나 Role Token이 아니면 undefined다.
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function roleAliasCss(className: SemanticColorName, theme: ThemeName): string | undefined {
  const alias = roleAliases.get(className);
  if (!alias) return undefined;
  const family = alias.family as (typeof roleFamily)[keyof typeof roleFamily];
  const familyValue = slotPrimitive(family, familySlotSteps(family)[alias.slot][theme]);
  const entry = semanticEntries().find((candidate) => candidate.className === className)!;
  return entry.value[theme] === familyValue ? `var(${familyVar(family, alias.slot)})` : undefined;
}

/** accent Utility class 하나. key는 Utility class에서 접두사를 뺀 이름이다. */
export interface AccentUtility {
  readonly namespace: SemanticNamespace;
  readonly key: string;
  readonly slot: ColorSlot;
}

/**
 * accent Utility class 목록. 예: `bg-accent-solid` → `--tide-accent-solid`, `text-accent` → `--tide-accent-text`
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export const accentUtilities: readonly AccentUtility[] = [
  ...colorSlots
    .filter((slot) => slot !== "text" && slot !== "border" && slot !== "on-solid")
    .map((slot) => ({ namespace: "background" as const, key: `accent-${slot}`, slot })),
  { namespace: "text", key: "accent", slot: "text" },
  { namespace: "text", key: "accent-on-solid", slot: "on-solid" },
  { namespace: "border", key: "accent", slot: "border" },
];
