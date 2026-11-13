// 앱 브랜드 색 계열. smoke가 `tide-color build brand.ts`로 app/brand.css를 만든다(브랜드 색 더하기 문서와 같은 구조).
import { defineColorFamily } from "@tide-design/foundation/color-family";

export default defineColorFamily({
  name: "brand",
  scale: {
    50: "#fcf0f5",
    100: "#fee5f0",
    200: "#ebcbd9",
    300: "#e1adc4",
    400: "#dc7dac",
    500: "#c75b93",
    600: "#a85c81",
    700: "#90406a",
    800: "#793157",
    900: "#68274a",
    950: "#5c1d3f",
  },
});
