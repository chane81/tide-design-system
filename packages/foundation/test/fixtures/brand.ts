// tide-color CLI 테스트용 앱 브랜드 계열. 앱과 같은 방식으로 패키지 이름(self-reference)으로 import한다.
import { defineColorFamily } from "@tide-tds/foundation/color-family";

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
