import type { ComponentProps, ReactElement } from "react";

import { cn } from "../../_internal/libs/cn";

export type DialogFooterProps = ComponentProps<"div">;

/** 동작 버튼 줄. 끝쪽에 맞추고 버튼 사이는 8px이다. 앞에 덜 위험한 동작(취소)을, 끝에 주 동작을 둔다. */
export function DialogFooter({ className, ...props }: DialogFooterProps): ReactElement {
  return <div {...props} className={cn("mt-2 flex flex-wrap justify-end gap-2", className)} />;
}
