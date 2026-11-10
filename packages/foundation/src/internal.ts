/**
 * `@tide-tds/foundation/internal`: 문서 앱(Token 블록), 빌드 스크립트, 테스트가 쓰는 내부 도우미.
 *
 * @internal 앱 개발자용 공개 계약이 아니다. 문서에 싣지 않고, 예고 없이 바뀌거나 사라질 수 있다.
 * @packageDocumentation
 */
export { primitiveHex } from "./color.ts";
export {
  colorValueHex,
  roleFamily,
  semanticEntries,
  semanticHex,
  shadowColor,
} from "./semantic.ts";
export { contrastExclusions, contrastRatio } from "./contrast.ts";
export { fontFamilyCss } from "./typography.ts";
