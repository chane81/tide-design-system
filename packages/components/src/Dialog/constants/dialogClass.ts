import {
  backdropMotionClass,
  dialogMotionClass,
  dialogSurfaceClass,
} from "../../_internal/constants/overlayClass";
import type { DialogSize } from "../types";

// class는 문자열 그대로 적는다(_internal/constants/overlayClass.ts 참고).
// 열릴 때 Dialog 요소 자신에 포커스가 올 수 있지만(useDialog) 표면 전체가 포커스 위치라 outline은 그리지 않는다.
export const backdropClass = `fixed inset-0 isolate z-modal flex items-center justify-center bg-overlay p-4 ${backdropMotionClass}`;
export const contentClass = `relative flex max-h-full w-full flex-col gap-4 overflow-y-auto p-6 text-body-md outline-none ${dialogSurfaceClass} ${dialogMotionClass}`;
export const sizeClass: Record<DialogSize, string> = {
  sm: "max-w-96",
  md: "max-w-128",
  lg: "max-w-160",
};
