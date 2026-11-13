"use client";
import type { ComponentProps, ReactElement } from "react";

import { cn } from "../../_internal/libs/cn.ts";
import { tabPanelClass } from "../constants/tabsClass.ts";
import { useTabsContext } from "../hooks/useTabsContext.ts";

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
