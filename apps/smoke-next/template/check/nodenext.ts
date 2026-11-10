// moduleResolution: nodenext에서 배포된 d.ts가 해석되는지 확인한다.
import {
  Button,
  cn,
  VisuallyHidden,
  type ButtonProps,
  type Color,
  type FillVariant,
  type VisuallyHiddenProps,
} from "@tide-tds/components";
import { color, semantic } from "@tide-tds/foundation";
import { defineColorFamily } from "@tide-tds/foundation/color-family";
import { tailwindMergeConfig } from "@tide-tds/foundation/tailwind-merge";
import { PlusIcon, type IconProps } from "@tide-tds/icons";

// 앱 브랜드 계열을 색 이름 타입에 더한다(티켓 40). components가 다시 낸 interface를 augmentation한다.
declare module "@tide-tds/components" {
  interface ColorRegistry {
    brand: true;
  }
}

const className: string = cn("p-4", "p-2");
const props: VisuallyHiddenProps = { children: "텍스트" };
const anchor: "#3183f5" = color.blue[500];
const buttonProps: ButtonProps = { variant: "subtle", color: "danger", size: "lg", loading: true };
const fill: FillVariant = "ghost";
const brandButton: ButtonProps = { color: "brand", variant: "outline" };
const iconProps: IconProps = { size: 20, strokeWidth: 1.5, "aria-label": "추가" };
const primary: "blue-600" = semantic.background["primary-solid"].light;
const colors: Color[] = ["primary", "gray", "brand"];
// @ts-expect-error 등록하지 않은 색 이름은 Color가 아니다.
const unknownColor: Color = "purple";
const brandFamily = defineColorFamily({ name: "brand", scale: { ...color.blue } });
const brandName: "brand" = brandFamily.name;

export const values = [
  className,
  props,
  VisuallyHidden,
  anchor,
  primary,
  colors,
  unknownColor,
  brandName,
  tailwindMergeConfig,
  PlusIcon,
  iconProps,
  Button,
  buttonProps,
  fill,
  brandButton,
] as const;
