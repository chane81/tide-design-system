// 기본 규칙으로는 대비가 모자라도록 명도를 Tide 권장 범위보다 밝게 둔 계열이다.
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
