// Component가 함께 쓰는 공통 union 타입(spec 「`@tide-tds/components` 공통 API」 스타일 축).
// 한 곳에서 정의하고, Component마다 `Extract`로 필요한 값만 고른다.

/** Component size. 높이는 `xs` 24px, `sm` 32px, `md` 40px, `lg` 48px다(spec size 표). */
export type Size = "xs" | "sm" | "md" | "lg";

// 색 이름(Color). foundation의 ColorRegistry를 그대로 다시 낸다(tide-v0-impl 티켓 40, ADR 0011).
// 앱은 `declare module "@tide-tds/components" { interface ColorRegistry { brand: true } }`로 브랜드 계열을 더한다.
// re-export한 interface에 한 augmentation도 원래 interface에 합쳐진다(TypeScript 7.0.2에서 확인).
export type { Color, ColorRegistry } from "@tide-tds/foundation";
