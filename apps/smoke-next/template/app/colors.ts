// 앱이 더한 브랜드 계열을 색 이름(Color) 타입에 등록한다. 앱이 설치한 패키지(@tide-tds/components)를 augmentation한다.
import type { Color } from "@tide-tds/components";

declare module "@tide-tds/components" {
  interface ColorRegistry {
    brand: true;
  }
}

export const brandColor: Color = "brand";
export const roleColor: Color = "primary";
export const familyColor: Color = "gray";
