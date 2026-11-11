"use client";
// 글자를 쳐서 옵션을 거르고 하나를 고르는 Combobox(tide-v0-impl 티켓 29). React Aria hooks만 쓰고 마크업은 직접 만든다
// (ADR 0004). 근거 버전: react-aria 3.53.1(useComboBox, useButton, useListBox, useFilter, mergeProps, mergeRefs),
// react-stately 3.51.0(useComboBoxState). 위치·portal·motion은 오버레이 공통 부분(overlay.tsx, ADR 0018), 목록 class와
// 옵션 모으기·그리기는 Select와 같은 목록 공통 부분(list-style.ts, list-collection.ts, listbox.tsx, ADR 0019)을 쓴다.
//
// 구조:
// - `Combobox`: 루트 DOM은 `role="combobox"` 텍스트 `<input>`이다(입력창 모양, Input과 같은 size). 감싸개 `<div>` 안에서
//   그 뒤에 목록을 여는 chevron 버튼(Tab 순서 밖)과 폼 제출용 숨은 `<input type="hidden">`(고른 옵션의 `value`)이 온다.
//   열리면 `document.body`에 목록을 portal한다.
// - 포커스는 늘 입력에 있다. 목록 안 위치는 가상 포커스(`aria-activedescendant`)로 옮기고 옵션의 `data-highlighted`로 보인다.
//   그래서 목록은 바깥을 inert로 막지 않는 non-modal이고(입력이 바깥이다), 포커스 가두기·복귀도 하지 않는다.
// - `ComboboxItem`·`ComboboxSection`은 Select 옵션·묶음과 같다(listbox.tsx).

import { ChevronDownIcon } from "@tide-tds/icons";
import {
  use,
  useLayoutEffect,
  useMemo,
  useRef,
  type ComponentProps,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { mergeProps, mergeRefs, useButton, useComboBox, useFilter, useListBox } from "react-aria";
import { useComboBoxState, type ComboBoxState } from "react-stately";

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
  useOverlayPresence,
  useOverlayTheme,
  usePopoverOverlay,
} from "./overlay.tsx";

export interface ComboboxProps extends Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "size" | "children" | "name" | "form" | "list"
> {
  /** 고른 값(제어). 고른 옵션의 `value`다. `null`이면 아무것도 고르지 않은 상태다. 주면 `onValueChange`로 바꾼다. */
  value?: string | null;
  /** 처음 고른 값(비제어). 입력에 그 옵션의 글자가 보인다. 폼을 reset하면 이 값으로 돌아간다. */
  defaultValue?: string;
  /**
   * 고른 값이 바뀌면 부른다. 옵션을 고르면 그 `value`로, 사용자가 입력을 모두 지우면 `null`로 부른다.
   */
  onValueChange?: (value: string | null) => void;
  /** 목록이 열리거나 닫힐 때 새 상태로 부른다. 열림 상태는 입력이 정하므로 제어할 수 없다. */
  onOpenChange?: (open: boolean) => void;
  /** 거른 결과가 없을 때 목록에 보이는 글자. 기본값은 `"결과가 없습니다"`다. */
  emptyMessage?: ReactNode;
  /** 폼 제출 이름. 숨은 input에 붙어 고른 옵션의 `value`가 이 이름으로 제출된다(입력한 글자는 제출되지 않는다). */
  name?: string;
  /** 숨은 input이 속할 `<form>`의 id. 폼 밖에 둘 때 쓴다. */
  form?: string;
  /** 높이 `sm` 32px, `md` 40px, `lg` 48px. 같은 size의 Input·Select·Button과 높이가 같다. 기본값은 `md`다. */
  size?: InputSize;
  /**
   * 오류 상태. 입력에 `aria-invalid="true"`와 `data-invalid`가 붙고 경계가 danger 색이 된다.
   * Field 안에서는 Field의 값을 따르고, 여기에 준 값이 이긴다.
   */
  invalid?: boolean;
  /**
   * 필수. 비어 있으면 폼 제출이 막히고 입력으로 포커스가 오며 오류 상태가 된다(브라우저 오류 말풍선은 없다).
   * 메시지는 Field의 `error`로 앱이 보여 준다. Field 안에서는 Field의 값을 따른다.
   */
  required?: boolean;
  /** `ComboboxItem`과 `ComboboxSection`. 이 요소들을 바로 아래(또는 Fragment·배열 안)에 둔다. */
  children?: ReactNode;
}

