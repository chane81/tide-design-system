import { primitiveHex, type ColorFamily, type PrimitiveColorName } from "./color";
import {
  colorSlots,
  familyOverrides,
  mixHex,
  resolveSlotSteps,
  slotPrimitive,
  slotRule,
  type BackgroundSlot,
  type ColorSlot,
  type SlotColorRef,
  type SlotOverrides,
  type SlotValue,
} from "./colorSlot";

/** Theme 이름 */
export type ThemeName = "light" | "dark";

/**
 * Primitive에 투명도를 더한 색. overlay, 무채색 호버(`bg-hover`·`bg-active`), shadow 색에만 쓰고, CSS에는 8자리 hex로 나간다.
 */
export interface AlphaColor {
  readonly primitive: PrimitiveColorName;
  /** 0~1 */
  readonly alpha: number;
}

/**
 * Semantic Token 하나가 가리키는 값. `transparent`는 light raised border에만 쓴다(CSS에서도 `transparent` 키워드로 나간다).
 */
export type SemanticColorValue = PrimitiveColorName | AlphaColor | MixedColor | "transparent";

/**
 * 두 Primitive를 섞은 불투명한 색. `base` 위에 `mix`를 `amount`만큼 덮은 값이고, 빌드할 때 `#rrggbb`로 계산한다.
 */
export interface MixedColor {
  readonly base: PrimitiveColorName;
  readonly mix: PrimitiveColorName;
  /** 0~1 */
  readonly amount: number;
}

/** Theme별로 가리키는 값 */
export interface ThemedColor {
  readonly light: SemanticColorValue;
  readonly dark: SemanticColorValue;
}

/**
 * Tide가 정한 Role 6개. 앱이 `RoleRegistry`에 더한 Role은 들지 않는다(앱 Role에는 Role Token이 없다).
 */
export type TideRole = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

/**
 * Role이 참조하는 Primitive 계열.
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
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

// neutral dark subtle은 gray 규칙의 950이 dark canvas와 같은 색이라 900/800/700으로 덮는다(ADR 0011).
/**
 * Role별로 계열 규칙에서 덮어쓸 값.
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
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
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export const roleSharedSlots = {
  neutral: { text: "text-default", border: "border-strong", "on-subtle": "text-default" },
} as const;

/**
 * 계열 슬롯 값을 Semantic 값으로 바꾼다. 단계는 Primitive 이름(`blue-600`), 덮기·섞기는 `MixedColor`다.
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export function slotColorValue(family: ColorFamily, value: SlotValue): SemanticColorValue {
  const name = (ref: SlotColorRef): PrimitiveColorName =>
    slotPrimitive(family, ref) as PrimitiveColorName;
  if (typeof value !== "object") return name(value);
  if ("mix" in value) return { base: name(value.mix[0]), mix: name(value.mix[1]), amount: 0.5 };

  return { base: name(value.step), mix: value.overlay, amount: value.amount };
}

// 두 Registry는 module augmentation 대상이라 type이 아니라 interface여야 한다(ADR 0016).

/**
 * Role 목록(Tide Role 6개). 앱은 module augmentation으로 자기 Role을 더하고, 색은 `tide-color build`로 만든다.
 *
 * ```ts
 * declare module "@tide-design/components" {
 *   interface RoleRegistry {
 *     brand: true;
 *   }
 * }
 * ```
 */
export interface RoleRegistry extends Record<TideRole, true> {}

/** Role(Tide Role + 앱이 `RoleRegistry`에 더한 Role). 뜻이 있는 색이라 행동·의미 Component의 `color`가 받는다. */
export type Role = keyof RoleRegistry;

/**
 * 색 계열 목록(Tide 색 계열 8개). 앱은 module augmentation으로 장식용 계열을 더한다.
 *
 * ```ts
 * declare module "@tide-design/components" {
 *   interface ColorFamilyRegistry {
 *     brand: true;
 *   }
 * }
 * ```
 */
export interface ColorFamilyRegistry extends Record<ColorFamily, true> {}

/** 색 계열 이름(Tide 계열 + 앱이 `ColorFamilyRegistry`에 더한 계열). 뜻이 없는 색이라 장식·분류 Component가 쓴다. */
export type ColorFamilyName = keyof ColorFamilyRegistry;

