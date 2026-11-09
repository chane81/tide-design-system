// 공개 표면: 아이콘 Component(생성)와 공통 props 타입.
// 아이콘 Component는 scripts/generate.ts가 이름표(icon-names.json)에서 src/generated/에 만든다(커밋하지 않음).
export type { IconProps } from "./IconBase.tsx";
export * from "./generated/index.ts";
