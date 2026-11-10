// Input·Textarea가 함께 쓰는 입력창 class(tide-v0-impl 티켓 15). 이후 Select·Combobox 트리거도 같은 틀을 쓴다.
// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
//
// - 경계: border-strong(표면 층 위 3:1, WCAG 1.4.11 입력 테두리). 오류는 aria-invalid:border-danger.
// - 포커스: focus-field(:focus, 클릭 포함). 오류 상태에서도 포커스 중에는 focus-field가 이긴다(foundation utility).
// - 비활성: 네이티브 :disabled. cursor-not-allowed와 disabled Token 색을 쓴다.
// - 글자: 텍스트 스타일 뒤에 font-normal을 둬 입력한 값은 보통 굵기로 보인다(tailwind-merge가 뒤의 굵기를 남긴다).
// - motion: 혼자 있는 조작 요소라 transition-colors(fast)다.

/** 입력창의 공통 모양. size class 뒤에 넣는다. */
export const inputBaseClass =
  "w-full min-w-0 rounded-md border border-strong bg-canvas font-normal text-default transition-colors placeholder:text-muted aria-invalid:border-danger focus:focus-field disabled:cursor-not-allowed disabled:border-default disabled:bg-disabled disabled:text-disabled disabled:placeholder:text-disabled";
