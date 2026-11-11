"use client";
// 값 하나를 고르는 Select(tide-v0-impl 티켓 28). React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useSelect, useButton, useListBox, HiddenSelect, DismissButton, mergeProps, mergeRefs),
// react-stately 3.51.0(useSelectState). 위치·portal·motion은 오버레이 공통 부분(overlay.tsx, ADR 0018), 목록 class와
// 옵션 모으기는 목록 공통 부분(list-style.ts, list-collection.ts, ADR 0019), 옵션·묶음 그리기는 listbox.tsx를 쓴다.
//
// 구조:
// - `Select`: 루트 DOM은 트리거 `<button type="button">`이다(입력창 모양, Input과 같은 size). 그 옆에 폼 제출용 숨은
//   `<select>`(React Aria HiddenSelect, 보조기술에서 숨김)를 두고, 열리면 `document.body`에 목록을 portal한다.
// - 목록: 위치를 잡는 바깥 요소(raised 표면, 앞뒤 숨은 닫기 버튼) 안에 `role="listbox"` 요소가 있다. listbox의 자식은
//   option·group만 될 수 있어 닫기 버튼을 바깥 요소에 둔다(Popover와 같은 DismissButton).
// - `SelectItem`: `role="option"`. `value`가 고른 값이고 폼에 제출된다. `SelectSection`: 옵션 묶음(`role="group"`).

