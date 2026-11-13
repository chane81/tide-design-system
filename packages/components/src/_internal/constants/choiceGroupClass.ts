// CheckboxGroup·RadioGroup이 함께 쓰는 묶음 배치 class(tide-v0-impl 티켓 16).
// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.

/** 항목을 쌓는 방향 */
export type ChoiceOrientation = "vertical" | "horizontal";

/** 방향별 배치. 가로는 줄이 넘치면 다음 줄로 간다. */
export const orientationClass: Record<ChoiceOrientation, string> = {
  vertical: "flex flex-col gap-2",
  horizontal: "flex flex-row flex-wrap gap-x-6 gap-y-2",
};
