import type { ReactElement } from "react";

import type { ChoiceSize } from "../../_internal/constants/choiceClass";

export interface CheckboxMarkProps {
  /** 체크 표시(`check`) 또는 가로줄(`indeterminate`) */
  kind: "check" | "indeterminate";
  size: ChoiceSize;
  className: string;
}

// Lucide check·minus와 같은 모양이다.
const pathData = { check: "M20 6 9 17l-5-5", indeterminate: "M5 12h14" } as const;

const pixelSize: Record<ChoiceSize, number> = { sm: 12, md: 16 };

const strokePixels = 2;

/** 그려지는 체크 표시. 상태는 input이 보조 기술에 알려 장식으로 숨긴다. */
export function CheckboxMark({ kind, size, className }: CheckboxMarkProps): ReactElement {
  const px = pixelSize[size];

  // non-scaling-stroke는 pathLength와 함께 쓰면 dash가 화면 픽셀로 계산되어, 두께를 viewBox 단위로 환산한다(ADR 0037).
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-mark={kind}
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={(strokePixels * 24) / px}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={pathData[kind]} pathLength={1} />
    </svg>
  );
}
