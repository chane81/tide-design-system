import type { Role, SemanticColorName } from "./semantic.ts";

/** 함께 쓰이는 글자(또는 경계)와 배경의 짝. Utility class 이름으로 적는다. */
export interface ContrastPair {
  readonly foreground: SemanticColorName;
  readonly background: SemanticColorName;
  /** 텍스트는 4.5, UI 경계와 포커스는 3 */
  readonly minRatio: 4.5 | 3;
}

/** 대비 검사에서 빼는 Semantic Token과 그 이유 */
export interface ContrastExclusion {
  readonly token: SemanticColorName;
  readonly reason: string;
}

// 대비 쌍 규칙은 tide-v0 티켓 09(컬러 Foundation 결정)의 「대비 검증 규칙」을 따른다.
// 모든 text × 모든 bg 조합이 아니라 실제로 함께 쓰는 쌍만 적는다. light와 dark에서 모두 검사한다.
// surface는 canvas와 같은 색이지만 이름이 다른 Token이므로 따로 등록한다.
const surfaces = ["bg-canvas", "bg-surface", "bg-raised"] as const;
const roles = ["primary", "success", "warning", "danger", "info"] as const satisfies Role[];
const allRoles = ["neutral", ...roles] as const satisfies Role[];
const subtleStates = ["subtle", "subtle-hover", "subtle-active"] as const;
const solidStates = ["solid", "solid-hover", "solid-active"] as const;

function pairs(
  foregrounds: readonly SemanticColorName[],
  backgrounds: readonly SemanticColorName[],
  minRatio: 4.5 | 3,
): ContrastPair[] {
  return foregrounds.flatMap((foreground) =>
    backgrounds.map((background) => ({ foreground, background, minRatio })),
  );
}

export const contrastPairs: readonly ContrastPair[] = [
  // 기본 글자 × 표면 층
  ...pairs(["text-default", "text-muted"], surfaces, 4.5),
  // neutral subtle 위 글자는 text-default다(neutral은 역할 text가 없다).
  ...pairs(
    ["text-default"],
    subtleStates.map((state) => `bg-neutral-${state}` as const),
    4.5,
  ),
  // 역할 글자 × 표면 층, 같은 역할 subtle 3단계
  ...roles.flatMap((role) =>
    pairs(
      [`text-${role}`],
      [...surfaces, ...subtleStates.map((state) => `bg-${role}-${state}` as const)],
      4.5,
    ),
  ),
  // solid 위 글자 × 모든 역할 solid 3단계
  ...pairs(
    ["text-on-solid"],
    allRoles.flatMap((role) => solidStates.map((state) => `bg-${role}-${state}` as const)),
    4.5,
  ),
  // UI 경계와 포커스 표시 × 표면 층(WCAG 1.4.11)
  ...pairs(
    ["border-strong", ...roles.map((role) => `border-${role}` as const), "outline-focus"],
    surfaces,
    3,
  ),
];

/**
 * 대비 검사에서 뺀 Semantic Token과 이유.
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
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
];

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
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
