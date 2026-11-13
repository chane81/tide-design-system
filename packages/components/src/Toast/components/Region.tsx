"use client";
import { useMemo, useRef, type ReactElement } from "react";
// 서브패스 말고 루트 entry에서 import한다. Vite 사전 번들 목록이 바뀌지 않게 한다.
import { mergeProps, mergeRefs, useToastRegion } from "react-aria";
import type { ToastState } from "react-stately";

import { cn } from "../../_internal/libs/cn";
import { regionClass } from "../constants/toastClass";
import type { ToastRegionProps } from "../Toast";
import type { Entry, ToastContent } from "../types";
import { ToastItem } from "./ToastItem";

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
  // regionProps의 data-react-aria-top-layer 덕에 열린 모달이 바깥을 inert로 막을 때 영역은 빠진다.
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
