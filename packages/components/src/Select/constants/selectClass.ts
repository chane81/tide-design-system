// class는 문자열 그대로 적는다(_internal/constants/inputClass.ts 참고).
// - 트리거: 입력창 모양(inputBaseClass: border-strong, focus-field, aria-invalid:border-danger, :disabled)에 Input과
//   같은 size class. 글자와 chevron을 한 줄에 두고 chevron은 오른쪽 끝이다(`justify-between`, 사이 8px).
// - 값 글자: 넘치면 말줄임(`truncate`). 고르지 않았을 때(placeholder)는 `text-muted`, 비활성이면 `text-disabled`.
//   옵션 안의 아이콘(장식용)은 트리거에서도 16px이고 글자와 8px 떨어진다.
// - chevron: 장식용 16px, `text-muted`(비활성이면 `text-disabled`).
export const triggerClass = "group inline-flex items-center justify-between gap-2 text-start";
export const valueClass =
  "min-w-0 flex-1 truncate [&>svg]:me-2 [&>svg]:inline-block [&>svg]:size-4 [&>svg]:align-[-0.125em]";
export const placeholderClass = "text-muted group-disabled:text-disabled";
export const chevronClass = "shrink-0 text-muted group-disabled:text-disabled";
