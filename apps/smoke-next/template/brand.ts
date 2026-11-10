// 앱 브랜드 색 계열. smoke가 `tide-color build brand.ts`로 app/brand.css를 만든다(브랜드 색 더하기 문서와 같은 구조).
import { defineColorFamily } from "@tide-tds/foundation/color-family";

export default defineColorFamily({
  name: "brand",
  scale: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
    950: "#2e1065",
  },
});
