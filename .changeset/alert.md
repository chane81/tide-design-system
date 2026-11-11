---
"@tide-tds/components": patch
"@tide-tds/foundation": patch
---

`Alert`를 추가했습니다. 화면 안에서 상태나 알릴 내용을 보여 주는 표면(radius `lg`, 역할 경계와 subtle 배경)이고 `"use client"`가 없어 서버 컴포넌트에서 바로 씁니다. `color`는 Role만 받습니다(앱이 더한 Role 포함, 기본 `info`). `info`·`success`·`warning`·`danger`는 모양이 다른 상태 아이콘(장식용)을 쓰고, `neutral`·`primary`·앱 Role은 `info`와 같은 아이콘입니다. `title`(제목), `children`(본문), `role`(`"alert"`·`"status"`, 기본은 역할 없는 정적 표시), `onClose`(주면 닫기 IconButton이 생기는 제어형 콜백), `closeLabel`(기본 `"닫기"`)을 받습니다. foundation 대비 쌍에 역할 경계 × 같은 역할 subtle(3:1)과 포커스 표시 × 역할 subtle(3:1)을 더했습니다. 기존 Token 값은 바뀌지 않습니다.
