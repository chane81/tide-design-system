// 밝은 계열을 overrides로 고쳐 대비를 맞추고, 배열로 계열 둘을 한 파일에 둔다.
import { defineColorFamily } from "@tide-design/foundation/color-family";

import brand from "./brand.ts";
import { yellowScale } from "./yellow.ts";

export default [
  brand,
  defineColorFamily({
    name: "yellow",
    scale: yellowScale,
    // text는 700으로도 통과하지만 text 덮어쓰기 경로를 검사하려고 800으로 둔다.
    overrides: {
      solid: { light: 400, dark: 400 },
      "solid-hover": { light: 500, dark: 500 },
      "solid-active": { light: 600, dark: 600 },
      "on-solid": { light: 950, dark: 950 },
      border: { light: 700 },
      text: { light: 800 },
    },
  }),
];
