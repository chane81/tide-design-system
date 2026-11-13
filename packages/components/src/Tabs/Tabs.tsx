"use client";
// 같은 영역의 여러 패널을 바꾸는 Tabs(tide-v0-impl 티켓 31). React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useTabList, useTab, mergeProps, mergeRefs), react-stately 3.51.0(useTabListState).
// 탭은 목록 공통 부분(libs/listCollection.ts, ADR 0019)으로 모은다. 탭의 `value`가 컬렉션 key다(`valueItemCollectionNode`).
// 접근성 패턴은 WAI-ARIA APG Tabs(자동·수동 활성화, 화살표·Home/End, 세로 tablist)를 따른다.
//
// 구조:
// - `Tabs`: 루트 `<div>`. 고른 값(`value`/`defaultValue`/`onValueChange`), 방향(`orientation`), 활성화 방식
//   (`activationMode`)을 갖고 탭과 패널을 잇는 id를 만든다.
// - `TabList`: `role="tablist"`. 안의 `Tab`을 컬렉션으로 모아 `useTabListState`·`useTabList`에 넘긴다. 화살표·Home/End·
//   글자(타입어헤드)로 탭을 옮기고 비활성 탭은 건너뛴다. 방향키는 React Aria locale 방향(RTL이면 반대)을 따른다.
// - `Tab`: `<button type="button" role="tab">`. 렌더하지 않는 표시 요소이고 `TabList`가 node로 그린다.
// - `TabPanel`: `role="tabpanel"`. 고른 값과 `value`가 같을 때만 렌더한다.
//
// id 연결: useTab은 탭 id를 `useTabList` 안에서 만든 id(상태 객체에 묶인 WeakMap 값)로 짓는다. 패널은 TabList 밖에 있어
// 그 상태 객체를 받을 수 없으므로(useTabPanel은 같은 상태 객체를 요구한다), 루트가 만든 id로 탭 id·`aria-controls`와
// 패널 id·`aria-labelledby`를 덮어쓴다. React Aria는 탭 id를 키보드 이동에 쓰지 않는다(`data-key`로 찾는다).

