// tide-color CLI 테스트용 밝은 계열. 기본 규칙(흰 글자 on-solid, border 600)으로는 대비가 모자란다.
// 값은 Tide 방식(OKLCH 색상 100 고정, Tide 채도 곡선 × 최대 0.17, sRGB를 벗어나면 채도만 줄임)으로 만들었다.
// 밝은 계열을 흉내 내려고 명도를 Tide 권장 범위보다 밝게 두었다(600 L 0.70, 700 L 0.535).
import { defineColorFamily } from "@tide-design/foundation/color-family";

export const yellowScale = {
  50: "#fbfaf3",
  100: "#f7f4e3",
  200: "#efebcc",
  300: "#e7dea6",
  400: "#e1d176",
  500: "#d4bf3a",
  600: "#b49f03",
  700: "#7c6e03",
  800: "#685b00",
  900: "#574c01",
  950: "#383102",
} as const;

export default defineColorFamily({ name: "yellow", scale: yellowScale });
