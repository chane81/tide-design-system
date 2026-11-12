import { color, type ColorStep } from "@tide-tds/foundation";
import { colorFamilyNames, contrastRatio } from "@tide-tds/foundation/internal";
import { describe, expect, it } from "vitest";

import { colorTileGroups, formatChroma, oklchChroma, tileTextColor } from "./colorTiles.ts";

const allTiles = colorTileGroups.flatMap((group) => group.tiles);

describe("tileTextColor", () => {
  it("밝은 바탕은 진한 글자, 어두운 바탕은 흰 글자", () => {
    expect(tileTextColor(color.blue[50])).toBe(color.black);
    expect(tileTextColor(color.blue[950])).toBe(color.white);
    expect(tileTextColor(color.white)).toBe(color.black);
    expect(tileTextColor(color.black)).toBe(color.white);
  });

  it("고른 글자색은 두 후보 중 대비가 높은 쪽이다", () => {
    for (const { hex, text } of allTiles) {
      const other = text === color.white ? color.black : color.white;
      expect(contrastRatio(text, hex)).toBeGreaterThanOrEqual(contrastRatio(other, hex));
    }
  });

  it("모든 타일에서 고른 글자가 4.5:1 이상이다(원칙 ① 접근성)", () => {
    for (const { name, hex, text } of allTiles) {
      expect(contrastRatio(text, hex), name).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("oklchChroma", () => {
  it("blue-500(#3183f5)은 C 0.188", () => {
    expect(color.blue[500]).toBe("#3183f5");
    expect(formatChroma("#3183f5")).toBe("0.188");
  });

  it("white·black·회색은 채도가 0이다", () => {
    expect(formatChroma("#ffffff")).toBe("0.000");
    expect(formatChroma("#000000")).toBe("0.000");
    expect(oklchChroma("#808080")).toBeLessThan(0.0005);
  });
});

describe("colorTileGroups", () => {
  it("계열 8개 모두 카드가 있고, 끝에 white·black 카드가 온다", () => {
    expect(colorTileGroups.map(({ id }) => id).toSorted()).toEqual(
      [...colorFamilyNames, "base"].toSorted(),
    );
    expect(colorTileGroups.at(-1)?.tiles.map(({ name }) => name)).toEqual(["white", "black"]);
  });

  it("계열 카드는 50~950의 11단계이고 값은 foundation 원본과 같다", () => {
    for (const group of colorTileGroups.slice(0, -1)) {
      expect(group.tiles.map(({ label }) => label)).toEqual([
        "50",
        "100",
        "200",
        "300",
        "400",
        "500",
        "600",
        "700",
        "800",
        "900",
        "950",
      ]);
      for (const tile of group.tiles) {
        const step = Number(tile.label) as ColorStep;
        expect(group.family).not.toBeNull();
        expect(tile.hex).toBe(color[group.family ?? "blue"][step]);
        expect(tile.name).toBe(`${group.id}-${tile.label}`);
      }
    }
  });

  it("Role 계열은 Role 이름, 장식 계열은 「장식」을 단다", () => {
    const roles = Object.fromEntries(colorTileGroups.map(({ id, role }) => [id, role]));
    expect(roles.blue).toBe("primary");
    expect(roles.purple).toBe("장식");
    expect(roles.mint).toBe("장식");
    expect(roles.base).toBeNull();
  });
});
