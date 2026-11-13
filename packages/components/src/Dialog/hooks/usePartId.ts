"use client";
import { useId, useLayoutEffect } from "react";

/** 부분 요소의 id를 정하고 열린 동안 dialog에 알린다. */
export function usePartId(id: string | undefined, register: (id: string | null) => void): string {
  const generated = useId();
  const resolved = id ?? generated;
  useLayoutEffect(() => {
    register(resolved);

    return () => register(null);
  }, [resolved, register]);

  return resolved;
}
