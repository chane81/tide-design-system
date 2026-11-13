import { alertLayoutClass } from "../../_internal/constants/alertClass";
import { overlaySurfaceClass, popoverMotionClass } from "../../_internal/constants/overlayClass";

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
// 새 Toast가 모서리 쪽에 오도록 거꾸로 쌓는다(DOM은 새것이 먼저라 Tab도 새것부터다).
export const regionClass =
  "fixed end-4 bottom-4 isolate z-toast flex w-[calc(100%-2rem)] max-w-96 flex-col-reverse gap-2 rounded-lg outline-none focus-visible:focus-ring";
export const toastClass = `${alertLayoutClass} ${overlaySurfaceClass} ${popoverMotionClass} outline-none focus-visible:focus-ring`;
