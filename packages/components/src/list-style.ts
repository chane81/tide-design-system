// 목록 오버레이 공통 class(tide-v0-impl 티켓 27). Menu가 처음 쓰고 Select·Combobox 목록(28·29)이 다시 쓴다.
// 이 파일은 class 문자열만 있으므로 "use client"가 없다.
//
// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// 나누는 기준(spec 「radius」·「포커스 표시」·「raised 위 항목」·「motion 적용」):
// - 목록(listPopupClass): 오버레이 표면 + padding 3px(중첩 규칙: 8 = 4 + 3 + 1) + 「자주 씀」 motion + z-popover.
// - 항목(listItemClass): radius sm, 기본 투명. 키보드 위치와 hover는 highlight, 그 밖의 hover는 무채색 bg-hover,
//   선택 유지는 subtle-active. transition이 없어 바로 바뀐다(반복되는 목록 항목).
// - 묶음 제목(listHeadingClass)과 구분선(listSeparatorClass).

import { frequentMotionClass, overlaySurfaceClass } from "./overlay-style.ts";

/**
 * 목록 오버레이(Menu 목록, Select·Combobox 목록)의 루트. 요소에 `data-open`이 있어야 한다(`frequentMotionClass`).
 *
 * - 표면: raised + `shadow-md` + radius `lg` + `border-raised`(overlaySurfaceClass).
 * - 여백: 3px. 바깥 radius 8px = 항목 radius 4px + 여백 3px + border 1px(spec 중첩 규칙).
 * - 크기: 폭은 내용에 맞추되 10rem(`min-w-40`)~20rem(`max-w-80`). 높이는 React Aria가 `max-height`로 화면 안에
 *   맞추고 넘치면 스크롤한다(`overflow-auto`).
 * - 쌓임: `z-popover`(300)라 Dialog(`z-modal`) 위에 보인다. 루트 `isolate`.
 * - 포커스: 목록 자신이 포커스를 받을 때(마우스로 연 직후)는 표시가 없다. 위치 표시는 항목의 highlight가 맡는다.
 * - motion: 「자주 씀」. 바로 나타나고 사라질 때만 opacity `fast`.
 */
export const listPopupClass = `isolate z-popover min-w-40 max-w-80 overflow-auto p-[3px] outline-none ${overlaySurfaceClass} ${frequentMotionClass}`;

/**
 * 목록 안 항목(Menu 항목, Select·Combobox 옵션). 상태는 boolean `data-*`로 받는다.
 *
 * - `data-highlighted`: 키보드 위치(React Aria가 옮긴 포커스 위치)이고, 마우스를 올리면 React Aria가 그 항목으로
 *   위치를 옮기므로 hover도 같은 모양이다. highlight = primary subtle 배경 + primary text 글자 + 투명 outline 2px.
 *   투명 outline은 평소에는 보이지 않고 forced-colors에서 시스템 색으로 그려져 위치가 남는다(그 모드는 배경을 덮는다).
 *   기본 `outline-none`이 outline 모양 변수를 none으로 두므로 `outline-solid`를 함께 쓴다.
 *   항목 안쪽(`-outline-offset-2`)에 그려 이웃 항목·목록 경계와 겹치지 않는다.
 * - `hover`(highlight가 아닐 때): 색 없이 덮는 `bg-hover`(ADR 0022 §3). 키보드로 옮긴 위치가 따로 있을 때
 *   마우스가 다른 항목 위에 있는 경우다. text-default × bg-hover(bg-raised 위 합성)가 4.5:1로 등록되어 있다.
 * - `data-selected`(highlight가 아닐 때): 선택 유지 `subtle-active`(neutral). 상태를 나타내는 바탕이라 덮기로 바꾸지 않는다.
 *   Select·Combobox의 고른 옵션이 쓴다.
 * - `data-disabled`: `text-disabled`, `cursor-not-allowed`. hover 배경이 없다.
 * - 상태끼리 겹칠 때 순서에 기대지 않도록 `not-data-highlighted:`로 서로 뺀다.
 * - transition이 없다. 반복되는 목록 항목은 바로 바뀐다(spec 「motion 적용」).
 * - 크기: 세로 6px·가로 8px 여백, `text-body-md`(16/24)라 높이 36px. 바로 안의 아이콘(svg, 장식용)은 16px이고
 *   아이콘과 글자 사이는 8px다(Button md와 같은 아이콘 크기).
 */
export const listItemClass = [
  "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-body-md text-default outline-none select-none [&>svg]:size-4 [&>svg]:shrink-0",
  "hover:not-data-highlighted:not-data-disabled:bg-hover",
  "data-selected:not-data-highlighted:bg-neutral-subtle-active",
  "data-highlighted:bg-primary-subtle data-highlighted:text-primary data-highlighted:outline-2 data-highlighted:outline-solid data-highlighted:-outline-offset-2 data-highlighted:outline-transparent",
  "data-disabled:cursor-not-allowed data-disabled:text-disabled",
].join(" ");

/** 항목 묶음의 제목. `text-label-sm`(12px), `text-muted`. 항목과 같은 가로 여백이라 글자 시작이 맞는다. */
export const listHeadingClass = "px-2 pt-1.5 pb-1 text-label-sm text-muted select-none";

/** 묶음 사이 구분선. 장식용 `border-default` 1px, 위아래 4px. */
export const listSeparatorClass = "my-1 h-0 border-t border-default";
