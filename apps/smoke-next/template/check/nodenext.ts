// moduleResolution: nodenext에서 배포된 d.ts가 해석되는지 확인한다.
import {
  Button,
  cn,
  IconButton,
  Link,
  VisuallyHidden,
  type ButtonProps,
  type IconButtonProps,
  type LinkProps,
  type Color,
  type ColorFamilyName,
  type FillVariant,
  type Role,
  type VisuallyHiddenProps,
} from "@tide-tds/components";
import { color, semantic } from "@tide-tds/foundation";
import { defineColorFamily } from "@tide-tds/foundation/color-family";
import { tailwindMergeConfig } from "@tide-tds/foundation/tailwind-merge";
import { PlusIcon, type IconProps } from "@tide-tds/icons";

// 앱 Role(brand)을 더한다(티켓 41). components가 다시 낸 interface를 augmentation한다.
declare module "@tide-tds/components" {
  interface RoleRegistry {
    brand: true;
  }
}

const className: string = cn("p-4", "p-2");
const props: VisuallyHiddenProps = { children: "텍스트" };
const anchor: "#3183f5" = color.blue[500];
const buttonProps: ButtonProps = { variant: "subtle", color: "danger", size: "lg", loading: true };
const fill: FillVariant = "ghost";
const iconButtonProps: IconButtonProps = { "aria-label": "추가", children: null, size: "xs" };
// @ts-expect-error IconButton은 aria-label이 필수다.
const unnamedIconButton: IconButtonProps = { children: null };
const linkProps: LinkProps = { href: "/docs", color: "brand" };
const brandButton: ButtonProps = { color: "brand", variant: "outline" };
const iconProps: IconProps = { size: 20, strokeWidth: 1.5, "aria-label": "추가" };
const primary: "blue-600" = semantic.background["primary-solid"].light;
const colors: Color[] = ["primary", "gray", "brand"];
const roles: Role[] = ["neutral", "brand"];
// @ts-expect-error 등록하지 않은 색 이름은 Color가 아니다.
const unknownColor: Color = "purple";
// @ts-expect-error Button의 color는 Role만 받는다. 색 계열 이름은 장식·분류 Component용이다.
const familyButton: ButtonProps = { color: "blue" };
// @ts-expect-error brand는 이 파일에서 Role로만 등록했다. 색 계열 이름이 아니다.
const brandAsFamily: ColorFamilyName = "brand";
const brandFamily = defineColorFamily({ name: "brand", scale: { ...color.blue } });
const brandName: "brand" = brandFamily.name;

export const values = [
  className,
  props,
  VisuallyHidden,
  anchor,
  primary,
  colors,
  roles,
  unknownColor,
  familyButton,
  brandAsFamily,
  brandName,
  tailwindMergeConfig,
  PlusIcon,
  iconProps,
  Button,
  buttonProps,
  fill,
  brandButton,
  IconButton,
  iconButtonProps,
  unnamedIconButton,
  Link,
  linkProps,
] as const;
