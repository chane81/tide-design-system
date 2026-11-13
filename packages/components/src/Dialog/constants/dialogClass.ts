import {
  backdropMotionClass,
  dialogMotionClass,
  dialogSurfaceClass,
} from "../../_internal/constants/overlayClass.ts";
import type { DialogSize } from "../types.ts";

// class는 문자열 그대로 적는다(_internal/constants/overlayClass.ts 참고).
// - 바깥 막: 화면 전체(fixed inset-0)를 bg-overlay로 덮고 쌓임은 z-modal(200)이다. 안의 Select·Menu 목록(z-popover 300)과
//   Tooltip(z-tooltip 500)은 그 위에 뜬다. Dialog를 가운데 두고 화면 끝과 16px을 띄운다. 루트 isolate(spec 「오버레이」).
// - 표면: raised + shadow-lg + radius xl + border-raised(dialogSurfaceClass), 여백 24px, 부분 사이 16px.
// - 높이: 화면보다 길면 Dialog 안에서 스크롤한다(max-h-full + overflow-y-auto). 페이지 스크롤은 잠긴다.
// - 포커스: 열릴 때 Dialog 요소 자신에 포커스가 올 수 있다(useDialog). 표면 전체가 포커스 위치라 outline은 그리지 않는다.
export const backdropClass = `fixed inset-0 isolate z-modal flex items-center justify-center bg-overlay p-4 ${backdropMotionClass}`;
export const contentClass = `relative flex max-h-full w-full flex-col gap-4 overflow-y-auto p-6 text-body-md outline-none ${dialogSurfaceClass} ${dialogMotionClass}`;
export const sizeClass: Record<DialogSize, string> = {
  sm: "max-w-96",
  md: "max-w-128",
  lg: "max-w-160",
};
