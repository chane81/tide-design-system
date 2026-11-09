import type { PrimitiveColorName } from "./color.ts";

/** Theme별로 가리키는 Primitive */
export interface ThemedColor {
  readonly light: PrimitiveColorName;
  readonly dark: PrimitiveColorName;
}

// Semantic 색. Tailwind 속성별 namespace로 노출한다(ADR 0003).
// 키는 Utility class에서 접두사(bg-, text- 등)를 뺀 이름이다.
// 02에서는 bg-primary-solid 하나만 둔다. 전체 목록은 컬러 Foundation(04)에서 채운다.
export const semantic = {
  background: {
    "primary-solid": { light: "blue-600", dark: "blue-600" },
  },
  text: {},
  border: {},
  outline: {},
} as const;

// isolatedDeclarations에서는 export 값에 satisfies를 쓸 수 없어서, 모양 검사를 따로 둔다.
semantic satisfies Record<SemanticNamespace, Record<string, ThemedColor>>;

/** Semantic namespace와 Utility class 접두사 */
export type SemanticNamespace = "background" | "text" | "border" | "outline";

export const semanticPrefix = {
  background: "bg",
  text: "text",
  border: "border",
  outline: "outline",
} as const;

semanticPrefix satisfies Record<SemanticNamespace, string>;
