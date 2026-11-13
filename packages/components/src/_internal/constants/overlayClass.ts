// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
// 쌓임(z-*)은 오버레이마다 달라 표면 class에 넣지 않고 부르는 쪽이 붙인다.

/** light의 투명 border는 forced-colors에서 CanvasText로 칠해져 그림자 없이도 경계가 남는다. */
export const overlaySurfaceClass =
  "rounded-lg border border-raised bg-raised text-default shadow-md";

/**
 * 「가끔 씀」 오버레이 motion. 요소에 `data-open`과 `data-placement`가 있어야 한다.
 * duration은 도착 상태의 값을 쓰므로 열림만 `data-open:duration-normal`이다. DOM에서 빼는 시점은 `useOverlayPresence`가 정한다.
 */
export const popoverMotionClass: string = [
  "transition-[opacity,display] transition-discrete duration-fast ease-out data-open:duration-normal motion-safe:transition-[opacity,filter,translate,display]",
  // 퇴장의 끝(닫힌 상태)
  "not-data-open:pointer-events-none not-data-open:hidden not-data-open:opacity-0 motion-safe:not-data-open:blur-[2px]",
  "motion-safe:not-data-open:data-[placement=bottom]:-translate-y-0.5 motion-safe:not-data-open:data-[placement=top]:translate-y-0.5",
  "motion-safe:not-data-open:data-[placement=right]:-translate-x-0.5 motion-safe:not-data-open:data-[placement=left]:translate-x-0.5",
  // 등장의 시작
  "starting:opacity-0 motion-safe:starting:blur-xs",
  "motion-safe:data-[placement=bottom]:starting:-translate-y-1 motion-safe:data-[placement=top]:starting:translate-y-1",
  "motion-safe:data-[placement=right]:starting:-translate-x-1 motion-safe:data-[placement=left]:starting:translate-x-1",
].join(" ");

/**
 * 「자주 씀」 오버레이 motion. 요소에 `data-open`이 있어야 한다.
 * 열린 동안 `transition-none`이라 퇴장 중에 다시 열려도 바로 불투명해진다.
 */
export const frequentMotionClass: string = [
  "transition-[opacity,display] transition-discrete duration-fast ease-out data-open:transition-none",
  "not-data-open:pointer-events-none not-data-open:hidden not-data-open:opacity-0",
].join(" ");

/** Dialog류 표면. forced-colors 처리는 `overlaySurfaceClass`와 같다. */
export const dialogSurfaceClass =
  "rounded-xl border border-raised bg-raised text-default shadow-lg";

/**
 * 모달 backdrop motion. 요소에 `data-open`이 있어야 한다.
 * `useOverlayPresence`는 이 요소의 전환을 기다린다. 안의 Dialog도 같은 duration이라 함께 끝난다.
 */
export const backdropMotionClass: string = [
  "transition-[opacity,display] transition-discrete duration-fast ease-out data-open:duration-normal",
  "not-data-open:pointer-events-none not-data-open:hidden not-data-open:opacity-0",
  "starting:opacity-0",
].join(" ");

/** Dialog류 motion. display 전환은 바깥 막(`backdropMotionClass`)이 맡고, 이 요소는 opacity·scale만 바꾼다. */
export const dialogMotionClass: string = [
  "transition-[opacity] duration-fast ease-out data-open:duration-normal motion-safe:transition-[opacity,scale]",
  "not-data-open:opacity-0 motion-safe:not-data-open:scale-98",
  "starting:opacity-0 motion-safe:starting:scale-96",
].join(" ");
