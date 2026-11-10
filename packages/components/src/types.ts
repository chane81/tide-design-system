// Component가 함께 쓰는 공통 union 타입(spec 「`@tide-tds/components` 공통 API」 스타일 축).
// 한 곳에서 정의하고, Component마다 `Extract`로 필요한 값만 고른다.

/** Component size. 높이는 `xs` 24px, `sm` 32px, `md` 40px, `lg` 48px다(spec size 표). */
export type Size = "xs" | "sm" | "md" | "lg";

/**
 * Button류의 채움 방식. `solid`·`subtle`은 Token의 강도와 이름이 같고, `outline`·`ghost`는 Component에만 있다.
 * 스타일 축 이름이 `variant`라도 값 집합은 채움 방식이라 `Variant`가 아닌 이 이름을 쓴다(GLOSSARY 「채움 방식」).
 */
export type FillVariant = "solid" | "subtle" | "outline" | "ghost";

/** Role 6개. 색 이름(`Color`)의 일부다. 정의는 foundation이 가진다. */
export type { Role } from "@tide-tds/foundation";

// 색 이름(Color). foundation의 ColorRegistry를 그대로 다시 낸다(tide-v0-impl 티켓 40, ADR 0011).
// 앱은 `declare module "@tide-tds/components" { interface ColorRegistry { brand: true } }`로 브랜드 계열을 더한다.
// re-export한 interface에 한 augmentation도 원래 interface에 합쳐진다(TypeScript 7.0.2에서 확인).
export type { Color, ColorRegistry } from "@tide-tds/foundation";