/** 색 이름(Color). `data-color` 속성이 받는 모든 이름이다(Role과 색 계열). */
export type Color = Role | ColorFamilyName;

// roleSlotColor와 같은 규칙을 타입으로 계산해 Token 타입이 `"blue-600"` 같은 리터럴로 남게 한다.
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
// 덮기·섞기 슬롯은 MixedColor다(원소 이름까지 타입에 남기지 않는다).
type StepName<Family extends string, Step> = Step extends number
  ? `${Family}-${Step}`
  : Step extends string
    ? Step
    : MixedColor;
type RoleSlotColor<Name extends TideRole, Slot extends ColorSlot> = {
  readonly light: StepName<(typeof roleFamily)[Name], RoleStep<Name, Slot, "light">>;
  readonly dark: StepName<(typeof roleFamily)[Name], RoleStep<Name, Slot, "dark">>;
};
/** 그 슬롯을 공통 Token과 나눠 쓰지 않고 자기 Role Token을 가진 Role. 예: text는 neutral 제외 */
type OwnRole<Slot extends ColorSlot> = {
  [Name in TideRole]: Name extends keyof typeof roleSharedSlots
    ? Slot extends keyof (typeof roleSharedSlots)[Name]
      ? never
      : Name
    : Name;
}[TideRole];
type RoleBackgroundTokens = {
  readonly [
    Key in `${TideRole}-${BackgroundSlot}`
  ]: Key extends `${infer Name extends TideRole}-${infer Slot extends BackgroundSlot}`
    ? RoleSlotColor<Name, Slot>
    : never;
};
type RoleTextTokens = {
  readonly [Name in OwnRole<"text">]: RoleSlotColor<Name, "text">;
} & {
  readonly [Name in OwnRole<"on-subtle"> as `${Name}-on-subtle`]: RoleSlotColor<Name, "on-subtle">;
};
type RoleBorderTokens = {
  readonly [Name in OwnRole<"border">]: RoleSlotColor<Name, "border">;
} & {
  readonly [Name in OwnRole<"subtle-border"> as `${Name}-subtle`]: RoleSlotColor<
    Name,
    "subtle-border"
  >;
};

const roles = Object.keys(roleFamily) as TideRole[];
const backgroundSlots = colorSlots.filter(
  (slot): slot is BackgroundSlot =>
    slot !== "text" &&
    slot !== "border" &&
    slot !== "subtle-border" &&
    slot !== "on-solid" &&
    slot !== "on-subtle",
);
/** 그 슬롯을 공통 Token과 나눠 쓰지 않는 Role */
function ownRoles(slot: ColorSlot): TideRole[] {
  const shared = roleSharedSlots as { [Name in TideRole]?: Partial<Record<ColorSlot, string>> };

  return roles.filter((role) => !Object.hasOwn(shared[role] ?? {}, slot));
}

/** Role 슬롯이 가리키는 값. 계열 규칙 → 계열 덮어쓸 값 → Role 덮어쓸 값 순서로 얹는다. */
function roleSlotColor(role: TideRole, slot: ColorSlot): ThemedColor {
  const family = roleFamily[role];
  const steps = resolveSlotSteps(
    (familyOverrides as { [Family in ColorFamily]?: SlotOverrides })[family],
    (roleOverrides as { [Name in TideRole]?: SlotOverrides })[role],
  )[slot];

  return {
    light: slotColorValue(family, steps.light),
    dark: slotColorValue(family, steps.dark),
  };
}

// 키는 Utility class에서 접두사를 뺀 이름이고, 공개 계약은 `--tide-<Utility class 이름>`이다(ADR 0003).
// Token을 더하면 contrast.ts에 대비 쌍이나 제외 사유를 함께 등록한다. 빠지면 테스트가 실패한다.
const commonBackground = {
  // surface는 canvas와 같은 색이고 border로 구분한다. dark raised는 밝기로 높이를 나타낸다.
  canvas: { light: "white", dark: "gray-950" },
  surface: { light: "white", dark: "gray-950" },
  raised: { light: "white", dark: "gray-900" },
  disabled: { light: "gray-100", dark: "gray-900" },
  overlay: {
    light: { primitive: "gray-950", alpha: 0.5 },
    dark: { primitive: "gray-950", alpha: 0.7 },
  },
  // 색 없는 바탕을 덮는 무채색 호버·클릭. 놓인 표면 위에 합성된다(ADR 0022).
  hover: {
    light: { primitive: "gray-950", alpha: 0.04 },
    dark: { primitive: "white", alpha: 0.06 },
  },
  active: {
    light: { primitive: "gray-950", alpha: 0.08 },
    dark: { primitive: "white", alpha: 0.1 },
  },
} as const;

