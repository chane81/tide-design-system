import type { InputSize } from "../../_internal/constants/inputClass.ts";

// class는 문자열 그대로 적는다(_internal/constants/inputClass.ts 참고).
// - 감싸개: 입력과 chevron 버튼을 한 줄에 둔다. 버튼은 음수 margin으로 입력의 끝 안쪽에 겹친다. 그래서 사용자 className으로
//   입력 폭을 바꿔도 버튼이 입력 끝에 붙어 있다.
// - 입력: 입력창 모양(inputBaseClass)에 Input과 같은 size class. 끝 padding은 chevron(16px)과 글자 사이 8px를 더 둔다.
// - 버튼: 장식이 아닌 실제 버튼(누르면 전체 목록을 연다)이지만 Tab 순서 밖이다(React Aria). chevron 16px은 Select 트리거와
//   같은 자리(입력 바깥 끝에서 size별 좌우 padding + border 1px)에 온다. `text-muted`, 비활성이면 `text-disabled`.
export const wrapperClass = "flex w-full";
export const inputEndClass: Record<InputSize, string> = {
  sm: "pe-[34px]",
  md: "pe-9",
  lg: "pe-10",
};
export const buttonSizeClass: Record<InputSize, string> = {
  sm: "-ms-[35px] w-[35px] pe-[11px]",
  md: "-ms-[37px] w-[37px] pe-[13px]",
  lg: "-ms-[41px] w-[41px] pe-[17px]",
};
export const buttonClass =
  "inline-flex shrink-0 cursor-pointer items-center justify-end text-muted outline-none disabled:cursor-not-allowed disabled:text-disabled";

/**
 * 거른 결과가 없을 때의 글자. 옵션과 같은 여백·글자 크기라 목록 높이가 옵션 하나와 같다. `text-muted`.
 * listbox 밖(같은 목록 표면 안)에 둔다. listbox 자식은 option·group만 될 수 있어서다. 결과 개수(0개)는 React Aria가
 * live region으로 알린다.
 */
export const emptyClass = "px-2 py-1.5 text-body-sm text-muted select-none";
