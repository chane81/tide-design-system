// 스냅숏은 Role 값을 의도적으로 바꿀 때만 `vitest -u`로 갱신한다.
import { describe, expect, it } from "vitest";

import { contrastPairs, type ThemeName } from "../src/index";
import { contrastPairRatio, semanticEntries, semanticHex } from "../src/internal";

const themes: ThemeName[] = ["light", "dark"];

describe("Role 회귀", () => {
  it("모든 Semantic Token의 Theme별 hex가 바뀌지 않는다", () => {
    const resolved = Object.fromEntries(
      semanticEntries().map((entry) => [
        entry.className,
        themes.map((theme) => semanticHex(entry.className, theme)).join(" / "),
      ]),
    );
    expect(resolved).toMatchSnapshot();
  });

  it("대비 쌍 목록과 Theme별 대비비가 바뀌지 않는다", () => {
    const results = contrastPairs.map((pair) => {
      const ratios = themes.map((theme) => contrastPairRatio(pair, theme).toFixed(4));
      const surface = pair.surface ? ` (${pair.surface} 위)` : "";

      return `${pair.foreground} / ${pair.background}${surface} ≥ ${pair.minRatio}: ${ratios.join(" / ")}`;
    });
    expect(results).toMatchSnapshot();
  });
});
