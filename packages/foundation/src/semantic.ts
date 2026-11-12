import { primitiveHex, type ColorFamily, type PrimitiveColorName } from "./color.ts";
import {
  colorSlots,
  familyOverrides,
  resolveSlotSteps,
  slotPrimitive,
  slotRule,
  type BackgroundSlot,
  type ColorSlot,
  type SlotOverrides,
} from "./color-slot.ts";

/** Theme 이름 */
export type ThemeName = "light" | "dark";

/** Primitive에 투명도를 더한 색. overlay와 shadow 색에만 쓰고, CSS에는 8자리 hex로 나간다. */
export interface AlphaColor {
  readonly primitive: PrimitiveColorName;
  /** 0~1 */
  readonly alpha: number;
}

/**
 * Semantic Token 하나가 가리키는 값. `transparent`는 light raised border에만 쓴다(CSS에서도 `transparent` 키워드로 나간다).
 */
export type SemanticColorValue = PrimitiveColorName | AlphaColor | "transparent";

/** Theme별로 가리키는 값 */
export interface ThemedColor {
  readonly light: SemanticColorValue;
  readonly dark: SemanticColorValue;
}

/**
 * Tide가 정한 Role 6개. 앱이 `RoleRegistry`에 더한 Role은 들어 있지 않다.
 * Tide 안의 계산(Semantic Token 이름, 대비 쌍)은 이 타입을 쓴다. 앱 Role에는 Role Token이 생기지 않기 때문이다.
 */
export type TideRole = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

/**
 * Role이 참조하는 Primitive 계열.
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export const roleFamily = {
  neutral: "gray",
  primary: "blue",
  success: "green",
  warning: "amber",
  danger: "red",
  info: "cyan",
} as const;

roleFamily satisfies Record<TideRole, ColorFamily>;

// Role은 「색 계열 + 덮어쓸 값」의 별칭이다(tide-v0-impl 티켓 40, ADR 0011).
// neutral은 gray와 다른 색이다(2026-11-10 사용자 결정). gray는 일반 계열 규칙을 따른다.
// - dark subtle 3단계: 900 / 800 / 700(gray 규칙의 950은 dark canvas와 같은 색이다)
// - text, border: 역할 Token을 두지 않고 text-default, border-strong을 쓴다(roleSharedSlots)
/**
 * Role별로 계열 규칙에서 덮어쓸 값.
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export const roleOverrides = {
  neutral: {
    subtle: { dark: 900 },
    "subtle-hover": { dark: 800 },
    "subtle-active": { dark: 700 },
  },
} as const;

roleOverrides satisfies { readonly [Name in TideRole]?: SlotOverrides };

/**
 * 역할 Token 대신 공통 Semantic Token을 쓰는 Role 슬롯. on-solid는 모든 Role이 `text-on-solid`를 쓴다.
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export const roleSharedSlots = {
  neutral: { text: "text-default", border: "border-strong" },
} as const;

// 색 이름 등록은 둘로 나뉜다(tide-v0-impl 티켓 41, ADR 0016).
// - RoleRegistry: 뜻이 있는 색. 행동·의미 Component(Button, IconButton, Link 등)의 `color`가 받는다.
// - ColorFamilyRegistry: 뜻이 없는 색 계열. 장식·분류 Component(Badge, Tag, Avatar 등)가 쓴다.
// 둘 다 augmentation 대상이라 type이 아니라 interface여야 한다. 같은 이름을 양쪽에 등록해도 된다.

/**
 * Role 목록. Tide Role 6개가 들어 있고, 앱은 module augmentation으로 자기 Role(예: `brand`)을 더한다.
 * 앱 Role의 색은 `@tide-tds/foundation/color-family`의 `defineColorFamily`와 `tide-color build`로 만든다.
 *
 * ```ts
 * declare module "@tide-tds/components" {
 *   interface RoleRegistry {
 *     brand: true;
 *   }
 * }
 * ```
 */
export interface RoleRegistry extends Record<TideRole, true> {}

/**
 * Role. 뜻이 있는 색이다. 행동·의미 Component의 `color`로 고르고, `data-color` 속성으로 accent 슬롯에 꽂는다.
 * Tide Role 6개와 앱이 `RoleRegistry`에 더한 Role이다.
 */
export type Role = keyof RoleRegistry;

/**
 * 색 계열 목록. Tide 색 계열 8개(장식 계열 purple·mint 포함)가 들어 있고, 앱은 module augmentation으로 장식용 계열을 더한다.
 * Tide가 Primitive 계열을 더하면 이 목록도 함께 넓어진다.
 *
 * ```ts
 * declare module "@tide-tds/components" {
 *   interface ColorFamilyRegistry {
 *     brand: true;
 *   }
 * }
 * ```
 */
export interface ColorFamilyRegistry extends Record<ColorFamily, true> {}

