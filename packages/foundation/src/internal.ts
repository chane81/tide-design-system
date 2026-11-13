/**
 * `@tide-design/foundation/internal`: 문서 앱(Token 블록), 빌드 스크립트, 테스트가 쓰는 내부 도우미.
 *
 * @internal 앱 개발자용 공개 계약이 아니다. 문서에 싣지 않고, 예고 없이 바뀌거나 사라질 수 있다.
 * @packageDocumentation
 */
export { primitiveHex } from "./color.ts";
export {
  colorSlots,
  familyOverrides,
  familySlotSteps,
  mixHex,
  resolveSlotSteps,
  slotPrimitive,
  slotRule,
  slotValueHex,
  type BackgroundSlot,
  type SlotColorRef,
  type SlotMix,
  type SlotOverlay,
  type SlotOverrides,
  type SlotRule,
  type SlotStep,
  type SlotValue,
} from "./color-slot.ts";
export {
  colorValueHex,
  roleFamily,
  roleOverrides,
  roleSharedSlots,
  semanticEntries,
  semanticHex,
  shadowColor,
} from "./semantic.ts";
export {
  colorFamilyNames,
  colorSlotHex,
  colorSlotValues,
  isRole,
  roleNames,
  roleSlotToken,
  tideColorNames,
  type TideColor,
} from "./color-name.ts";
export {
  accentDefaultDeclarations,
  accentUtilities,
  accentVar,
  dataColorRule,
  familyThemeDeclarations,
  familyVar,
  primitiveVar,
  roleAliasCss,
  semanticVar,
  tideFamilyThemeDeclarations,
  type AccentUtility,
} from "./color-css.ts";
export {
  checkColorContrast,
  colorContrastRules,
  contrastExclusions,
  contrastPairRatio,
  contrastRatio,
  opaqueSemanticHex,
  type ColorContrastResult,
  type ColorContrastRule,
} from "./contrast.ts";
export { fontFamilyCss } from "./typography.ts";
export { shadowCss } from "./shape.ts";
