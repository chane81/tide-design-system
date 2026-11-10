// 루트와 internal 서브패스의 export 이름(공개 표면)을 확인한다.
// 루트는 Token 객체만 낸다. 도우미는 앱 개발자용이 아닌 `@tide-tds/foundation/internal`에 있다.
import { describe, expect, it } from "vitest";

describe("exports", () => {
  it("루트는 Token 객체만 낸다", async () => {
    const root = await import("../dist/index.js");
    expect(Object.keys(root).sort()).toEqual(
      [
        "color",
        "contrastPairs",
        "focusRing",
        "fontFamily",
        "fontSize",
        "fontWeight",
        "radius",
        "semantic",
        "semanticPrefix",
        "shadow",
        "textStyle",
      ].sort(),
    );
  });

  it("도우미는 internal 서브패스에 있다", async () => {
    const internal = await import("../dist/internal.js");
    expect(Object.keys(internal).sort()).toEqual(
      [
        "colorValueHex",
        "contrastExclusions",
        "contrastRatio",
        "fontFamilyCss",
        "primitiveHex",
        "roleFamily",
        "semanticEntries",
        "semanticHex",
        "shadowColor",
        "shadowCss",
      ].sort(),
    );
  });
});
