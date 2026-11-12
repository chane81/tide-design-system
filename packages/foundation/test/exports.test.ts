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
        "duration",
        "easing",
        "focusRing",
        "fontFamily",
        "fontSize",
        "fontWeight",
        "radius",
        "semantic",
        "semanticPrefix",
        "shadow",
        "textStyle",
        "zIndex",
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
        // 색 계열·accent 슬롯(티켓 40)
        "accentDefaultDeclarations",
        "accentUtilities",
        "accentVar",
        "checkColorContrast",
        "colorContrastRules",
        "colorFamilyNames",
        "colorSlotHex",
        "colorSlotValues",
        "colorSlots",
        "dataColorRule",
        "familyOverrides",
        "familySlotSteps",
        "familyThemeDeclarations",
        "familyVar",
        "isRole",
        "primitiveVar",
        "resolveSlotSteps",
        "roleAliasCss",
        "roleNames",
        "roleOverrides",
        "roleSharedSlots",
        "roleSlotToken",
        "semanticVar",
        "slotPrimitive",
        "slotRule",
        "tideColorNames",
        "tideFamilyThemeDeclarations",
        // 덮기·섞기와 반투명 배경 대비(ADR 0022)
        "contrastPairRatio",
        "mixHex",
        "opaqueSemanticHex",
        "slotValueHex",
      ].sort(),
    );
  });

  it("color-family 서브패스는 앱 브랜드 색 계열 API를 낸다(티켓 40)", async () => {
    const colorFamily = await import("../dist/color-family.js");
    expect(Object.keys(colorFamily).sort()).toEqual(
      ["checkColorFamily", "colorFamilyCss", "colorFamilySlotHex", "defineColorFamily"].sort(),
    );
  });
});
