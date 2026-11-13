import type { InputSize } from "../../_internal/constants/inputClass";

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
// 버튼은 음수 margin으로 입력 끝 안쪽에 겹친다. 사용자 className으로 입력 폭을 바꿔도 끝에 붙어 있게 한다.
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

// listbox 자식은 option·group만 될 수 있어 결과 없음 글자는 listbox 밖(같은 표면 안)에 둔다.
export const emptyClass = "px-2 py-1.5 text-body-sm text-muted select-none";
