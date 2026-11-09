// Primitive 색. 정본은 hex다(tide-v0 티켓 08·09).
// 02에서는 관통 확인용으로 blue만 둔다. 나머지 계열은 컬러 Foundation(04)에서 채운다.
export const color = {
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
} as const;

/** Primitive 이름. 예: `blue-600` */
export type PrimitiveColorName = {
  [Family in keyof typeof color]: `${Family}-${keyof (typeof color)[Family] & number}`;
}[keyof typeof color];