const commonText = {
  default: { light: "gray-900", dark: "gray-50" },
  // light gray-600은 흰 표면 위 4.34:1로 4.5:1에 못 미쳐 gray-700을 쓴다(ADR 0022).
  muted: { light: "gray-700", dark: "gray-300" },
  disabled: { light: "gray-400", dark: "gray-600" },
  // solid 배경 위 글자. 모든 Role이 같이 쓴다.
  "on-solid": { light: "white", dark: "white" },
} as const;

const commonBorder = {
  // 구분선(장식용). 대비 검사에서 제외한다.
  default: { light: "gray-200", dark: "gray-800" },
  // 입력창 등 UI 식별용 경계. 3:1
  strong: { light: "gray-500", dark: "gray-400" },
  // light 투명 border는 forced-colors에서 경계로 그려지고, dark는 그림자가 약해 border가 경계를 맡는다.
  // 장식용이라 대비 검사에서 제외한다.
  raised: { light: "transparent", dark: "gray-800" },
} as const;

const commonOutline = {
  // primary 포커스 테두리와 같은 값. focus-ring·focus-field는 이 Token 대신 accent 슬롯을 쓴다(ADR 0032).
  focus: { light: "blue-600", dark: "blue-400" },
} as const;

export const semantic: {
  readonly background: typeof commonBackground & RoleBackgroundTokens;
  readonly text: typeof commonText & RoleTextTokens;
  readonly border: typeof commonBorder & RoleBorderTokens;
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
    ...Object.fromEntries(ownRoles("text").map((role) => [role, roleSlotColor(role, "text")])),
    ...Object.fromEntries(
      ownRoles("on-subtle").map((role) => [`${role}-on-subtle`, roleSlotColor(role, "on-subtle")]),
    ),
  } as typeof commonText & RoleTextTokens,
  border: {
    ...commonBorder,
    ...Object.fromEntries(ownRoles("border").map((role) => [role, roleSlotColor(role, "border")])),
    ...Object.fromEntries(
      ownRoles("subtle-border").map((role) => [
        `${role}-subtle`,
        roleSlotColor(role, "subtle-border"),
      ]),
    ),
  } as typeof commonBorder & RoleBorderTokens,
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
/**
 * Theme별 shadow 색. CSS에서는 `--tide-shadow-color`로 쓴다.
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export const shadowColor = {
  light: { primitive: "gray-950", alpha: 0.08 },
  dark: { primitive: "black", alpha: 0.3 },
} as const;

shadowColor satisfies ThemedColor;

/**
 * 모든 Semantic Token(namespace, Utility class 이름, Theme별 값).
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
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
 * 값을 hex로 바꾼다. alpha가 있으면 `#rrggbbaa`, `transparent`는 `#00000000`, `MixedColor`는 계산한 `#rrggbb`다.
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export function colorValueHex(value: SemanticColorValue): string {
  if (value === "transparent") return "#00000000";
  if (typeof value === "string") return primitiveHex(value);
  if ("base" in value)
    return mixHex(primitiveHex(value.base), primitiveHex(value.mix), value.amount);
  const alpha = Math.round(value.alpha * 255)
    .toString(16)
    .padStart(2, "0");

  return `${primitiveHex(value.primitive)}${alpha}`;
}

/**
 * Semantic Token이 Theme에서 가리키는 hex.
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export function semanticHex(name: SemanticColorName, theme: ThemeName): string {
  const entry = semanticEntries().find((candidate) => candidate.className === name);
  if (!entry) throw new Error(`Semantic Token이 아니다: ${name}`);

  return colorValueHex(entry.value[theme]);
}
