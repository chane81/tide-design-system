import { primitiveHex, type ColorFamily, type PrimitiveColorName } from "./color.ts";

/** Theme 이름 */
export type ThemeName = "light" | "dark";

/** Primitive에 투명도를 더한 색. overlay와 shadow 색에만 쓰고, CSS에는 8자리 hex로 나간다. */
export interface AlphaColor {
  readonly primitive: PrimitiveColorName;
  /** 0~1 */
  readonly alpha: number;
}

/** Semantic Token 하나가 가리키는 값 */
export type SemanticColorValue = PrimitiveColorName | AlphaColor;

/** Theme별로 가리키는 값 */
export interface ThemedColor {
  readonly light: SemanticColorValue;
  readonly dark: SemanticColorValue;
}

/** Role. Component에서는 `color` prop으로 고른다. */
export type Role = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

/** Role이 참조하는 Primitive 계열 */
export const roleFamily = {
  neutral: "gray",
  primary: "blue",
  success: "green",
  warning: "amber",
  danger: "red",
  info: "cyan",
} as const;

roleFamily satisfies Record<Role, ColorFamily>;

// Semantic 색. Tailwind 속성별 namespace로 노출한다(ADR 0003).
// 키는 Utility class에서 접두사(bg-, text- 등)를 뺀 이름이다. 공개 계약은 `--tide-<Utility class 이름>`이다.
// 매핑은 tide-v0 티켓 09(컬러 Foundation 결정)와 spec 「`@tide-tds/foundation`」 매핑을 따른다.
// - solid / hover / active: 두 Theme 모두 600 / 700 / 800(흰 글자 대비를 지키려고 dark도 진해지는 방향)
// - subtle / hover / active: light 50 / 100 / 200, dark 950 / 900 / 800. dark neutral만 900 / 800 / 700(950은 canvas와 같은 색)
// - 역할 text: light 800, dark 200. 역할 border: light 600, dark 400. neutral은 text·border를 두지 않는다(default·strong을 쓴다).
// Token을 더하면 contrast.ts에 대비 쌍이나 제외 사유를 함께 등록한다. 등록하지 않으면 테스트가 실패한다.
export const semantic = {
  background: {
    // 표면 층. surface는 canvas와 같은 색이고 border로 구분한다. dark raised는 밝기로 높이를 나타낸다.
    canvas: { light: "white", dark: "gray-950" },
    surface: { light: "white", dark: "gray-950" },
    raised: { light: "white", dark: "gray-900" },
    disabled: { light: "gray-100", dark: "gray-900" },
    overlay: {
      light: { primitive: "gray-950", alpha: 0.5 },
      dark: { primitive: "gray-950", alpha: 0.7 },
    },

    "neutral-solid": { light: "gray-600", dark: "gray-600" },
    "neutral-solid-hover": { light: "gray-700", dark: "gray-700" },
    "neutral-solid-active": { light: "gray-800", dark: "gray-800" },
    "neutral-subtle": { light: "gray-50", dark: "gray-900" },
    "neutral-subtle-hover": { light: "gray-100", dark: "gray-800" },
    "neutral-subtle-active": { light: "gray-200", dark: "gray-700" },

    "primary-solid": { light: "blue-600", dark: "blue-600" },
    "primary-solid-hover": { light: "blue-700", dark: "blue-700" },
    "primary-solid-active": { light: "blue-800", dark: "blue-800" },
    "primary-subtle": { light: "blue-50", dark: "blue-950" },
    "primary-subtle-hover": { light: "blue-100", dark: "blue-900" },
    "primary-subtle-active": { light: "blue-200", dark: "blue-800" },

    "success-solid": { light: "green-600", dark: "green-600" },
    "success-solid-hover": { light: "green-700", dark: "green-700" },
    "success-solid-active": { light: "green-800", dark: "green-800" },
    "success-subtle": { light: "green-50", dark: "green-950" },
    "success-subtle-hover": { light: "green-100", dark: "green-900" },
    "success-subtle-active": { light: "green-200", dark: "green-800" },

    "warning-solid": { light: "amber-600", dark: "amber-600" },
    "warning-solid-hover": { light: "amber-700", dark: "amber-700" },
    "warning-solid-active": { light: "amber-800", dark: "amber-800" },
    "warning-subtle": { light: "amber-50", dark: "amber-950" },
    "warning-subtle-hover": { light: "amber-100", dark: "amber-900" },
    "warning-subtle-active": { light: "amber-200", dark: "amber-800" },

    "danger-solid": { light: "red-600", dark: "red-600" },
    "danger-solid-hover": { light: "red-700", dark: "red-700" },
    "danger-solid-active": { light: "red-800", dark: "red-800" },
    "danger-subtle": { light: "red-50", dark: "red-950" },
    "danger-subtle-hover": { light: "red-100", dark: "red-900" },
    "danger-subtle-active": { light: "red-200", dark: "red-800" },

    "info-solid": { light: "cyan-600", dark: "cyan-600" },
    "info-solid-hover": { light: "cyan-700", dark: "cyan-700" },
    "info-solid-active": { light: "cyan-800", dark: "cyan-800" },
    "info-subtle": { light: "cyan-50", dark: "cyan-950" },
    "info-subtle-hover": { light: "cyan-100", dark: "cyan-900" },
    "info-subtle-active": { light: "cyan-200", dark: "cyan-800" },
  },
  text: {
    default: { light: "gray-900", dark: "gray-50" },
    muted: { light: "gray-600", dark: "gray-300" },
    disabled: { light: "gray-400", dark: "gray-600" },
    // solid 배경 위 글자. 모든 Role이 같이 쓴다.
    "on-solid": { light: "white", dark: "white" },

    primary: { light: "blue-800", dark: "blue-200" },
    success: { light: "green-800", dark: "green-200" },
    warning: { light: "amber-800", dark: "amber-200" },
    danger: { light: "red-800", dark: "red-200" },
    info: { light: "cyan-800", dark: "cyan-200" },
  },
  border: {
    // 구분선(장식용). 대비 검사에서 제외한다.
    default: { light: "gray-200", dark: "gray-800" },
    // 입력창 등 UI 식별용 경계. 3:1
    strong: { light: "gray-500", dark: "gray-400" },

    primary: { light: "blue-600", dark: "blue-400" },
    success: { light: "green-600", dark: "green-400" },
    warning: { light: "amber-600", dark: "amber-400" },
    danger: { light: "red-600", dark: "red-400" },
    info: { light: "cyan-600", dark: "cyan-400" },
  },
  outline: {
    // 포커스 표시 색. 오류 상태에서도 바꾸지 않는다.
    focus: { light: "blue-600", dark: "blue-400" },
  },
} as const;

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
export const shadowColor = {
  light: { primitive: "gray-950", alpha: 0.08 },
  dark: { primitive: "black", alpha: 0.3 },
} as const;

shadowColor satisfies ThemedColor;

/** 모든 Semantic Token(namespace, Utility class 이름, Theme별 값) */
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

/** 값을 hex로 바꾼다. alpha가 있으면 8자리 hex(`#rrggbbaa`)다. */
export function colorValueHex(value: SemanticColorValue): string {
  if (typeof value === "string") return primitiveHex(value);
  const alpha = Math.round(value.alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${primitiveHex(value.primitive)}${alpha}`;
}

/** Semantic Token이 Theme에서 가리키는 hex */
export function semanticHex(name: SemanticColorName, theme: ThemeName): string {
  const entry = semanticEntries().find((candidate) => candidate.className === name);
  if (!entry) throw new Error(`Semantic Token이 아니다: ${name}`);
  return colorValueHex(entry.value[theme]);
}
