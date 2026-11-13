import { mixHex, type ColorSlot } from "./colorSlot.ts";
import { semanticHex, type SemanticColorName, type ThemeName, type TideRole } from "./semantic.ts";

/**
 * 대비 하한 세 등급(ADR 0023).
 * - `4.5`: 정지 상태의 글자(표면 층·subtle·faint 위 글자, 선택 유지 바탕 위 글자)
 * - `4`: hover·누름 같은 일시 상태의 글자, solid 위 글자(on-solid)
 * - `3`: 글자가 아닌 UI 요소(경계, 포커스 표시, Switch thumb)
 */
export type ContrastMinRatio = 4.5 | 4 | 3;

/** 함께 쓰이는 글자(또는 경계)와 배경의 짝. Utility class 이름으로 적는다. */
export interface ContrastPair {
  readonly foreground: SemanticColorName;
  readonly background: SemanticColorName;
  /** 정지 상태 글자는 4.5, 일시 상태 글자와 solid 위 글자는 4, UI 경계·포커스·thumb은 3(ADR 0023) */
  readonly minRatio: ContrastMinRatio;
  /** 배경이 반투명(`bg-hover`·`bg-active`)이면 그 아래 표면. 배경을 이 표면 위에 합성한 값으로 검사한다. */
  readonly surface?: SemanticColorName;
}

/** 대비 검사에서 빼는 Semantic Token과 그 이유 */
export interface ContrastExclusion {
  readonly token: SemanticColorName;
  readonly reason: string;
}

// 대비 쌍 규칙은 tide-v0 티켓 09(컬러 Foundation 결정)의 「대비 검증 규칙」을 따르고, 하한은 ADR 0023의 세 등급이다.
// - 4.5: 정지 상태 글자. 표면 층·subtle·faint 위 글자, 선택 유지 바탕(neutral subtle-active) 위 글자.
// - 4: 일시 상태 글자(hover·누름 배경 subtle-hover·subtle-active, bg-hover·bg-active 합성)와 solid 위 글자(on-solid).
// - 3: 글자가 아닌 UI 요소(경계, 포커스 표시, Switch thumb).
// 모든 text × 모든 bg 조합이 아니라 실제로 함께 쓰는 쌍만 적는다. light와 dark에서 모두 검사한다.
// 같은 짝을 두 번 적지 않는다. 한 짝을 여러 쓰임이 쓰면 가장 엄한 등급으로 한 번 적는다.
// surface는 canvas와 같은 색이지만 이름이 다른 Token이므로 따로 등록한다.
const surfaces = ["bg-canvas", "bg-surface", "bg-raised"] as const;
const roles = ["primary", "success", "warning", "danger", "info"] as const satisfies TideRole[];
const allRoles = ["neutral", ...roles] as const satisfies TideRole[];
const solidStates = ["solid", "solid-hover", "solid-active"] as const;
// on-subtle이 놓이는 바탕(ADR 0022 §1). 정지 상태(faint·subtle)와 일시 상태(subtle-hover·subtle-active)로 나눈다.
const onSubtleRest = ["faint", "subtle"] as const;
const subtleTransient = ["subtle-hover", "subtle-active"] as const;
// 무채색 호버·클릭(ADR 0022 §3). 반투명이라 흰 표면(light canvas, dark canvas) 위에 합성한 값으로 검사한다.
// hover·누름에만 쓰는 배경이라 그 위 글자는 일시 상태 등급(4)이다.
const neutralStates = ["bg-hover", "bg-active"] as const;
const neutralStateSurface = "bg-canvas" as const;

function pairs(
  foregrounds: readonly SemanticColorName[],
  backgrounds: readonly SemanticColorName[],
  minRatio: ContrastMinRatio,
): ContrastPair[] {
  return foregrounds.flatMap((foreground) =>
    backgrounds.map((background) => ({ foreground, background, minRatio })),
  );
}

