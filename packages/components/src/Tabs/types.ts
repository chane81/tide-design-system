import type { TabListState } from "react-stately";

/** 탭 목록의 방향. 세로면 ↓↑로 옮기고 탭 목록이 패널의 시작쪽에 선다. */
export type TabsOrientation = "horizontal" | "vertical";

/** 키보드로 탭을 옮겼을 때 바로 고를지(`automatic`), Enter·Space로 고를지(`manual`). */
export type TabsActivationMode = "automatic" | "manual";

export type CollectionNode =
  TabListState<object>["collection"] extends Iterable<infer N> ? N : never;