import { ChevronDownIcon } from "@tide-tds/icons";
import {
  use,
  useLayoutEffect,
  useMemo,
  useRef,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import {
  DismissButton,
  HiddenSelect,
  mergeProps,
  mergeRefs,
  useButton,
  useListBox,
  useSelect,
} from "react-aria";
import { useSelectState, type SelectState } from "react-stately";

import { cn } from "./cn.ts";
import { FieldContext, useFieldControl } from "./field-context.ts";
import { inputBaseClass, inputSizeClass, type InputSize } from "./input-style.ts";
import {
  asCollectionComponent,
  resolveCollectionChildren,
  sectionCollectionNode,
  valueItemCollectionNode,
} from "./list-collection.ts";
import { listPopupClass } from "./list-style.ts";
import { ListBoxNodes, type ListBoxOptionProps, type ListBoxSectionProps } from "./listbox.tsx";
import {
  OverlayPortal,
  useCloseOnTab,
  useOverlayPresence,
  useOverlayTheme,
  usePopoverOverlay,
} from "./overlay.tsx";

export interface SelectProps extends Omit<
  ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "type" | "size" | "children" | "name" | "form"
> {
  /** 고른 값(제어). 고른 옵션의 `value`다. `null`이면 아무것도 고르지 않은 상태다. 주면 `onValueChange`로 바꾼다. */
  value?: string | null;
  /** 처음 고른 값(비제어). 주지 않으면 아무것도 고르지 않은 상태로 시작한다. 폼을 reset하면 이 값으로 돌아간다. */
  defaultValue?: string;
  /** 사용자가 다른 옵션을 고르면 그 옵션의 `value`로 부른다. */
  onValueChange?: (value: string) => void;
  /** 목록 열림 상태(제어). 주면 `onOpenChange`로 바꾼다. */
  open?: boolean;
  /** 처음 목록 열림 상태(비제어). 기본값은 `false`다. */
  defaultOpen?: boolean;
  /** 목록 열림 상태가 바뀌려 할 때 새 값으로 부른다. 옵션을 골라 닫힐 때도 부른다. */
  onOpenChange?: (open: boolean) => void;
  /** 폼 제출 이름. 숨은 `<select>`에 붙어 고른 값이 이 이름으로 제출된다(트리거 버튼에는 붙지 않는다). */
  name?: string;
  /** 숨은 `<select>`가 속할 `<form>`의 id. 폼 밖에 둘 때 쓴다. */
  form?: string;
  /** 브라우저 자동 완성 힌트. 숨은 `<select>`에 붙는다. */
  autoComplete?: string;
  /** 아무것도 고르지 않았을 때 트리거에 보이는 글자. 기본값은 `"선택하세요"`다. */
  placeholder?: string;
  /** 높이 `sm` 32px, `md` 40px, `lg` 48px. 같은 size의 Input·Button과 높이가 같다. 기본값은 `md`다. */
  size?: InputSize;
  /**
   * 오류 상태. 트리거에 `aria-invalid="true"`와 `data-invalid`가 붙고 경계가 danger 색이 된다.
   * Field 안에서는 Field의 값을 따르고, 여기에 준 값이 이긴다.
   */
  invalid?: boolean;
  /**
   * 필수. 고르지 않고 폼을 제출하면 제출이 막히고 트리거로 포커스가 오며 오류 상태가 된다(브라우저 오류 말풍선은
   * 없다). 메시지는 Field의 `error`로 앱이 보여 준다. Field 안에서는 Field의 값을 따른다.
   */
  required?: boolean;
  /** `SelectItem`과 `SelectSection`. 이 요소들을 바로 아래(또는 Fragment·배열 안)에 둔다. */
  children?: ReactNode;
}

// class는 문자열 그대로 적는다(input-style.ts 참고).
// - 트리거: 입력창 모양(inputBaseClass: border-strong, focus-field, aria-invalid:border-danger, :disabled)에 Input과
//   같은 size class. 글자와 chevron을 한 줄에 두고 chevron은 오른쪽 끝이다(`justify-between`, 사이 8px).
// - 값 글자: 넘치면 말줄임(`truncate`). 고르지 않았을 때(placeholder)는 `text-muted`, 비활성이면 `text-disabled`.
//   옵션 안의 아이콘(장식용)은 트리거에서도 16px이고 글자와 8px 떨어진다.
// - chevron: 장식용 16px, `text-muted`(비활성이면 `text-disabled`).
const triggerClass = "group inline-flex items-center justify-between gap-2 text-start";
const valueClass =
  "min-w-0 flex-1 truncate [&>svg]:me-2 [&>svg]:inline-block [&>svg]:size-4 [&>svg]:align-[-0.125em]";
const placeholderClass = "text-muted group-disabled:text-disabled";
const chevronClass = "shrink-0 text-muted group-disabled:text-disabled";

/** 목록 상태. Select가 고른 값의 node key는 옵션의 `value`(문자열)다. */
type SelectListState = SelectState<object>;

/**
 * 값 하나를 고르는 입력. 트리거를 누르거나(마우스는 누르는 순간) Enter·Space·↓·↑로 목록을 열고, 화살표·Home/End·
 * 영문 글자로 옵션을 옮겨 Enter·Space·누름으로 고른다. 닫힌 채로 글자를 치면 바로 그 옵션을 고른다.
 * 고르면 닫히고 포커스는 트리거로 돌아온다. Esc·바깥 누름·Tab으로도 닫힌다.
 * Field 안에 두면 label·설명·오류가 자동으로 연결되고, `name`을 주면 고른 값이 폼에 제출된다.
 * 상태는 `data-open`(트리거·목록), `data-invalid`(트리거), 네이티브 `:disabled`(트리거),
 * `data-highlighted`·`data-selected`·`data-disabled`(옵션)로 노출한다.
 */
export function Select({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  name,
  form,
  autoComplete,
  placeholder = "선택하세요",
  size = "md",
  invalid,
  disabled,
  required,
  id,
  ref,
  className,
  children,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: SelectProps): ReactElement {
  const field = use(FieldContext);
  const control = useFieldControl({
    id,
    invalid,
    disabled,
    required,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
  });
  const isDisabled = control.disabled ?? false;
  const isRequired = control.required ?? false;
  const items = useMemo(() => resolveCollectionChildren(children), [children]);
  // 컬렉션 key가 옵션 value(문자열)라 고른 값이 곧 key다(valueItemCollectionNode).
  const state = useSelectState<object>({
    // useSelectState의 children 타입은 React Stately 요소(Item·Section)지만, 같은 방식으로 getCollectionNode를 붙인
    // Tide 옵션 요소를 넘긴다(list-collection.ts).
    children: items as unknown as Parameters<typeof useSelectState<object>>[0]["children"],
    value,
    defaultValue,
    onChange: (key) => {
      if (key != null) onValueChange?.(String(key));
    },
    isOpen: open,
    defaultOpen,
    onOpenChange,
    isDisabled,
    isRequired,
    // 필수 검사는 네이티브 제약 검사(숨은 select의 required)로 한다. 비면 제출을 막고 트리거로 포커스를 옮긴다.
    validationBehavior: "native",
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Field의 label은 이름으로(aria-labelledby), 설명·오류는 aria-describedby로 잇는다(ADR 0013). 트리거 id는
  // Field의 controlId라 label의 for와 오류 요약 링크(#id)가 트리거를 가리킨다.
  const { triggerProps, valueProps, menuProps, hiddenSelectProps, isInvalid } = useSelect<object>(
    {
      id: control.id,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy ?? field?.labelId,
      isDisabled,
      isRequired,
      validationBehavior: "native",
      name,
      form,
      autoComplete,
    },
    state,
    triggerRef,
  );
  const { buttonProps } = useButton(triggerProps, triggerRef);
  const mergedRef = useMemo(() => mergeRefs(ref, triggerRef), [ref, triggerRef]);
  // 앱·Field가 정한 오류 상태, 또는 필수인데 비어 제출이 막힌 상태(React Aria 네이티브 검사 결과)
  const showInvalid = control["data-invalid"] === "" || isInvalid;
  const selected = state.selectedItem;

  return (
    <>
      <button
        {...mergeProps(props, buttonProps)}
        ref={mergedRef}
        // useSelect(useField)는 자기 설명·오류 요소 자리의 id를 aria-describedby에 넣는다. Tide는 그 요소를 그리지 않고
        // Field가 설명·오류를 그리므로 Field 연결 값만 쓴다(서버 HTML에 없는 id를 가리키지 않게).
        aria-describedby={control["aria-describedby"]}
        aria-invalid={showInvalid ? true : control["aria-invalid"]}
        data-invalid={showInvalid ? "" : undefined}
        data-open={state.isOpen ? "" : undefined}
        className={cn(inputSizeClass[size], inputBaseClass, triggerClass, className)}
      >
        <span {...valueProps} className={cn(valueClass, !selected && placeholderClass)}>
          {selected ? selected.rendered : placeholder}
        </span>
        <ChevronDownIcon size={16} className={chevronClass} />
      </button>
      <HiddenSelect {...hiddenSelectProps} autoComplete={autoComplete} />
      <SelectPopover state={state} triggerRef={triggerRef} menuProps={menuProps} />
    </>
  );
}

type SelectMenuProps = ReturnType<typeof useSelect<object>>["menuProps"];

interface SelectPopoverProps {
  readonly state: SelectListState;
  readonly triggerRef: RefObject<HTMLButtonElement | null>;
  readonly menuProps: SelectMenuProps;
}

/** 목록을 DOM에 둘지 정하고 portal한다. 닫혀도 퇴장 전환이 끝날 때까지 남긴다(ADR 0018). */
function SelectPopover(props: SelectPopoverProps): ReactElement | null {
  const popoverRef = useRef<HTMLDivElement>(null);
  const present = useOverlayPresence(props.state.isOpen, popoverRef);
  if (!present) return null;
  // 옵션에 포커스가 오므로 FocusScope로 감싸(focusManagement 기본값) 닫힐 때 트리거로 포커스를 돌려준다.
  return (
    <OverlayPortal isExiting={!props.state.isOpen}>
      <SelectPopoverInner {...props} popoverRef={popoverRef} />
    </OverlayPortal>
  );
}

interface SelectPopoverInnerProps extends SelectPopoverProps {
  readonly popoverRef: RefObject<HTMLDivElement | null>;
}

/**
 * 목록 표면(`listPopupClass`)과 그 안의 `role="listbox"`. 트리거 아래 시작 끝에 4px 떨어져 붙고(Menu와 같다),
 * 폭은 트리거보다 좁지 않다.
 */
function SelectPopoverInner({
  state,
  triggerRef,
  menuProps,
  popoverRef,
}: SelectPopoverInnerProps): ReactElement {
  const listRef = useRef<HTMLDivElement>(null);
  useOverlayTheme(triggerRef, popoverRef);
  // 목록 폭이 트리거보다 좁지 않게 한다. 위치를 계산하기 전(위치 hook보다 먼저)에 붙인다(useOverlayTheme과 같다).
  useLayoutEffect(() => {
    const popover = popoverRef.current;
    const width = triggerRef.current?.offsetWidth;
    if (popover && width) popover.style.minWidth = `${width}px`;
  }, [triggerRef, popoverRef]);
  const { overlayProps } = usePopoverOverlay(
    { triggerRef, popoverRef, placement: "bottom start", offset: 4 },
    state,
  );
  const { listBoxProps } = useListBox(menuProps, state, listRef);
  // Tab은 목록을 닫고 포커스를 트리거로 돌린다(Menu와 같다, overlay.tsx).
  useCloseOnTab(popoverRef, state.close);

  return (
    <div
      {...overlayProps}
      ref={popoverRef}
      data-open={state.isOpen ? "" : undefined}
      className={listPopupClass}
    >
      {/* 스크린리더 사용자가 Esc 없이 닫을 수 있는 숨은 버튼(Popover와 같다). Tab 순서에는 없다. */}
      <DismissButton onDismiss={state.close} />
      <div {...listBoxProps} ref={listRef} className="outline-none">
        <ListBoxNodes state={state} />
      </div>
      <DismissButton onDismiss={state.close} />
    </div>
  );
}

export interface SelectItemProps extends ListBoxOptionProps {}

/**
 * Select의 옵션(`role="option"`). `Select`나 `SelectSection` 바로 안에 둔다. `value`가 고른 값이고 폼에 제출된다.
 * 내용(아이콘과 글자)은 고르면 트리거에도 보인다. 키보드 위치와 마우스를 올린 옵션은 highlight(primary subtle 배경,
 * primary 글자), 고른 옵션은 neutral subtle-active 배경과 끝의 체크 아이콘이다.
 * 상태는 `data-highlighted`, `data-selected`, `data-disabled`로 노출한다.
 */
export function SelectItem(_props: SelectItemProps): null {
  // 렌더하지 않는다. Select가 컬렉션으로 모아 그린다(listbox.tsx).
  return null;
}
asCollectionComponent(SelectItem, valueItemCollectionNode);

export interface SelectSectionProps extends ListBoxSectionProps {}

/**
 * 옵션 묶음(`role="group"`). `heading`이 화면에 보이는 제목이자 묶음의 이름이고, 없으면 `aria-label`이 이름이다.
 * 앞뒤 다른 옵션·묶음과의 사이에 구분선이 그려진다.
 */
export function SelectSection(_props: SelectSectionProps): null {
  // 렌더하지 않는다. Select가 컬렉션으로 모아 그린다(listbox.tsx).
  return null;
}
asCollectionComponent(SelectSection, sectionCollectionNode);