export const contrastPairs: readonly ContrastPair[] = [
  // 기본 글자 × 표면 층
  ...pairs(["text-default", "text-muted"], surfaces, 4.5),
  // neutral faint·subtle 위 글자는 text-default다(neutral의 on-subtle은 text-default를 공유한다).
  // subtle-active는 Button subtle 누름이기도 하지만 목록의 선택 유지 바탕(Select·Combobox 고른 옵션)이라 정지 상태 등급이다.
  ...pairs(
    ["text-default"],
    (["faint", "subtle", "subtle-active"] as const).map((state) => `bg-neutral-${state}` as const),
    4.5,
  ),
  // neutral subtle-hover는 Button subtle hover뿐이다(일시 상태).
  ...pairs(["text-default"], ["bg-neutral-subtle-hover"], 4),
  // 역할 글자(바탕 없이 쓰는 색 글자) × 표면 층, 같은 역할 subtle.
  // subtle 위 글자는 보통 on-subtle이지만(ADR 0022), Progress 막대 × 트랙, Menu·Select·Combobox highlight
  // (text-primary × bg-primary-subtle), Switch 꺼짐 hover thumb이 text × subtle을 쓴다.
  // Pagination 현재 페이지는 Button subtle이라 text-primary-on-subtle이다(아래 on-subtle 쌍).
  ...roles.flatMap((role) => pairs([`text-${role}`], [...surfaces, `bg-${role}-subtle`], 4.5)),
  // 파스텔 글자(on-subtle) × 같은 역할 faint·subtle(정지 상태)
  ...roles.flatMap((role) =>
    pairs(
      [`text-${role}-on-subtle`],
      onSubtleRest.map((state) => `bg-${role}-${state}` as const),
      4.5,
    ),
  ),
  // 파스텔 글자(on-subtle) × 같은 역할 subtle-hover·subtle-active(일시 상태). Button subtle, Pagination 현재 페이지,
  // Alert 닫기 버튼의 hover·누름이다.
  ...roles.flatMap((role) =>
    pairs(
      [`text-${role}-on-subtle`],
      subtleTransient.map((state) => `bg-${role}-${state}` as const),
      4,
    ),
  ),
  // 역할 글자 × 같은 역할 faint. Button·IconButton outline·ghost의 hover다(누름은 위의 text × subtle, ADR 0025).
  // hover라 일시 상태지만 subtle·faint 위 글자는 4.5로 맞춘다(실제 최저 5.43:1).
  ...roles.flatMap((role) => pairs([`text-${role}`], [`bg-${role}-faint`], 4.5)),
  // text-default × 무채색 호버·클릭(흰 표면 위에 합성). neutral Button outline·ghost, 목록 항목, Table 행,
  // Accordion 트리거의 hover·누름이다. Role 색 outline·ghost는 같은 색 subtle로 채운다(ADR 0025).
  ...neutralStates.map((background) => ({
    foreground: "text-default" as const,
    background,
    minRatio: 4 as const,
    surface: neutralStateSurface,
  })),
  // text-default × 무채색 호버·클릭(raised 표면 위에 합성). 목록 오버레이 항목(Menu·Select·Combobox)과
  // Toast 닫기·액션 버튼, Dialog 닫기 버튼(neutral)이다.
  ...neutralStates.map((background) => ({
    foreground: "text-default" as const,
    background,
    minRatio: 4 as const,
    surface: "bg-raised" as const,
  })),
  // solid 위 글자 × 모든 역할 solid 3단계. 버튼·배지의 label 글자(medium 굵기)라 4다(ADR 0023).
  ...pairs(
    ["text-on-solid"],
    allRoles.flatMap((role) => solidStates.map((state) => `bg-${role}-${state}` as const)),
    4,
  ),
  // UI 경계와 포커스 표시 × 표면 층(WCAG 1.4.11)
  ...pairs(
    ["border-strong", ...roles.map((role) => `border-${role}` as const), "outline-focus"],
    surfaces,
    3,
  ),
  // Alert 경계 × subtle(3:1) 쌍은 지웠다(ADR 0022 §1). Alert 테두리는 꾸밈인 subtle-border로 바뀌고,
  // 바탕과 글자만으로 알아볼 수 있어 경계 대비 의무가 없다.
  // 포커스 표시 × 역할 subtle. subtle 표면 안의 조작 요소(Alert 닫기 버튼)는 ring이 그 배경 위에 그려진다(티켓 20).
  ...pairs(
    ["outline-focus"],
    allRoles.map((role) => `bg-${role}-subtle` as const),
    3,
  ),
  // Switch 꺼짐 누름 thumb(text-accent) × 같은 역할 subtle-active. thumb은 글자가 아닌 UI 요소라 3이다(티켓 46).
  // neutral은 thumb이 text-default이고, text-default × bg-neutral-subtle-active는 위에서 4.5로 등록되어 있다.
  ...roles.flatMap((role) => pairs([`text-${role}`], [`bg-${role}-subtle-active`], 3)),
];

