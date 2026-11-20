import type { ReactElement, Ref } from "react";

import { tabIndicatorClass } from "../constants/tabsClass";
import type { TabsOrientation, TabsShape } from "../types";

export interface TabIndicatorProps {
  readonly ref: Ref<HTMLSpanElement>;
  readonly shape: TabsShape;
  readonly orientation: TabsOrientation;
}

/** 고른 탭 아래에 놓이는 고른 표시 하나. 자리는 useTabIndicator가 CSS 변수로 적는다. */
export function TabIndicator({ ref, shape, orientation }: TabIndicatorProps): ReactElement {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      data-indicator=""
      className={tabIndicatorClass[shape][orientation]}
    />
  );
}
