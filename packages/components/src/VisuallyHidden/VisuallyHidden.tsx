import type { ComponentProps, ReactElement } from "react";

import { cn } from "../_internal/libs/cn";

export type VisuallyHiddenProps = ComponentProps<"span">;

/** 화면에는 보이지 않고 보조 기술에는 읽히는 텍스트. 서버 컴포넌트로 쓸 수 있다. */
export function VisuallyHidden({ className, ...props }: VisuallyHiddenProps): ReactElement {
  return <span {...props} className={cn("sr-only", className)} />;
}
