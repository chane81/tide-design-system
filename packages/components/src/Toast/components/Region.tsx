"use client";
import { useMemo, useRef, type ReactElement } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고: Vite 사전 번들 목록이 바뀌지 않는다).
import { mergeProps, mergeRefs, useToastRegion } from "react-aria";
import type { ToastState } from "react-stately";

import { cn } from "../../_internal/libs/cn.ts";
import { regionClass } from "../constants/toastClass.ts";
import type { ToastRegionProps } from "../Toast.tsx";
import type { Entry, ToastContent } from "../types.ts";
import { ToastItem } from "./ToastItem.tsx";

export interface RegionProps extends Omit<ToastRegionProps, "queue"> {
  readonly state: ToastState<ToastContent>;
  readonly entries: readonly Entry[];
  readonly onExited: (key: string) => void;
}

export function Region({
  state,
  entries,
  onExited,
  ref,
  className,
  "aria-label": ariaLabel,
  ...props
}: RegionProps): ReactElement {
  const regionRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMemo(() => mergeRefs(ref, regionRef), [ref]);
  // regionProps: role="region" 랜드마크·이름, hover·포커스 동안 시간 멈춤, 닫힌 Toast의 포커스 옮기기,
  // data-react-aria-top-layer(열린 모달 Popover·Dialog가 바깥을 inert로 막을 때 빠지고, 눌러도 그 오버레이를 닫지 않는다).
  const { regionProps } = useToastRegion({ "aria-label": ariaLabel }, state, regionRef);
  return (
    <div {...mergeProps(props, regionProps)} ref={mergedRef} className={cn(regionClass, className)}>
      {entries.map((entry) => (
        <ToastItem
          key={entry.toast.key}
          toast={entry.toast}
          open={entry.open}
          state={state}
          onExited={onExited}
        />
      ))}
    </div>
  );
}