/**
 * 색 계열 이름. 뜻이 없는 색이라 장식·분류 Component가 쓴다.
 * Tide 색 계열(`ColorFamily`)과 앱이 `ColorFamilyRegistry`에 더한 계열이다.
 */
export type ColorFamilyName = keyof ColorFamilyRegistry;

/** 색 이름(Color). `data-color` 속성이 받는 모든 이름이다(Role과 색 계열). */
export type Color = Role | ColorFamilyName;

// 타입 수준에서 Role 슬롯이 가리키는 Primitive를 계산한다. 런타임 계산(roleSlotColor)과 같은 규칙이다.
// 그래서 `semantic.background["primary-solid"].light`의 타입이 `"blue-600"` 그대로 남는다.
type Lookup<Table, K1, K2, K3, Fallback> = K1 extends keyof Table
  ? K2 extends keyof Table[K1]
    ? K3 extends keyof Table[K1][K2]
      ? Table[K1][K2][K3]
      : Fallback
    : Fallback
  : Fallback;
type FamilyStep<Family, Slot extends ColorSlot, Theme extends ThemeName> = Lookup<
  typeof familyOverrides,
  Family,
  Slot,
  Theme,
  (typeof slotRule)[Slot][Theme]
>;
type RoleStep<Name extends TideRole, Slot extends ColorSlot, Theme extends ThemeName> = Lookup<
  typeof roleOverrides,
  Name,
  Slot,
  Theme,
  FamilyStep<(typeof roleFamily)[Name], Slot, Theme>
>;
type StepName<Family extends string, Step> = Step extends number ? `${Family}-${Step}` : Step;
type RoleSlotColor<Name extends TideRole, Slot extends ColorSlot> = {
  readonly light: StepName<(typeof roleFamily)[Name], RoleStep<Name, Slot, "light">>;
  readonly dark: StepName<(typeof roleFamily)[Name], RoleStep<Name, Slot, "dark">>;
};
/** 역할 text·border Token이 있는 Role(neutral 제외) */
type AccentRole = Exclude<TideRole, keyof typeof roleSharedSlots>;
type RoleBackgroundTokens = {
  readonly [
    Key in `${TideRole}-${BackgroundSlot}`
  ]: Key extends `${infer Name extends TideRole}-${infer Slot extends BackgroundSlot}`
    ? RoleSlotColor<Name, Slot>
    : never;
};
type RoleSlotTokens<Slot extends "text" | "border"> = {
  readonly [Name in AccentRole]: RoleSlotColor<Name, Slot>;
};

const roles = Object.keys(roleFamily) as TideRole[];
const backgroundSlots = colorSlots.filter(
  (slot): slot is BackgroundSlot => slot !== "text" && slot !== "border" && slot !== "on-solid",
);
const accentRoles = roles.filter((role): role is AccentRole => !(role in roleSharedSlots));

/** Role 슬롯이 가리키는 Primitive. 계열 규칙 → 계열 덮어쓸 값 → Role 덮어쓸 값 순서로 얹는다. */
function roleSlotColor(role: TideRole, slot: ColorSlot): ThemedColor {
  const family = roleFamily[role];
  const steps = resolveSlotSteps(
    (familyOverrides as { [Family in ColorFamily]?: SlotOverrides })[family],
    (roleOverrides as { [Name in TideRole]?: SlotOverrides })[role],
  )[slot];
  return {
    light: slotPrimitive(family, steps.light) as PrimitiveColorName,
    dark: slotPrimitive(family, steps.dark) as PrimitiveColorName,
  };
}

// Semantic 색. Tailwind 속성별 namespace로 노출한다(ADR 0003).
// 키는 Utility class에서 접두사(bg-, text- 등)를 뺀 이름이다. 공개 계약은 `--tide-<Utility class 이름>`이다.
// 공통 Token은 아래에 직접 적고, Role Token은 Role 별칭 규칙(roleSlotColor)으로 만든다.
// Token을 더하면 contrast.ts에 대비 쌍이나 제외 사유를 함께 등록한다. 등록하지 않으면 테스트가 실패한다.
const commonBackground = {
  // 표면 층. surface는 canvas와 같은 색이고 border로 구분한다. dark raised는 밝기로 높이를 나타낸다.
  canvas: { light: "white", dark: "gray-950" },
  surface: { light: "white", dark: "gray-950" },
  raised: { light: "white", dark: "gray-900" },
  disabled: { light: "gray-100", dark: "gray-900" },
  overlay: {
    light: { primitive: "gray-950", alpha: 0.5 },
    dark: { primitive: "gray-950", alpha: 0.7 },
  },
} as const;

const commonText = {
  default: { light: "gray-900", dark: "gray-50" },
  muted: { light: "gray-600", dark: "gray-300" },
  disabled: { light: "gray-400", dark: "gray-600" },
  // solid 배경 위 글자. 모든 Role이 같이 쓴다.
  "on-solid": { light: "white", dark: "white" },
} as const;

