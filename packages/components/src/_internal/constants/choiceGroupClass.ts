// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.

export type ChoiceOrientation = "vertical" | "horizontal";

export const orientationClass: Record<ChoiceOrientation, string> = {
  vertical: "flex flex-col gap-2",
  horizontal: "flex flex-row flex-wrap gap-x-6 gap-y-2",
};
