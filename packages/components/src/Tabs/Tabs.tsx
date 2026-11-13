"use client";
// 같은 영역의 여러 패널을 바꾸는 Tabs(tide-v0-impl 티켓 31). React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useTabList, useTab, mergeProps, mergeRefs), react-stately 3.51.0(useTabListState).
// 탭은 목록 공통 부분(_internal/libs/listCollection.ts, ADR 0019)으로 모은다. 탭의 `value`가 컬렉션 key다(`valueItemCollectionNode`).
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
  useCallback,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";

import { cn } from "../_internal/libs/cn.ts";
import { tabsOrientationClass } from "./constants/tabsClass.ts";
import { TabsContext, type TabsContextValue } from "./hooks/useTabsContext.ts";
import type { TabsActivationMode, TabsOrientation } from "./types.ts";

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
