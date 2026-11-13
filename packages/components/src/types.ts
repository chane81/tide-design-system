/** Component size. 높이 `xs` 24px, `sm` 32px, `md` 40px, `lg` 48px. */
export type Size = "xs" | "sm" | "md" | "lg";

/** Button류의 채움 방식(`variant` 값). `outline`·`ghost`는 Token에 없고 Component에만 있다. */
export type FillVariant = "solid" | "subtle" | "outline" | "ghost";

// 정의는 foundation에 있고 다시 낸다(ADR 0016). re-export한 interface에도 앱의 RoleRegistry augmentation이 합쳐진다.
export type {
  Color,
  ColorFamilyName,
  ColorFamilyRegistry,
  Role,
  RoleRegistry,
} from "@tide-design/foundation";
