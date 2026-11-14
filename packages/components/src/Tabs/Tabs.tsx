"use client";
// 패널은 TabList 밖이라 useTabPanel에 같은 상태 객체를 줄 수 없다. 루트가 만든 id로 탭·패널 id와 연결 속성을
// 덮어쓴다. React Aria는 키보드 이동에 탭 id가 아니라 `data-key`를 쓴다.

import {
  useCallback,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";

import { cn } from "../_internal/libs/cn";
import { tabsOrientationClass } from "./constants/tabsClass";
import { TabsContext, type TabsContextValue } from "./hooks/useTabsContext";
import type { TabsActivationMode, TabsOrientation } from "./types";

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

interface TabsBaseOwnProps {
  /** 고른 탭이 바뀌려 할 때 부른다. 같은 탭을 다시 누르면 부르지 않고, 준 값의 탭이 없으면 첫 활성 탭으로 부른다. */
  onValueChange?: (value: string) => void;
  /** 탭 목록의 방향. 기본값은 `horizontal`이다. 세로면 ↓↑로 옮기고 탭 목록이 패널의 시작쪽에 선다. */
  orientation?: TabsOrientation;
  /** 키보드로 옮기면 바로 고를지(`automatic`, 기본값), Enter·Space로 고를지(`manual`). 패널이 느리면 `manual`. */
  activationMode?: TabsActivationMode;
  /** `TabList` 하나와 `TabPanel`들 */
  children?: ReactNode;
}

export type TabsOwnProps = TabsBaseOwnProps & TabsValueProps;

export type TabsProps = TabsOwnProps & Omit<ComponentProps<"div">, keyof TabsOwnProps | "onChange">;

/**
 * 같은 영역의 여러 패널 중 하나를 고르는 탭 묶음. 루트는 `<div>`이고 방향이 `data-orientation`으로 붙는다.
 * 안에 `TabList` 하나와 탭마다 `TabPanel`을 둔다.
 * Tide props: `value`, `defaultValue`, `onValueChange`, `orientation`, `activationMode`, `children` ({@link TabsOwnProps}). 나머지는 `<div>` 속성.
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
