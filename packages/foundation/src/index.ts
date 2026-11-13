// 루트는 Token 객체와 그 타입만 낸다(spec 「`@tide-design/foundation`」 공개 표면).
// 대비 계산 같은 도우미는 앱 개발자용이 아니라서 `./internal.ts`(`@tide-design/foundation/internal`)에 둔다.
export { color, type ColorFamily, type ColorStep, type PrimitiveColorName } from "./color.ts";
export type { ColorSlot } from "./colorSlot.ts";
export {
  semantic,
  semanticPrefix,
  type AlphaColor,
  type Color,
  type ColorFamilyName,
  type ColorFamilyRegistry,
  type MixedColor,
  type Role,
  type RoleRegistry,
  type SemanticColorName,
  type SemanticColorValue,
  type SemanticNamespace,
  type ThemeName,
  type ThemedColor,
  type TideRole,
} from "./semantic.ts";
export {
  contrastPairs,
  type ContrastExclusion,
  type ContrastMinRatio,
  type ContrastPair,
} from "./contrast.ts";
export {
  fontFamily,
  fontSize,
  fontWeight,
  textStyle,
  type FontFamilyName,
  type FontSizeStep,
  type FontWeightName,
  type TextStyleName,
  type TextStyleValue,
} from "./typography.ts";
export {
  focusRing,
  radius,
  shadow,
  type RadiusName,
  type ShadowLayer,
  type ShadowName,
} from "./shape.ts";
export { duration, easing, type DurationName, type EasingName } from "./motion.ts";
export { zIndex, type ZIndexName } from "./stacking.ts";
