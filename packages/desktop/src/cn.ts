import { tailwindMergeConfig } from "@tide-tds/foundation/tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// extendTailwindMerge는 큰 자료구조를 만들므로 모듈에서 한 번만 호출한다(tailwind-merge 3.7.0 docs).
const twMerge = extendTailwindMerge(tailwindMergeConfig);

/**
 * class를 합치고 충돌을 푼다. 뒤에 온 class가 이긴다.
 * Component는 사용자 `className`을 항상 마지막 인자로 넘긴다.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
