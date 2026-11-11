// moduleResolution: nodenext에서 배포된 d.ts가 해석되는지 확인한다.
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  cn,
  Field,
  IconButton,
  Input,
  Link,
  Menu,
  MenuContent,
  MenuItem,
  MenuSection,
  MenuTrigger,
  Progress,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  SelectSection,
  Combobox,
  ComboboxItem,
  ComboboxSection,
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Popover,
  PopoverContent,
  PopoverTrigger,
  AlertDialog,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  Separator,
  Skeleton,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  VisuallyHidden,
  type AccordionHeadingLevel,
  type AccordionItemProps,
  type AccordionPanelProps,
  type AccordionProps,
  type AccordionTriggerProps,
  type AlertProps,
  type BreadcrumbCurrentProps,
  type BreadcrumbItemProps,
  type BreadcrumbLinkProps,
  type BreadcrumbProps,
  type AvatarProps,
  type BadgeProps,
  type ButtonProps,
  type CardProps,
  type CheckboxGroupProps,
  type CheckboxProps,
  type RadioGroupProps,
  type SelectItemProps,
  type SelectProps,
  type SelectSectionProps,
  type ComboboxItemProps,
  type ComboboxProps,
  type ComboboxSectionProps,
  type RadioProps,
  type FieldProps,
  type IconButtonProps,
  type InputProps,
  type LinkProps,
  type MenuContentProps,
  type MenuItemProps,
  type MenuPlacement,
  type MenuProps,
  type MenuSectionProps,
  type MenuTriggerProps,
  type ProgressProps,
  type PaginationEllipsisProps,
  type PaginationItemProps,
  type PaginationLinkProps,
  type PaginationNextProps,
  type PaginationPreviousProps,
  type PaginationProps,
  type PopoverContentProps,
  type AlertDialogProps,
  type DialogCloseProps,
  type DialogContentProps,
  type DialogDescriptionProps,
  type DialogFooterProps,
  type DialogProps,
  type DialogSize,
  type DialogTitleProps,
  type DialogTriggerProps,
  type PopoverPlacement,
  type TabListProps,
  type TabPanelProps,
  type TabProps,
  type TabsActivationMode,
  type TabsOrientation,
  type TabsProps,
  type PopoverProps,
  type PopoverTriggerProps,
  type SeparatorProps,
  type SkeletonProps,
  type SwitchProps,
  type TableBodyProps,
  type TableCellProps,
  type TableHeadProps,
  type TableHeaderCellProps,
  type TableProps,
  type TableRowProps,
  type TextareaProps,
  type TooltipContentProps,
  type TooltipPlacement,
  type TooltipProps,
  type TooltipTriggerProps,
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
// Table은 부분마다 요소 props를 받고 머리 칸 scope는 HTML 값만 받는다. 스타일 축은 없다(티켓 23).
const tableProps: TableProps = { "aria-label": "요금제", className: "w-auto" };
const tableHeadProps: TableHeadProps = { className: "bg-neutral-subtle" };
const tableBodyProps: TableBodyProps = { id: "rows" };
const tableRowProps: TableRowProps = { className: "hover:bg-transparent" };
const tableHeaderCellProps: TableHeaderCellProps = { scope: "row" };
const tableCellProps: TableCellProps = { headers: "q1", className: "tabular-nums text-end" };
// @ts-expect-error TableHeaderCell scope는 HTML scope 값만 받는다.
const wrongScope: TableHeaderCellProps = { scope: "column" };
// @ts-expect-error Table에는 variant가 없다.
const variantTable: TableProps = { variant: "striped" };
// Breadcrumb·Pagination은 nav·li·a·span props를 받는다. 색·variant·size 축은 없다(티켓 24).
const breadcrumbProps: BreadcrumbProps = { "aria-label": "문서 경로", className: "mb-4" };
const breadcrumbItemProps: BreadcrumbItemProps = { className: "gap-2" };
const breadcrumbLinkProps: BreadcrumbLinkProps = { href: "/docs" };
const breadcrumbCurrentProps: BreadcrumbCurrentProps = { children: "설치" };
// @ts-expect-error BreadcrumbLink에는 color가 없다.
const coloredBreadcrumbLink: BreadcrumbLinkProps = { color: "primary" };
const paginationProps: PaginationProps = { "aria-label": "댓글 페이지" };
const paginationItemProps: PaginationItemProps = { className: "hidden sm:block" };
const paginationLinkProps: PaginationLinkProps = { href: "?page=2", current: true };
const paginationPreviousProps: PaginationPreviousProps = { disabled: true };
const paginationNextProps: PaginationNextProps = { "aria-label": "다음 댓글" };
const paginationEllipsisProps: PaginationEllipsisProps = { children: "3쪽 생략" };
// @ts-expect-error 이전/다음의 size는 고정이다.
const sizedPaginationNext: PaginationNextProps = { size: "lg" };
const popoverProps: PopoverProps = {
  defaultOpen: true,
  onOpenChange: (open) => void open,
  children: null,
};
const popoverTriggerProps: PopoverTriggerProps = { disabled: true };
const placement: PopoverPlacement = "right bottom";
const popoverContentProps: PopoverContentProps = { placement, offset: 4, "aria-label": "공유" };
// @ts-expect-error Popover 내용의 역할은 dialog로 고정이다.
const menuPopover: PopoverContentProps = { role: "menu" };
const dialogProps: DialogProps = { open: true, onOpenChange: (open) => void open, children: null };
const alertDialogProps: AlertDialogProps = { defaultOpen: false, children: null };
const dialogTriggerProps: DialogTriggerProps = { disabled: true };
const dialogSize: DialogSize = "lg";
const dialogContentProps: DialogContentProps = { size: dialogSize, closeLabel: "설정 닫기" };
const dialogTitleProps: DialogTitleProps = { id: "title" };
const dialogDescriptionProps: DialogDescriptionProps = { id: "desc" };
const dialogFooterProps: DialogFooterProps = { className: "justify-start" };
const dialogCloseProps: DialogCloseProps = { onClick: (event) => event.preventDefault() };
// @ts-expect-error Dialog size는 sm·md·lg다.
const xlDialog: DialogContentProps = { size: "xl" };
// @ts-expect-error Dialog 내용의 역할은 고정이다(AlertDialog를 쓴다).
const roleDialog: DialogContentProps = { role: "alertdialog" };
// @ts-expect-error React Aria 이름(isDismissable)은 드러내지 않는다.
const dismissableDialog: DialogContentProps = { isDismissable: true };
const tabsOrientation: TabsOrientation = "vertical";
const tabsActivation: TabsActivationMode = "manual";
const tabsProps: TabsProps = {
  defaultValue: "a",
  orientation: tabsOrientation,
  activationMode: tabsActivation,
  onValueChange: (value) => void value,
};
const tabListProps: TabListProps = { "aria-label": "보기" };
const tabProps: TabProps = { value: "a", disabled: true };
const tabPanelProps: TabPanelProps = { value: "a", tabIndex: -1 };
// @ts-expect-error Tabs는 value나 defaultValue 하나를 꼭 받는다.
const noValueTabs: TabsProps = { orientation: "horizontal" };
// @ts-expect-error React Aria 이름(keyboardActivation)은 드러내지 않는다.
const ariaTabs: TabsProps = { defaultValue: "a", keyboardActivation: "manual" };
// @ts-expect-error 탭 역할은 tab으로 고정이다.
const roleTab: TabProps = { value: "a", role: "option" };
const tooltipProps: TooltipProps = { delay: 0, closeDelay: 100, disabled: false, children: null };
const tooltipTriggerProps: TooltipTriggerProps = { "aria-describedby": "hint" };
const accordionProps: AccordionProps = {
  defaultValue: ["a"],
  multiple: true,
  onValueChange: (value) => void value,
};
const accordionItemProps: AccordionItemProps = { value: "a", disabled: true };
const accordionLevel: AccordionHeadingLevel = 2;
const accordionTriggerProps: AccordionTriggerProps = { level: accordionLevel };
const accordionPanelProps: AccordionPanelProps = { role: "group" };
// @ts-expect-error Accordion 값은 문자열 목록이다.
const stringAccordion: AccordionProps = { value: "a" };
// @ts-expect-error React Aria 이름(allowsMultipleExpanded)은 드러내지 않는다.
const ariaAccordion: AccordionProps = { allowsMultipleExpanded: true };
// @ts-expect-error 패널 역할은 region·group이다.
const dialogPanel: AccordionPanelProps = { role: "dialog" };
const tooltipPlacement: TooltipPlacement = "top end";
const tooltipContentProps: TooltipContentProps = { placement: tooltipPlacement, offset: 6 };
// @ts-expect-error Tooltip 설명의 역할은 tooltip으로 고정이다.
const dialogTooltip: TooltipContentProps = { role: "dialog" };
const menuProps: MenuProps = { defaultOpen: false, onOpenChange: () => undefined, children: null };
const menuTriggerProps: MenuTriggerProps = { disabled: true };
const menuPlacement: MenuPlacement = "top start";
const menuContentProps: MenuContentProps = {
  placement: menuPlacement,
  offset: 2,
  "aria-label": "동작",
};
const menuItemProps: MenuItemProps = {
  disabled: true,
  textValue: "삭제",
  onClick: () => undefined,
};
const menuSectionProps: MenuSectionProps = { heading: "정렬", className: "mt-1" };
// @ts-expect-error Menu 목록의 역할은 menu로 고정이다.
const listboxMenu: MenuContentProps = { role: "listbox" };
// @ts-expect-error React Aria 이름(onAction)은 드러내지 않는다. onClick을 쓴다.
const actionItem: MenuItemProps = { onAction: () => undefined };
const selectProps: SelectProps = {
  value: null,
  defaultValue: "apple",
  onValueChange: (value: string) => value,
  open: false,
  onOpenChange: () => undefined,
  name: "fruit",
  placeholder: "고르세요",
  size: "lg",
  invalid: true,
  required: true,
};
const selectItemProps: SelectItemProps = { value: "apple", disabled: true, textValue: "사과" };
const selectSectionProps: SelectSectionProps = { heading: "과일", className: "mt-1" };
// @ts-expect-error Select는 xs를 받지 않는다(Input과 같다).
const xsSelect: SelectProps = { size: "xs" };
// @ts-expect-error 옵션은 value가 필수다.
const selectItemWithoutValue: SelectItemProps = {};
// @ts-expect-error React Aria 이름(onSelectionChange)은 드러내지 않는다. onValueChange를 쓴다.
const selectionChange: SelectProps = { onSelectionChange: () => undefined };
const comboboxProps: ComboboxProps = {
  value: null,
  defaultValue: "kr",
  onValueChange: (value: string | null) => value,
  onOpenChange: (open: boolean) => open,
  emptyMessage: "없음",
  name: "country",
  placeholder: "국가",
  size: "sm",
  invalid: true,
  required: true,
};
const comboboxItemProps: ComboboxItemProps = { value: "kr", disabled: true, textValue: "대한민국" };
const comboboxSectionProps: ComboboxSectionProps = { heading: "아시아", className: "mt-1" };
// @ts-expect-error Combobox는 xs를 받지 않는다(Input과 같다).
const xsCombobox: ComboboxProps = { size: "xs" };
// @ts-expect-error Combobox 열림 상태는 입력이 정하므로 제어하지 않는다.
const openCombobox: ComboboxProps = { open: true };
// @ts-expect-error React Aria 이름(onInputChange)은 드러내지 않는다.
const inputChange: ComboboxProps = { onInputChange: () => undefined };
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
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
  accordionProps,
  accordionItemProps,
  accordionTriggerProps,
  accordionPanelProps,
  stringAccordion,
  ariaAccordion,
  dialogPanel,
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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  tableProps,
  tableHeadProps,
  tableBodyProps,
  tableRowProps,
  tableHeaderCellProps,
  tableCellProps,
  wrongScope,
  variantTable,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbCurrent,
  breadcrumbProps,
  breadcrumbItemProps,
  breadcrumbLinkProps,
  breadcrumbCurrentProps,
  coloredBreadcrumbLink,
  Pagination,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  paginationProps,
  paginationItemProps,
  paginationLinkProps,
  paginationPreviousProps,
  paginationNextProps,
  paginationEllipsisProps,
  sizedPaginationNext,
  Popover,
  PopoverTrigger,
  PopoverContent,
  popoverProps,
  popoverTriggerProps,
  popoverContentProps,
  menuPopover,
  AlertDialog,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  dialogProps,
  alertDialogProps,
  dialogTriggerProps,
  dialogContentProps,
  dialogTitleProps,
  dialogDescriptionProps,
  dialogFooterProps,
  dialogCloseProps,
  xlDialog,
  roleDialog,
  dismissableDialog,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  tabsProps,
  tabListProps,
  tabProps,
  tabPanelProps,
  noValueTabs,
  ariaTabs,
  roleTab,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  tooltipProps,
  tooltipTriggerProps,
  tooltipContentProps,
  dialogTooltip,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSection,
  menuProps,
  menuTriggerProps,
  menuContentProps,
  menuItemProps,
  menuSectionProps,
  listboxMenu,
  actionItem,
  Select,
  SelectItem,
  SelectSection,
  selectProps,
  selectItemProps,
  selectSectionProps,
  xsSelect,
  selectItemWithoutValue,
  selectionChange,
  Combobox,
  ComboboxItem,
  ComboboxSection,
  comboboxProps,
  comboboxItemProps,
  comboboxSectionProps,
  xsCombobox,
  openCombobox,
  inputChange,
] as const;