const commonBorder = {
  // 구분선(장식용). 대비 검사에서 제외한다.
  default: { light: "gray-200", dark: "gray-800" },
  // 입력창 등 UI 식별용 경계. 3:1
  strong: { light: "gray-500", dark: "gray-400" },
  // raised 표면 경계. light는 그림자가 경계를 맡고 투명 border는 forced-colors에서 시스템 색으로 그려진다.
  // dark는 그림자가 잘 보이지 않아 border가 경계를 맡는다(tide-v0 티켓 20, 2026-11-10 사용자 결정). 장식용이라 대비 검사에서 제외한다.
  raised: { light: "transparent", dark: "gray-800" },
} as const;

const commonOutline = {
  // 포커스 표시 색. 오류 상태에서도 바꾸지 않는다.
  focus: { light: "blue-600", dark: "blue-400" },
} as const;

export const semantic: {
  readonly background: typeof commonBackground & RoleBackgroundTokens;
  readonly text: typeof commonText & RoleSlotTokens<"text">;
  readonly border: typeof commonBorder & RoleSlotTokens<"border">;
  readonly outline: typeof commonOutline;
} = {
  background: {
    ...commonBackground,
    ...Object.fromEntries(
      roles.flatMap((role) =>
        backgroundSlots.map((slot) => [`${role}-${slot}`, roleSlotColor(role, slot)]),
      ),
    ),
  } as typeof commonBackground & RoleBackgroundTokens,
  text: {
    ...commonText,
    ...Object.fromEntries(accentRoles.map((role) => [role, roleSlotColor(role, "text")])),
  } as typeof commonText & RoleSlotTokens<"text">,
  border: {
    ...commonBorder,
    ...Object.fromEntries(accentRoles.map((role) => [role, roleSlotColor(role, "border")])),
  } as typeof commonBorder & RoleSlotTokens<"border">,
  outline: commonOutline,
};

// isolatedDeclarations에서는 export 값에 satisfies를 쓸 수 없어서, 모양 검사를 따로 둔다.
semantic satisfies Record<SemanticNamespace, Record<string, ThemedColor>>;

/** Semantic namespace와 Utility class 접두사 */
export type SemanticNamespace = "background" | "text" | "border" | "outline";

export const semanticPrefix = {
  background: "bg",
  text: "text",
  border: "border",
  outline: "outline",
} as const;

semanticPrefix satisfies Record<SemanticNamespace, string>;

/** Semantic Token의 Utility class 이름. 예: `bg-primary-solid`, `text-muted` */
export type SemanticColorName = {
  [
    Namespace in SemanticNamespace
  ]: `${(typeof semanticPrefix)[Namespace]}-${keyof (typeof semantic)[Namespace] & string}`;
}[SemanticNamespace];

// shadow 색은 Utility class로 노출하지 않는다. 공개 계약은 `--tide-shadow-color` 하나다.
// alpha는 tide-v0 티켓 24(그림자·포커스 표시 시각 비교)에서 light 8%, dark 30%로 정했다.
/**
 * Theme별 shadow 색. CSS에서는 `--tide-shadow-color`로 쓴다.
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export const shadowColor = {
  light: { primitive: "gray-950", alpha: 0.08 },
  dark: { primitive: "black", alpha: 0.3 },
} as const;

shadowColor satisfies ThemedColor;

/**
 * 모든 Semantic Token(namespace, Utility class 이름, Theme별 값).
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function semanticEntries(): {
  readonly namespace: SemanticNamespace;
  readonly key: string;
  readonly className: SemanticColorName;
  readonly value: ThemedColor;
}[] {
  return (Object.keys(semantic) as SemanticNamespace[]).flatMap((namespace) =>
    Object.entries(semantic[namespace] as Record<string, ThemedColor>).map(([key, value]) => ({
      namespace,
      key,
      className: `${semanticPrefix[namespace]}-${key}` as SemanticColorName,
      value,
    })),
  );
}

/**
 * 값을 hex로 바꾼다. alpha가 있으면 8자리 hex(`#rrggbbaa`)다. `transparent`는 `#00000000`이다.
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function colorValueHex(value: SemanticColorValue): string {
  if (value === "transparent") return "#00000000";
  if (typeof value === "string") return primitiveHex(value);
  const alpha = Math.round(value.alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${primitiveHex(value.primitive)}${alpha}`;
}

/**
 * Semantic Token이 Theme에서 가리키는 hex.
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function semanticHex(name: SemanticColorName, theme: ThemeName): string {
  const entry = semanticEntries().find((candidate) => candidate.className === name);
  if (!entry) throw new Error(`Semantic Token이 아니다: ${name}`);
  return colorValueHex(entry.value[theme]);
}
