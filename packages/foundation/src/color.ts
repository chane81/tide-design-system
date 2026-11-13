// Primitive 색. 정본은 hex다(tide-v0 티켓 08·09, spec 「`@tide-design/foundation`」 컬러).
// 초안은 OKLCH L 계단(티켓 08의 A)으로 만들었고, 손으로 조정해도 된다. 조정하면 대비 쌍 검사가 다시 보장한다.
// 지금 값은 ADR 0022(docs/decisions/0022-pastel-intensity-and-overlay-states.md)를 따른다. 50~300·950은 계열마다 손으로
// 맞춘 값이고(파스텔 바탕·테두리·글자), solid 쪽(600~900)은 채도 상한을 둔 값이다. amber의 연한 단계(50~400)는 노랑 쪽이다.
// 600(solid 바탕)은 tide-v0-impl 티켓 47에서 덜 진하게 바꿨다. 이전 600에서 OKLCH L +0.03, 채도 ×0.85(상한 0.12), 색상 유지.
// 흰 글자 대비는 4.18~4.62로 solid 위 글자 하한 4:1(ADR 0023)을 넘는다.
// 계열 이름은 용도가 아니라 색상으로 짓는다. 어느 Role이 어느 계열을 쓰는지는 semantic.ts의 roleFamily에 있다.
// purple·mint는 Role이 없는 장식 계열이다(ADR 0022 §5). 장식·분류 Component(Badge, Tag, Avatar)만 쓴다.
// 계열을 더하면 계열 변수 묶음, `[data-color]` 규칙, 대비 쌍, 색 계열 이름 타입(ColorFamilyRegistry)이 함께 따라온다(티켓 40, 41).
// blue-500은 Tide의 앵커 `#3183f5`이고 바꾸지 않는다.
export const color = {
  white: "#ffffff",
  black: "#000000",
  blue: {
    50: "#eff4fc",
    100: "#e3eefd",
    200: "#c9d7eb",
    300: "#a7c0e3",
    400: "#65a1f9",
    500: "#3183f5",
    600: "#4e7aba",
    700: "#2b5fa8",
    800: "#184c93",
    900: "#114080",
    950: "#113465",
  },
  gray: {
    50: "#f5f5f6",
    100: "#e8e8ea",
    200: "#d7d8da",
    300: "#bec1c4",
    400: "#9da1a6",
    500: "#82878e",
    600: "#747a81",
    700: "#5b6068",
    800: "#4a4e54",
    900: "#3f4247",
    950: "#28292c",
  },
  green: {
    50: "#ecf7ee",
    100: "#dbf5df",
    200: "#c2dfc7",
    300: "#9ecba6",
    400: "#60b775",
    500: "#15a14c",
    600: "#428a55",
    700: "#0b7335",
    800: "#055f2a",
    900: "#045123",
    950: "#02471e",
  },
  amber: {
    50: "#f8f4e5",
    100: "#f7edc8",
    200: "#e2d6a9",
    300: "#d6bb79",
    400: "#ca9734",
    500: "#b47900",
    600: "#9b702f",
    700: "#815600",
    800: "#6a4600",
    900: "#5b3b00",
    950: "#543601",
  },
  red: {
    50: "#fcf1ef",
    100: "#ffe6e3",
    200: "#efcdc8",
    300: "#e5aea7",
    400: "#f47368",
    500: "#ea3e39",
    600: "#b55a51",
    700: "#a82d29",
    800: "#921315",
    900: "#7c1212",
    950: "#671513",
  },
  cyan: {
    50: "#edf5f9",
    100: "#ddf1f9",
    200: "#c1dbe6",
    300: "#97c6da",
    400: "#51aed0",
    500: "#0094bc",
    600: "#3484a1",
    700: "#006a87",
    800: "#00576f",
    900: "#004a5f",
    950: "#1c4351",
  },
  purple: {
    50: "#f5f2fc",
    100: "#f0e9ff",
    200: "#d9d0ed",
    300: "#c4b5e4",
    400: "#ad8de5",
    500: "#956ed3",
    600: "#8469b0",
    700: "#6b4e99",
    800: "#583e81",
    900: "#4b336f",
    950: "#412963",
  },
  mint: {
    50: "#ebf6f5",
    100: "#d7f4f1",
    200: "#b9dfdb",
    300: "#91cbc6",
    400: "#54b3ad",
    500: "#219a94",
    600: "#3a8883",
    700: "#116e6a",
    800: "#0b5a57",
    900: "#0e4c49",
    950: "#11403e",
  },
} as const;

type ColorTable = typeof color;

/** 11단계 스케일을 가진 계열 이름. 예: `blue` */
export type ColorFamily = {
  [Key in keyof ColorTable]: ColorTable[Key] extends string ? never : Key;
}[keyof ColorTable];

/** 스케일 단계. 50~950의 11단계 */
export type ColorStep = keyof ColorTable["blue"];

/** Primitive 이름. 예: `blue-600`, `white` */
export type PrimitiveColorName =
  | { [Key in keyof ColorTable]: ColorTable[Key] extends string ? Key : never }[keyof ColorTable]
  | { [Family in ColorFamily]: `${Family}-${ColorStep}` }[ColorFamily];

/**
 * Primitive 이름을 정본 hex로 바꾼다.
 * @internal `@tide-design/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function primitiveHex(name: PrimitiveColorName): string {
  if (name === "white" || name === "black") return color[name];
  const index = name.lastIndexOf("-");
  const family = name.slice(0, index) as ColorFamily;
  const step = Number(name.slice(index + 1)) as ColorStep;
  return color[family][step];
}
