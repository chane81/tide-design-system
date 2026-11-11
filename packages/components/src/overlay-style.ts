// 오버레이 공통 class(tide-v0-impl 티켓 25). Popover가 처음 쓰고 Tooltip·Menu·Select·Combobox·Toast가 다시 쓴다.
// 이 파일은 class 문자열만 있으므로 "use client"가 없다.
//
// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// 나누는 기준(spec 「오버레이」·「motion 적용」):
// - 표면(overlaySurfaceClass): raised 표면 + shadow-md + radius lg + 투명 border. Menu·Select 목록·Toast가 같다.
//   Tooltip은 같은 표면에 padding만 다르고, Dialog는 shadow-lg·radius xl이라 자기 class를 쓴다.
// - 쌓임 단계는 표면 class에 넣지 않는다. 오버레이마다 다르므로(z-popover, z-tooltip, z-toast, z-modal) 부르는 쪽이 붙인다.
// - motion(popoverMotionClass): 「가끔 씀」 오버레이(Popover, Toast)의 등장·퇴장. 「자주 씀」(Menu, Select·Combobox 목록,
//   Tooltip)은 바로 나타나고 opacity fast로만 사라지므로 같은 구조로 시작 상태(starting:)와 이동·blur만 뺀 class를 더한다.

/**
 * 오버레이 표면. raised 표면(`bg-raised`), `shadow-md`, radius `lg`, 경계 `border-raised`(light 투명 / dark gray-800).
 * - 글자는 `text-default`다. `text-default × bg-raised` 4.5:1이 등록되어 있다.
 * - `border-raised`는 장식용 경계라 대비 검사에서 빠진다. light의 투명 border는 forced-colors에서 CanvasText로 칠해져
 *   그림자 없이도 경계가 남는다(spec Elevation, 사용자 이야기 37). forced-colors에서는 브라우저가 box-shadow를 지운다.
 */
export const overlaySurfaceClass =
  "rounded-lg border border-raised bg-raised text-default shadow-md";

/**
 * 「가끔 씀」 오버레이의 등장·퇴장(spec 「motion 적용」). 요소에 `data-open`(열림)과 `data-placement`(트리거 기준 방향,
 * `top`·`bottom`·`left`·`right`)가 있어야 한다.
 *
 * - 등장: `@starting-style`(`starting:`)에서 opacity 0 + blur 4px(`blur-xs`) + 트리거 쪽으로 4px(`*-translate-*-1`)
 *   떨어진 곳에서 시작해 `normal`(300ms)로 제자리에 온다.
 * - 퇴장: `data-open`이 빠지면 같은 조합의 절반(blur 2px, 2px 이동)으로 `fast`(150ms)에 사라진다.
 *   duration은 도착 상태의 값을 쓰므로 기본 `duration-fast`에 열림만 `data-open:duration-normal`이다. easing은 둘 다 out이다.
 * - 닫힌 상태는 `display: none`(`hidden`)이고 `transition-discrete`(`transition-behavior: allow-discrete`)로 display도
 *   전환 대상에 넣어, 퇴장 전환이 끝날 때 사라진다. 이 둘을 지원하지 않는 브라우저에서는 바로 나타나고 사라진다.
 *   요소를 DOM에서 빼는 시점은 `useOverlayPresence`가 전환이 끝나기를 기다려 정한다.
 * - 퇴장 중에는 `pointer-events-none`으로 눌리지 않는다.
 * - reduced-motion: 이동·blur와 그 전환 대상(filter, translate)은 `motion-safe:`일 때만 둔다. 움직임 줄이기에서는
 *   opacity(와 display)만 같은 시간으로 바뀐다.
 * - `transition-all`은 쓰지 않는다. 전환 대상을 적는다.
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
