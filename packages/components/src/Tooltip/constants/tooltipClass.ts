import { overlaySurfaceClass } from "../../_internal/constants/overlayClass";

// class는 문자열 그대로 적는다(_internal/constants/overlayClass.ts 참고).
// 열린 동안 `transition-none`이라 새로 나타날 때도, 퇴장 중에 다시 열려도 바로 불투명해진다.
const motionClass = [
  "transition-[opacity,display] transition-discrete duration-fast ease-out data-open:transition-none",
  "not-data-open:pointer-events-none not-data-open:hidden not-data-open:opacity-0",
].join(" ");

export const contentClass = `isolate z-tooltip max-w-60 px-2 py-1 text-body-sm ${overlaySurfaceClass} ${motionClass}`;
