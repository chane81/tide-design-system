// Primitive 색. 정본은 hex다(tide-v0 티켓 08·09, spec 「`@tide-tds/foundation`」 컬러).
// 초안은 OKLCH L 계단(티켓 08의 A)으로 만들었고, 손으로 조정해도 된다. 조정하면 대비 쌍 검사가 다시 보장한다.
// 계열 이름은 용도가 아니라 색상으로 짓는다. 어느 Role이 어느 계열을 쓰는지는 semantic.ts의 roleFamily에 있다.
// blue-500은 Tide의 앵커 `#3183f5`이고 바꾸지 않는다.
export const color = {
  white: "#ffffff",
  black: "#000000",
  blue: {
    50: "#f0f6fe",
    100: "#ddeafc",
    200: "#c3dafb",
    300: "#9bc3fd",
    400: "#65a1f9",
    500: "#3183f5",
    600: "#006ae2",
    700: "#005ac2",
    800: "#0049a1",
    900: "#093f85",
    950: "#0d2850",
  },
  gray: {
    50: "#f5f5f6",
    100: "#e8e8ea",
    200: "#d7d8da",
    300: "#bec1c4",
    400: "#9da1a6",
    500: "#82878e",
    600: "#6b7179",
    700: "#5b6068",
    800: "#4a4e54",
    900: "#3f4247",
    950: "#28292c",
  },
  green: {
    50: "#f0f7f1",
    100: "#deeee0",
    200: "#c4e1c9",
    300: "#9bd0a5",
    400: "#60b775",
    500: "#15a14c",
    600: "#00873d",
    700: "#007433",
    800: "#005f28",
    900: "#005121",
    950: "#073315",
  },
  amber: {
    50: "#faf4ed",
    100: "#f3e7d7",
    200: "#ead5b8",
    300: "#e0ba85",
    400: "#ce9437",
    500: "#b47900",
    600: "#976500",
    700: "#815600",
    800: "#6a4600",
    900: "#5b3b00",
    950: "#3a2400",
  },
  red: {
    50: "#fff2f0",
    100: "#fde1dd",
    200: "#fccac4",
    300: "#fca79d",
    400: "#f47368",
    500: "#ea3e39",
    600: "#d30016",
    700: "#b60011",
    800: "#96000c",
    900: "#7d0e10",
    950: "#4c120f",
  },
  cyan: {
    50: "#eff7fa",
    100: "#dcecf2",
    200: "#c0deea",
    300: "#93cae0",
    400: "#51aed0",
    500: "#0094bc",
    600: "#007c9e",
    700: "#006a87",
    800: "#00576f",
    900: "#004a5f",
    950: "#002f3d",
  },
} as const;

type Color = typeof color;

/** 11단계 스케일을 가진 계열 이름. 예: `blue` */
export type ColorFamily = {
  [Key in keyof Color]: Color[Key] extends string ? never : Key;
}[keyof Color];

/** 스케일 단계. 50~950의 11단계 */
export type ColorStep = keyof Color["blue"];

/** Primitive 이름. 예: `blue-600`, `white` */
export type PrimitiveColorName =
  | { [Key in keyof Color]: Color[Key] extends string ? Key : never }[keyof Color]
  | { [Family in ColorFamily]: `${Family}-${ColorStep}` }[ColorFamily];

/**
 * Primitive 이름을 정본 hex로 바꾼다.
 * @internal `@tide-tds/foundation/internal` 전용. 앱 개발자용 공개 계약이 아니다(문서 앱·빌드 스크립트·테스트용).
 */
export function primitiveHex(name: PrimitiveColorName): string {
  if (name === "white" || name === "black") return color[name];
  const index = name.lastIndexOf("-");
  const family = name.slice(0, index) as ColorFamily;
  const step = Number(name.slice(index + 1)) as ColorStep;
  return color[family][step];
}
