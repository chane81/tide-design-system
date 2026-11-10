// 타이포그래피 Token(tide-v0 티켓 11, spec 「`@tide-tds/foundation`」 타이포그래피).
// - font-family는 sans와 mono 두 개다. 웹폰트와 @font-face는 넣지 않는다(웹폰트는 앱이 로드한다).
// - 크기와 행간은 rem이다. 루트 font-size를 바꾸지 않으므로 브라우저 글자 크기를 키우면 함께 커진다(WCAG 1.4.4).
// - 자간은 모든 스타일이 0이라서 letter-spacing 하위 변수를 두지 않는다.

/**
 * font-family 스택. 공개 계약은 `--tide-font-<이름>`이고 `font-<이름>` class와 기본 글꼴이 쓴다.
 * - sans: Pretendard README의 「어디서든 동일한 환경」 스택. 가변판 이름(`Pretendard Variable`)을 맨 앞에 둔다.
 * - mono: 시스템 고정폭 글꼴만 쓴다(tailwindcss 4.3.5 기본 `--font-mono`와 같은 순서).
 */
export const fontFamily = {
  sans: [
    "Pretendard Variable",
    "Pretendard",
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "Roboto",
    "Helvetica Neue",
    "Segoe UI",
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    "Malgun Gothic",
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "sans-serif",
  ],
  mono: [
    "ui-monospace",
    "SFMono-Regular",
    "Menlo",
    "Monaco",
    "Consolas",
    "Liberation Mono",
    "Courier New",
    "monospace",
  ],
} as const;

/** font-family Token 이름 */
export type FontFamilyName = keyof typeof fontFamily;

/**
 * Primitive 크기. 키는 px, 값은 rem이다. class로 노출하지 않고 공개 계약 `--tide-font-size-<px>`만 둔다.
 * 텍스트 스타일이 이 값을 참조한다.
 */
export const fontSize = {
  12: "0.75rem",
  14: "0.875rem",
  16: "1rem",
  18: "1.125rem",
  20: "1.25rem",
  24: "1.5rem",
  32: "2rem",
  40: "2.5rem",
  48: "3rem",
  56: "3.5rem",
} as const;

/** Primitive 크기 단계(px) */
export type FontSizeStep = keyof typeof fontSize;

/** 굵기 Token. Tailwind 기본 굵기는 지우고 이 다섯 개만 `font-<이름>` class로 둔다. */
export const fontWeight = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** 굵기 Token 이름 */
export type FontWeightName = keyof typeof fontWeight;

/** 텍스트 스타일 하나의 값 */
export interface TextStyleValue {
  /** Primitive 크기 단계(px) */
  readonly fontSize: FontSizeStep;
  /** 행간(rem). 4px 격자를 따른다. */
  readonly lineHeight: string;
  /** 굵기 Token 이름. 텍스트 스타일은 light를 쓰지 않는다. */
  readonly fontWeight: Exclude<FontWeightName, "light">;
}

/**
 * 텍스트 스타일 14개. `text-<이름>` class 하나가 크기, 행간, 굵기를 함께 정한다.
 * 공개 계약은 `--tide-text-<이름>`과 그 `--line-height`, `--font-weight` 하위 변수다.
 * 값은 spec 표를 그대로 옮겼다(크기/행간 px → rem).
 */
export const textStyle = {
  "display-lg": { fontSize: 56, lineHeight: "4rem", fontWeight: "bold" },
  "display-md": { fontSize: 48, lineHeight: "3.5rem", fontWeight: "bold" },
  "heading-xl": { fontSize: 40, lineHeight: "3rem", fontWeight: "bold" },
  "heading-lg": { fontSize: 32, lineHeight: "2.5rem", fontWeight: "bold" },
  "heading-md": { fontSize: 24, lineHeight: "2rem", fontWeight: "bold" },
  "heading-sm": { fontSize: 20, lineHeight: "1.75rem", fontWeight: "semibold" },
  "heading-xs": { fontSize: 18, lineHeight: "1.75rem", fontWeight: "semibold" },
  "body-lg": { fontSize: 18, lineHeight: "1.75rem", fontWeight: "normal" },
  "body-md": { fontSize: 16, lineHeight: "1.5rem", fontWeight: "normal" },
  "body-sm": { fontSize: 14, lineHeight: "1.25rem", fontWeight: "normal" },
  "label-lg": { fontSize: 16, lineHeight: "1.25rem", fontWeight: "medium" },
  "label-md": { fontSize: 14, lineHeight: "1.25rem", fontWeight: "medium" },
  "label-sm": { fontSize: 12, lineHeight: "1rem", fontWeight: "medium" },
  caption: { fontSize: 12, lineHeight: "1rem", fontWeight: "normal" },
} as const;

// isolatedDeclarations(oxc d.ts)가 `as const satisfies`를 추론하지 못해서 검사는 따로 둔다(semantic.ts의 roleFamily와 같다).
textStyle satisfies Record<string, TextStyleValue>;

/** 텍스트 스타일 이름. Typography의 `variant` 값이다. */
export type TextStyleName = keyof typeof textStyle;

/**
 * font-family 스택을 CSS 값으로 만든다. 영문과 하이픈만으로 된 이름은 그대로 두고, 나머지(공백이 있는 이름)는 따옴표로 감싼다.
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function fontFamilyCss(name: FontFamilyName): string {
  return fontFamily[name]
    .map((family) => (/^[-a-zA-Z]+$/.test(family) ? family : `"${family}"`))
    .join(", ");
}