// class는 문자열 그대로 적는다(input-style.ts 참고).
// - 감싸개: 입력과 chevron 버튼을 한 줄에 둔다. 버튼은 음수 margin으로 입력의 끝 안쪽에 겹친다. 그래서 사용자 className으로
//   입력 폭을 바꿔도 버튼이 입력 끝에 붙어 있다.
// - 입력: 입력창 모양(inputBaseClass)에 Input과 같은 size class. 끝 padding은 chevron(16px)과 글자 사이 8px를 더 둔다.
// - 버튼: 장식이 아닌 실제 버튼(누르면 전체 목록을 연다)이지만 Tab 순서 밖이다(React Aria). chevron 16px은 Select 트리거와
//   같은 자리(입력 바깥 끝에서 size별 좌우 padding + border 1px)에 온다. `text-muted`, 비활성이면 `text-disabled`.
const wrapperClass = "flex w-full";
const inputEndClass: Record<InputSize, string> = {
  sm: "pe-[34px]",
  md: "pe-9",
  lg: "pe-10",
};
const buttonSizeClass: Record<InputSize, string> = {
  sm: "-ms-[35px] w-[35px] pe-[11px]",
  md: "-ms-[37px] w-[37px] pe-[13px]",
  lg: "-ms-[41px] w-[41px] pe-[17px]",
};
const buttonClass =
  "inline-flex shrink-0 cursor-pointer items-center justify-end text-muted outline-none disabled:cursor-not-allowed disabled:text-disabled";

/**
 * 거른 결과가 없을 때의 글자. 옵션과 같은 여백·글자 크기라 목록 높이가 옵션 하나와 같다. `text-muted`.
 * listbox 밖(같은 목록 표면 안)에 둔다. listbox 자식은 option·group만 될 수 있어서다. 결과 개수(0개)는 React Aria가
 * live region으로 알린다.
 */
const emptyClass = "px-2 py-1.5 text-body-md text-muted select-none";

/** 목록 상태. Combobox가 고른 값의 node key는 옵션의 `value`(문자열)다. */
type ComboboxListState = ComboBoxState<object>;

/**
 * 한글 IME 조합 중의 keydown인지. 조합 중 Enter·화살표·Esc는 IME가 쓰므로 목록 동작에 쓰지 않는다.
 * Chromium·Firefox는 `isComposing`이 `true`다. Safari는 조합을 끝내는 Enter의 keydown이 compositionend 뒤에
 * `isComposing: false`로 오지만 `keyCode`가 229다(조합 처리 중인 키). 그래서 둘 다 본다.
 */
const isComposingKey = (event: KeyboardEvent): boolean =>
  event.nativeEvent.isComposing || event.keyCode === 229;

/**
 * 글자를 쳐서 옵션을 거르고 하나를 고르는 입력. 치면 목록이 열리고 옵션 글자에 친 글자가 들어 있는 옵션만 남는다
 * (대소문자·악센트 무시, 현재 locale 기준). ↓·↑로 목록을 열고 옵션을 옮겨 Enter로 고르며, chevron 버튼을 누르면 거르지
 * 않은 전체 목록이 열린다. 고르면 닫히고 입력에 그 옵션의 글자가 들어간다. Esc는 닫고 입력을 고른 옵션의 글자로 되돌린다.
 * 포커스가 나가면 고르지 않은 글자는 지워진다(자유 입력 없음). 거른 결과가 없으면 목록에 `emptyMessage`가 보인다.
 * Field 안에 두면 label·설명·오류가 자동으로 연결되고, `name`을 주면 고른 옵션의 `value`가 폼에 제출된다.
 * 상태는 `data-open`·`data-invalid`·네이티브 `:disabled`(입력), `data-open`(목록),
 * `data-highlighted`·`data-selected`·`data-disabled`(옵션)로 노출한다.
 */
