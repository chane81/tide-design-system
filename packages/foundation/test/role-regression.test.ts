// Role 회귀 검사(tide-v0-impl 티켓 40). Role을 「색 계열 + 덮어쓸 값」의 별칭으로 바꾸기 전 결과를 스냅숏으로 고정했다.
// Role Token이 가리키는 hex, 대비 쌍 목록, 대비비가 하나라도 바뀌면 실패한다.
// 스냅숏은 티켓 40 구현 전 main(fb22761)에서 만들었다. 값을 의도적으로 바꿀 때만 `vitest -u`로 갱신한다.
import { describe, expect, it } from "vitest";

import { contrastPairs, type ThemeName } from "../src/index.ts";
import { contrastRatio, semanticEntries, semanticHex } from "../src/internal.ts";

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
      const ratios = themes.map((theme) =>
        contrastRatio(
          semanticHex(pair.foreground, theme),
          semanticHex(pair.background, theme),
        ).toFixed(4),
      );
      return `${pair.foreground} / ${pair.background} ≥ ${pair.minRatio}: ${ratios.join(" / ")}`;
    });
    expect(results).toMatchSnapshot();
  });
});