/**
 * 대비 검사에서 뺀 Semantic Token과 이유.
 * @internal `@tide-design/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export const contrastExclusions: readonly ContrastExclusion[] = [
  { token: "border-default", reason: "장식용 구분선이다. 경계 식별에 쓰지 않는다." },
  {
    token: "border-raised",
    reason:
      "raised 표면의 장식용 경계다(light 투명, dark gray-800). 표면 구분은 그림자와 배경 밝기가 맡고, 대비 의무가 없다.",
  },
  {
    token: "bg-disabled",
    reason: "비활성 상태는 WCAG 대비 요건 밖이다. Component가 속성과 cursor로도 표현한다.",
  },
  {
    token: "text-disabled",
    reason: "비활성 상태는 WCAG 대비 요건 밖이다. Component가 속성과 cursor로도 표현한다.",
  },
  { token: "bg-overlay", reason: "modal 뒤를 가리는 반투명 막이다. 위에 글자를 두지 않는다." },
  // 파스텔 테두리(ADR 0022 §1). 배지·Alert는 바탕과 글자만으로 알아볼 수 있어 테두리가 꾸밈이다(WCAG 1.4.11 대상 아님).
  ...allRoles.map((role) => ({
    token: `border-${role}-subtle` as const,
    reason:
      "파스텔 테두리(subtle-border)는 꾸밈이다. subtle 바탕과 on-subtle 글자만으로 알아볼 수 있어 경계 대비 의무가 없다.",
  })),
];

// 색 이름(Color) 하나의 대비 쌍 규칙(tide-v0-impl 티켓 40). Role 대비 쌍과 같은 규칙을 슬롯 이름으로 적는다.
// Tide 색 계열, 테스트 전용 계열, 앱 브랜드 계열(tide-color CLI)이 모두 이 규칙으로 light·dark를 검사한다.
// 하한은 ADR 0023의 세 등급이다.
// - text × 표면 층, 같은 색 subtle: 4.5
// - text × 무채색 호버·클릭(bg-hover·bg-active를 흰 표면에 합성): 4(일시 상태)
// - on-subtle × 같은 색 faint·subtle: 4.5
// - on-subtle × 같은 색 subtle-hover·subtle-active: 4(일시 상태)
// - on-solid × 같은 색 solid 3단계: 4(solid 위 글자)
// - border × 표면 층: 3
// - text × 같은 색 subtle-active: 3(Switch 꺼짐 누름 thumb, UI 요소)
// subtle-border는 꾸밈이라 검사하지 않는다(ADR 0022 §1).
/** 색 이름 하나에서 함께 쓰는 슬롯 짝. 배경은 같은 색의 슬롯이거나 표면 층·무채색 호버 Token이다. */
export interface ColorContrastRule {
  readonly foreground: ColorSlot;
  readonly background: ColorSlot | (typeof surfaces)[number] | (typeof neutralStates)[number];
  /** 정지 상태 글자는 4.5, 일시 상태 글자와 solid 위 글자는 4, UI 요소는 3(ADR 0023) */
  readonly minRatio: ContrastMinRatio;
  /** 배경이 반투명이면 그 아래 표면. 배경을 이 표면 위에 합성한 값으로 검사한다. */
  readonly surface?: (typeof surfaces)[number];
}

