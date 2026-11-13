// tide-color CLI 테스트용: 밝은 계열을 overrides로 고쳐 대비를 맞춘다. 배열로 계열 둘을 한 파일에 둔다.
import { defineColorFamily } from "@tide-tds/foundation/color-family";

import brand from "./brand.ts";
import { yellowScale } from "./yellow.ts";

export default [
  brand,
  defineColorFamily({
    name: "yellow",
    scale: yellowScale,
    // solid는 밝은 단계(400/500/600)에 진한 글자(950)를 얹고, light 경계는 한 단계 진하게 덮어쓴다.
    // light text는 한 단계 진하게(800) 덮어쓴다. 처음엔 무채색 클릭 바탕(bg-active) 위 4.5:1을 맞추려던 것이다.
    // 일시 상태 하한이 4:1이 된 뒤(ADR 0023)와 픽스처 값을 바꾼 뒤(티켓 49)에는 700도 통과하지만, text 덮어쓰기 경로를 남기려고 그대로 둔다.
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
