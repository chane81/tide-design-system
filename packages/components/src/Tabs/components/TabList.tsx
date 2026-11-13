"use client";
import {
  isValidElement,
  useMemo,
  useRef,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { mergeProps, mergeRefs, useTabList } from "react-aria";
import { useTabListState } from "react-stately";

import { cn } from "../../_internal/libs/cn";
import { resolveCollectionChildren } from "../../_internal/libs/listCollection";
import { tabListOrientationClass } from "../constants/tabsClass";
import { useTabsContext } from "../hooks/useTabsContext";
import { TabView } from "./TabView";

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
  // Tide 탭 요소를 넘긴다(_internal/libs/listCollection.ts).
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
