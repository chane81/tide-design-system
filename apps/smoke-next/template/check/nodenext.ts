// moduleResolution: nodenext에서 배포된 d.ts가 해석되는지 확인한다.
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  cn,
  Field,
  IconButton,
  Input,
  Link,
  Progress,
  Radio,
  RadioGroup,
  Separator,
  Skeleton,
  Switch,
  Textarea,
  VisuallyHidden,
  type AlertProps,
  type AvatarProps,
  type BadgeProps,
  type ButtonProps,
  type CardProps,
  type CheckboxGroupProps,
  type CheckboxProps,
  type RadioGroupProps,
  type RadioProps,
  type FieldProps,
  type IconButtonProps,
  type InputProps,
  type LinkProps,
  type ProgressProps,
  type SeparatorProps,
  type SkeletonProps,
  type SwitchProps,
  type TextareaProps,
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
const fieldProps: FieldProps = { label: "이메일", error: "오류", children: null };
const inputProps: InputProps = { size: "lg", invalid: true, type: "date" };
const textareaProps: TextareaProps = { size: "sm", rows: 4 };
// @ts-expect-error Input은 xs를 받지 않는다.
const xsInput: InputProps = { size: "xs" };
const checkboxProps: CheckboxProps = { size: "sm", color: "success", indeterminate: true };
const checkboxGroupProps: CheckboxGroupProps = { orientation: "horizontal", invalid: true };
const radioProps: RadioProps = { value: "fast", size: "md" };
const radioGroupProps: RadioGroupProps = {
  defaultValue: "fast",
  onValueChange: (value: string) => value,
};
// @ts-expect-error Radio는 value가 필수다.
const radioWithoutValue: RadioProps = {};
// @ts-expect-error Checkbox color는 Role만 받는다(색 계열 이름은 받지 않는다).
const grayCheckbox: CheckboxProps = { color: "gray" };
const groupField: FieldProps = { label: "배송", group: true, children: null };
const switchProps: SwitchProps = {
  size: "sm",
  color: "success",
  defaultChecked: true,
  name: "news",
};
// @ts-expect-error Switch는 xs를 받지 않는다.
const xsSwitch: SwitchProps = { size: "xs" };
// @ts-expect-error Switch color는 Role만 받는다(색 계열 이름은 받지 않는다).
const graySwitch: SwitchProps = { color: "gray" };
const badgeProps: BadgeProps = { children: "완료", color: "brand", variant: "solid", size: "sm" };
// Badge color는 Role과 색 계열 이름(Color)을 받는다(ADR 0016·0017).
const blueBadge: BadgeProps = { children: "디자인", color: "blue" };
// @ts-expect-error 등록하지 않은 이름은 Badge color가 아니다.
const unknownBadge: BadgeProps = { children: "완료", color: "purple-ish" };
// @ts-expect-error Badge는 상태 텍스트(children)가 필수다.
const emptyBadge: BadgeProps = { color: "success" };
const cardProps: CardProps = { children: null, id: "card" };
const separatorProps: SeparatorProps = { orientation: "vertical", decorative: true };
// @ts-expect-error Separator orientation은 horizontal/vertical만 받는다.
const diagonalSeparator: SeparatorProps = { orientation: "diagonal" };
// Alert color는 Role만 받는다(앱 Role 포함, ADR 0016). role은 alert·status만, onClose는 인자 없는 콜백이다(티켓 20).
const alertProps: AlertProps = {
  color: "brand",
  title: "새 요금제",
  role: "status",
  onClose: () => {},
  closeLabel: "알림 닫기",
};
// @ts-expect-error Alert color는 색 계열 이름을 받지 않는다.
const blueAlert: AlertProps = { color: "blue" };
// @ts-expect-error Alert role은 alert·status만 받는다.
const buttonAlert: AlertProps = { role: "button" };
// Avatar color는 색 계열 이름만 받는다(Role은 받지 않는다, 티켓 21). alt는 필수다.
const avatarProps: AvatarProps = { alt: "홍길동", src: "/a.png", size: "xs", color: "cyan" };
// @ts-expect-error Avatar color는 Role을 받지 않는다.
const primaryAvatar: AvatarProps = { alt: "", color: "primary" };
// @ts-expect-error Avatar는 alt가 필수다.
const noAltAvatar: AvatarProps = { src: "/a.png" };
// Skeleton size는 circle에만 있다. Progress는 value와 이름이 필수이고 color는 Role만 받는다(티켓 22).
const skeletonProps: SkeletonProps = { variant: "circle", size: "lg" };
// @ts-expect-error Skeleton text는 size를 받지 않는다.
const sizedTextSkeleton: SkeletonProps = { variant: "text", size: "md" };
const progressProps: ProgressProps = { value: 3, max: 10, color: "brand", "aria-label": "업로드" };
// @ts-expect-error Progress는 접근 가능한 이름이 필수다.
const unnamedProgress: ProgressProps = { value: 3 };
// @ts-expect-error Progress color는 색 계열 이름을 받지 않는다.
const blueProgress: ProgressProps = { value: 3, "aria-label": "업로드", color: "blue" };
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
  Field,
  Input,
  Textarea,
  fieldProps,
  inputProps,
  textareaProps,
  xsInput,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  checkboxProps,
  checkboxGroupProps,
  radioProps,
  radioGroupProps,
  radioWithoutValue,
  grayCheckbox,
  groupField,
  Switch,
  switchProps,
  xsSwitch,
  graySwitch,
  Badge,
  badgeProps,
  blueBadge,
  unknownBadge,
  emptyBadge,
  Card,
  cardProps,
  Separator,
  separatorProps,
  diagonalSeparator,
  Alert,
  alertProps,
  blueAlert,
  buttonAlert,
  Avatar,
  avatarProps,
  primaryAvatar,
  noAltAvatar,
  Skeleton,
  skeletonProps,
  sizedTextSkeleton,
  Progress,
  progressProps,
  unnamedProgress,
  blueProgress,
] as const;
