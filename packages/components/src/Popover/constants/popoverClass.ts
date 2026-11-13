import { overlaySurfaceClass, popoverMotionClass } from "../../_internal/constants/overlayClass";

// class는 문자열 그대로 적는다(_internal/constants/overlayClass.ts 참고). 높이는 React Aria가 max-height로 맞춘다.
// 내용 요소 자신에 포커스가 오지만(useDialog) 표면 전체가 포커스 위치라 outline은 그리지 않는다.
export const contentClass = `isolate z-popover max-w-80 overflow-auto p-4 text-body-md outline-none ${overlaySurfaceClass} ${popoverMotionClass}`;