export function Combobox({
  value,
  defaultValue,
  onValueChange,
  onOpenChange,
  emptyMessage = "결과가 없습니다",
  name,
  form,
  size = "md",
  invalid,
  disabled,
  required,
  readOnly,
  id,
  ref,
  className,
  children,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: ComboboxProps): ReactElement {
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
  // 대소문자·악센트를 무시하는 locale 기준 「포함」 검사(React Aria ComboBox 기본 거르기와 같다).
  const { contains } = useFilter({ sensitivity: "base" });
  const state = useComboBoxState<object>({
    // useComboBoxState의 children 타입은 React Stately 요소(Item·Section)지만, 같은 방식으로 getCollectionNode를 붙인
    // Tide 옵션 요소를 넘긴다(list-collection.ts, Select와 같다).
    children: items as unknown as Parameters<typeof useComboBoxState<object>>[0]["children"],
    defaultFilter: contains,
    value,
    defaultValue,
    onChange: (key) => onValueChange?.(key == null ? null : String(key)),
    onOpenChange: (open) => onOpenChange?.(open),
    // 거른 결과가 없어도 목록을 닫지 않고 「결과 없음」을 보인다.
    allowsEmptyCollection: true,
    isDisabled,
    isReadOnly: readOnly,
    isRequired,
    // 필수 검사는 네이티브 제약 검사(입력의 required)로 한다. 비면 제출을 막고 입력으로 포커스를 옮긴다.
    validationBehavior: "native",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listBoxRef = useRef<HTMLDivElement>(null);
  // Field의 label은 `<label for>`로 입력의 이름이 되고, labelId를 aria-labelledby로도 넘겨 목록·버튼의 이름에 쓴다.
  const { inputProps, buttonProps, listBoxProps, isInvalid } = useComboBox<object>(
    {
      inputRef,
      buttonRef,
      popoverRef,
      listBoxRef,
      id: control.id,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy ?? field?.labelId,
      isDisabled,
      isReadOnly: readOnly,
      isRequired,
      validationBehavior: "native",
    },
    state,
  );
  const { buttonProps: chevronProps } = useButton(buttonProps, buttonRef);
  const mergedRef = useMemo(() => mergeRefs(ref, inputRef), [ref, inputRef]);
  const showInvalid = control["data-invalid"] === "" || isInvalid;
  const { onKeyDown: ariaKeyDown, ...ariaInputProps } = inputProps;

  return (
    <div className={wrapperClass}>
      <input
        {...mergeProps(props, ariaInputProps)}
        ref={mergedRef}
        // IME 조합 중의 키는 React Aria 목록 동작에 넘기지 않는다(Enter로 조합을 끝낼 때 고르거나 입력을 되돌리지 않게).
        // 앱이 준 onKeyDown은 늘 먼저 부른다.
        onKeyDown={(event) => {
          props.onKeyDown?.(event);
          if (!isComposingKey(event)) ariaKeyDown?.(event);
        }}
        // useComboBox(useTextField·useField)는 값 요소와 자기 설명·오류 요소 자리의 id를 aria-describedby에 넣는다. Tide는
        // 그 요소를 그리지 않고 Field가 설명·오류를 그리므로 Field 연결 값만 쓴다(Select와 같다).
        aria-describedby={control["aria-describedby"]}
        aria-invalid={showInvalid ? true : control["aria-invalid"]}
        data-invalid={showInvalid ? "" : undefined}
        data-open={state.isOpen ? "" : undefined}
        className={cn(inputSizeClass[size], inputBaseClass, inputEndClass[size], className)}
      />
      <button {...chevronProps} ref={buttonRef} className={cn(buttonClass, buttonSizeClass[size])}>
        <ChevronDownIcon size={16} />
      </button>
      {name !== undefined && (
        <input
          type="hidden"
          name={name}
          form={form}
          value={state.selectedKey == null ? "" : String(state.selectedKey)}
          disabled={isDisabled}
        />
      )}
      <ComboboxPopover
        state={state}
        inputRef={inputRef}
        popoverRef={popoverRef}
        listBoxRef={listBoxRef}
        listBoxProps={listBoxProps}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}

type ComboboxListBoxProps = ReturnType<typeof useComboBox<object>>["listBoxProps"];

interface ComboboxPopoverProps {
  readonly state: ComboboxListState;
  readonly inputRef: RefObject<HTMLInputElement | null>;
  readonly popoverRef: RefObject<HTMLDivElement | null>;
  readonly listBoxRef: RefObject<HTMLDivElement | null>;
  readonly listBoxProps: ComboboxListBoxProps;
  readonly emptyMessage: ReactNode;
}

/**
 * 목록을 DOM에 둘지 정하고 portal한다. 닫혀도 퇴장 전환이 끝날 때까지 남긴다(ADR 0018).
 * 포커스는 입력에 머물므로 FocusScope로 감싸지 않는다(`focusManagement={false}`). 감싸면 바깥 빈 곳을 눌러 포커스가
 * body로 간 뒤 목록이 빠질 때 FocusScope가 입력으로 포커스를 되돌린다(react-aria 3.53.1 FocusScope restoreFocus).
 */
function ComboboxPopover(props: ComboboxPopoverProps): ReactElement | null {
  const present = useOverlayPresence(props.state.isOpen, props.popoverRef);
  if (!present) return null;
  return (
    <OverlayPortal isExiting={!props.state.isOpen} focusManagement={false}>
      <ComboboxPopoverInner {...props} />
    </OverlayPortal>
  );
}

/**
 * 목록 표면(`listPopupClass`)과 그 안의 `role="listbox"`. 입력 아래 시작 끝에 4px 떨어져 붙고(Select와 같다),
 * 폭은 입력보다 좁지 않다. 거른 결과가 없으면 listbox 뒤에 `emptyMessage`를 보인다.
 */
function ComboboxPopoverInner({
  state,
  inputRef,
  popoverRef,
  listBoxRef,
  listBoxProps,
  emptyMessage,
}: ComboboxPopoverProps): ReactElement {
  useOverlayTheme(inputRef, popoverRef);
  // 목록 폭이 입력보다 좁지 않게 한다. 위치를 계산하기 전(위치 hook보다 먼저)에 붙인다(Select와 같다).
  // 다만 화면 폭에서 위치 여백(React Aria containerPadding 12px, 양쪽)을 뺀 것보다 넓지 않게 한다. 입력이 화면을 꽉
  // 채우면(모바일) 목록이 화면 밖으로 넘치고, 옵션을 화면에 보이려는 스크롤이 문서를 움직여 non-modal 목록이 닫힌다
  // (react-aria 3.53.1 useCloseOnScroll, 테스트로 확인).
  useLayoutEffect(() => {
    const popover = popoverRef.current;
    const width = inputRef.current?.offsetWidth;
    if (popover && width) popover.style.minWidth = `min(${width}px, 100vw - 24px)`;
  }, [inputRef, popoverRef]);
  // 입력이 목록 바깥이라 non-modal이다. 바깥을 inert로 막거나 바깥 누름으로 닫지 않고, 포커스가 입력을 떠나면
  // useComboBox가 닫는다. 보조기술에서는 useComboBox가 입력과 목록 밖을 숨긴다(aria-hidden).
  const { overlayProps } = usePopoverOverlay(
    { triggerRef: inputRef, popoverRef, placement: "bottom start", offset: 4, nonModal: true },
    state,
  );
  const { listBoxProps: listProps } = useListBox(listBoxProps, state, listBoxRef);
  const empty = state.collection.size === 0;

  return (
    <div
      {...overlayProps}
      ref={popoverRef}
      data-open={state.isOpen ? "" : undefined}
      className={listPopupClass}
    >
      <div {...listProps} ref={listBoxRef} className="outline-none">
        <ListBoxNodes state={state} />
      </div>
      {empty && <div className={emptyClass}>{emptyMessage}</div>}
    </div>
  );
}

export interface ComboboxItemProps extends ListBoxOptionProps {}

/**
 * Combobox의 옵션(`role="option"`). `Combobox`나 `ComboboxSection` 바로 안에 둔다. `value`가 고른 값이고 폼에
 * 제출된다. 거르기와 고른 뒤 입력에 들어가는 글자는 `textValue`(기본은 내용의 글자)다. 키보드 위치와 마우스를 올린
 * 옵션은 highlight, 고른 옵션은 neutral subtle-active 배경과 끝의 체크 아이콘이다(Select 옵션과 같다).
 * 상태는 `data-highlighted`, `data-selected`, `data-disabled`로 노출한다.
 */
export function ComboboxItem(_props: ComboboxItemProps): null {
  // 렌더하지 않는다. Combobox가 컬렉션으로 모아 그린다(listbox.tsx).
  return null;
}
asCollectionComponent(ComboboxItem, valueItemCollectionNode);

export interface ComboboxSectionProps extends ListBoxSectionProps {}

/**
 * 옵션 묶음(`role="group"`). `heading`이 화면에 보이는 제목이자 묶음의 이름이고, 없으면 `aria-label`이 이름이다.
 * 거른 결과 묶음 안에 남은 옵션이 없으면 묶음도 빠진다.
 */
export function ComboboxSection(_props: ComboboxSectionProps): null {
  // 렌더하지 않는다. Combobox가 컬렉션으로 모아 그린다(listbox.tsx).
  return null;
}
asCollectionComponent(ComboboxSection, sectionCollectionNode);
