// 정본은 hex다. 손으로 조정해도 되고 대비 쌍 검사가 다시 보장한다(값의 근거는 ADR 0022).
// blue-500은 Tide의 앵커 `#148cfc`다.
export const color = {
  white: "#ffffff",
  black: "#000000",
  blue: {
    50: "#ecf5ff",
    100: "#e1eeff",
    200: "#bfd8f7",
    300: "#97c2f4",
    400: "#53a3fe",
    500: "#148cfc",
    600: "#1e7bd8",
    700: "#0060b3",
    800: "#004e94",
    900: "#00427f",
    950: "#003568",
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
 * @internal `@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용).
 */
export function primitiveHex(name: PrimitiveColorName): string {
  if (name === "white" || name === "black") return color[name];
  const index = name.lastIndexOf("-");
  const family = name.slice(0, index) as ColorFamily;
  const step = Number(name.slice(index + 1)) as ColorStep;

  return color[family][step];
}
