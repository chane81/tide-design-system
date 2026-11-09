// 루트는 Token 객체와 그 타입만 낸다(spec 「`@tide-tds/foundation`」 공개 표면).
// 대비 계산 같은 도우미는 앱 개발자용이 아니라서 `./internal.ts`(`@tide-tds/foundation/internal`)에 둔다.
export { color, type ColorFamily, type ColorStep, type PrimitiveColorName } from "./color.ts";
export {
  semantic,
  semanticPrefix,
  type AlphaColor,
  type Role,
  type SemanticColorName,
  type SemanticColorValue,
  type SemanticNamespace,
  type ThemeName,
  type ThemedColor,
} from "./semantic.ts";
export { contrastPairs, type ContrastExclusion, type ContrastPair } from "./contrast.ts";