/**
 * 색 이름 하나의 대비 쌍 규칙.
 * @internal `@tide-design/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export const colorContrastRules: readonly ColorContrastRule[] = [
  ...[...surfaces, "subtle" as const].map((background) => ({
    foreground: "text" as const,
    background,
    minRatio: 4.5 as const,
  })),
  // outline·ghost hover(ADR 0025). 누름은 위의 text × subtle이다.
  { foreground: "text" as const, background: "faint" as const, minRatio: 4.5 as const },
  ...onSubtleRest.map((background) => ({
    foreground: "on-subtle" as const,
    background,
    minRatio: 4.5 as const,
  })),
  ...subtleTransient.map((background) => ({
    foreground: "on-subtle" as const,
    background,
    minRatio: 4 as const,
  })),
  ...solidStates.map((background) => ({
    foreground: "on-solid" as const,
    background,
    minRatio: 4 as const,
  })),
  ...surfaces.map((background) => ({
    foreground: "border" as const,
    background,
    minRatio: 3 as const,
  })),
  { foreground: "text" as const, background: "subtle-active" as const, minRatio: 3 as const },
];

/** 대비 쌍 규칙 하나를 Theme 하나에서 검사한 결과 */
export interface ColorContrastResult extends ColorContrastRule {
  readonly theme: ThemeName;
  readonly ratio: number;
  readonly pass: boolean;
}

/**
 * 색 이름 하나의 슬롯 hex로 대비 쌍 규칙을 light·dark에서 검사한다. 표면 층은 Tide Token 값을 쓴다.
 * @internal `@tide-design/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function checkColorContrast(
  slotHex: Readonly<Record<ThemeName, Readonly<Record<ColorSlot, string>>>>,
): ColorContrastResult[] {
  return (["light", "dark"] as const).flatMap((theme) =>
    colorContrastRules.map((rule) => {
      const background = rule.background.startsWith("bg-")
        ? opaqueSemanticHex(rule.background as SemanticColorName, theme, rule.surface)
        : slotHex[theme][rule.background as ColorSlot];
      const ratio = contrastRatio(slotHex[theme][rule.foreground], background);

      return { ...rule, theme, ratio, pass: ratio >= rule.minRatio };
    }),
  );
}

/**
 * Semantic Token의 불투명한 hex. 반투명 Token(8자리 hex)은 `surface` 위에 합성한다(브라우저가 그리는 값과 같다).
 * @internal `@tide-design/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function opaqueSemanticHex(
  name: SemanticColorName,
  theme: ThemeName,
  surface?: SemanticColorName,
): string {
  const hex = semanticHex(name, theme);
  if (hex.length === 7) return hex;
  if (!surface) throw new Error(`반투명 Token은 아래 표면이 있어야 검사할 수 있다: ${name}`);
  const alpha = Number.parseInt(hex.slice(7), 16) / 255;

  return mixHex(opaqueSemanticHex(surface, theme), hex.slice(0, 7), alpha);
}

/**
 * 대비 쌍 하나의 Theme별 대비비. 반투명 배경은 쌍의 표면(`surface`) 위에 합성한 값으로 계산한다.
 * @internal `@tide-design/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function contrastPairRatio(pair: ContrastPair, theme: ThemeName): number {
  return contrastRatio(
    opaqueSemanticHex(pair.foreground, theme),
    opaqueSemanticHex(pair.background, theme, pair.surface),
  );
}

/** WCAG 2.x 상대 휘도. `#rrggbb`만 받는다. */
function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) throw new Error(`불투명한 6자리 hex가 아니다: ${hex}`);
  const [r, g, b] = match.slice(1).map((channel) => {
    const value = Number.parseInt(channel, 16) / 255;

    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * 두 색의 WCAG 2.x 대비비(1~21). 순서는 상관없다.
 * 반투명 색(8자리 hex)은 받지 않는다. 대비 검사에서 overlay와 shadow는 제외한다.
 * @internal `@tide-design/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);

  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
