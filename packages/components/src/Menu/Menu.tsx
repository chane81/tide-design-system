"use client";
// 트리거에 동작 목록을 띄우는 Menu(tide-v0-impl 티켓 27). React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useMenuTrigger, useMenu, useMenuItem, useMenuSection, usePress, mergeProps, mergeRefs),
// react-stately 3.51.0(useMenuTriggerState, useTreeState). 위치·portal·motion은 오버레이 공통 부분(ADR 0018),
// 목록·항목 class와 항목 모으기는 목록 공통 부분(constants/listClass.ts, libs/listCollection.ts, ADR 0019)을 쓴다.
//
// 구조:
// - `Menu`: 열림 상태만 갖는다(DOM 없음). `open`/`defaultOpen`/`onOpenChange(open)`.
// - `MenuTrigger`: 기본 `<button type="button">`. 마우스는 누르는 순간, 키보드는 Enter·Space·↓(첫 항목)·↑(마지막 항목)로
//   연다. `aria-haspopup`, `aria-expanded`, 열렸을 때 `aria-controls`, `data-open`이 붙는다.
// - `MenuContent`: `document.body`로 portal한 `role="menu"` 요소. 화살표·Home/End·글자로 항목을 옮겨 다니고,
//   Esc·바깥 누름·Tab으로 닫히며 포커스는 트리거로 돌아온다.
// - `MenuItem`: `role="menuitem"`. Enter·Space·누름으로 실행(`onClick`)하고 메뉴를 닫는다.
// - `MenuSection`: 항목 묶음(`role="group"`). 제목(`heading`)이 이름이 되고, 묶음 앞뒤에 구분선이 그려진다.

