// 앱 브랜드 색을 설치한 @tide-design/components에 등록한다(ADR 0016). 둘 다 tide-color가 만든 같은 CSS를 쓴다.
// RoleRegistry는 행동·의미 Component(Button 등)의 color, ColorFamilyRegistry는 장식·분류 Component(Badge·Tag)용이다.
import type { Color, ColorFamilyName, Role } from "@tide-design/components";

declare module "@tide-design/components" {
  interface RoleRegistry {
    brand: true;
  }
  interface ColorFamilyRegistry {
    brand: true;
  }
}

export const brandColor: Role = "brand";
export const roleColor: Role = "primary";
export const familyColor: ColorFamilyName = "gray";
export const brandFamily: ColorFamilyName = "brand";
export const anyColor: Color = "cyan";
