// Component가 함께 쓰는 공통 union 타입(spec 「`@tide-tds/components` 공통 API」 스타일 축).
// 한 곳에서 정의하고, Component마다 `Extract`로 필요한 값만 고른다.

/** Component size. 높이는 `xs` 24px, `sm` 32px, `md` 40px, `lg` 48px다(spec size 표). */
export type Size = "xs" | "sm" | "md" | "lg";

/**
 * Button류의 채움 방식. `solid`·`subtle`은 Token의 강도와 이름이 같고, `outline`·`ghost`는 Component에만 있다.
 * 스타일 축 이름이 `variant`라도 값 집합은 채움 방식이라 `Variant`가 아닌 이 이름을 쓴다(GLOSSARY 「채움 방식」).
 */
export type FillVariant = "solid" | "subtle" | "outline" | "ghost";

// 색 이름 타입. 정의는 foundation이 가지고 여기서 그대로 다시 낸다(tide-v0-impl 티켓 40·41, ADR 0016).
// - Role: 행동·의미 Component(Button, IconButton, Link 등)의 `color`. Tide Role 6개 + 앱 Role
// - ColorFamilyName: 장식·분류 Component(Badge, Tag, Avatar 등)가 쓰는 색 계열. Tide 색 계열 6개 + 앱 장식 계열
//   Badge는 Role도 함께 받아 `Color`(Role | ColorFamilyName)를 쓴다(ADR 0017).
// 앱은 `declare module "@tide-tds/components" { interface RoleRegistry { brand: true } }`로 Role을 더한다.
// re-export한 interface에 한 augmentation도 원래 interface에 합쳐진다(TypeScript 7.0.2에서 확인).
export type {
  Color,
  ColorFamilyName,
  ColorFamilyRegistry,
  Role,
  RoleRegistry,
} from "@tide-tds/foundation";
