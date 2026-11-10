// tide-color CLI 테스트용 밝은 계열. 기본 규칙(흰 글자 on-solid, border 600)으로는 대비가 모자란다.
import { defineColorFamily } from "@tide-tds/foundation/color-family";

export const yellowScale = {
  50: "#fefce8",
  100: "#fef9c3",
  200: "#fef08a",
  300: "#fde047",
  400: "#facc15",
  500: "#eab308",
  600: "#ca8a04",
  700: "#a16207",
  800: "#854d0e",
  900: "#713f12",
  950: "#422006",
} as const;

export default defineColorFamily({ name: "yellow", scale: yellowScale });