import {
  createContext,
  createElement,
  use,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import {
  mergeProps,
  mergeRefs,
  useMenu,
  useMenuItem,
  useMenuSection,
  useMenuTrigger,
  usePress,
} from "react-aria";
import {
  useMenuTriggerState,
  useTreeState,
  type MenuTriggerState,
  type TreeState,
} from "react-stately";

import { cn } from "./libs/cn.ts";
import {
  asCollectionComponent,
  itemCollectionNode,
  resolveCollectionChildren,
  sectionCollectionNode,
  type CollectionItemProps,
  type CollectionSectionProps,
} from "./libs/listCollection.ts";
import {
  listHeadingClass,
  listItemClass,
  listPopupClass,
  listSeparatorClass,
} from "./constants/listClass.ts";
import { OverlayPortal } from "./components/OverlayPortal.tsx";
import { useCloseOnTab } from "./hooks/useCloseOnTab.ts";
import { useOverlayPresence } from "./hooks/useOverlayPresence.ts";
import { useOverlayTheme } from "./hooks/useOverlayTheme.ts";
import { usePopoverOverlay } from "./hooks/usePopoverOverlay.ts";
import type { OverlayPlacement } from "./libs/overlayPosition.ts";
import { renderElement } from "./libs/renderElement.ts";

/** Menu 목록의 위치. 앞은 트리거의 어느 쪽, 뒤는 그 변에서 맞출 끝이다. 공간이 모자라면 반대쪽으로 뒤집힌다. */
export type MenuPlacement = OverlayPlacement;

type MenuTriggerAria = ReturnType<typeof useMenuTrigger<unknown>>;

interface MenuContextValue {
  readonly state: MenuTriggerState;
  readonly triggerRef: RefObject<HTMLElement | null>;
  /** useMenuTrigger가 만든 트리거 props(누름·키보드 열기, aria-haspopup·expanded·controls) */
  readonly menuTriggerProps: MenuTriggerAria["menuTriggerProps"];
  /** useMenuTrigger가 만든 목록 props(id, 처음 포커스 위치, 닫기) */
  readonly menuProps: MenuTriggerAria["menuProps"];
  /** 트리거 요소 id. 목록에 이름이 없을 때 aria-labelledby로 쓴다. */
  readonly triggerId: string;
  readonly setTriggerId: (id: string) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext(part: string): MenuContextValue {
  const context = use(MenuContext);
  if (!context) throw new Error(`${part}는 Menu 안에 둔다.`);
  return context;
}

export interface MenuProps {
  /** 열림 상태(제어). 주면 `onOpenChange`로 바꾼다. */
  open?: boolean;
  /** 처음 열림 상태(비제어). 기본값은 `false`다. */
  defaultOpen?: boolean;
  /** 열림 상태가 바뀌려 할 때 새 값으로 부른다. 항목을 실행해 닫힐 때도 부른다. */
  onOpenChange?: (open: boolean) => void;
  /** `MenuTrigger`와 `MenuContent` */
  children: ReactNode;
}

/**
 * 트리거와 동작 목록을 잇는 열림 상태. DOM 요소를 만들지 않는다.
 * 안에 `MenuTrigger` 하나와 `MenuContent` 하나를 둔다.
 */
export function Menu({ open, defaultOpen, onOpenChange, children }: MenuProps): ReactElement {
  const state = useMenuTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const triggerRef = useRef<HTMLElement>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger<unknown>({}, state, triggerRef);
  const generatedTriggerId = useId();
  const [triggerId, setTriggerId] = useState(generatedTriggerId);
  const value = useMemo<MenuContextValue>(
    () => ({ state, triggerRef, menuTriggerProps, menuProps, triggerId, setTriggerId }),
    [state, menuTriggerProps, menuProps, triggerId],
  );
  return <MenuContext value={value}>{children}</MenuContext>;
}

export interface MenuTriggerProps extends ComponentProps<"button"> {
  /**
   * 다른 요소로 렌더한다. 예: `render={<Button variant="outline" />}`, `render={<IconButton aria-label="더보기" />}`.
   * props, ref, className, 이벤트 핸들러를 그 요소에 병합한다. 기본은 class 없는 `<button type="button">`이다.
   */
  render?: ReactElement;
}

/**
 * Menu를 여는 버튼. 마우스는 누르는 순간 열고, 키보드는 Enter·Space·↓로 열어 첫 항목에, ↑로 열어 마지막 항목에
 * 위치한다. `aria-haspopup`, `aria-expanded`, 열렸을 때 `aria-controls`와 `data-open`이 붙는다.
 */
export function MenuTrigger({
  render,
  ref,
  id,
  className,
  ...props
}: MenuTriggerProps): ReactElement {
  const { state, triggerRef, menuTriggerProps, triggerId, setTriggerId } =
    useMenuContext("MenuTrigger");
  // useMenuTrigger의 누름 props(onPressStart·onPress·preventFocusOnPress)는 React Aria press 이벤트다. 트리거는
  // render로 Tide Button 등 다른 요소가 되므로 useButton 대신 press 동작만 usePress로 붙인다(Popover와 같다).
  // id는 아래에서 앱 id 또는 Menu가 만든 id로 정한다.
  const {
    onPressStart,
    onPress,
    preventFocusOnPress,
    id: _ariaId,
    isDisabled: _isDisabled,
    ...ariaProps
  } = menuTriggerProps;
  const { pressProps } = usePress({ onPressStart, onPress, preventFocusOnPress, ref: triggerRef });
  const mergedRef = useMemo(() => mergeRefs(ref, triggerRef), [ref, triggerRef]);
  const resolvedId = id ?? triggerId;
  useLayoutEffect(() => {
    if (resolvedId !== triggerId) setTriggerId(resolvedId);
  }, [resolvedId, triggerId, setTriggerId]);

  const merged = {
    ...mergeProps(props, ariaProps, pressProps),
    id: resolvedId,
    ref: mergedRef,
    "data-open": state.isOpen ? "" : undefined,
  };
  if (!render) {
    // 기본 요소는 class가 없다. className을 주면 그대로 붙는다.
    return createElement("button", { type: "button", ...merged, className });
  }
  return renderElement({
    defaultElement: "button",
    render,
    baseClassName: "",
    props: { ...merged, className },
  });
}

export interface MenuContentProps extends Omit<ComponentProps<"div">, "id" | "role"> {
  /** 트리거 기준 위치. 기본값은 `bottom start`(아래, 시작 끝 맞춤)다. 공간이 모자라면 반대쪽으로 뒤집힌다. */
  placement?: MenuPlacement;
  /** 트리거와의 간격(px). 기본값은 `4`다. */
  offset?: number;
  /** `MenuItem`과 `MenuSection`. 이 요소들을 바로 아래(또는 Fragment·배열 안)에 둔다. */
  children?: ReactNode;
}

/**
 * 트리거 옆에 뜨는 동작 목록(`role="menu"`). 열릴 때만 `document.body`에 portal로 렌더하고 `z-popover`로 쌓는다.
 * 바로 나타나고, 닫히면 opacity만 `fast`(150ms)로 사라진다.
 * 열려 있으면 `data-open`이, 트리거 기준 방향이 `data-placement`(`top`/`bottom`/`left`/`right`)로 붙는다.
 */
export function MenuContent(props: MenuContentProps): ReactElement | null {
  const context = useMenuContext("MenuContent");
  const popoverRef = useRef<HTMLDivElement>(null);
  const present = useOverlayPresence(context.state.isOpen, popoverRef);
  if (!present) return null;
  // Menu는 항목에 포커스가 오므로 FocusScope로 감싸(focusManagement 기본값) 닫힐 때 트리거로 포커스를 돌려준다.
  return (
    <OverlayPortal isExiting={!context.state.isOpen}>
      <MenuContentInner {...props} context={context} popoverRef={popoverRef} />
    </OverlayPortal>
  );
}

interface MenuContentInnerProps extends MenuContentProps {
  readonly context: MenuContextValue;
  readonly popoverRef: RefObject<HTMLDivElement | null>;
}

/** DOM에 있는 동안만 portal 안에서 렌더한다. React Aria 오버레이·목록 hook은 요소가 있다고 보고 동작한다. */
function MenuContentInner({
  context,
  popoverRef,
  placement = "bottom start",
  offset = 4,
  ref,
  className,
  children,
  ...props
}: MenuContentInnerProps): ReactElement {
  const { state, triggerRef, menuProps, triggerId } = context;
  useOverlayTheme(triggerRef, popoverRef);
  const { overlayProps } = usePopoverOverlay({ triggerRef, popoverRef, placement, offset }, state);
  const items = useMemo(() => resolveCollectionChildren(children), [children]);
  // useTreeState의 children 타입은 React Stately 요소(Item·Section)지만, 같은 방식으로 getCollectionNode를 붙인
  // Tide 항목 요소를 넘긴다(libs/listCollection.ts).
  const tree = useTreeState<object>({
    children: items as unknown as Parameters<typeof useTreeState<object>>[0]["children"],
  });
  // 이름이 없으면 트리거 글자를 이름으로 쓴다(useMenuTrigger 기본값과 같지만 앱이 트리거 id를 바꿀 수 있다).
  const labelledBy = props["aria-labelledby"] ?? (props["aria-label"] ? undefined : triggerId);
  const { menuProps: ariaMenuProps } = useMenu(
    { ...menuProps, "aria-label": props["aria-label"], "aria-labelledby": labelledBy },
    tree,
    popoverRef,
  );
  const mergedRef = useMemo(() => mergeRefs(ref, popoverRef), [ref, popoverRef]);
  // Tab은 메뉴를 닫고 포커스를 트리거로 돌린다(WAI-ARIA APG Menu Button). React Aria useMenu는 Tab을 다루지 않는다.
  useCloseOnTab(popoverRef, state.close);
  const { style: _style, ...rest } = mergeProps(props, overlayProps, ariaMenuProps);
  const nodes = [...tree.collection];

  return (
    <div
      {...rest}
      ref={mergedRef}
      data-open={state.isOpen ? "" : undefined}
      className={cn(listPopupClass, className)}
      // 위치 style(React Aria) 위에 사용자 style을 덮는다.
      style={{ ...overlayProps.style, ...props.style }}
    >
      {nodes.map((node, index) => {
        // 묶음 앞뒤에 구분선을 그린다. 목록 처음·끝과 이어진 구분선은 그리지 않는다.
        const previous = nodes[index - 1];
        const separator =
          previous !== undefined && (node.type === "section" || previous.type === "section");
        const element =
          node.type === "section" ? (
            <MenuSectionView key={node.key} node={node} tree={tree} />
          ) : (
            <MenuItemView key={node.key} node={node} tree={tree} />
          );
        if (!separator) return element;
        return [
          <div
            key={`${String(node.key)}-separator`}
            role="separator"
            className={listSeparatorClass}
          />,
          element,
        ];
      })}
    </div>
  );
}

type CollectionNode = TreeState<object>["collection"] extends Iterable<infer N> ? N : never;

export interface MenuItemProps
  extends Omit<ComponentProps<"div">, "role" | "children">, CollectionItemProps {
  /** 항목 내용. 아이콘(장식용)과 글자를 함께 둘 수 있다. */
  children?: ReactNode;
  /**
   * 항목을 실행할 때 부른다. 마우스·터치 누름뿐 아니라 Enter·Space도 click으로 실행한다(네이티브 버튼과 같다).
   * 실행하면 메뉴가 닫힌다. `disabled`면 부르지 않는다.
   */
  onClick?: ComponentProps<"div">["onClick"];
}

/**
 * Menu의 동작 항목(`role="menuitem"`). `MenuContent`나 `MenuSection` 바로 안에 둔다.
 * 키보드 위치와 마우스를 올린 항목은 highlight(primary subtle 배경, primary 글자)로 바로 바뀐다.
 * 상태는 `data-highlighted`(키보드 위치·hover), `data-disabled`(비활성)로 노출한다.
 */
export function MenuItem(_props: MenuItemProps): null {
  // 렌더하지 않는다. MenuContent가 컬렉션으로 모아 MenuItemView로 그린다.
  return null;
}
asCollectionComponent(MenuItem, itemCollectionNode);

export interface MenuSectionProps extends CollectionSectionProps {
  /** 묶음 감싸개(`<div role="presentation">`)에 붙는 class */
  className?: string;
  /** `MenuItem`. 바로 아래(또는 Fragment·배열 안)에 둔다. */
  children?: ReactNode;
}

/**
 * 항목 묶음(`role="group"`). `heading`이 화면에 보이는 제목이자 묶음의 이름이고, 없으면 `aria-label`이 이름이다.
 * 앞뒤 다른 항목·묶음과의 사이에 구분선(`role="separator"`)이 그려진다.
 */
export function MenuSection(_props: MenuSectionProps): null {
  // 렌더하지 않는다. MenuContent가 컬렉션으로 모아 MenuSectionView로 그린다.
  return null;
}
asCollectionComponent(MenuSection, sectionCollectionNode);

interface ViewProps {
  readonly node: CollectionNode;
  readonly tree: TreeState<object>;
}

/** 항목 하나를 그린다. node.props는 앱이 MenuItem에 준 props(와 컬렉션이 더한 isDisabled)다. */
function MenuItemView({ node, tree }: ViewProps): ReactElement {
  const itemRef = useRef<HTMLDivElement>(null);
  const {
    ref,
    className,
    onClick,
    disabled: _disabled,
    textValue: _textValue,
    isDisabled: _isDisabled,
    children: _children,
    id,
    ...props
  } = node.props as MenuItemProps & { isDisabled?: boolean };
  // 사용자 onClick은 useMenuItem에 넘긴다. 비활성 항목에는 click 처리가 붙지 않으므로 부르지 않는다.
  const { menuItemProps, isFocused, isDisabled } = useMenuItem(
    {
      key: node.key,
      id,
      // 항목 요소는 div다. React Aria는 focusable 요소 일반으로 적어 두었다.
      onClick: onClick as Parameters<typeof useMenuItem>[0]["onClick"],
      "aria-label": props["aria-label"],
    },
    tree,
    itemRef,
  );
  const mergedRef = useMemo(() => mergeRefs(ref, itemRef), [ref, itemRef]);
  // useMenuItem은 글자·설명·단축키를 따로 둘 자리의 id를 aria-labelledby·describedby로 건다. Tide 항목은 내용 전체가
  // 이름이므로 그 id를 빼고 앱이 준 값만 남긴다(없는 id를 가리키지 않게).
  const merged = mergeProps(props, menuItemProps);
  return (
    <div
      {...merged}
      ref={mergedRef}
      aria-labelledby={props["aria-labelledby"]}
      aria-describedby={props["aria-describedby"]}
      data-highlighted={isFocused ? "" : undefined}
      data-disabled={isDisabled ? "" : undefined}
      className={cn(listItemClass, className)}
    >
      {node.rendered}
    </div>
  );
}

/** 묶음 하나를 그린다. 제목은 보조기술에서 숨기고(`presentation`) 묶음의 이름으로만 쓴다(useMenuSection). */
function MenuSectionView({ node, tree }: ViewProps): ReactElement {
  const { className } = node.props as MenuSectionProps;
  const { itemProps, headingProps, groupProps } = useMenuSection({
    heading: node.rendered,
    "aria-label": node["aria-label"],
  });
  return (
    <div {...itemProps} className={className}>
      {node.rendered != null && (
        <div {...headingProps} className={listHeadingClass}>
          {node.rendered}
        </div>
      )}
      <div {...groupProps}>
        {[...node.childNodes].map((child) => (
          <MenuItemView key={child.key} node={child} tree={tree} />
        ))}
      </div>
    </div>
  );
}
