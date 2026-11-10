// 앱이 더한 브랜드 색을 등록한다(티켓 41, ADR 0016). 앱이 설치한 패키지(@tide-tds/components)를 augmentation한다.
// - RoleRegistry: Button·IconButton·Link 같은 행동·의미 Component의 color로 쓴다.
// - ColorFamilyRegistry: Badge·Tag 같은 장식·분류 Component용 색 계열로 쓴다.
// 두 등록 모두 tide-color가 만든 같은 CSS([data-color="brand"])를 쓴다.
import type { Color, ColorFamilyName, Role } from "@tide-tds/components";

declare module "@tide-tds/components" {
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
