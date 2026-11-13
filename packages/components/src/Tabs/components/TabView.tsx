"use client";
import { useMemo, useRef, type ReactElement } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { mergeProps, mergeRefs, useTab } from "react-aria";
import type { TabListState } from "react-stately";

import { cn } from "../../_internal/libs/cn.ts";
import { tabBaseClass, tabOrientationClass } from "../constants/tabsClass.ts";
import type { TabsContextValue } from "../hooks/useTabsContext.ts";
import type { CollectionNode } from "../types.ts";
import type { TabProps } from "./Tab.tsx";

export interface TabViewProps {
  readonly node: CollectionNode;
  readonly state: TabListState<object>;
  readonly context: TabsContextValue;
}

/** 탭 하나를 그린다. node.props는 앱이 Tab에 준 props(와 컬렉션이 더한 isDisabled)다. */
export function TabView({ node, state, context }: TabViewProps): ReactElement {
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