import {
  createContext,
  isValidElement,
  use,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { mergeProps, mergeRefs, useTab, useTabList } from "react-aria";
import { useTabListState, type TabListState } from "react-stately";

import { cn } from "../libs/cn.ts";
import {
  asCollectionComponent,
  resolveCollectionChildren,
  valueItemCollectionNode,
  type CollectionValueItemProps,
} from "../libs/listCollection.ts";

/** 탭 목록의 방향. 세로면 ↓↑로 옮기고 탭 목록이 패널의 시작쪽에 선다. */
export type TabsOrientation = "horizontal" | "vertical";

/** 키보드로 탭을 옮겼을 때 바로 고를지(`automatic`), Enter·Space로 고를지(`manual`). */
export type TabsActivationMode = "automatic" | "manual";

interface TabsContextValue {
  readonly value: string;
  readonly setValue: (value: string) => void;
  readonly orientation: TabsOrientation;
  readonly activationMode: TabsActivationMode;
  readonly tabId: (value: string) => string;
  readonly panelId: (value: string) => string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(part: string): TabsContextValue {
  const context = use(TabsContext);
  if (!context) throw new Error(`${part}는 Tabs 안에 둔다.`);
  return context;
}

// 루트 class(ADR 0005 손으로 쓴 map). 탭 목록과 패널 사이는 가로 16px, 세로 24px다.
const tabsOrientationClass: Record<TabsOrientation, string> = {
  horizontal: "flex flex-col gap-4",
  vertical: "flex flex-row gap-6",
};

// 탭 목록: 장식용 `border-default` 1px 선 위에 탭이 놓인다. 가로는 아래, 세로는 끝쪽 선이다.
const tabListOrientationClass: Record<TabsOrientation, string> = {
  horizontal: "flex shrink-0 gap-1 border-b border-default",
  vertical: "flex shrink-0 flex-col gap-1 border-e border-default",
};

// 탭(spec 「포커스 표시」·「motion 적용」):
// - 글자 `text-label-md`(14/20), 여백 세로 8px·가로 12px라 높이 36px. 바로 안의 아이콘(장식용)은 16px, 글자와 8px.
// - 색: 기본 `text-muted`, hover `text-default`, 고른 탭 `text-primary`, 비활성 `text-disabled` + `cursor-not-allowed`.
//   글자색은 반복되는 항목이라 transition 없이 바로 바뀐다.
// - 고른 표시(indicator): 탭 목록 선 위에 겹친 2px `border-primary` 막대(`::after`). 색만이 아니라 모양으로도 고른 탭이
//   보인다. 고르지 않은 탭은 막대가 투명(opacity 0)이다.
// - 막대 motion: opacity `fast`(150ms, out). 움직임 줄이기가 아니면 막대가 가운데에서 펼쳐진다(scale 0 → 1). 움직임
//   줄이기에서는 확대 없이 opacity만 바뀐다(spec 「reduced-motion에서는 이동·확대·blur를 opacity로 바꾼다」).
// - forced-colors: 막대 경계색은 브라우저가 CanvasText로 덮는다. 고른 탭이 분명하도록 시스템 강조색(Highlight)으로 고정한다.
// - 포커스: `focus-visible:focus-ring`(ring 2px, offset 2px, 조작 요소 radius md).
const tabBaseClass = [
  "relative flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-label-md whitespace-nowrap text-muted outline-none select-none [&>svg]:size-4 [&>svg]:shrink-0",
  "hover:not-data-selected:enabled:text-default data-selected:text-primary focus-visible:focus-ring",
  "disabled:cursor-not-allowed disabled:text-disabled",
  "after:pointer-events-none after:absolute after:border-primary after:opacity-0 after:transition-opacity data-selected:after:opacity-100",
  "forced-colors:after:forced-color-adjust-none forced-colors:after:border-[Highlight]",
].join(" ");

const tabOrientationClass: Record<TabsOrientation, string> = {
  horizontal:
    "after:inset-x-0 after:-bottom-px after:border-b-2 motion-safe:after:scale-x-0 motion-safe:after:transition-[opacity,scale] motion-safe:data-selected:after:scale-x-100",
  vertical:
    "after:inset-y-0 after:-end-px after:border-e-2 motion-safe:after:scale-y-0 motion-safe:after:transition-[opacity,scale] motion-safe:data-selected:after:scale-y-100",
};

// 패널: 탭 다음 Tab 순서에 들어가므로 포커스 표시가 있다. 세로 배치에서는 남은 폭을 채운다.
const tabPanelClass = "min-w-0 flex-1 rounded-md outline-none focus-visible:focus-ring";

/** id에 쓸 수 없는 공백을 뺀다(React Aria 탭 id와 같은 규칙). */
const idPart = (value: string): string => value.replace(/\s+/g, "");

type TabsValueProps =
  | {
      /** 고른 탭의 값(제어). 주면 `onValueChange`로 바꾼다. */
      value: string;
      defaultValue?: undefined;
    }
  | {
      value?: undefined;
      /** 처음 고른 탭의 값(비제어). 서버 렌더에서도 그 패널이 바로 보이도록 `value`나 `defaultValue` 하나는 꼭 준다. */
      defaultValue: string;
    };

interface TabsBaseProps extends Omit<ComponentProps<"div">, "defaultValue" | "onChange"> {
  /**
   * 고른 탭이 바뀌려 할 때 새 값으로 부른다. 이미 고른 탭을 다시 눌러도 부르지 않는다.
   * 준 값과 같은 탭이 없으면 첫 활성 탭을 고르며 부른다.
   */
  onValueChange?: (value: string) => void;
  /** 탭 목록의 방향. 기본값은 `horizontal`이다. 세로면 ↓↑로 옮기고 탭 목록이 패널의 시작쪽에 선다. */
  orientation?: TabsOrientation;
  /**
   * 키보드로 탭을 옮겼을 때 바로 고를지(`automatic`, 기본값), Enter·Space로 고를지(`manual`)다.
   * 패널을 그리는 데 시간이 걸리면(데이터를 불러오는 패널) `manual`을 쓴다(WAI-ARIA APG).
   */
  activationMode?: TabsActivationMode;
  /** `TabList` 하나와 `TabPanel`들 */
  children?: ReactNode;
}

export type TabsProps = TabsBaseProps & TabsValueProps;

/**
 * 같은 영역의 여러 패널 중 하나를 고르는 탭 묶음. 루트는 `<div>`이고 방향이 `data-orientation`으로 붙는다.
 * 안에 `TabList` 하나와 탭마다 `TabPanel`을 둔다.
 */
export function Tabs({
  value: valueProp,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  activationMode = "automatic",
  ref,
  className,
  children,
  ...props
}: TabsProps): ReactElement {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : internal;
  const setValue = useCallback(
    (next: string) => {
      // React Stately는 이미 고른 탭을 다시 눌러도 onSelectionChange를 부른다. 값이 바뀔 때만 알린다.
      if (next === value) return;
      if (!controlled) setInternal(next);
      onValueChange?.(next);
    },
    [controlled, onValueChange, value],
  );
  const baseId = useId();
  const context = useMemo<TabsContextValue>(
    () => ({
      value,
      setValue,
      orientation,
      activationMode,
      tabId: (tab) => `${baseId}-tab-${idPart(tab)}`,
      panelId: (tab) => `${baseId}-tabpanel-${idPart(tab)}`,
    }),
    [value, setValue, orientation, activationMode, baseId],
  );
  return (
    <div
      {...props}
      ref={ref}
      data-orientation={orientation}
      className={cn(tabsOrientationClass[orientation], className)}
    >
      <TabsContext value={context}>{children}</TabsContext>
    </div>
  );
}

export interface TabListProps extends Omit<ComponentProps<"div">, "role" | "children"> {
  /** `Tab`. 바로 아래(또는 Fragment·배열 안)에 둔다. */
  children?: ReactNode;
}

/**
 * 탭 목록(`role="tablist"`). 화살표로 탭을 옮기고(끝에서 처음으로 돈다) Home·End로 처음·마지막 탭에 간다.
 * 비활성 탭은 건너뛴다. 이름은 `aria-label`이나 `aria-labelledby`로 준다.
 */
export function TabList({ ref, className, children, ...props }: TabListProps): ReactElement {
  const context = useTabsContext("TabList");
  const listRef = useRef<HTMLDivElement>(null);
  const items = useMemo(() => resolveCollectionChildren(children), [children]);
  // 준 값과 같은 탭이 없으면 선택을 비워 넘긴다. useTabListState가 첫 활성 탭을 골라 onSelectionChange로 알린다.
  const known = items.some(
    (item) => isValidElement<{ value?: unknown }>(item) && item.props.value === context.value,
  );
  // useTabListState의 children 타입은 React Stately 요소(Item)지만, 같은 방식으로 getCollectionNode를 붙인
  // Tide 탭 요소를 넘긴다(libs/listCollection.ts).
  const state = useTabListState<object>({
    children: items as unknown as Parameters<typeof useTabListState<object>>[0]["children"],
    // null은 「제어하되 고른 것이 없음」이다(react-stately useControlledState). 타입은 Key만 적혀 있다.
    selectedKey: known ? context.value : (null as unknown as string),
    onSelectionChange: (key) => context.setValue(String(key)),
  });
  const { tabListProps } = useTabList(
    {
      orientation: context.orientation,
      keyboardActivation: context.activationMode,
      "aria-label": props["aria-label"],
      "aria-labelledby": props["aria-labelledby"],
    },
    state,
    listRef,
  );
  const mergedRef = useMemo(() => mergeRefs(ref, listRef), [ref, listRef]);
  return (
    <div
      {...mergeProps(props, tabListProps)}
      ref={mergedRef}
      className={cn(tabListOrientationClass[context.orientation], className)}
    >
      {[...state.collection].map((node) => (
        <TabView key={node.key} node={node} state={state} context={context} />
      ))}
    </div>
  );
}

export interface TabProps
  extends
    Omit<ComponentProps<"button">, "value" | "type" | "role" | "id" | "disabled" | "children">,
    Omit<CollectionValueItemProps, "textValue"> {
  /** 탭 글자. 아이콘(장식용)과 글자를 함께 둘 수 있다. */
  children?: ReactNode;
}

/**
 * 탭 하나(`role="tab"`). `TabList` 바로 안에 두고, 같은 `value`의 `TabPanel`과 이어진다.
 * 고른 탭은 `data-selected`와 `aria-selected="true"`이고 primary 글자와 아래(세로면 끝쪽) 막대로 보인다.
 * `disabled`면 네이티브 `disabled`라 고를 수 없고 키보드 이동도 건너뛴다.
 */
export function Tab(_props: TabProps): null {
  // 렌더하지 않는다. TabList가 컬렉션으로 모아 TabView로 그린다.
  return null;
}
asCollectionComponent(Tab, valueItemCollectionNode);

type CollectionNode = TabListState<object>["collection"] extends Iterable<infer N> ? N : never;

interface TabViewProps {
  readonly node: CollectionNode;
  readonly state: TabListState<object>;
  readonly context: TabsContextValue;
}

/** 탭 하나를 그린다. node.props는 앱이 Tab에 준 props(와 컬렉션이 더한 isDisabled)다. */
function TabView({ node, state, context }: TabViewProps): ReactElement {
  const tabRef = useRef<HTMLButtonElement>(null);
  const {
    ref,
    className,
    value,
    disabled: _disabled,
    isDisabled: _isDisabled,
    children: _children,
    // useTab이 탭 props로 useFocusable을 불러 이 처리기들을 이미 붙인다. 다시 병합하면 두 번 불린다.
    onFocus: _onFocus,
    onBlur: _onBlur,
    onKeyDown: _onKeyDown,
    onKeyUp: _onKeyUp,
    autoFocus: _autoFocus,
    ...props
  } = node.props as TabProps & { isDisabled?: boolean };
  const { tabProps, isSelected, isDisabled } = useTab({ key: node.key }, state, tabRef);
  const mergedRef = useMemo(() => mergeRefs(ref, tabRef), [ref, tabRef]);
  return (
    <button
      {...mergeProps(props, tabProps)}
      ref={mergedRef}
      type="button"
      id={context.tabId(value)}
      aria-controls={isSelected ? context.panelId(value) : undefined}
      disabled={isDisabled || undefined}
      data-selected={isSelected ? "" : undefined}
      className={cn(tabBaseClass, tabOrientationClass[context.orientation], className)}
    >
      {node.rendered}
    </button>
  );
}

export interface TabPanelProps extends Omit<ComponentProps<"div">, "id" | "role"> {
  /** 이어지는 `Tab`의 값. 그 탭을 고른 동안만 렌더한다. */
  value: string;
}

/**
 * 탭 하나의 내용(`role="tabpanel"`). 같은 `value`의 탭을 고른 동안만 렌더하고, 그 탭이 이름이 된다(`aria-labelledby`).
 * 탭 다음 Tab 순서에 들어간다(`tabIndex` 기본 `0`). 첫 내용이 조작 요소면 `tabIndex={-1}`로 뺄 수 있다.
 */
export function TabPanel({
  value,
  ref,
  className,
  tabIndex = 0,
  ...props
}: TabPanelProps): ReactElement | null {
  const context = useTabsContext("TabPanel");
  if (context.value !== value) return null;
  return (
    <div
      {...props}
      ref={ref}
      role="tabpanel"
      id={context.panelId(value)}
      aria-labelledby={context.tabId(value)}
      tabIndex={tabIndex}
      className={cn(tabPanelClass, className)}
    />
  );
}
