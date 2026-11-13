import type { ReactElement, ReactNode } from "react";

import { iconSizeClass } from "../constants/buttonClass";
import type { ButtonSize } from "../types";

export function Icon({ size, children }: { size: ButtonSize; children: ReactNode }): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center *:size-full ${iconSizeClass[size]}`}
    >
      {children}
    </span>
  );
}
